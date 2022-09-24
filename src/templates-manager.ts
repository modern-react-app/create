import { join, resolve, extname } from "path";
import { stat, writeFile, readdir, readFile, mkdir } from "fs/promises";
import { ErrUnknownTemp } from "errors";
import type { Logger } from "logger";

export interface TemplateFile {
    readonly name: string;
    readonly type: string;
    readonly path: string;
    readonly content: string;
}

export class TemplatesManager {
    private readonly templatesPath = resolve(__dirname, "../templates");

    constructor(private readonly logger: Logger) {}

    public async checkTemplateExists(name: string): Promise<boolean> {
        try {
            return stat(join(this.templatesPath, name)).then((x) =>
                x.isDirectory(),
            );
        } catch (e) {
            return false;
        }
    }

    public async getTemplateFiles(
        name: string,
    ): Promise<ReadonlyArray<TemplateFile>> {
        const templateExists = await this.checkTemplateExists(name);
        if (templateExists) {
            const files: TemplateFile[] = [];
            for (const filename of await readdir(
                join(this.templatesPath, name),
            )) {
                const fileStat = await stat(
                    join(this.templatesPath, name, filename),
                );
                if (fileStat.isFile()) {
                    const content = await readFile(
                        join(this.templatesPath, name, filename),
                        {
                            encoding: "utf-8",
                        },
                    );
                    files.push({
                        name: filename,
                        type: extname(name),
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

    public async writeTemplateFiles(
        appName: string,
        files: ReadonlyArray<TemplateFile>,
        dest: string,
    ) {
        await mkdir(join(dest, appName), { recursive: true });
        for (const file of files) {
            await writeFile(
                join(dest, appName, file.path, file.name),
                file.content.replace(/\{\{app-name}}/g, appName),
            );
        }
    }
}
