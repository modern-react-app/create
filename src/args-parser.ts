import type { Logger } from "logger";
import { ErrUnknownArg, ErrUnknownOpt } from "errors";

interface ArgValidationOptions {
    readonly positionals: string[];
    readonly values: string[];
    readonly options: string[];
}

export class ArgvParser {
    private readonly argv = process.argv.slice(2, process.argv.length);
    private readonly positional: string[] = [];
    private readonly values: Record<string, string> = {};
    private readonly options: Record<string, boolean> = {};

    constructor(private readonly logger: Logger) {}

    public parse() {
        for (let i = 0; i < this.argv.length; i++) {
            const arg = this.argv[i];
            const pArg = i - 1 in this.argv ? this.argv[i - 1] : null;
            const nArg = i + 1 in this.argv ? this.argv[i + 1] : null;

            if (
                (!arg!.startsWith("--") && pArg === null) ||
                (!arg!.startsWith("--") &&
                    pArg !== null &&
                    !pArg!.startsWith("--"))
            ) {
                this.positional.push(arg!);
                continue;
            }

            if (
                arg!.startsWith("--") &&
                nArg !== null &&
                !nArg!.startsWith("--")
            ) {
                this.values[arg!.substring(2, arg!.length)] = nArg!;
                i++;
                continue;
            }

            this.options[arg!.substring(2, arg!.length)] = true;
        }
    }

    public validate({ positionals, values, options }: ArgValidationOptions) {
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

    public at(index: number): string | null {
        return index in this.positional ? this.positional[index]! : null;
    }

    public value(name: string): string | null {
        return name in this.values ? this.values[name]! : null;
    }

    public option(name: string): boolean | null {
        return name in this.options ? this.options[name]! : null;
    }
}
