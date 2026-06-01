/// <reference types = "C:/Users/Freez/node_modules/@types/node" />

import * as fs from "fs";
import * as path from "path";
import * as os from "os";

function getBetween(text: string, start: string, end: string) {
    return text.split(start)[1]?.split(end)[0] ?? "";
}

const reset = `
type AcqusitionFunctions = {}//#

type ConsequenceFunctions = {}//#
`


const helperTypes = `
type anyString<T extends string> = (string & {}) | T

type SingleTarget = anyString<
    "Self" | "SelfCore" |
    "MainTarget" |
    "TargetCore" |
    "Victim" | "Killer" |
    "id" |
    "inst" |
    "adjLeft" | "adjRight"
>

type MultiTarget = SingleTarget | anyString<
    "SelfParts" | "TargetParts" |
    "EveryTarget" | "SubTarget" |
    "All"
>

type Sin = {
	caps: "CRIMSON" | "SCARLET" | "AMBER" | "SHAMROCK" | "AZURE" | "INDIGO" | "VIOLET"
	number: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
}
type AttackType = {
	caps: "SLASH" | "PENETRATE" | "HIT"
}
`.trim();



const md = fs.readFileSync(path.join(__dirname, "./def.md"), "utf-8");
const output = path.join(__dirname, "../typescript/modularJS.d.ts")

// fs.writeFileSync(output, reset);

const defFile = fs.existsSync(output) ? fs.readFileSync(output, "utf-8") : reset;
const defFileFlat = defFile.replaceAll(os.EOL, "");


let toWrite = "";

/**
### **gethp(var_1, var_2)** %transparent% hpcheck %%
Gets HP value based on the arguments.
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: `normal` | `%` | `max`
    - `normal`: Remaining HP
    - `%`: Percentage of remaining HP (rounded down, e.g., 349/350 = 99)
    - `max`: Max HP value
    - `missing`: Missing HP value
    - `missing%`: Missing HP percentage
 */
function mapFunction(text: string, returnType = "void") {
    text = text.trim();
    const lines = text.split(os.EOL);
    const funcBody = lines[0].split("**")[1];
    if (!funcBody) return null;


    const funcName = funcBody.split("(")[0];
    const funcDesc = lines.slice(1)
        .map(text => text.trim())
        .join(os.EOL).trim();
    const funcDesc2 = lines.slice(1, lines.indexOf("- **Arguments:**")).join(os.EOL).trim() || "No Description Provided";
    const funcArgus = lines.filter(line => line.trim().startsWith("-") && line.split("`").length > 1);
    const funcArgusDesc = funcArgus.reduce((acc, line) => {
        const varName = line.split("`")[1];
        if (!varName.startsWith("var") && !varName.startsWith("opt"))
            return acc;

        const value = line.split(":").slice(1).join(":").trim();

        if (varName.endsWith("option")) {
            const newVarName = varName.split(" ")[0];
            acc.data[newVarName] ??= "";
            acc.data[newVarName] += value.split(" ")[0] + " | ";
            return acc
        }

        acc.data[varName] = value;
        acc.meta.lastName = varName

        return acc;
    }, { data: {} as Record<string, string>, meta: { lastName: "" } }).data

    function log(args: any) {
        if (funcBody.startsWith("getbuff"))
            console.log(args);
    }
    const funcParams = Object.keys(funcArgusDesc).map(key => key.split(" ")[0]) //getBetween(funcBody, "(", ")").split(",")
        .map(t => t.trim()).map(vr => vr.split("~")[0]).map(vr => {
            const locale = funcArgusDesc[vr];

            if (vr.startsWith("opt"))
                vr += "?";

            if (locale) {
                if (locale.includes("[Single-Target](https://rentry.co/glitchscript#target-arguments)"))
                    return vr + ": SingleTarget"
                if (locale.includes("[Multi-Target](https://rentry.co/glitchscript#target-arguments)"))
                    return vr + ": MultiTarget"
                if (
                    locale.includes("`VALUE_#`") || locale.includes("(int)") ||
                    locale.includes("integer") || locale.toLowerCase().includes("index") ||
                    locale.includes("ID")
                )
                    return vr + ": number"
                if (locale.startsWith("Self | Target"))
                    return vr + `: "Self" | "Target"`
                if (locale.toLowerCase().includes("buff keyword")) {
                    return vr + `: string`
                }
                if (locale.split("|").length > 1)
                    return vr + ":" + locale.split("|").map(text => {
                        if (text.includes("`")) return `"${text.split("`")[1].trim()}"`
                        else return `"${text.trim()}"`;
                    }).join(" | ")
                if (locale.includes("`"))
                    return vr + `: "${locale.split("`")[1]}"`;
            }

            return vr
        });

    const jsDocParms = Object.entries(funcArgusDesc).map(([key, value]) => {
        return `@param ${key} ${value}`;
    })

    // console.log(funcBody + "\n" + JSON.stringify(funcArgusDesc) + "\n\n")

    log(funcParams)


    return {
        name: funcName,
        params: funcParams,
        returns: returnType,
        description: funcDesc,
        singleDescription: funcDesc2,
        argumentPlural: funcArgusDesc,
        jsDocParms
    }
}

{
    function funcsToList(text: string) {
        console.log("parsing", text)
        return text.split("\n\n").map(sec => {
            const spl = sec.split("\n").map(t => t.trim());
            return [spl.at(-1)!.split("(")[0], spl.join('\n')]
        })
    }
    const functionsInDef = {
        acquisition: Object.fromEntries(
            funcsToList(
                getBetween(defFileFlat, "type AcquisitionFunctions = {", "}//#").trim()
            )
        ),
        consequence: Object.fromEntries(
            funcsToList(
                getBetween(defFileFlat, "type ConsequenceFunctions = {", "}//#").trim()
            )
        ),
    }

    const mdFunctions = {
        acquisition: getBetween(md,
            `## **Value Acquisition Functions**`,
            `## **OnGainBuff exclusive acquirers**`
        ).trim()
            .split(os.EOL).slice(2).join(os.EOL) // Remove the first two lines.
            .split(os.EOL + os.EOL),
        consequence: getBetween(md,
            `## **Consequence Functions**`,
            `## **Buff Supporting Functions**`
        ).trim()
            .split(os.EOL).slice(2).join(os.EOL) // Remove the first two lines.
            .split(os.EOL + os.EOL)
    };


    const entries = {
        consequence: Object.fromEntries(mdFunctions.consequence.map(v => {
            const mapped = mapFunction(v, "void")
            if (!mapped) return [];
            return [mapped.name, `
/**
${mapped.singleDescription.split(os.EOL).map(text => "\t" + text).join(os.EOL)}
${mapped.jsDocParms.map(text => "\t" + text).join(os.EOL)}
*/
${mapped.name}(${mapped.params.join(', ')}): ${mapped.returns}`.trim()
            ]
        })),
        acquisition: Object.fromEntries(mdFunctions.acquisition.map(v => {
            const mapped = mapFunction(v, "number")
            if (!mapped) return [];
            return [mapped.name, `
/**
${mapped.singleDescription.split(os.EOL).map(text => "\t" + text).join(os.EOL)}
${mapped.jsDocParms.map(text => "\t" + text).join(os.EOL)}
*/
${mapped.name}(${mapped.params.join(', ')}): ${mapped.returns}`.trim()
            ]
        }))
    };

    toWrite = helperTypes + "\n\n"

    toWrite += `
        type AcquisitionFunctions = {
${Object.values({ ...entries.acquisition, ...functionsInDef.acquisition }).filter(v => v).join("\n\n")}
        }//#

        type ConsequenceFunctions = {
${Object.values({ ...entries.consequence, ...functionsInDef.consequence }).filter(v => v).join("\n\n")}
        }//#
    `.trim();

    console.log(Object.keys(functionsInDef.acquisition).length)
    console.log(Object.keys(functionsInDef.consequence).length)

    toWrite = `${toWrite}

declare global {
	const Modular: ConsequenceFunctions & AcquisitionFunctions;
	const Mdl: typeof Modular;
	const Logger: { log: (arg1: any) => {}, error: (arg1: any) => {} };
	/** Data that can be written to that persists. This data is accessible through any .js file, so ensure you store your mod's data under a unique key. */
	const GameData: { global: Record<any, any>, encounter: Record<any, any> };
	/** Contains functions that allow you to read and write files, as well as list directories and files.
	 * * Full system access is disabled by default, so read methods can only access the plugin's folder, and write methods can only write inside of the mod's folder.
	 */
	const IO: {
		/** The user's profile folder, or an empty string if full IO access is not enabled. */
		readonly userFolder: string;
		/** Reads a file's content. If the file doesn't exist, this will return an empty string. */
		read(fileDir: string): string;
		/** Writes content to a file. If the file doesn't exist, it will be created. If it already exists, it will be overwritten. */
		write(fileDir: string, content: string): boolean;
		/** Lists all directories in a directory. If the directory doesn't exist, this will return an empty array. */
		listDirectories(folderDir: string): string[];
		/** Lists all files in a directory. If the directory doesn't exist, this will return an empty array. */
		listFiles(folderDir: string): string[];
		/** Deletes a file. Returns true if the file was successfully deleted, false otherwise. */
		delete(fileDir: string): boolean;
	}
}

export { }
    `.trim()


    fs.writeFileSync(output, toWrite);
}

