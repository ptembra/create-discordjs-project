import arg from 'arg';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { createProject } from './main';
import execa from 'execa';
import { maxSatisfying } from 'semver';

import packageJSON from '../package.json'

const parseArgumentsIntoOptions = (rawArgs) => {
    
    const args = arg(
        {
            '--git': Boolean,
            '--yes': Boolean,
            '--install': Boolean,
            '--verbose': Boolean,
            '-g': Boolean,
            '-y': Boolean,
            '-i': Boolean,
            '-v': Boolean,
        },
        {
            argv: rawArgs.slice(2)
        }
    )

    return {
        targetDir: args._[0] || null,
        template: args._[1],
        pkgManager: args._[2],
        skipPrompts: args['', '--yes', '-y'] || false,
        runInstall: args['', '--install', '-i'] || false,
        git: args['', '--git', '-g'] || false,
        verbose: args['', '--verbose', '-v'] || false
    }
}
// Recieves template and checks if the template passed is valid.
const validateTemplate = async (template, opts) => {
    console.log(template)
    const { stdout } = await execa('npm', ['info', template, 'keywords', '--json']);
    const res = JSON.parse(stdout)
    opts.verbose && console.log('\n', res)
    if (res.includes("cdjs-template")) {
        return true
    }
    else {
        return "Not a valid template!"
    }
}

export const checkVersion = async () => {
    const { stdout } = await execa('npm', ['info', 'create-discordjs-project', 'version'])
    const versions = [packageJSON.version, stdout]
    let newestVersion = maxSatisfying(versions, '*')
    if (newestVersion != packageJSON.version) {
        console.log(
            '%s Outdated version!', chalk.bold.yellow('WARNING'),
            chalk.gray.italic('\n → run the command below to update the package\n',
                '   npm update -g create-discordjs-project\n'))
    }
}


const promptMissingOptions = async (opts) => {
    if (opts.targetDir) {
        const defaultTemplate = '@nemesisly/cdjs-javascript-template';
        const defaultPkgManager = 'npm'
        if (opts.skipPrompts) {
            return {
                ...opts,
                template: opts.template || defaultTemplate,
                pkgManager: opts.pkgManager || defaultPkgManager
            }
        }

        const questions = [];
        if (!opts.template) {
            questions.push({
                type: 'input',
                name: 'template',
                message: 'Please choose a template',
                default: defaultTemplate
            })
        }
        if (!opts.pkgManager) {
            questions.push({
                type: 'list',
                name: 'pkgManager',
                message: 'Please choose a package manager',
                choices: ['npm', 'yarn'],
                default: defaultPkgManager
            })
        }
        if (!opts.git) {
            questions.push({
                type: 'confirm',
                name: 'git',
                message: 'Do you want to initialize a git repo?',
                default: false
            })
        }
        if (!opts.runInstall) {
            questions.push({
                type: 'confirm',
                name: 'runInstall',
                message: 'Do you want to install the default dependencies?',
                default: false
            })
        }

        const answers = await inquirer.prompt(questions)

        return {
            ...opts,
            template: opts.template || answers.template,
            pkgManager: opts.pkgManager || answers.pkgManager,
            git: opts.git || answers.git,
            runInstall: opts.runInstall || answers.runInstall
        }
    } else {
        console.log('Please specify the project directory:\n',
            chalk.magenta('    create-discordjs-project'), chalk.greenBright('<project-directory>\n\n'),
            chalk.reset('For example:\n'),
            chalk.magenta('    create-discordjs-project'), chalk.greenBright('my-awesome-bot')
        )
    }
}

export async function cli(args) {
    const runFunctions = async () => {
        await checkVersion()
        let opts = parseArgumentsIntoOptions(args);
        opts = await promptMissingOptions(opts)
        await createProject(opts)
    }

    runFunctions()
}