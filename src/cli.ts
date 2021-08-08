import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { prompt } from "enquirer";
import kleur from "kleur";
import { createProject } from "./main";
import { checkVersion } from "./functions/checkVersion";
import checkWifi from "./functions/checkWifi";

import options, { incompleteOptions } from "./types/options";
import getDirs from "./functions/getDirs";
import validateTemplate from "./functions/validateTemplate";

const parseArgumentsIntoOptions = async (
  rawArgs: string[]
): Promise<incompleteOptions> => {
  const argv = await yargs(hideBin(rawArgs)).options({
    g: { alias: "git", type: "boolean", default: false },
    y: { alias: "yes", type: "boolean", default: false },
    i: { alias: "install", type: "boolean", default: false },
    v: { alias: "verbose", type: "boolean", default: false },
  }).argv;

  return {
    target: argv._[0]?.toString() ?? null,
    template: argv._[1]?.toString() ?? null,
    pkgManager: argv._[2]?.toString() ?? null,
    skipPrompts: argv.y,
    runInstall: argv.i,
    git: argv.g,
    verbose: argv.v,
  };
};

function compileDirs(opts: incompleteOptions): options {
  return { ...opts, ...getDirs(opts.template, opts.target) };
}

const promptMissingOptions = async (
  opts: incompleteOptions
): Promise<options> => {
  if (opts.target) {
    const defaultTemplate = "@nemesisly/javascript";
    const defaultPkgManager = "npm";
    if (opts.skipPrompts) {
      return compileDirs({
        ...opts,
        template: opts.template || defaultTemplate,
        pkgManager: opts.pkgManager || defaultPkgManager,
      });
    }

    const questions = [];
    if (!opts.template) {
      questions.push({
        type: "input",
        name: "template",
        message: "Please choose a template",
        initial: defaultTemplate,
      });
    }
    if (!opts.pkgManager) {
      questions.push({
        type: "select",
        name: "pkgManager",
        message: "Please choose a package manager",
        choices: ["npm", "yarn"],
        initial: defaultPkgManager,
      });
    }
    if (!opts.git) {
      questions.push({
        type: "confirm",
        name: "git",
        message: "Do you want to initialize a git repo?",
        initial: false,
      });
    }
    if (!opts.runInstall) {
      questions.push({
        type: "confirm",
        name: "runInstall",
        message: "Do you want to install the default dependencies?",
        initial: false,
      });
    }

    // const answers = await inquirer.prompt(questions);
    const answers: {
      template: string;
      pkgManager: "npm" | "yarn";
      git: boolean;
      runInstall: boolean;
    } = await prompt(questions);

    return compileDirs({
      ...opts,
      template: opts.template || answers.template,
      pkgManager: opts.pkgManager || answers.pkgManager,
      git: opts.git || answers.git,
      runInstall: opts.runInstall || answers.runInstall,
    });
  } else {
    console.log(
      "Please specify the project directory:\n",
      kleur.magenta("    create-discordjs-project"),
      kleur.green("<project-directory>\n\n"),
      kleur.reset("For example:\n"),
      kleur.magenta("    create-discordjs-project"),
      kleur.green("my-awesome-bot")
    );
    process.exit(0);
  }
};

export async function cli(args: string[]) {
  await checkWifi();
  await checkVersion();
  const incompleteOptions = await parseArgumentsIntoOptions(args);
  const opts = await promptMissingOptions(incompleteOptions);
  await validateTemplate(opts);
  await createProject(opts);
}
