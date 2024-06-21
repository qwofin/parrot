import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { SimplePagination } from "~/components/SimplePagination";
import { SimpleBookList } from "~/components/book/SimpleBookList";
import { listBooks } from "~/helpers/listBooks";

export async function loader({ request }: LoaderFunctionArgs) {
  return listBooks(request.url, 12);
}

export default function Page() {
  const data = useLoaderData<typeof loader>();
  const searchParams: {[key: string]: string} = data.results.filter || {}
  if (data.results.query) {
    searchParams.q = data.results.query
  }
  return (
    <div className="space-y-10">
      <h1>{data.summary}</h1>
      <SimpleBookList books={data.results.data} />
      <SimplePagination
        page={data.results.page}
        total={Math.ceil(data.results.total / data.results.limit)}
        pathname="/simple/books"
        searchParams={searchParams}
      />
    </div>
  );
}
