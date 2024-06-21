import { useLoaderData } from "@remix-run/react";
import { SimpleBookList } from "~/components/book/SimpleBookList";
import { findBooks } from "~/db/BookRepository";

export async function loader() {
  const recentlyAdded = await findBooks(1, 12);

  return recentlyAdded;
}

export const handle = {
  title: "Recently added",
};

export default function Page() {
  const data = useLoaderData<typeof loader>();
  return <SimpleBookList books={data.data} />;
}
