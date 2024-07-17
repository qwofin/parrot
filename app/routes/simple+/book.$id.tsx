import { type fileSchema } from "~/db/schema";
import { Link, useLoaderData } from "@remix-run/react";
import { SimpleDownloadButton } from "~/components/book/SimpleDownloadButton";
import { loader } from "~/routes/_modern+/book.$id";

export { loader };

export default function Page() {
  const data = useLoaderData<typeof loader>();
  const files: { [format: string]: typeof fileSchema.$inferSelect } = {};
  for (const file of data.book.files) {
    const format = file.path.split(".").pop() as string;
    if (!files[format]) {
      files[format] = file;
    }
  }

  function renderSeries(item: typeof data.book) {
    if (!item?.seriesTitle) return null;
    const split = item.seriesTitle.split(";").map((series) => series.trim());
    return (
      <>
        {split.map((series) => {
          const titleSplit = series.split("#");
          return (
            <div key={series}>
              <Link
                to={`/simple/books?seriesTitle=${titleSplit[0]}`}
                className="underline"
              >
                {series}
              </Link>
            </div>
          );
        })}
      </>
    );
  }

  function renderGenres(item: typeof data.book) {
    if (!item?.genres?.length) return null;
    return (
      <>
        {item.genres
          .map<React.ReactNode>((genre) => {
            return (
              <Link key={genre} to={`/simple/books?genres=${genre}`} className="underline">
                {genre}
              </Link>
            );
          })
          .reduce((prev, curr) => [prev, ", ", curr])}
      </>
    );
  }

  return (
    <main className="grid grid-cols-1 md:grid-cols-7 gap-10 space-y-10">
      <div className="md:col-span-5 md:order-last">
        <h2>
          <Link
            to={`/simple/books?authorName=${data.book.authorName}`}
            className="underline"
          >
            {data.book.authorName}
          </Link>
        </h2>
        <h1 className="text-3xl">{data.book.title}</h1>
        <h2>{renderSeries(data.book)}</h2>
        <p className="mt-10">{renderGenres(data.book)}</p>
        <div className="mt-10 grid grid-cols-2">
          <div>
            <h3 className="mb-2">Downloads</h3>
            <div className="space-x-2">
              {Object.entries(files).map(([format, file]) => (
                <SimpleDownloadButton
                  key={file.id}
                  format={format}
                  fileId={file.id}
                  filename={data.book.title}
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-2">Conversions</h3>
            <div className="space-x-2">
              {Object.keys(data.conversion.targets).map((format) => (
                <SimpleDownloadButton
                  key={format}
                  format={format}
                  fileId={data.conversion.source.id}
                  filename={data.book.title}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="mt-10">{data.book.description}</p>
      </div>
      <div className="md:col-span-2">
        <img
          src={data.book.cover!}
          alt="book cover"
          className="object-fill z-0"
        />
      </div>
    </main>
  );
}
