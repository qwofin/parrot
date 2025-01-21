import { db } from "~/db/conn";
import type { Readarr, Book } from "./Readarr";
import { bookSchema, fileSchema } from "~/db/schema";
import { and, eq, inArray } from "drizzle-orm";
const BATCH_SIZE = 20;

function isEmpty(value: any): boolean {
  if (value === null || value === undefined || value == "") {
    return true;
  }

  if (Array.isArray(value) && value.length === 0) {
    return true;
  }

  if (value instanceof Date) {
    return false;
  }

  if (typeof value === "object" && Object.keys(value).length === 0) {
    return true;
  }

  return false;
}

function needsUpdate<T>(value: T, update: T): boolean {
  return JSON.stringify(value) !== JSON.stringify(update);
}

function calculateUpdate<T>(
  original: T,
  update: T,
  ignoreFields: string[]
): Partial<T> | null {
  const result: Partial<T> = {};
  for (const key in update) {
    if (isEmpty(original[key]) && !isEmpty(update[key])) {
      result[key] = update[key];
    }

    if (
      !ignoreFields.includes(key) &&
      needsUpdate(original[key], update[key])
    ) {
      result[key] = update[key];
    }
  }
  return Object.keys(result).length ? result : null;
}

function findCover(book: Book): string | null {
  for (const image of book.images) {
    if (image.coverType == "cover") {
      return image.url;
    }
  }

  return null;
}

export class Syncer {
  static async syncBooks(readarr: Readarr) {
    console.log(`Syncing ${readarr.name}`);
    const readarrBooks = await readarr.getBooks();
    console.log(`Found ${readarrBooks.length} books`);
    const readarrAuthors = Object.fromEntries(
      (await readarr.getAuthors()).map((author) => [author.id, author])
    );
    console.log(`Found ${Object.keys(readarrAuthors).length} authors`);
    let last = 0;
    let updated = 0;
    let added = 0;
    while (last <= readarrBooks.length) {
      last += BATCH_SIZE;
      const chunk = readarrBooks
        .slice(last, last + BATCH_SIZE)
        .filter((book) => book.statistics.bookFileCount > 0);
      if (!chunk.length) continue;
      const existingBooks = await db.query.bookSchema.findMany({
        where: inArray(
          bookSchema.goodreadsId,
          chunk.map((book) => book.foreignBookId)
        ),
      });
      const existingBookMap: { [id: string]: typeof bookSchema.$inferSelect } =
        Object.fromEntries(
          existingBooks.map((book) => [book.goodreadsId, book])
        );

      for (const book of chunk) {
        const author = readarrAuthors[book.authorId];
        try {
          const files = await readarr.getBookFiles(book.id);
          if (!files.length) {
            console.log(`Skipping book ${book.id}, no files found.`);
          }
          const edition = await readarr.getEdition(
            book.id,
            book.foreignEditionId
          );
          const existingBook = existingBookMap[book.foreignBookId];
          const update: typeof bookSchema.$inferInsert = {
            title: book.title,
            goodreadsId: book.foreignBookId,
            seriesTitle: book.seriesTitle,
            releaseDate: new Date(book.releaseDate),
            genres: book.genres,
            cover: findCover(book),
            links: book.links,
            ratings: book.ratings,
            authorName: author.authorName,
            goodreadsAuthorId: author.foreignAuthorId,
            description: edition.overview,
            metadataReadarrId: readarr.id,
          };
          let bookId = null;
          if (existingBook) {
            bookId = existingBook.id;
            // only update metadata for the original readarr instance
            if (existingBook.metadataReadarrId === readarr.id) {
              // only write updates when there is something to change
              const calculated = calculateUpdate(existingBook, update, [
                "metadataReadarrId",
                "id",
                "addedAt",
              ]);
              if (calculated) {
                await db
                  .update(bookSchema)
                  .set(update)
                  .where(eq(bookSchema.id, existingBook.id));
                updated++;
              }
            }
          } else {
            const addResult = await db
              .insert(bookSchema)
              .values(update)
              .returning({ id: bookSchema.id })
              .onConflictDoNothing();
            bookId = addResult[0].id;
            added++;
          }

          const existingFiles = await db.query.fileSchema.findMany({
            where: and(
              eq(fileSchema.bookId, bookId),
              eq(fileSchema.sourceReadarrId, readarr.id!)
            ),
          });
          const existingFileMap: {
            [id: string]: typeof fileSchema.$inferSelect;
          } = Object.fromEntries(
            existingFiles.map((file) => [file.readarrBookId, file])
          );
          for (const file of files) {
            const existingFile = existingFileMap[file.id];
            const fileUpdate: typeof fileSchema.$inferInsert = {
              path: file.path,
              readarrBookId: file.id,
              sourceReadarrId: readarr.id,
              bookId: bookId,
            };
            if (existingFile) {
              const calculatedFileUpdate = calculateUpdate(
                existingFile,
                fileUpdate,
                ["id", "sourceReadarrId", "bookId", "readarrBookId"]
              );
              if (calculatedFileUpdate) {
                await db
                  .update(fileSchema)
                  .set(calculatedFileUpdate)
                  .where(eq(fileSchema.id, existingFile.id));
              }
            } else {
              await db
                .insert(fileSchema)
                .values(fileUpdate)
                .onConflictDoNothing();
            }
          }
        } catch (err) {
          console.log(`Skipping book: ${err}`);
          continue;
        }
      }
    }
    console.log(
      `Finished syncing ${readarr.name}, added ${added}, updated ${updated}`
    );
  }

  static async syncFiles(readarr: Readarr) {}
}
