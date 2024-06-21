import { and, asc, count, desc, like, or } from "drizzle-orm";
import { db } from "./conn";
import { bookSchema } from "./schema";
import type { SQLiteSelect } from "drizzle-orm/sqlite-core";

const FILTER_KEYS = [
  "title",
  "seriesTitle",
  "authorName",
  "description",
  "genres"
] as const;

export const SORT_KEYS = [
  "id",
  "title",
  "seriesTitle",
  "authorName",
  "releaseDate"
] as const
export type BookFilter = {
  [key in (typeof FILTER_KEYS)[number]]?: string;
};
function withFilters<T extends SQLiteSelect>(qb: T, filter?: BookFilter): T {
  if (!filter) return qb;
  return qb.where(
    and(
      ...Object.entries(filter)
        .filter(([key]) => {
          return FILTER_KEYS.includes(key as keyof BookFilter);
        })
        .map(([key, value]) => {
          return like(bookSchema[key as keyof BookFilter], `%${value}%`);
        })
    )
  );
}
function withSearch<T extends SQLiteSelect>(qb: T, query?: string): T {
  if (!query) return qb;

  return qb.where(
    or(
      like(bookSchema.title, `%${query}%`),
      like(bookSchema.authorName, `%${query}%`),
      like(bookSchema.genres, `%${query}%`),
      like(bookSchema.seriesTitle, `%${query}%`)
    )
  );
}

export async function findBooks(
  page: number,
  limit: number,
  sortBy: typeof SORT_KEYS[number] = "id",
  sortDir: "asc" | "desc" = "desc",
  query?: string,
  filter?: BookFilter
) {
  const total = await withSearch(
    withFilters(
      db.select({ value: count() }).from(bookSchema).$dynamic(),
      filter
    ),
    query
  );
  const orderFunc = sortDir == "asc" ? asc : desc;
  const data = await withSearch(
    withFilters(
      db
        .select()
        .from(bookSchema)
        .offset((page - 1) * limit)
        .limit(limit)
        .orderBy(orderFunc(bookSchema[sortBy]))
        .$dynamic(),
      filter
    ),
    query
  );
  return {
    total: total[0].value,
    page,
    limit,
    data,
    query,
    filter
  };
}