import { SORT_KEYS, findBooks } from "~/db/BookRepository";
export async function listBooks(reqUrl: string, defaultLimit: number = 48, defaultQuery: string = "", defaultPage: number = 1) {
  const url = new URL(reqUrl);
  const query = url.searchParams.get("q") || defaultQuery;
  const currentPage = Number(url.searchParams.get("page")) || defaultPage;
  const limit = Number(url.searchParams.get("limit")) || defaultLimit;
  let sortBy = SORT_KEYS.find(key => key === url.searchParams.get("sort"));
  let sortDir = (["asc", "desc"] as const).find(key => key === url.searchParams.get("sortd"));
  if (!sortBy) {
    sortBy = 'id'
  }
  if (!sortDir) {
    sortDir = "desc"
  }
  url.searchParams.delete("q");
  url.searchParams.delete("page");
  url.searchParams.delete("limit");
  const results = await findBooks(
    currentPage,
    limit,
    sortBy,
    sortDir,
    query,
    Object.fromEntries(url.searchParams.entries())
  );

  let summary = `Books`;
  const explainers = [];
  const filters = Object.values(Object.fromEntries(url.searchParams))
    .map((item) => `"${item}"`)
    .join(", ");
  if (filters) {
    explainers.push(`for ${filters}`);
  }
  if (query) {
    explainers.push(`matching "${query}"`);
  }

  summary += " " + explainers.join(", ");
  summary += `(${results.total})`;

  return {
    summary,
    results,
  };
}