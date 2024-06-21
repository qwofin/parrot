import { db } from "~/db/conn";
import { readarrSchema } from "~/db/schema";
import { ParrotError, ValidationError } from "~/errors";
import { eq } from "drizzle-orm";
import fs from "node:fs";

export type Link = {
  url: string;
  name: string;
};

export type Image = {
  url: string;
  coverType: string;
  extension: string;
};

export type Ratings = {
  votes: number;
  value: number;
  popularity: number;
};

export type RemoteDirMapping = {
  local: string;
  remote: string;
};

export type Book = {
  id: number;
  foreignBookId: string;
  foreignEditionId: string;
  authorId: number;
  seriesTitle: string;
  titleSlug: string;
  title: string;
  genres: string[];
  releaseDate: string;
  images: Image[];
  links: Link[];
  ratings: Ratings;
  statistics: {
    bookFileCount: number;
  };
};

type Edition = {
  id: number;
  overview: string;
  foreignEditionId: string;
};

type BookFile = {
  id: number;
  dateAdded: string;
  path: string;
};

type Author = {
  id: number;
  authorName: string;
  foreignAuthorId: string;
};

type RootFolder = {
  path: string;
};

export class Readarr {
  protected raw: typeof readarrSchema.$inferInsert;
  constructor(raw: typeof readarrSchema.$inferInsert) {
    this.raw = raw;
  }

  get name() {
    return this.raw.name;
  }

  get id() {
    return this.raw.id;
  }

  protected async _request(path: string) {
    return fetch(this.raw.host + path, {
      headers: { "x-api-key": this.raw.apiKey },
    });
  }

  protected _expandLinks<T extends Link | Image>(items: T[]): T[] {
    for (const item of items) {
      if (item.url.startsWith("/")) {
        item.url = (this.raw.publicHost || this.raw.host) + item.url;
      }
    }
    return items;
  }

  async getBooks(ids: string[] = []): Promise<Book[]> {
    // let query = "";
    const query = new URLSearchParams();
    // if (ids.length) {
    //   query.set("bookIds[]", ids)
    //   // query += `&bookIds[]=${ids.join(",")}`;
    // }

    const response = await this._request(`/api/v1/book${query}`);
    const books: Book[] = await response.json();
    for (const book of books) {
      this._expandLinks(book.images);
      this._expandLinks(book.links);
    }
    return books;
  }

  async getEdition(id: number, goodreadsEditionId: string): Promise<Edition> {
    const response = await this._request(`/api/v1/edition?bookId=${id}`);
    const data: Edition[] = await response.json();
    for (const edition of data) {
      if (edition.foreignEditionId === goodreadsEditionId) {
        return edition;
      }
    }
    throw new ParrotError("Could not find matching edition");
  }

  async getAuthors(): Promise<Author[]> {
    const response = await this._request("/api/v1/author");

    return response.json();
  }

  async getBookFiles(bookId: number): Promise<BookFile[]> {
    const response = await this._request(`/api/v1/bookfile?bookId=${bookId}`);

    return response.json();
  }

  async validate() {
    try {
      const response = await this._request("/api/v1/system/status");
      if (response.status != 200) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (err) {
      throw new ValidationError(
        `Faled to connect to readarr: ${(err as Error).message}`
      );
    }
    const roots = (await (
      await this._request("/api/v1/rootfolder")
    ).json()) as RootFolder[];
    for (const root of roots) {
      try {
        this.resolvePath(root.path);
      } catch (err) {
        throw new ValidationError((err as Error).message);
      }
    }
  }

  resolvePath(path: string): string {
    if (fs.existsSync(path)) {
      return path;
    }

    if (this.raw.dirMaps) {
      for (const mapping of this.raw.dirMaps) {
        if (path.startsWith(mapping.remote)) {
          const mappedPath = path.replace(mapping.remote, mapping.local);
          if (!fs.existsSync(mappedPath)) {
            throw new ParrotError(`Local path ${mappedPath} does not exist`);
          }

          return mappedPath;
        }
      }
    }

    throw new ParrotError(
      `Can not resolve ${path}, missing or invalid remote path mapping.`
    );
  }

  static async getForId(id: number): Promise<Readarr> {
    const raw = await db.query.readarrSchema.findFirst({
      where: eq(readarrSchema.id, id),
    });
    if (!raw) {
      throw new ParrotError("Invalid readarr ID");
    }
    return new Readarr(raw);
  }

  static async getReadarrs(): Promise<Readarr[]> {
    const raw = await db.query.readarrSchema.findMany();

    return raw.map((result) => new Readarr(result));
  }

  static async getReadarrMap(): Promise<{ [id: string]: Readarr }> {
    const readarrs = await this.getReadarrs();
    return Object.fromEntries(readarrs.map((readarr) => [readarr.id, readarr]));
  }
}
