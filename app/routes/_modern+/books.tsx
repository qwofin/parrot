import type { LoaderFunctionArgs } from "@remix-run/node";
import { WrappedPagination } from "~/components/WrappedPagination";
import { BookCardList } from "~/components/book/BookCardList";
import { useLoaderData } from "@remix-run/react";
import { listBooks } from "~/helpers/listBooks";
export async function loader({ request }: LoaderFunctionArgs) {
  return listBooks(request.url)
}

export default function BooksPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="space-y-10 grid justify-items-stretch">
      <h1>{data.summary}</h1>
      <BookCardList books={data.results.data} />
      <WrappedPagination
        isCompact
        showControls
        total={Math.ceil(data.results.total / data.results.limit)}
        initialPage={data.results.page}
        className="justify-self-center"
      />
    </div>
  );
}
