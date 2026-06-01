using Microsoft.ClearScript;
using Microsoft.ClearScript.V8;
using Microsoft.ClearScript.JavaScript;

using System;
using System.IO;
using System.Collections.Generic;

using ModularSkillScripts;
// using SharpCompress;
using LetheJavascript.Modular;
using Lethe;
using System.Linq;
using LetheJavascript.Patches;
using BepInEx.Configuration;
using BepInEx;

namespace LetheJavascript.Classes;

public class LoadedModule
{
    public V8ScriptEngine engine { get; init; }
    public ScriptObject exports;

    public void Dispose() => engine.Dispose();
}

public class LoadedModuleUnused
{
    public V8ScriptEngine engine { get; init; }
    public Dictionary<string, ScriptObject> exports = new();

    public void Dispose()
    {
        engine.Dispose();
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
        this.pathCache = new() {
            {"mod://", modFolder},
            {"plugins://", Paths.PluginPath},
            {"./", this.javascriptFolder}
        };
    }
    private readonly string modFolder;
    private readonly string javascriptFolder;
    public string read(string fileDir)
    {
        fileDir = formatPath(fileDir);
        if (!isPathAllowed(fileDir, Paths.PluginPath))
        {
            Main.Logger.LogError("[JS] Attempted to read a file outside of the plugins folder without IO access enabled: " + fileDir);
            return "";
        }

        try { return File.ReadAllText(fileDir); }
        catch { return ""; }
    }

    public bool write(string fileDir, string content)
    {
        fileDir = formatPath(fileDir);
        if (!isPathAllowed(fileDir, modFolder))
        {
            Main.Logger.LogError("[JS] Attempted to write a file outside of the plugins folder without IO access enabled: " + fileDir);
            return false;
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
            Main.Logger.LogError("[JS] Attempted to list a directory outside of the plugins folder without IO access enabled: " + folderDir);
            return [];
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
            Main.Logger.LogError("[JS] Attempted to list a directory outside of the plugins folder without IO access enabled: " + folderDir);
            return [];
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
            Main.Logger.LogError("[JS] Attempted to delete a file outside of the plugins folder without IO access enabled: " + fileDir);
            return false;
        }

        try
        {
            if (File.Exists(fileDir)) { File.Delete(fileDir); return true; }

            if (Directory.Exists(fileDir)) { Directory.Delete(fileDir, true); return true; }

            Main.Logger.LogError("[JS] Attempted to delete a file that does not exist: " + fileDir);
            return false;
        }
        catch (Exception ex) { Main.Logger.LogError(ex); return false; }
    }

    private static bool isPathAllowed(string fileDir, string folderRestriction)
    {
        if (Main.runtime.config_IoFullAccess)
            return true;

        string fullPath = Path.GetFullPath(fileDir);
        string allowedRoot = Path.GetFullPath(folderRestriction);

        if (!allowedRoot.EndsWith(Path.DirectorySeparatorChar))
            allowedRoot += Path.DirectorySeparatorChar;

        return fullPath.StartsWith(
            allowedRoot,
            StringComparison.OrdinalIgnoreCase
        );
    }
    private readonly Dictionary<string, string> pathCache;
    private string formatPath(string path)
    {
        if (path.StartsWith("./"))
            path = Path.Combine(javascriptFolder, path);
        else foreach (var (prefix, realPath) in pathCache)
        {
            if (path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            { path = Path.Combine(realPath, path[prefix.Length..]); break; }
        }

        return Path.GetFullPath(path);
    }
}

public class ScriptRuntime
{
    #region Configurations
    public bool config_IoFullAccess = false;
    public reloadBehaviour config_reloadBehaviour = reloadBehaviour.onFileSave;
    #endregion
    public PropertyBag mdlFunctions = new();

    public ScriptRuntime(dynamic config = null)
    {
        Main.Logger.LogInfo("ScriptRuntime Init Begun");

        PropertyBag cons = new();
        PropertyBag acq = new();

        foreach (var (key, value) in MainClass.consequenceDict)
        {
            cons.Add(key, (params object[] args) =>
            {
                string argsString = string.Join(',', args);
                value.ExecuteConsequence(
                    ModularConsequenceRunJavascript.lastSA,
                    $"{key}({argsString})", argsString,
                    Array.ConvertAll(args, x => x?.ToString() ?? "")
                );
            });
        }

        foreach (var (key, value) in MainClass.acquirerDict)
        {
            acq.Add(key, (params object[] args) =>
            {
                string argsString = string.Join(',', args);
                return value.ExecuteAcquirer(
                    ModularConsequenceRunJavascript.lastSA,
                    $"{key}({argsString})", argsString,
                    Array.ConvertAll(args, x => x?.ToString() ?? "")
                );
            });
        }

        mdlFunctions["do"] = cons;
        mdlFunctions["get"] = acq;
        var all = new PropertyBag();
        foreach (var (key, value) in cons) all[key] = value;
        foreach (var (key, value) in acq) all[key] = value;
        mdlFunctions["all"] = all;

        Main.Logger.LogInfo($"Loaded {cons} consqs and {acq} acqs");

        Main.Logger.LogInfo("ScriptRuntime Init Done");
    }

    public readonly Dictionary<string, LoadedModule> LoadedModules = new();
    public void loadFile(string fileDirectory)
    {
        Main.Logger.LogInfo("Loading JS FILE: =>> " + fileDirectory);

        string fileName = Path.GetFileName(fileDirectory);
        string currentScriptName = Path.GetFileNameWithoutExtension(fileDirectory);
        string modFolder = Directory.GetParent(fileDirectory).Parent.FullName;

        Main.Logger.LogInfo($"mod folder is {modFolder}");

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

        V8ScriptEngine engine = new(V8ScriptEngineFlags.EnableDynamicModuleImports);
        engine.DocumentSettings.AccessFlags = DocumentAccessFlags.EnableFileLoading;
        engine.DocumentSettings.SearchPath = Path.GetDirectoryName(fileDirectory);

        // Import Modular
        engine.AddHostObject("Modular", mdlFunctions["all"]); engine.AddHostObject("Mdl", mdlFunctions["all"]);

        // Import unique logger
        engine.AddHostObject("Logger", new
        {
            log = (Action<object>)(x => Main.Logger.LogInfo($"[JS] {x}")),
            error = (Action<object>)(x => Main.Logger.LogError($"[JS] {x}"))
        });

        // Import global game data and IO access.
        engine.AddHostObject("GameData", StagePatches.jsData);
        engine.AddHostObject("IO", new IO(modFolder));

        try
        {
            var mod = LoadedModules[currentScriptName] = new() { engine = engine };

            // Add the script to the engine i guess idfk.
            engine.DocumentSettings.AddSystemDocument("__main", ModuleCategory.Standard, File.ReadAllText(fileDirectory));

            // import it.
            Main.Logger.LogInfo($"About to quote on quote, import '{fileName}'");
            dynamic module = engine.Evaluate(new DocumentInfo() { Category = ModuleCategory.Standard },
                @"
                    import * as imp from '__main';
                    globalThis.___module___ = imp;
                "
            );

            Main.Logger.LogInfo($"module is {engine.Script.___module___}");
            mod.exports = engine.Script.___module___;
            Main.Logger.LogInfo($"Got it. adding the module into the list");
            Main.Logger.LogInfo($"Successfully loaded module {currentScriptName}");
        }
        catch (Exception ex)
        {
            engine.Dispose();

            Main.Logger.LogError(
                $"Failed parsing/loading {fileName}: {ex}"
            );
        }
    }
    public void callScript(string scriptName, string method, object[] args)
    {
        Main.Logger.LogInfo($"Looking for {scriptName}.js, calling {method} in it.");
        if (!LoadedModules.TryGetValue(scriptName, out var module)) return;

        Main.Logger.LogInfo($"Found {scriptName}.js. trying to call {method} now.");

        try
        {
            // Get the module's method, cast it, and then try to invoke it.
            var func = module.exports.InvokeMethod(method, args);
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
                Main.runtime.loadFile(jsPath);
            }
        }
    }

    private readonly Dictionary<string, FileSystemWatcher> watchers = new();
    private void Listen(string dir)
    {

        FileSystemWatcher watcher = new(dir)
        {
            Filter = "*.js",
            NotifyFilter = NotifyFilters.FileName | NotifyFilters.LastWrite,
            IncludeSubdirectories = true,
            EnableRaisingEvents = true
        };

        watcher.Changed += (sender, e) => Main.runtime.loadFile(e.FullPath);
        watcher.Created += (sender, e) => Main.runtime.loadFile(e.FullPath);
        watcher.Deleted += (sender, e) => Main.runtime.loadFile(e.FullPath);
        watcher.Renamed += (sender, e) =>
        {
            Main.runtime.loadFile(e.OldFullPath);
            Main.runtime.loadFile(e.FullPath);
        };
        watchers.Add(dir, watcher);
    }


    public ConfigEntry<bool> ioAccess;
}