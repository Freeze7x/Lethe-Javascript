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
 * A custom dictionary for tracking custom data throughout the Encounter.
 * 
 * It is recommended to get a "mod identifier" first, and then store what you need in there.
*/
// declare const EncounterData: {
//     get<T = {}>(key: string, defaultValue?: T): T;
// };

/**
 * A custom dictionary for tracking custom data throughout the Limbus Company Session.
 * 
 * It is recommended to follow a format similar to this to avoid collisions and have better control:
 * @example
 * const gData = GlobalData.get("Shane/MirrorDungeon2", {
 *      packs: [new Pack(), new Pack()],
 *      gifts: [new Gift()]
 * });
*/
// declare const GlobalData: {
//     get<T = {}>(key: string, defaultValue?: T): T;
// };

interface DotNetArray<T> extends Iterable<T> {
    readonly Length: number;
    [index: number]: T;
}

type BattleUnitModel = Record<any, any>;

/** A logger for recording messages and errors. */
// declare const logger: {
//     log(toLog: any): void;
//     error(toLog: any): void;
// };

declare const JSPipeline: {
    GetBattleUnitModelListFromTarget(targetString: string): DotNetArray<BattleUnitModel>;
    GetBattleUnitModelFromTarget(target: string): BattleUnitModel;
    GetStageController(): Record<any, any>;
    SelfAction(): Record<any, any>;
    EncounterID: number;
    BattleUnitModelUtility: {
        ChangeHp(bum: BattleUnitModel, number: number): void;
        [x: string]: any;
    };
    [x: string]: any;
};

/** Manually invokes a function from Modular. */
declare function InvokeModular<T extends number = number>(name: string, ...args: any[]): T;

//#endregion