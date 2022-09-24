import { defineConfig } from "rollup";
import { resolve } from "path";
import external from "rollup-plugin-auto-external";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import filesize from "rollup-plugin-filesize";
import { updatePkgVersion } from "./rollup/plugins/update-pkg-version";

export default defineConfig({
    input: resolve(__dirname, "src", "index.ts"),
    output: [
        {
            dir: resolve(__dirname, "bin"),
            entryFileNames: "create-modern-react-app.js",
            format: "cjs",
            generatedCode: "es2015",
            banner: "#!/usr/bin/env node",
        },
    ],
    plugins: [
        external(),
        nodeResolve(),
        typescript(),
        filesize(),
        updatePkgVersion(),
    ],
});
