import execa from "execa";
import options from "src/types/options";
import chalk from "chalk";

// Receives template and checks if the template passed is valid.
const validateTemplate = async (opts: options) => {
  const { stdout } = await execa("npm", [
    "info",
    opts.template,
    "keywords",
    "--json",
  ]);
  const res = JSON.parse(stdout);
  opts.verbose && console.log("\n", res);
  if (!res.includes("cdjs-template")) {
    console.log("%s Invalid template", chalk.bold.red("ERR"));
    process.exit(0);
  }
};

export default validateTemplate;
