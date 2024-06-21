import {
  text,
  integer,
  sqliteTable,
  customType,
  unique,
  index,
} from "drizzle-orm/sqlite-core";
import type {
  Link,
  Ratings,
  RemoteDirMapping,
} from "~/services/Readarr";
import { relations, sql } from "drizzle-orm";

const customDate = customType<{
  data: Date;
  driverData: number;
}>({
  dataType() {
    return `number`;
  },
  fromDriver(value: number): Date {
    return new Date(value);
  },
  toDriver(value: Date): number {
    return value.getTime();
  },
});

const stringList = customType<{
  data: string[];
  driverData: string;
}>({
  dataType() {
    return `text`;
  },
  fromDriver(value: string): string[] {
    if (!value) return [];
    return value.split(",");
  },
  toDriver(value: string[]): string {
    return value.join(",");
  },
});

export const readarrSchema = sqliteTable("readarr", {
  id: integer("id").primaryKey(),
  name: text("name").notNull().unique(),
  host: text("host").notNull(),
  publicHost: text("public_host"),
  apiKey: text("api_key").notNull(),
  dirMaps: text("dir_maps", { mode: "json" })
    .$type<RemoteDirMapping[]>()
    .default(sql`[]`)
    .notNull(),
});

export const bookSchema = sqliteTable(
  "books",
  {
    id: integer("id").primaryKey(),
    authorName: text("author_name").notNull(),
    goodreadsAuthorId: text("goodreads_author_id").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    seriesTitle: text("series_title"),
    goodreadsId: text("goodreads_id").unique(),
    releaseDate: customDate("release_date"),
    genres: stringList("genres"),
    cover: text("cover"),
    links: text("links", { mode: "json" })
      .$type<Link[]>()
      .default(sql`[]`)
      .notNull(),
    ratings: text("ratings", { mode: "json" }).$type<Ratings>(),
    metadataReadarrId: integer("metadata_readarr_id").references(
      () => readarrSchema.id,
      { onDelete: "cascade" }
    ),
  },
  (table) => ({
    authorIdx: index("authorName_idx").on(table.authorName),
    titleIdx: index("title_idx").on(table.title),
    descriptionIdx: index("description_idx").on(table.description),
    genresIdx: index("genres_idx").on(table.genres),
    seriesTitleIdx: index("seriesTitle_idx").on(table.seriesTitle),
  })
);

export const bookRelations = relations(bookSchema, ({ many, one }) => ({
  metadataReadarr: one(readarrSchema, {
    fields: [bookSchema.metadataReadarrId],
    references: [readarrSchema.id],
    relationName: "metadataReadarr",
  }),
  files: many(fileSchema, {
    relationName: "files",
  }),
}));

export const fileSchema = sqliteTable(
  "files",
  {
    id: integer("id").primaryKey(),
    path: text("path").notNull(),
    readarrBookId: integer("readarr_book_id"),
    // format: text("format").notNull(),
    bookId: integer("book_id").references(() => bookSchema.id, {
      onDelete: "cascade",
    }).notNull(),
    sourceReadarrId: integer("source_readarr_id").references(
      () => readarrSchema.id,
      { onDelete: "cascade" }
    ),
  },
  (table) => ({
    readarr_path: unique().on(table.path, table.sourceReadarrId),
  })
);

export const fileRelations = relations(fileSchema, ({ one }) => ({
  sourceReadarr: one(readarrSchema, {
    fields: [fileSchema.sourceReadarrId],
    references: [readarrSchema.id],
    relationName: "sourceReadarr",
  }),
  book: one(bookSchema, {
    fields: [fileSchema.bookId],
    references: [bookSchema.id],
    relationName: "files",
  }),
}));
