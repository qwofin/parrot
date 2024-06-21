import { useLoaderData } from "@remix-run/react";
import { SimpleBookList } from "~/components/book/SimpleBookList";
import { findBooks } from "~/db/BookRepository";
export const handle = {
  title: "Recently released",
};

export async function loader() {
  const recentlyReleased = await findBooks(1, 12, "releaseDate");

  return recentlyReleased;
}

export default function Page() {
  const data = useLoaderData<typeof loader>();
  return <SimpleBookList books={data.data} />;
}
