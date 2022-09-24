import type { ErrorWithCode } from "errors";
import { red, yellow } from "chalk";

export class Logger {
    public info(msg: string) {
        console.log(msg);
    }

    public warn(msg: string) {
        console.warn(yellow(msg));
    }

    public error(error: ErrorWithCode) {
        console.error(red(error.message));
        process.exit(error.code);
    }
}
