import { db } from "~/db/conn";
import { fileSchema } from "~/db/schema";
import { converter } from "~/services/Converter";
import { eq } from "drizzle-orm";
import fs from "node:fs";
import Path from "node:path";
import type { ReadableOptions } from "node:stream";
import type { LoaderFunctionArgs } from "@remix-run/node";
function streamFile(
  path: string,
  options?: ReadableOptions
): ReadableStream<Uint8Array> {
  const downloadStream = fs.createReadStream(path, options);

  return new ReadableStream({
    start(controller) {
      downloadStream.on("data", (chunk: Buffer) =>
        controller.enqueue(new Uint8Array(chunk))
      );
      downloadStream.on("end", () => controller.close());
      downloadStream.on("error", (error: NodeJS.ErrnoException) =>
        controller.error(error)
      );
    },
    cancel() {
      downloadStream.destroy();
    },
  });
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const format = url.searchParams.get("format")
  const file = await db.query.fileSchema.findFirst({
    where: eq(fileSchema.id, Number(params.id)),
    with: {
      book: true
    }
  });
  if (!file) {
    return new Response("File not found", { status: 404 });
  }
  const conv = await converter.convert(file, file.book, format);
  const stats = await fs.promises.stat(conv.outFile);
  const data: ReadableStream<Uint8Array> = streamFile(conv.outFile);
  return new Response(data, {
    status: 200,
    headers: new Headers({
      "content-disposition": `attachment; filename*="UTF-8''${encodeURIComponent(Path.basename(conv.outFile))}"`,
      "content-type": "plain/text",
      "content-length": stats.size.toString(),
    }),
  });
}
