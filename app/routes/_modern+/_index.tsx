import { Link } from "@nextui-org/react";
import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BookCardList } from "~/components/book/BookCardList";
import { findBooks } from "~/db/BookRepository";
import { db } from "~/db/conn";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader() {
  const anyBooks = await db.query.bookSchema.findFirst()
  const recentlyAdded = await findBooks(1, 12);
  const recentlyReleased = await findBooks(1, 12, "releaseDate");

  return json({
    recentlyAdded,
    recentlyReleased,
    anyBooksFound: anyBooks !== undefined
  });
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  if (!data.anyBooksFound) {
    return <div>
      <h1 className="text-center">
        There do not seem to be any books found - you might wanna <Link href="/readarr">set up a readarr source</Link> .
      </h1>
    </div>
  }

  return (
    <div className="space-y-10 grid">
      <h2>Recently added</h2>
      <BookCardList books={data.recentlyAdded.data} />
      <h2>Recently released</h2>
      <BookCardList books={data.recentlyReleased.data} />
    </div>
  );
}
