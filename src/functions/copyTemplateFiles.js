import path from "path";
import { promisify } from "util";
import ncp from "ncp";
// const access = promisify(fs.access);
const copy = promisify(ncp);

const copyTemplateFiles = async (opts) => {
  console.log(
    "THIS IS THE LOG",
    opts.templateDirectory,
    `\n${opts.targetDir}\\.`
  );
  //   await copy(opts.templateDirectory, `${opts.targetDir}\\.`);
};
export default copyTemplateFiles;
