import chalk from "chalk";
import fs from "fs";
import { promisify } from "util";
import ncp from "ncp";
import path from "path";
import execa from "execa";
import Listr from "listr";
import copyTemplateFiles from "./functions/copyTemplateFiles";

// REMOVE LATER
import gitignore from "gitignore";
import { projectInstall } from "pkg-install";

const writeGitignore = promisify(gitignore.writeFile);
const makeDir = promisify(fs.mkdir);

const createDirectory = async (opts) => {
  return makeDir(`./${opts.targetDir}`).catch((e) => {
    console.log("%s Failed to create directory", chalk.bold.red("ERR"));
    process.exit(1);
  });
};

const createGitignore = async (opts) => {
  const file = fs.createWriteStream(path.join(opts.targetDir, ".gitignore"), {
    flags: "a",
  });
  return writeGitignore({
    type: "Node",
    file: file,
  });
};

const gitInit = async () => {
  const res = await execa("git", ["init"], {
    cwd: opts.targetDir,
  });
  if (res.failed) {
    return Promise.reject(
      new Error("%s Failed to initialize git", chalk.red.bold("ERR"))
    );
  }
  return opts.git;
};

export const createProject = async (opts) => {
  opts = {
    ...opts,
  };

  console.log(opts.targetDir);

  if (!opts.targetDir) return;

  const fullPathName = new URL(import.meta.url).pathname;
  const rawDirectory = opts.targetDir;

  // const targetDirectory = `./${opts.targetDir}`
  // opts.targetDir = targetDirectory;

  const templateDir = path
    .join(
      process.platform === "win32" ? fullPathName.substr(3) : fullPathName,
      `${opts.targetDir}/node_modules/`,
      opts.template.toLowerCase()
    )
    .replace("%20", " ");

  opts.templateDirectory = templateDir;

  opts.verbose &&
    console.log(
      chalk.red.bold("\n VERBOSE MODE \n "),
      chalk.bold("\ntemplate-dir: "),
      templateDir,
      chalk.bold("\ntarget-dir: "),
      targetDirectory,
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

  //   async function run(opts) {
  //     console.log(1);

  //     await createDirectory(opts);
  //     console.log(1);

  //     console.log(path.resolve(process.cwd(), opts.targetDir));

  //     console.log(1);
  //     // await copyTemplateFiles
  //   }

  //   await run(opts);

  //   process.exit(0);

  console.log(`${opts.templateDirectory}/.`);
  const tasks = new Listr(
    [
      {
        title: !opts.verbose ? "📁 Creating project directory" : "",
        task: () => createDirectory(opts),
      },
      {
        title: "🔗 Installing template",
        task: async () => {
          await execa("npm", ["init", "-y"], {
            cwd: path.resolve(process.cwd(), opts.targetDir),
            all: true,
          });
          await execa("npm", ["install", opts.template], {
            cwd: path.resolve(process.cwd(), opts.targetDir),
            all: true,
          });
        },
      },
      {
        title: !opts.verbose
          ? "📜 Copying project template into your project"
          : "",
        task: () => copyTemplateFiles(opts),
      },
      {
        title: !opts.verbose ? "🦺 Creating gitignore" : "",
        task: () => createGitignore(opts),
      },
      {
        title: !opts.verbose ? "☁ Initializing git" : "",
        task: () => gitInit(opts),
        enabled: () => opts.git,
      },
      {
        title: !opts.verbose ? "🚚 Installing dependencies" : "",
        task: () =>
          projectInstall({
            cwd: opts.targetDir,
          }),
        skip: () =>
          !opts.runInstall
            ? "Pass --install to automatically install required dependencies"
            : undefined,
      },
    ],
    {
      exitOnError: false,
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
      chalk.magenta(`${opts.pkgManager} start\n`)
    );
  opts.verbose || console.log("Happy hacking!");
  return true;
};
