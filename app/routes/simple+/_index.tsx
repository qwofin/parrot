import { Link, useLoaderData } from "@remix-run/react";
import { SimpleBookList } from "~/components/book/SimpleBookList";
import { findBooks } from "~/db/BookRepository";

export const handle = {
  title: "Menu"
}
export async function loader() {
  const recentlyAdded = await findBooks(1, 4);

  return recentlyAdded;
}

export default function Page() {
  const data = useLoaderData<typeof loader>();
  const menu = [
    ["./recently-added", "Recently added"],
    ["./recently-released", "Recently released"],
    ["./books", "Books"],
  ]

  return (
    <>
    <ul className="divide-y border border-black">
      {menu.map((item, idx) => (<li key={idx} className="w-full flex border-black"><Link to={item[0]} className="underline w-full py-6 text-center">{item[1]}</Link></li>))}
    </ul>
    <h3 className="text-2xl my-5">Most recently added</h3>
    <SimpleBookList books={data.data} />
    </>
  );
}
