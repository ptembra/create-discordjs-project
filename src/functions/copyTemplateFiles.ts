import path from "path";
import { promisify } from "util";
import ncp from "ncp";
import { unlink as ul } from "fs";
import options from "src/types/options";
import rmdir from "./rmDirForce";
// const access = promisify(fs.access);
const copy = promisify(ncp);
const unlink = promisify(ul);

const copyTemplateFiles = async (opts: options) => {
  const template = path.join(opts.templateDir, "files");
  const target = opts.targetDir;

  await unlink(path.join(target, "package-lock.json"));
  await unlink(path.join(target, "package.json"));
  await copy(template, target);
  await rmdir(path.join(target, "node_modules"));
};
export default copyTemplateFiles;
