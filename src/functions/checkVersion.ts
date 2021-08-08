// Checks version in package.lock and compares it to current npm version
import execa from "execa";
import { maxSatisfying } from "semver";
import kleur from "kleur";

const { version }: { version: string } = require("../../package.json");

export const checkVersion = async () => {
  const { stdout } = await execa("npm", [
    "info",
    "create-discordjs-project",
    "version",
  ]);
  const versions = [version, stdout];
  let newestVersion = maxSatisfying(versions, "*");
  if (newestVersion != version) {
    console.log(
      "%s Outdated version!",
      kleur.bold().yellow("WARNING"),
      kleur
        .gray()
        .italic(
          "\n → run the command below to update the package\n   npm update -g create-discordjs-project\n"
        )
    );
  }
};
