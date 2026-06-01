/// <reference types = "C:/Users/Freez/node_modules/@types/node" />
import * as fs from "fs";
import * as path from "path";
import * as os from "os"
const nl = os.EOL;
const scriptClassFile = fs.readFileSync(path.join(__dirname, "../Classes.cs"), "utf-8")

const typeLookup = {
    "int": "number",
    "float": "number",
    "string": "string",
    "bool": "boolean"
} as Record<string, any>

const regions = Object.fromEntries(
    scriptClassFile.split("//TS")
        .slice(1)
        .map(text => text.trim())
        .map(text => [text.split(nl)[0], text.split(nl).slice(1).join(nl)])
)

const scriptClass = regions["Unit"];

const props = scriptClass.split(nl).map(line => line.trim()).filter(line => line.startsWith("public") && line.endsWith(";")).map(line => line.slice(0, -1))
const types = props.reduce((acc, cv) => {
    const dat = cv.split(" ");
    let type = dat[1];
    const arrayType = type.endsWith("[]");
    if (arrayType) type = type.slice(0, -2);
    const typeName = typeLookup[type] ?? type;
    const result = arrayType ? `${typeName}[]` : typeName;
    acc[dat[2]] = result;
    return acc;
}, {} as Record<string, string>);

console.log(types);