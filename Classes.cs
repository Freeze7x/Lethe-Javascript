using Microsoft.ClearScript;
using Microsoft.ClearScript.V8;
using Microsoft.ClearScript.JavaScript;


using System;
using System.IO;
using System.Collections.Generic;
using System.Reflection;
using System.Linq;
using System.Text.RegularExpressions;
using System.Runtime.CompilerServices;


using ModularSkillScripts;
// using SharpCompress;
using LetheJavascript.Modular;
using Lethe;
using LetheJavascript.Patches;
using BepInEx.Configuration;
using BepInEx;
using MainUI;
using LetheJavascript.JS;

namespace LetheJavascript.Classes;

public class LoadedModule
{
    public LoadedModule(V8ScriptEngine engine)
    {
        this.Engine = engine;
    }
    public V8ScriptEngine Engine { get; init; }
    public ScriptObject Exports;
    /// <summary>
    /// The Lethe mod folder this file is from.
    /// </summary>
    public string ModFolder;
    /// <summary>
    /// The path to the file this script was loaded from.
    /// </summary>
    public string FileDirectory;
    public HashSet<string> Dependencies = [];

    public void Dispose() => Engine.Dispose();
    public void Reload(ScriptRuntime parent)
    {
        parent.LoadFile(FileDirectory, ModFolder);
    }
}

public enum reloadBehaviour
{
    onLobby,
    onFileSave
}

public class IO
{
    public readonly string userFolder = Main.runtime.config_IoFullAccess ? Environment.GetFolderPath(Environment.SpecialFolder.UserProfile) : "";
    public IO(string modFolder)
    {
        this.modFolder = modFolder;
        this.javascriptFolder = Path.Combine(modFolder, "javascript");
        this.pathLookup = new() {
            {"mod://", modFolder},
            {"plugins://", Paths.PluginPath},
            {"./", javascriptFolder}
        };
    }

    private readonly string modFolder;
    private readonly string javascriptFolder;
    public string read(string fileDir)
    {
        fileDir = formatPath(fileDir);
        if (!isPathAllowed(fileDir, Paths.PluginPath))
        {
            Main.Logger.LogError("[JS] Access Violation: " + fileDir); return "";
        }

        try { return File.ReadAllText(fileDir); }
        catch { return ""; }
    }

    public bool write(string fileDir, string content)
    {
        fileDir = formatPath(fileDir);
        if (!isPathAllowed(fileDir, modFolder))
        {
            Main.Logger.LogError("[JS] Access Violation: " + fileDir); return false;
        }

        try { File.WriteAllText(fileDir, content); }
        catch { return false; }
        return true;
    }
    public string[] listDirectories(string folderDir)
    {
        folderDir = formatPath(folderDir);
        if (!isPathAllowed(folderDir, Paths.PluginPath))
        {
            Main.Logger.LogError("[JS] Access Violation: " + folderDir); return [];
        }

        if (!Directory.Exists(folderDir)) return [];

        try { return [.. Directory.GetDirectories(folderDir).Select(Path.GetFileName)]; }
        catch { return []; }
    }
    public string[] listFiles(string folderDir)
    {
        folderDir = formatPath(folderDir);
        if (!isPathAllowed(folderDir, Paths.PluginPath))
        {
            Main.Logger.LogError("[JS] Access Violation: " + folderDir); return [];
        }

        if (!Directory.Exists(folderDir)) return [];

        try { return [.. Directory.GetFiles(folderDir).Select(Path.GetFileName)]; }
        catch { return []; }
    }
    public bool delete(string fileDir)
    {
        fileDir = formatPath(fileDir);
        if (!isPathAllowed(fileDir, modFolder))
        {
            Main.Logger.LogError("[JS] Access Violation: " + fileDir);
            return false;
        }

        try
        {
            if (File.Exists(fileDir)) { File.Delete(fileDir); return true; }

            if (Directory.Exists(fileDir)) { Directory.Delete(fileDir, true); return true; }

            Main.Logger.LogError("[JS] Access Violation: " + fileDir); return false;
        }
        catch (Exception ex) { Main.Logger.LogError(ex); return false; }
    }

    private static bool isPathAllowed(string fileDir, string folderRestriction)
    {
        // If full IO access is permitted, just let it rip.
        if (Main.runtime.config_IoFullAccess) return true;

        fileDir = Path.GetFullPath(fileDir);
        folderRestriction = Path.GetFullPath(folderRestriction);

        string relative = Path.GetRelativePath(folderRestriction, fileDir);

        return !relative.StartsWith("..") && !Path.IsPathRooted(relative);
    }
    private readonly Dictionary<string, string> pathLookup;
    private string formatPath(string path)
    {
        foreach (var (prefix, realPath) in pathLookup)
        {
            if (path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            {
                path = Path.Combine(realPath, path[prefix.Length..]);
                break;
            }
        }

        Main.Logger.LogInfo("path is: " + path);
        return path;
    }
}

public class ScriptRuntime
{
    #region Configurations
    public bool config_IoFullAccess = false;
    public reloadBehaviour config_reloadBehaviour = reloadBehaviour.onFileSave;
    #endregion
    public static int InvokeModular(string name, params object[] args)
    {
        string argsString = string.Join(',', args);
        if (MainClass.consequenceDict.ContainsKey(name))
        {
            MainClass.consequenceDict[name].ExecuteConsequence(
                ModularConsequenceRunJavascript.lastSA,
                $"{name}({argsString})", argsString,
                Array.ConvertAll(args, x => x?.ToString() ?? "")
            );
            return 0;
        }

        if (MainClass.acquirerDict.ContainsKey(name))
        {
            return MainClass.acquirerDict[name].ExecuteAcquirer(
                ModularConsequenceRunJavascript.lastSA,
                $"{name}({argsString})", argsString,
                Array.ConvertAll(args, x => x?.ToString() ?? "")
            );
        }

        return 0;
    }

    public ScriptRuntime(dynamic config = null)
    {
        Main.Logger.LogInfo("ScriptRuntime Init Begun");
        Main.Logger.LogInfo("ScriptRuntime Init Done");
    }
    static readonly string JS_CODE_PREPEND = "";
    static ScriptRuntime()
    {
        JS_CODE_PREPEND = Main.ExtractEmbed("embed.prefix.js");
    }

    public readonly Dictionary<string, LoadedModule> LoadedModules = [];
    /// <summary>
    /// key is file path
    /// 
    /// value is files that rely on the provided key
    /// </summary>
    public readonly Dictionary<string, HashSet<string>> Dependencies = [];
    public void LoadFile(string fileDirectory, string modFolder = "")
    {
        Main.Logger.LogInfo("Loading JS FILE: =>> " + fileDirectory);

        string fileName = Path.GetFileName(fileDirectory);
        string currentScriptName = Path.GetFileNameWithoutExtension(fileDirectory);

        Main.Logger.LogInfo($"mod folder is {modFolder}");

        // foreach (var (_, module) in LoadedModules.ToArray())
        // {
        //     // If the module depends on a file that is already in the list, reload it.
        //     if (module.Dependencies.Contains(fileDirectory))
        //         module.Reload(this);
        // }

        // Dispose old module if it exists
        if (LoadedModules.TryGetValue(currentScriptName, out var existing))
        {
            existing.Dispose();
            LoadedModules.Remove(currentScriptName);
        }

        // If file doesn't exist, just delete the old module and do nothing else
        if (!File.Exists(fileDirectory))
        {
            Main.Logger.LogInfo($"File does not exist: {fileDirectory}, deleting the module.");
            return;
        }

        string[] lines = File.ReadAllLines(fileDirectory);
        string contents = string.Join("\n", lines);
        foreach (var import in getImportsFromJs(contents, fileDirectory))
        {
            Dependencies.TryAdd(import, []);
            Dependencies[import].Add(fileDirectory);
        }


        var test = Regex.Match(contents, @"ScriptBehaviour\s*=\s*\[(.*?)\]", RegexOptions.Singleline);
        if (test.Success)
        {
            var args = test.Groups[1].Value
                .Split(',')
                // .Select(arg => Regex.Replace(arg.Trim(), @"""(.*?)""", "$1"))
                .Select(arg => arg.Trim('"').Trim())
                .ToHashSet();

            if (args.Contains("import-only") || args.Contains("do-not-load"))
            {
                Main.Logger.LogInfo($"File {fileDirectory} is to be ignored, skipping execution.");
                return;
            }
        }

        // string COMMENT_PREFIX = "// # Lethe ";
        // var configLine = lines.FirstOrDefault(line => line.TrimStart().StartsWith(COMMENT_PREFIX));
        // if (configLine != null)
        // {
        //     var args = configLine[(configLine.IndexOf(COMMENT_PREFIX) + COMMENT_PREFIX.Length)..]
        //         .TrimStart()
        //         .Split(' ')
        //         .Select(arg => arg.Trim())
        //         .ToHashSet();

        //     if (args.Contains("import-only") || args.Contains("do-not-load"))
        //     {
        //         Main.Logger.LogInfo($"File {fileDirectory} is to be ignored, skipping execution.");
        //         return;
        //     }
        // }

        V8ScriptEngine engine = new(V8ScriptEngineFlags.EnableDynamicModuleImports);
        engine.DocumentSettings.AccessFlags = DocumentAccessFlags.EnableFileLoading;
        engine.DocumentSettings.SearchPath = Path.GetDirectoryName(fileDirectory);
        engine.DocumentSettings.Loader.DiscardCachedDocuments();

        try
        {
            var mod = new LoadedModule(engine)
            {
                FileDirectory = fileDirectory,
                Dependencies = [.. getImportsFromJs(contents, fileDirectory)]
            };
            Main.Logger.LogInfo($"Depends on =>> {string.Join(", ", mod.Dependencies)}");

            LoadDataIntoModule(mod);

            // Add the script to the engine.
            engine.DocumentSettings.AddSystemDocument("__main", ModuleCategory.Standard, contents);

            // import it.
            Main.Logger.LogInfo($"About to quote on quote, import '{fileName}'");
            dynamic module = engine.Evaluate(new DocumentInfo() { Category = ModuleCategory.Standard },
                @"
                    import * as imp from '__main';
                    globalThis.___module___ = imp;
                "
            );

            Main.Logger.LogInfo($"module is {engine.Script.___module___}");
            mod.Exports = engine.Script.___module___;
            Main.Logger.LogInfo($"Got it. adding the module into the list");
            Main.Logger.LogInfo($"Successfully loaded module {currentScriptName}");

            LoadedModules[currentScriptName] = mod;
        }
        catch (Exception ex)
        {
            engine.Dispose();

            Main.Logger.LogError(
                $"Failed parsing/loading {fileName}: {ex}"
            );
        }
    }
    private static void LoadDataIntoModule(LoadedModule module)
    {
        var engine = module.Engine;
        // Import Modular caller.
#pragma warning disable CS8974
        engine.AddHostObject("InvokeModular", InvokeModular);
#pragma warning restore CS8974

        // Import unique logger
        engine.AddHostObject("logger", new
        {
            log = (Action<object>)(x => Main.Logger.LogInfo($"[JS] {x}")),
            error = (Action<object>)(x => Main.Logger.LogError($"[JS] {x}"))
        });

        // Import global game data and IO access.
        engine.AddHostObject("EncounterData", StagePatches.encounterData);
        engine.AddHostObject("GlobalData", StagePatches.globalData);

        // engine.AddHostObject("IO", new IO(module.ModFolder));

        engine.AddHostType("JSPipeline", typeof(Pipeline));

        // Import helper classes. https://pbs.twimg.com/media/FbbTu_sWIAEIR9T.jpg
        engine.Execute(JS_CODE_PREPEND);
    }
    public void loadLetheJavascriptFolder(string folderDirectory)
    {
        foreach (var file in Directory.GetFiles(folderDirectory, "*.js", SearchOption.AllDirectories))
            LoadFile(file, folderDirectory);
    }
    public void callScript(string scriptName, string method, object[] args)
    {
        Main.Logger.LogInfo($"Looking for {scriptName}.js, calling {method} in it.");
        if (!LoadedModules.TryGetValue(scriptName, out var module)) return;

        Main.Logger.LogInfo($"Found {scriptName}.js. trying to call {method} now.");

        try
        {
            // Get the module's method, cast it, and then try to invoke it.
            var func = module.Exports.InvokeMethod(method, args);
        }
        catch (Exception ex)
        {
            Main.Logger.LogError("hell nah bruh something wrong");
            Main.Logger.LogError(ex);
        }
    }
    public void LoadAllFromModPath()
    {
        foreach (var modPath in Directory.GetDirectories(LetheMain.modsPath.FullPath))
        {
            Main.Logger.LogInfo("Scanning for mexicans: " + modPath);
            var javascriptFolder = Path.Combine(modPath, "javascript");

            // No js directory? perish.
            if (!Directory.Exists(javascriptFolder))
            {
                // Remove the watcher, if it exists
                if (watchers.TryGetValue(javascriptFolder, out var watcher))
                {
                    watcher.Dispose(); watchers.Remove(javascriptFolder);
                }
                continue;
            }

            // Add a listener so we can dynamically update and stuff idfk.
            if (config_reloadBehaviour == reloadBehaviour.onFileSave)
                if (!watchers.ContainsKey(javascriptFolder))
                    Listen(javascriptFolder);

            // Load the files lowkey.
            foreach (var jsPath in Directory.GetFiles(javascriptFolder, "*.js", SearchOption.AllDirectories))
            {
                Main.Logger.LogInfo("Scanning for mexicans v2: " + jsPath);
                jsFileModFolders.Add(jsPath, modPath);
                Main.runtime.LoadFile(jsPath, modPath);
            }
        }
    }
    private static string[] getImportsFromJs(string code, string filePath)
    {
        Regex regex2 = new(@"import.*?(?:""|')(.*?)(?:""|')", RegexOptions.Singleline);
        List<string> imports2 = [];
        var result = regex2.Matches(code);
        foreach (Match match in result)
        {
            imports2.Add(match.Groups[1].Value);
        }

        return [.. imports2.Select(import => Path.GetFullPath(Path.Join(Path.GetDirectoryName(filePath), import)))];
    }
    private readonly Dictionary<string, string> jsFileModFolders = [];
    private readonly Dictionary<string, FileSystemWatcher> watchers = [];
    /// <summary>
    /// Listen for a ./javascript folder change.
    /// </summary>
    /// <param name="dir"></param>
    private void Listen(string dir)
    {

        FileSystemWatcher watcher = new(dir)
        {
            Filter = "*.js",
            NotifyFilter = NotifyFilters.FileName | NotifyFilters.LastWrite,
            IncludeSubdirectories = true,
            EnableRaisingEvents = true
        };

        watcher.Changed += (sender, e) => FileChanged(e.FullPath);
        watcher.Created += (sender, e) => Main.runtime.LoadFile(e.FullPath, dir);
        watcher.Deleted += (sender, e) => Main.runtime.LoadFile(e.FullPath, dir);
        watcher.Renamed += (sender, e) =>
        {
            Main.runtime.LoadFile(e.OldFullPath, dir);
            Main.runtime.LoadFile(e.FullPath, dir);
        };

        watchers.Add(dir, watcher);
    }

    private void FileChanged(string filePath)
    {
        HashSet<string> filesToLoad = [];
        HashSet<string> filesTraveled = [];
        filesToLoad.Add(filePath);

        void recursive(string fp)
        {
            filesTraveled.Add(fp);
            if (Dependencies.TryGetValue(fp, out var dependants))
            {
                foreach (var dependant in dependants)
                {
                    // This file depends on the changed file, add it to load list.
                    // Check the dependants of that file if we haven't yet.
                    if (!filesToLoad.Add(dependant))
                        recursive(dependant);
                }
            }
        }
        recursive(filePath);

        foreach (var file in filesToLoad)
            LoadFile(file);
    }
}