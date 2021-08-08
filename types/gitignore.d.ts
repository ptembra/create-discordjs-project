declare module "gitignore" {
  import type { WriteStream } from "fs";
  export function writeFile(
    options: { type: string; file: WriteStream },
    callback: (err: any, val: any) => void
  ): void;
}
