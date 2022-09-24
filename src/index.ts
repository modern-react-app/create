import { Program } from "program";
import { Logger } from "logger";
import { bold, green } from "chalk";

const logger = new Logger();
const program = new Program(logger);

program.init();
program.run().then(({ name }) => {
    logger.info(green(`App "${bold(name)}" created successfully!`));
});
