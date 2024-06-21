import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const filename = url.searchParams.get("filename")!;
  const format = url.searchParams.get("format")!;

  return {
    id: params.id,
    filename,
    format
  }
}


export default function Page() {
  const data = useLoaderData<typeof loader>();
  const url = `/file/${data.id}/download/${data.filename}.${data.format}?format=${data.format}`;

  return (
    <>
      <p className="text-center text-xl">Hang on while your book is converted...</p>
      <script dangerouslySetInnerHTML={{
        __html: `window.location.href = "${url}";`
      }} />
    </>
  );
}
