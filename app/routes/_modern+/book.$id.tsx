import { db } from "~/db/conn";
import { bookSchema, type fileSchema } from "~/db/schema";
import { Image, Link } from "@nextui-org/react";
import { eq } from "drizzle-orm";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { converter } from "~/services/Converter";
import { SimpleDownloadButton } from "~/components/book/SimpleDownloadButton";

export async function loader({ params }: LoaderFunctionArgs) {
  const book = await db.query.bookSchema.findFirst({
    where: eq(bookSchema.id, Number(params.id)),
    with: {
      files: true,
    },
  });
  if (!book) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
  const conversionSource = converter.findConversionSource(book.files);
  const targets = converter.generateConversions(book.files);

  return {
    book,
    conversion: {
      source: conversionSource,
      targets,
    },
  };
}

export default function BookPage() {
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
              <Link href={`/books?sort=releaseDate&sortd=asc&seriesTitle=${titleSplit[0]}`}>{series}</Link>
            </div>
          );
        })}
      </>
    );
  }

  function renderGenres(item: typeof data.book) {
    if (!item?.genres) return null;
    return (
      <>
        {item.genres
          .map<React.ReactNode>((genre) => {
            return (
              <Link key={genre} href={`/books?genres=${genre}`}>
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
          <Link href={`/books?authorName=${data.book.authorName}`}>
            {data.book.authorName}
          </Link>
        </h2>
        <h1 className="text-4xl">{data.book.title}</h1>
        <h2>{renderSeries(data.book)}</h2>
        <p className="mt-10">{renderGenres(data.book)}</p>
        <p className="mt-10">{data.book.description}</p>
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
      </div>
      <div className="md:col-span-2">
        <Image
          src={data.book.cover!}
          alt="book cover"
          radius="none"
          className="object-fill z-0"
        />
      </div>
    </main>
  );
}
