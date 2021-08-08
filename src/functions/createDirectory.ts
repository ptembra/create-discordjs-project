import { mkdir as mk } from "fs";
import path from "path";
import kleur from "kleur";
import { existsSync } from "fs";
import options from "src/types/options";
import { promisify } from "util";

const mkdir = promisify(mk);

const createDirectory = async (opts: options) => {
  return new Promise(async (resolve, reject) => {
    mkdir(opts.targetDir)
      .then(resolve)
      .catch((err: any) => {
        if (existsSync(opts.targetDir)) {
          console.error(
            "%s Failed to create directory, directory appears to already exists and to have files inside of it",
            kleur.bold().red("ERR")
          );
        } else {
          console.error(
            "%s Failed to create directory",
            kleur.bold().red("ERR")
          );
          if (opts.verbose) console.error(err);
        }
        process.exit(1);
      });
  });
};

export default createDirectory;
