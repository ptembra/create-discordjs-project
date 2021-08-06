import { mkdir } from "fs/promises";
import path from "path";
import chalk from "chalk";
import { existsSync } from "fs";

const createDirectory = async (opts) => {
  return new Promise(async (resolve, reject) => {
    mkdir(path.join(process.cwd(), opts.targetDir))
      .then(resolve)
      .catch(() => {
        if (existsSync(path.join(process.cwd(), opts.targetDir))) {
          console.error(
            "%s Failed to create directory, directory appears to already exists and to have files inside of it",
            chalk.bold.red("ERR")
          );
        } else {
          console.error("%s Failed to create directory", chalk.bold.red("ERR"));
        }
        process.exit(1);
      });
  });
};

export default createDirectory;
