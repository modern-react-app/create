#!/usr/bin/env node
'use strict';

const chalk = require('chalk');
const path = require('path');
const promises = require('fs/promises');
const validatePackageName = require('validate-npm-package-name');

const _interopDefaultLegacy = e => e && typeof e === 'object' && 'default' in e ? e : { default: e };

const validatePackageName__default = /*#__PURE__*/_interopDefaultLegacy(validatePackageName);

class ErrorWithCode extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.message = message;
    }
}
class ErrNodeVersion extends ErrorWithCode {
    constructor(version) {
        super(`You are running Node "${chalk.bold(version)}".\nModern React App requires Node 14 or higher. \nPlease update your version of Node.`, 1);
    }
}
class ErrUnknownArg extends ErrorWithCode {
    constructor(argument) {
        super(`Unknown argument "${chalk.bold(argument)}".`, 2);
    }
}
class ErrUnknownOpt extends ErrorWithCode {
    constructor(option) {
        super(`Unknown option "${chalk.bold(option)}".`, 3);
    }
}
class ErrUnknownTemp extends ErrorWithCode {
    constructor(template) {
        super(`Unknown template "${chalk.bold(template)}".`, 4);
    }
}
class ErrInvalidPkgName extends ErrorWithCode {
    constructor(name, errors) {
        super(`Invalid app name "${chalk.bold(name)}"\n${errors.join(", ")}`, 5);
    }
}

class ArgvParser {
    constructor(logger) {
        this.logger = logger;
        this.argv = process.argv.slice(2, process.argv.length);
        this.positional = [];
        this.values = {};
        this.options = {};
    }
    parse() {
        for (let i = 0; i < this.argv.length; i++) {
            const arg = this.argv[i];
            const pArg = i - 1 in this.argv ? this.argv[i - 1] : null;
            const nArg = i + 1 in this.argv ? this.argv[i + 1] : null;
            if ((!arg.startsWith("--") && pArg === null) ||
                (!arg.startsWith("--") &&
                    pArg !== null &&
                    !pArg.startsWith("--"))) {
                this.positional.push(arg);
                continue;
            }
            if (arg.startsWith("--") &&
                nArg !== null &&
                !nArg.startsWith("--")) {
                this.values[arg.substring(2, arg.length)] = nArg;
                i++;
                continue;
            }
            this.options[arg.substring(2, arg.length)] = true;
        }
    }
    validate({ positionals, values, options }) {
        this.positional.forEach((arg) => {
            if (!positionals.includes(arg)) {
                this.logger.error(new ErrUnknownArg(arg));
            }
        });
        Object.keys(this.values).forEach((arg) => {
            if (!values.includes(arg)) {
                this.logger.error(new ErrUnknownArg(arg));
            }
        });
        Object.keys(this.options).forEach((opt) => {
            if (!options.includes(opt)) {
                this.logger.error(new ErrUnknownOpt(opt));
            }
        });
    }
    at(index) {
        return index in this.positional ? this.positional[index] : null;
    }
    value(name) {
        return name in this.values ? this.values[name] : null;
    }
    option(name) {
        return name in this.options ? this.options[name] : null;
    }
}

class TemplatesManager {
    constructor(logger) {
        this.logger = logger;
        this.templatesPath = path.resolve(__dirname, "../templates");
    }
    async checkTemplateExists(name) {
        try {
            return promises.stat(path.join(this.templatesPath, name)).then((x) => x.isDirectory());
        }
        catch (e) {
            return false;
        }
    }
    async getTemplateFiles(name) {
        const templateExists = await this.checkTemplateExists(name);
        if (templateExists) {
            const files = [];
            for (const filename of await promises.readdir(path.join(this.templatesPath, name))) {
                const fileStat = await promises.stat(path.join(this.templatesPath, name, filename));
                if (fileStat.isFile()) {
                    const content = await promises.readFile(path.join(this.templatesPath, name, filename), {
                        encoding: "utf-8",
                    });
                    files.push({
                        name: filename,
                        type: path.extname(name),
                        path: "/",
                        content,
                    });
                }
            }
            return files;
        }
        this.logger.error(new ErrUnknownTemp(name));
        return [];
    }
    async writeTemplateFiles(appName, files, dest) {
        await promises.mkdir(path.join(dest, appName), { recursive: true });
        for (const file of files) {
            await promises.writeFile(path.join(dest, appName, file.path, file.name), file.content.replace(/\{\{app-name}}/g, appName));
        }
    }
}

class Program {
    constructor(logger) {
        this.logger = logger;
        this.args = new ArgvParser(this.logger);
        this.templates = new TemplatesManager(this.logger);
    }
    checkNodeVersion() {
        const currentNodeVersion = process.versions.node;
        const [major] = currentNodeVersion.split(".");
        if (+(major !== null && major !== void 0 ? major : 0) < 14) {
            this.logger.error(new ErrNodeVersion(currentNodeVersion));
        }
    }
    init() {
        this.checkNodeVersion();
        this.args.parse();
        this.args.validate({
            positionals: [],
            values: ["name"],
            options: ["yarn"],
        });
    }
    async run() {
        var _a, _b;
        const name = (_a = this.args.value("name")) !== null && _a !== void 0 ? _a : "";
        const { validForNewPackages, errors = [] } = validatePackageName__default.default(name);
        if (!validForNewPackages) {
            this.logger.error(new ErrInvalidPkgName(name, errors));
        }
        const template = (_b = this.args.value("template")) !== null && _b !== void 0 ? _b : "base";
        const templateFiles = await this.templates.getTemplateFiles(template);
        await this.templates.writeTemplateFiles(name, templateFiles, process.cwd());
        return { name };
    }
}

class Logger {
    info(msg) {
        console.log(msg);
    }
    warn(msg) {
        console.warn(chalk.yellow(msg));
    }
    error(error) {
        console.error(chalk.red(error.message));
        process.exit(error.code);
    }
}

const logger = new Logger();
const program = new Program(logger);
program.init();
program.run().then(({ name }) => {
    logger.info(chalk.green(`App "${chalk.bold(name)}" created successfully!`));
});
