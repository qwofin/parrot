import { Input } from "@nextui-org/react";
import { Search } from "iconoir-react";

export function SearchInput(props: { action: string } = { action: "/books" }) {
  return (
    <form action={props.action} method="GET" className="max-w-full h-10 w-full">
      <Input
        classNames={{
          base: "max-w-full h-10",
          mainWrapper: "h-full",
          input: "text-small",
          inputWrapper:
            "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
        }}
        placeholder="Type to search..."
        size="sm"
        name="q"
        startContent={<Search />}
        type="search"
      />
    </form>
  );
}
