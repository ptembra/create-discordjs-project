import arg from "arg";
import inquirer from "inquirer";
import chalk from "chalk";
import { createProject } from "./main";
import { checkVersion } from "./functions/checkVersion";

const parseArgumentsIntoOptions = (rawArgs) => {
  const args = arg(
    {
      "--git": Boolean,
      "--yes": Boolean,
      "--install": Boolean,
      "--verbose": Boolean,
      "-g": Boolean,
      "-y": Boolean,
      "-i": Boolean,
      "-v": Boolean,
    },
    {
      argv: rawArgs.slice(2),
    }
  );

  return {
    targetDir: args._[0] || null,
    template: args._[1],
    pkgManager: args._[2],
    skipPrompts: args[("", "--yes", "-y")] || false,
    runInstall: args[("", "--install", "-i")] || false,
    git: args[("", "--git", "-g")] || false,
    verbose: args[("", "--verbose", "-v")] || false,
  };
};

const promptMissingOptions = async (opts) => {
  if (opts.targetDir) {
    const defaultTemplate = "@nemesisly/cdjs-javascript-template";
    const defaultPkgManager = "npm";
    if (opts.skipPrompts) {
      return {
        ...opts,
        template: opts.template || defaultTemplate,
        pkgManager: opts.pkgManager || defaultPkgManager,
      };
    }

    const questions = [];
    if (!opts.template) {
      questions.push({
        type: "input",
        name: "template",
        message: "Please choose a template",
        default: defaultTemplate,
      });
    }
    if (!opts.pkgManager) {
      questions.push({
        type: "list",
        name: "pkgManager",
        message: "Please choose a package manager",
        choices: ["npm", "yarn"],
        default: defaultPkgManager,
      });
    }
    if (!opts.git) {
      questions.push({
        type: "confirm",
        name: "git",
        message: "Do you want to initialize a git repo?",
        default: false,
      });
    }
    if (!opts.runInstall) {
      questions.push({
        type: "confirm",
        name: "runInstall",
        message: "Do you want to install the default dependencies?",
        default: false,
      });
    }

    const answers = await inquirer.prompt(questions);

    return {
      ...opts,
      template: opts.template || answers.template,
      pkgManager: opts.pkgManager || answers.pkgManager,
      git: opts.git || answers.git,
      runInstall: opts.runInstall || answers.runInstall,
    };
  } else {
    console.log(
      "Please specify the project directory:\n",
      chalk.magenta("    create-discordjs-project"),
      chalk.greenBright("<project-directory>\n\n"),
      chalk.reset("For example:\n"),
      chalk.magenta("    create-discordjs-project"),
      chalk.greenBright("my-awesome-bot")
    );
  }
};

export async function cli(args) {
  const runFunctions = async () => {
    await checkVersion();
    let opts = parseArgumentsIntoOptions(args);
    opts = await promptMissingOptions(opts);
    await createProject(opts);
  };

  runFunctions();
}
