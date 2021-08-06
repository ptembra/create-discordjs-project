import path from "path";
import { promisify } from "util";
import ncp from "ncp";
import { unlink, rmdir } from "fs/promises";
// const access = promisify(fs.access);
const copy = promisify(ncp);

const copyTemplateFiles = async (opts) => {
  const template = path.join(opts.templateDirectory, "files");
  const target = path.join(process.cwd(), opts.targetDir);

  await unlink(path.join(target, "package-lock.json"));
  await unlink(path.join(target, "package.json"));
  await copy(template, target);
  await rmdir(path.join(target, "node_modules"), {
    recursive: true,
    force: true,
  });
};
export default copyTemplateFiles;
