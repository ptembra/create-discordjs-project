import execa from "execa";

// Recieves template and checks if the template passed is valid.
const validateTemplate = async (template, opts) => {
  const { stdout } = await execa("npm", [
    "info",
    template,
    "keywords",
    "--json",
  ]);
  const res = JSON.parse(stdout);
  opts.verbose && console.log("\n", res);
  if (res.includes("cdjs-template")) {
    return true;
  } else {
    return "Not a valid template!";
  }
};

export default validateTemplate;
