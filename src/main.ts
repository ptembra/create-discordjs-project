import chalk from "chalk";
import fs from "fs";
import { promises } from "fs";
import { promisify } from "util";
import path from "path";
import execa from "execa";
import Listr from "listr";
import VerboseRenderer from "listr-verbose-renderer";

import copyTemplateFiles from "./functions/copyTemplateFiles";
import createDirectory from "./functions/createDirectory";
import options from "./types/options";

// REMOVE LATER
import { writeFile } from "gitignore";

const writeGitignore = (opts: { type: string; file: fs.WriteStream }) =>
  new Promise((resolve, reject) => {
    writeFile(opts, (err: any, val: any) => {
      if (err) reject(err);
      else resolve(val);
    });
  });

const createGitignore = async (opts: options) => {
  const file = fs.createWriteStream(path.join(opts.target, ".gitignore"), {
    flags: "a",
  });
  return writeGitignore({
    type: "Node",
    file: file,
  });
};

const gitInit = async (opts: options) => {
  const res = await execa("git", ["init"], {
    cwd: opts.target,
  });
  if (res.failed) {
    return Promise.reject(
      new Error(["%s Failed to initialize git", chalk.red.bold("ERR")].join())
    );
  }
  return opts.git;
};

export const createProject = async (opts: options) => {
  opts = {
    ...opts,
  };

  if (!opts.target) return;

  const rawDirectory = opts.target;

  opts.verbose &&
    console.log(
      chalk.red.bold("\n VERBOSE MODE \n "),
      chalk.bold("\ntemplate-dir: "),
      opts.templateDir,
      chalk.bold("\ntarget-dir: "),
      opts.target,
      chalk.bold("\nopts: "),
      opts
    );

  opts.verbose &&
    console.log(
      "Found a bug? Create an issue at: \n",
      chalk.underline.blue(
        "https://github.com/Nemesisly/create-discordjs-project/issues"
      ),
      "\n"
    );

  const tasks = new Listr(
    [
      {
        title: "📁 Creating project directory",
        task: () => createDirectory(opts),
        skip: () => {
          return new Promise((resolve, reject) => {
            promises
              .readdir(opts.targetDir)
              .then((files) => {
                if (files.length == 0) resolve(true);
                resolve(false);
              })
              .catch(() => {
                resolve(false);
              });
          });
        },
      },
      {
        title: "🔗 Installing template",
        task: async () => {
          await execa("npm", ["init", "-y"], {
            cwd: opts.targetDir,
            all: true,
          });
          await execa("npm", ["install", opts.template], {
            cwd: opts.targetDir,
            all: true,
          });
        },
      },
      {
        title: "📜 Copying project template into your project",
        task: () => copyTemplateFiles(opts),
      },
      {
        title: "🦺 Creating gitignore",
        task: () => createGitignore(opts),
      },
      {
        title: "☁ Initializing git",
        task: () => gitInit(opts),
        enabled: () => opts.git,
      },
      {
        title: "🚚 Installing dependencies",
        task: () =>
          execa(opts.pkgManager, ["install"], {
            cwd: opts.targetDir,
            all: true,
          }),
        skip: () =>
          !opts.runInstall
            ? "Pass --install to automatically install required dependencies"
            : undefined,
      },
    ],
    {
      renderer: opts.verbose ? VerboseRenderer : undefined,
    }
  );

  await tasks.run();

  console.log("%s Project ready", chalk.green.bold("DONE"));
  opts.verbose ||
    console.log(
      "Here are some commands you can run in the project: ",
      chalk.magenta(`\n\n${opts.pkgManager} start`),
      "\n Starts the bot",
      chalk.gray.italic(
        " → The bot is run using nodemon meaning that if you save anything the code automatically restarts!"
      ),
      "\n\nWe suggest you run:\n\n",
      chalk.magenta("cd"),
      `${rawDirectory.trim()}\n`,
      chalk.magenta(`cp .env.TEMPLATE .env\n`),
      chalk.magenta(`nano .env\n`),
      chalk.magenta(`${opts.pkgManager} start\n`)
    );
  opts.verbose || console.log("Happy hacking!");
  return true;
};
