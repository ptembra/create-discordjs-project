import fs from "fs";
import path from "path";
import { promisify } from "util";
const readdir = promisify(fs.readdir);
const rmdir = promisify(fs.rmdir);
const unlink = promisify(fs.unlink);

const rmdirs = async function rmdirs(dir: string) {
  let entries = await readdir(dir, { withFileTypes: true });
  await Promise.all(
    entries.map((entry) => {
      let fullPath = path.join(dir, entry.name);
      return entry.isDirectory() ? rmdirs(fullPath) : unlink(fullPath);
    })
  );
  await rmdir(dir);
};

export default rmdirs;
