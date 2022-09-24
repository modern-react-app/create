import { bold } from "chalk";

export abstract class ErrorWithCode extends Error {
    public readonly code: number;
    public override readonly message: string;

    protected constructor(message: string, code: number) {
        super(message);
        this.code = code;
        this.message = message;
    }
}

export class ErrNodeVersion extends ErrorWithCode {
    constructor(version: string) {
        super(
            `You are running Node "${bold(
                version,
            )}".\nModern React App requires Node 14 or higher. \nPlease update your version of Node.`,
            1,
        );
    }
}

export class ErrUnknownArg extends ErrorWithCode {
    constructor(argument: string) {
        super(`Unknown argument "${bold(argument)}".`, 2);
    }
}

export class ErrUnknownOpt extends ErrorWithCode {
    constructor(option: string) {
        super(`Unknown option "${bold(option)}".`, 3);
    }
}

export class ErrUnknownTemp extends ErrorWithCode {
    constructor(template: string) {
        super(`Unknown template "${bold(template)}".`, 4);
    }
}

export class ErrInvalidPkgName extends ErrorWithCode {
    constructor(name: string, errors: string[]) {
        super(`Invalid app name "${bold(name)}"\n${errors.join(", ")}`, 5);
    }
}
