import { ArgvParser } from "args-parser";
import { TemplatesManager } from "templates-manager";
import { ErrInvalidPkgName, ErrNodeVersion } from "errors";
import validatePackageName from "validate-npm-package-name";
import { Logger } from "logger";

interface Stat {
    readonly name: string;
}

export class Program {
    private readonly logger: Logger;
    private readonly args: ArgvParser;
    private readonly templates: TemplatesManager;

    constructor(logger: Logger) {
        this.logger = logger;
        this.args = new ArgvParser(this.logger);
        this.templates = new TemplatesManager(this.logger);
    }

    private checkNodeVersion() {
        const currentNodeVersion = process.versions.node;
        const [major] = currentNodeVersion.split(".");
        if (+(major ?? 0) < 14) {
            this.logger.error(new ErrNodeVersion(currentNodeVersion));
        }
    }

    public init() {
        this.checkNodeVersion();
        this.args.parse();
        this.args.validate({
            positionals: [],
            values: ["name"],
            options: ["yarn"],
        });
    }

    public async run(): Promise<Stat> {
        const name = this.args.value("name") ?? "";
        const { validForNewPackages, errors = [] } = validatePackageName(name);
        if (!validForNewPackages) {
            this.logger.error(new ErrInvalidPkgName(name, errors));
        }

        const template = this.args.value("template") ?? "base";
        const templateFiles = await this.templates.getTemplateFiles(template);

        await this.templates.writeTemplateFiles(
            name,
            templateFiles,
            process.cwd(),
        );
        return { name };
    }
}
