// Functions that are imported through C# rather than created in .js

/**
* Contains functions that allow you to read and write files, as well as list directories and files.
* * Full system access is disabled by default, so read methods can only access the plugin's folder, and write methods can only write inside of the mod's folder.
*/
// declare const IO: {
//     /** The user's profile folder, or an empty string if full IO access is not enabled. */
//     readonly userFolder: string;
//     /** Reads a file's content. If the file doesn't exist, this will return an empty string. */
//     read(fileDir: string): string;
//     /** Writes content to a file. If the file doesn't exist, it will be created. If it already exists, it will be overwritten. */
//     write(fileDir: string, content: string): boolean;
//     /** Lists all directory names in a directory. If the directory doesn't exist, this will return an empty iterable. */
//     listDirectories(folderDir: string): Iterable<string>;
//     /** Lists all file names and their extension in a directory. If the directory doesn't exist, this will return an empty iterable. */
//     listFiles(folderDir: string): Iterable<string>;
//     /** Deletes a file. Returns true if the file was successfully deleted, false otherwise. */
//     delete(fileDir: string): boolean;
// };

/**
 * Writable Record that persists throughout the encounter. 
 * It is recommended that you apply a property directly to it under your mod's name
 * or a similar identifier, and write inside of that property to avoid collisions.
*/
declare const EncounterData: Record<any, any>;

/**
 * Writable Record that persists throughout the Limbus Company session. 
 * It is recommended that you apply a property directly to it under your mod's name
 * or a similar identifier, and write inside of that property to avoid collisions.
*/
declare const GlobalData: Record<any, any>;

/** A logger for recording messages and errors. */
declare const logger: {
    log(toLog: any): void
    error(toLog: any): void
};

declare class Utility {
    static GetInstIdFromMultiTarget(targetString: string): Iterable<number>
    static GetBattleUnitModelFromTarget(target: string): any
}

/** Manually invokes a function from Modular. */
declare function InvokeModular<T extends number = number>(name: string, ...args: any[]): T

//#endregion