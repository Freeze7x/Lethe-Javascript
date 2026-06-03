/// <reference types = "C:/Users/Freez/node_modules/@types/node" />

// This file will create a d.ts folder for the modularClasses.ts file, 
// and will create a .js file for use in Clearscript under temp.js, and write it to Classes.cs;

import * as fs from "fs"
import { execSync } from "child_process"
import path from "path"
import esbuild from "esbuild";
import os from "os";
import { start } from "repl";

const tsFolder = path.join(__dirname, "../../../typescript")
const input = path.join(__dirname, "modularClasses.ts");
const output = path.join(__dirname, "./helpers.js");
const tempIn = path.join(__dirname, "./temp.ts");


const code = fs.readFileSync(input, "utf8").split("// # Only Include Below")[1].trim();

console.log("Compiling " + path.basename(input) + " to " + path.basename(output))
console.log("bruh", tsFolder)

fs.writeFileSync(tempIn, code)

// Write definition file for Unit class.
const forDTS = `
${code.split("// # Document Above")[0].trim()}

declare global {
    const Units: {
        self: Unit,
        target: Unit
    }
}

export { }
`.trim()

// Write to fs.
fs.writeFileSync(path.join(tsFolder, "/modularClasses.d.ts"), forDTS)

// ts laced
try {
    execSync("tsc" + " " + tempIn)
} catch (e) {
    console.error(e)
}


// Delete the temp.ts file
fs.unlinkSync(tempIn);

{
    const temp = path.join(__dirname, "./temp.js");
    const code = fs.readFileSync(temp, "utf8");

    const minified = esbuild.transformSync(code, { loader: "js", minify: true }).code;

    fs.writeFileSync(temp, minified);

    const csMain = path.join(__dirname, "../../../Classes.cs");
    const csFile = fs.readFileSync(csMain, "utf-8");
    const newCsFile = csFile.split(os.EOL).map(line => {
        if (line.trim().startsWith("private const string EXTERNAL_UTILITY_JS = ")) {
            const startingWhitespace = line.match(/^(\s*)/)?.[0] ?? "";
            return `${startingWhitespace}private const string EXTERNAL_UTILITY_JS = """${minified.trim()}""";`;
        }
        return line;
    }).join(os.EOL);
    fs.writeFileSync(csMain, newCsFile);

    fs.unlinkSync(temp);
}