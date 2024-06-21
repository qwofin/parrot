import type { bookSchema, fileSchema } from "~/db/schema";
import { Readarr } from "./Readarr";
import { execa } from "execa";
import Path from "node:path";
import fs from "node:fs"
import { config } from "~/settings.server";

// lowest to highest
const SOURCE_PREFERENCE = ["azw3", "azw", "mobi", "epub"];

export class Conversion {
  source: string;
  outDir: string;
  format: string;
  cover?: string;
  status: number = 0;
  error?: string;
  createdAt: number;

  constructor(source: string, outDir: string, format: string, cover?: string) {
    this.source = source;
    this.outDir = outDir;
    this.format = format;
    this.cover = cover;
    this.createdAt = Date.now()
  }

  async start() {
    this.status = 1;

    const binPath = config.get("convert.path");
    const formats = config.get(`convert.formats`)
    let conf = {args: []}
    // @ts-expect-error why is this so hard in typescript
    if (formats[this.format]) {
      // @ts-expect-error ...
      conf = formats[this.format]
    }
    const cmdArgs = []
    if (this.cover) {
      cmdArgs.push("--cover", this.cover)
    }
    const result = await execa(binPath, [this.source, this.outFile, ...cmdArgs, ...conf.args]);
    if (result.exitCode !== 0) {
      this.status = -1;
      this.error = result.stderr;
    } else {
      this.status = 2;
    }
    return this;
  }

  isDone() {
    return this.isSuccessful() || this.status < 0;
  }

  isSuccessful() {
    return this.status === 2;
  }

  get outFile(): string {
    const file = Path.parse(this.source);
    return this.outDir + "/" + file.name + "." + this.format;
  }

  static createFailed(
    source: string,
    outDir: string,
    format: string,
    error: string
  ) {
    const conv = new this(source, outDir, format);
    conv.error = error;
    conv.status = -1;
    return conv;
  }

  static createNoConvert(source: string, outDir: string, format: string) {
    const conv = new this(source, outDir, format);
    conv.status = 2;
    return conv;
  }
}

export class Converter {
  protected conversions: { [id: string]: Conversion } = {};
  protected outputDir = config.get("convert.outDir");

  async convert(
    file: typeof fileSchema.$inferSelect,
    book: typeof bookSchema.$inferSelect,
    format: string | null,
  ): Promise<Conversion> {
    const id = `${file.bookId}#${format}`
    if (this.conversions[id]) {
      return this.conversions[id];
    }

    let path = file.path;
    const sourceFormat = Path.parse(path).ext.slice(1);
    if (file.sourceReadarrId) {
      const readarr = await Readarr.getForId(file.sourceReadarrId);
      try {
        path = readarr.resolvePath(path);
      } catch (err) {
        this.conversions[id] = Conversion.createFailed(
          path,
          this.outputDir,
          format || sourceFormat,
          (err as Error).message
        );
        return this.conversions[id];
      }
    }
    const fileMeta = Path.parse(path);

    if (sourceFormat === format || !format) {
      return Conversion.createNoConvert(path, fileMeta.dir, sourceFormat);
    }

    const conv = new Conversion(path, this.outputDir, format, book.cover || undefined);
    this.conversions[id] = conv;
    return conv.start();
  }

  generateConversions(files: (typeof fileSchema.$inferSelect)[]): {
    [format: string]: { enabled: boolean; args: string[] };
  } {
    const formats = config.get("convert.formats");
    for (const [format, settings] of Object.entries(formats)) {
      if (!settings.enabled) {
        delete formats[format as keyof typeof formats];
      }
    }
    for (const file of files) {
      const ext = Path.parse(file.path).ext.slice(1);
      if (ext in formats) {
        delete formats[ext as keyof typeof formats];
      }
    }

    return formats;
  }

  findConversionSource(
    files: (typeof fileSchema.$inferSelect)[]
  ): typeof fileSchema.$inferSelect {
    const ordered = files.slice().sort((a, b) => {
      const aRank = SOURCE_PREFERENCE.indexOf(Path.parse(a.path).ext.slice(1));
      const bRank = SOURCE_PREFERENCE.indexOf(Path.parse(b.path).ext.slice(1));

      if (aRank > bRank) {
        return 1;
      } else if (aRank < bRank) {
        return -1;
      }

      return 0;
    });

    return ordered[0];
  }

  async clearCache() {
    const cutoff = Date.now() - 5*60*1000  // 5 mins
    for (const [id, conv] of Object.entries(this.conversions)) {
      if (conv.isDone() && conv.createdAt < cutoff ) {
        await fs.promises.unlink(conv.outFile)
        delete this.conversions[id]
      }
    }
  }
}

export const converter = new Converter();
