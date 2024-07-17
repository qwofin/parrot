import { Search } from "iconoir-react";

export function SimpleSearchInput() {
  return (
    <form action="/simple/books" method="GET" className="max-w-full h-10 w-full">
      <Search />
      <input
        placeholder="Type to search..."
        name="q"
        type="search"
      />
    </form>
  );
}
