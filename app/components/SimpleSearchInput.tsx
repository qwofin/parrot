import { Search } from "iconoir-react";

export function SimpleSearchInput() {
  return (
    <form action="/simple/books" method="GET" className="max-w-full h-10 w-full">
      <Search />
      <input
        // classNames={{
        //   base: "max-w-full h-10",
        //   mainWrapper: "h-full",
        //   input: "text-small",
        //   inputWrapper:
        //     "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
        // }}
        placeholder="Type to search..."
        name="q"
        type="search"
      />
    </form>
  );
}
