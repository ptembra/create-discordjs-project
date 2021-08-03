import chalk from "chalk";
import fs from 'fs'
import { promisify } from "util";
import ncp from "ncp";
import path from "path";
import execa from "execa";
import { projectInstall } from "pkg-install";
import Listr from "listr";
import boxen from "boxen";
import gitignore from 'gitignore'

const access = promisify(fs.access)
const copy = promisify(ncp);
const writeGitignore = promisify(gitignore.writeFile);
const writeFile = promisify(fs.writeFile);

const copyTemplateFiles = async (opts) => {
    return copy(opts.templateDirectory, opts.targetDir, { clobber: false })
}

async function createGitignore(opts) {
    const file = fs.createWriteStream(
        path.join(opts.targetDir, '.gitignore'),
        { flags: 'a' }
    );
    return writeGitignore({
        type: 'Node',
        file: file,
    });
}

const gitInit = async () => {
    const res = await execa('git', ['init'], {
        cwd: opts.targetDir
    })
    if (res.failed) {
        return Promise.reject(new Error('%s Failed to initialize git', chalk.red.bold('ERR')))
    }
    return opts.git
}

export const createProject = async (opts) => {
    opts = {
        ...opts,
    };

    if (!opts.targetDir) return

    const fullPathName = new URL(import.meta.url).pathname;

    // fullPathName.substr(fullPathName.indexOf('/')),

    const rawDirectory = opts.targetDir

    const templateDir = path.join(
        process.platform === "win32" ? fullPathName.substr(3) : fullPathName,
        '../../templates',
        opts.template.toLowerCase()
    ).concat('\\').replace('%20', ' ');

    const targetDirectory = `./${opts.targetDir}/`


    opts.targetDir = targetDirectory

    opts.templateDirectory = templateDir;

    try {
        await access(templateDir, fs.constants.R_OK);
    } catch (err) {
        console.error('%s Invalid template name', chalk.bold.red('ERR'))
        process.exit(1)
    }

    const tasks = new Listr(
        [
            {
                title: '📜 Copying project files',
                task: () => copyTemplateFiles(opts),
            },
            {
                title: '❌ Creating gitignore',
                task: () => createGitignore(opts),
            },
            {
                title: '☁ Initializing git',
                task: () => initGit(opts),
                enabled: () => opts.git,
            },
            {
                title: '🚚 Installing dependencies',
                task: () =>
                    projectInstall({
                        cwd: opts.targetDir,
                    }),
                skip: () =>
                    !opts.runInstall
                        ? 'Pass --install to automatically install required dependencies'
                        : undefined,
            },
        ],
        {
            exitOnError: false,
        }
    );

    await tasks.run()
    console.log('%s Project ready', chalk.green.bold('DONE'))
    console.log(
        'Here are some commands you can run in the project: ',
        chalk.cyanBright(`\n\n${opts.pkgManager} start`),
        '\n Starts the bot',
        chalk.gray.italic(' → The bot is run using nodemon meaning that if you save anything the code automatically restarts!'),
        '\n\nWe suggest you run:\n\n',
        chalk.cyanBright('cd'),
        `${rawDirectory.trim()}\n`,
        chalk.cyanBright(`${opts.pkgManager} start\n`))
    console.log('Happy hacking!')
    return true;
}