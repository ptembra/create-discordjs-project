import chalk from "chalk";
import fs from 'fs'
import { promisify } from "util";
import ncp from "ncp";
import path from "path";
import execa from "execa";
import { projectInstall } from "pkg-install";
import Listr from "listr";

const access = promisify(fs.access)
const copy = promisify(ncp);

const copyTemplateFiles = async (opts) => {
    return copy(opts.templateDirectory, opts.targetDir, { clobber: false })
}

const gitInit = async () => {
    const res = await execa('git', ['init'], {
        cwd: opts.targetDir
    })
    if (res.failed) {
        return Promise.reject(new Error('%s Failed to initialize git', chalk.red.bold('ERR')))
    }
    return
}

export const createProject = async (opts) => {
    opts = {
        ...opts,
        targetDir: opts.targetDir
    };

    const fullPathName = new URL(import.meta.url).pathname;
    const templateDir = path.resolve(
        fullPathName.substr(fullPathName.indexOf('/')),
        '../../templates',
        opts.template.toLowerCase()
    ).slice(3).concat('\\').replace('%20', ' ');

    const targetDirectory = `./${opts.targetDir}`

    opts.targetDir = targetDirectory

    opts.templateDirectory = templateDir;

    try {
        await access(templateDir, fs.constants.R_OK);
    } catch (err) {
        console.error('%s Invalid template name', chalk.bold.red('ERR'))
        process.exit(1)
    }

    const tasks = new Listr([
        {
            title: 'Copying project files',
            task: () => copyTemplateFiles(opts)
        },
        {
            title: 'Intializing Git',
            enabled: () => gitInit(opts),
        },
        {
            title: 'Installing dependencies',
            task: () => projectInstall({ cwd: opts.targetDir }),
            skip: () => !opts.runInstall ? 'Pass --install to automatically install dependencies' : undefined
        },
    ]);

    await tasks.run()
    console.log('%s Project ready', chalk.green.bold('DONE'))
    console.log('Happy hacking!')
    return true;
}