import convict from "convict";
import fs from "node:fs";
const FILE = "./config/config.json";
const schema = {
  convert: {
    outDir: {
      default: "/app/cache"
    },
    path: {
      default: "/opt/calibre/ebook-convert",
    },
    formats: {
      mobi: {
        enabled: {
          default: true,
        },
        args: {
          default: ["--mobi-file-type", "old"],
        },
      },
      epub: {
        enabled: {
          default: true,
        },
        args: {
          default: ["--epub-toc-at-end"],
        },
      },
    },
  },
  task: {
    sync: {
      schedule: {
        default: "0 */15 * * * *",
      },
    },
    clear_conversion_cache: {
      schedule: {
        default: "0 0 */6 * * *"
      }
    }
  },
};

export const config = convict(schema);
if (fs.existsSync(FILE)) {
  config.loadFile(FILE);
  config.validate({ allowed: "strict" });
}

export function saveConfig() {
  fs.writeFileSync(FILE, config.toString());
}
