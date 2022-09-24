import type { Plugin } from "rollup";
import { resolve, require } from "app-root-path";
import { inc } from "semver";
import { writeFile } from "fs/promises";
import { green, bold } from "chalk";

const pkgToString = (pkg: object) => JSON.stringify(pkg, null, 2);

export function updatePkgVersion(): Plugin {
    return {
        name: "update-pkg-version",
        async closeBundle() {
            const { name, version, ...pkg } = require("package.json");
            const newVer = inc(version, "minor");
            const newPkg = { name, version: newVer, ...pkg };
            await writeFile(resolve("package.json"), pkgToString(newPkg));
            console.log(green("%s updated to '%s'"), bold(name), bold(newVer));
        },
    };
}
