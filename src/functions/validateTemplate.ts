import execa from "execa";
import options from "src/types/options";
import kleur from "kleur";

// Receives template and checks if the template passed is valid.
const validateTemplate = async (opts: options) => {
  const { stdout } = await execa("npm", [
    "info",
    opts.template,
    "keywords",
    "--json",
  ]);
  if (!stdout) {
    console.error("%s Couldn't validate template", kleur.bold().red("ERR"));
    process.exit(1);
  }
  const res = JSON.parse(stdout);
  opts.verbose && console.log("\n", res);
  if (res.includes("cdjs-template")) {
    console.log("%s Valid template", kleur.bold().green("SUCCESS"));
  } else {
    console.log("%s Invalid template", kleur.bold().red("ERR"));
    process.exit(0);
  }
};

export default validateTemplate;
