/// <reference types = "C:/Users/Freez/node_modules/@types/node" />

import fs from "fs";
import path from "path";
import os from "os";
const cls = fs.readFileSync(path.join(__dirname, "./source.txt"), "utf-8");

const lines = cls.split(os.EOL);

const properties: { key: string, type: string, args?: { spread?: boolean, name: string, type: string; }[]; }[] = [];
for (let line of lines) {
    line = line.trim();
    if (line.startsWith("public")) {
        line = line.split(":")[0];
        if (line.endsWith(")")) {
            const words = line.split("(")[0].split(/\s+/);
            const name = words.at(-1)!;
            const type = words.at(-2)!;
            const args =
                /\((.*?)\)/.exec(line)?.[1]
                    .split(", ").map(arg => {
                        const split = arg.split(/\s+/);
                        if (split[0] === "params") {
                            return {
                                spread: true,
                                type: split[1],
                                name: split[2]
                            };
                        }
                        return {
                            type: split[0],
                            name: split[1]
                        };
                    }) ?? [];
            if (args) {
                properties.push({
                    key: name,
                    type,
                    args
                });
            }
            ;
        } else {
            const words = line.split(/\s+/);
            const name = words.at(-1)!;
            const type = words.at(-2)!;
            properties.push({
                key: name, type
            });
        }
    }
}

console.log(
    properties.reduce((acc, prop) => {
        acc.add(prop.type)
        return acc;
    }, new Set<string>()).values()
);


fs.writeFileSync(path.join(__dirname, "./output.json"), JSON.stringify(properties))

