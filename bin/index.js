#!/usr/bin/env node

"use strict";

const {writeFileSync} = require("fs");
const {execSync} = require("child_process");
const pkgTemplate = require("../templates/package.json");

const appName = process.argv[process.argv.findIndex((arg) => arg === "--name") + 1];

writeFileSync("package.json", JSON.stringify({...pkgTemplate, name: appName}, null, 2));

console.log("Installing dependencies...");

execSync("npm install");
