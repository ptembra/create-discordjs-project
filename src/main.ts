import kleur from "kleur";
import fs from "fs";
import { promises } from "fs";
import path from "path";
import execa from "execa";
import Listr from "listr";
import VerboseRenderer from "listr-verbose-renderer";
import copyTemplateFiles from "./functions/copyTemplateFiles";
import createDirectory from "./functions/createDirectory";
import options from "./types/options";
import { writeFile } from "gitignore";
import verboseConsole from "./verboseConsole";

let verboseLog: (...args: any[]) => void,
  verboseError: (...args: any[]) => void,
  verboseInfo: (...args: any[]) => void;

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
      new Error(["%s Failed to initialize git", kleur.red().bold("ERR")].join())
    );
  }
  return opts.git;
};

export const createProject = async (opts: options) => {
  ({ verboseLog, verboseError, verboseInfo } = verboseConsole(opts.verbose));

  if (!opts.target) return;

  const rawDirectory = opts.target;

  verboseLog(
    kleur.red().bold("\n VERBOSE MODE \n "),
    kleur.bold("\ntemplate-dir: "),
    opts.templateDir,
    kleur.bold("\ntarget-dir: "),
    opts.target,
    kleur.bold("\nopts: "),
    opts
  );

  verboseLog(
    "Found a bug? Create an issue at: \n",
    kleur
      .underline()
      .blue("https://github.com/Nemesisly/create-discordjs-project/issues"),
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
        title: "☁️ Initializing git",
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

  console.log("%s Project ready", kleur.green().bold("DONE"));
  opts.verbose ||
    console.log(
      "Here are some commands you can run in the project: ",
      kleur.magenta(`\n\n${opts.pkgManager} start`),
      "\n Starts the bot",
      kleur
        .gray()
        .italic(
          " → The bot is run using nodemon meaning that if you save anything the code automatically restarts!"
        ),
      "\n\nWe suggest you run:\n\n",
      kleur.magenta("cd"),
      `${rawDirectory.trim()}\n`,
      kleur.magenta("cp"),
      ".env.TEMPLATE .env\n",
      kleur.magenta(
        `${
          process.platform === "win32"
            ? process.title.toLowerCase().indexOf("cmd") < -1
              ? `".env"`
              : process.title.toLowerCase().indexOf("powershell") < -1 && "ii"
            : "nano"
        }`
      ),
      `${process.title.toLowerCase().indexOf("cmd") < -1 ? "" : ".env"}`,
      kleur.magenta(`${opts.pkgManager}`),
      "start"
    );

  opts.verbose || console.log("Happy hacking!");
  return true;
};
