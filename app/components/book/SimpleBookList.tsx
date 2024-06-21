import { Link } from "@remix-run/react";
import type { bookSchema } from "~/db/schema";

export type Props = {
  books: (typeof bookSchema.$inferSelect)[];
};

export function SimpleBookList(props: Props) {
  return (
    <div className="space-y-2">
      {props.books.map((book) => (
        <div key={book.id} className="grid grid-cols-12 text-2xl">
          <div className="col-span-7 truncate">
            <Link to={`/simple/book/${book.id}`} className="underline">
              {book.title}
            </Link>
          </div>
          <div className="col-span-4 truncate">{book.authorName}</div>
        </div>
      ))}
    </div>
  );
}
