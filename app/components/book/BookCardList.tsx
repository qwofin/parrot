import type { bookSchema } from "~/db/schema";
import { BookCard } from "./BookCard";

export type Props = {
  books: typeof bookSchema.$inferSelect[];
};


export function BookCardList(props: Props) {
  return (<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
    {props.books.map(book => (<BookCard key={book.id} book={book}/>))}
  </div>      
  )
}