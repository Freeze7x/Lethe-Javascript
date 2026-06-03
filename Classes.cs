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
    public LoadedModule(V8ScriptEngine engine)
    {
        this.engine = engine;
    }
    public V8ScriptEngine engine { get; init; }
    public ScriptObject exports;
    public string modFolder;

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

    // ts is laced and that damn dog got it im so sorry.
    private const string EXTERNAL_UTILITY_JS = """var __spreadArray=this&&this.__spreadArray||function(r,n,u){if(u||arguments.length===2)for(var e=0,t=n.length,a;e<t;e++)(a||!(e in n))&&(a||(a=Array.prototype.slice.call(n,0,e)),a[e]=n[e]);return r.concat(a||Array.prototype.slice.call(n))};function property(r,n){return n(r)}var Unit=(function(){function r(n){var u=this;switch(this.target=n,this.speed=property(this,function(e){return{get min(){return Mdl.getstat(e.target,"speedMin")},get max(){return Mdl.getstat(e.target,"speedMax")},get current(){return Mdl.getspeed(e.target)},getSlotSpeed:function(t){return Mdl.getspeed(e.target,t)}}}),this.stagger=property(this,function(e){return{addAt:function(t){Mdl.breakaddbar(e.target,t)},tremorBurst:function(t,a){Mdl.burst(e.target,t??1),a&&Mdl.buff(e.target,"Vibration",0,-a,0)},staggerDamage:function(t,a){Modular.breakdmg(e.target,t??1,a)},instantStagger:function(t){Mdl.break(e.target,t)},recover:function(){Mdl.breakrecover(e.target)},getThresholds:function(){return new Array(Mdl.getbreakcount(e.target)).fill(null).map(function(t,a){Mdl.getbreakvalue(e.target,a)})}}}),this.buff=property(this,function(e){return{get:function(t){return{potency:Mdl.getbuff(e.target,t,"stack"),count:Mdl.getbuff(e.target,t,"turn"),consumed:Mdl.getbuff(e.target,t,"consumed")}},inflict:function(t,a,l,i,o){var g=i==null?0:{"this turn":0,"next turn":1,"this and next turn":2}[i];Mdl.buff(e.target,t,a,l,g,o?"use":void 0)},getCount:function(t){return t?Mdl.getbuffcount(e.target,t):Mdl.getbuffcount(e.target,"neg")+Mdl.getbuffcount(e.target,"pos")}}}),this.passive={add:function(e,t){Modular.passiveadd(u.target,e,t?"yesdupe":"nodupe")},remove:function(e){Modular.passiveremove(u.target,e)},includes:function(e){return!!Modular.haspassive(u.target,e)}},this.resist=property(this,function(e){return new Proxy({},{get:function(t,a){var l=r.TYPES.attackTypes.sToI[a];if(l)return Mdl.getatkres(e.target,l)/100;var i=r.TYPES.sin.sToI[a];return i?Mdl.getsinres(e.target,i)/100:0},set:function(t,a,l){var i=r.TYPES.attackTypes.sToI[a];if(i)return Mdl.ovwatkres(e.target,i,l*100),!0;var o=r.TYPES.sin.sToI[a];return o?(Mdl.ovwsinres(e.target,o,l*100),!0):!1}})}),this.skill=property(this,function(e){return{get basePower(){return Modular.getskillbase(e.target)},addBasePower:function(t){Modular.base(t)},get coinPower(){return Modular.getcoinscale(e.target,0)},addCoinPower:function(t){Modular.scale(t)},getCoinAtIndexPower:function(t){return Modular.getcoinscale(e.target,t)},addClashPower:function(t){Mdl.clash(t)},get power(){return Mdl.getcurrentpower(e.target)},get rank(){return Mdl.getskillrank(e.target)},get weight(){return Mdl.getskillatkweight(e.target)},set weight(t){var a=Mdl.getskillatkweight(e.target);Mdl.atkweight(t-a)},get level(){return Mdl.getskilllevel(e.target)},get correction(){return Mdl.getskillatklevel(e.target)},get attackType(){var t;return(t=r.TYPES.attackTypes.nToS[Mdl.getskillatk(e.target)])!==null&&t!==void 0?t:"none"},set attackType(t){t!=="none"&&Mdl.changeatktype(r.TYPES.attackTypes.sToI[t])},get sin(){var t;return(t=r.TYPES.sin.nToS[Mdl.getskillattribute(e.target)])!==null&&t!==void 0?t:"neutral"},set sin(t){Mdl.changeaffinity(r.TYPES.sin.sToI[t])},get defenseType(){var t;return(t=r.TYPES.defenseType.nToS[Mdl.getskilldeftype(e.target)])!==null&&t!==void 0?t:"none"},get id(){var t=Modular.getskillid();return t!==-1?t:null},get clashable(){return!!Mdl.getskillcanduel(e.target)},set clashable(t){Mdl.skillcanduel(t?"True":"False")}}}),n){case"Self":this.core=new r("SelfCore");break;case"MainTarget":case"Target":this.core=new r(n+"Core");break;default:this.core=null}}return Object.defineProperty(r.prototype,"faction",{get:function(){return["ally","enemy"][Mdl.getunitfaction(this.target)]},enumerable:!1,configurable:!0}),Object.defineProperty(r.prototype,"level",{get:function(){return Mdl.getlevel(this.target)},set:function(n){Mdl.setlevel(this.target,n)},enumerable:!1,configurable:!0}),Object.defineProperty(r.prototype,"hp",{get:function(){return Modular.gethp(this.target,"normal")},set:function(n){var u=Modular.gethp(this.target,"normal");Modular.healhp(this.target,n-u)},enumerable:!1,configurable:!0}),Object.defineProperty(r.prototype,"maxHp",{get:function(){return Mdl.gethp(this.target,"max")},set:function(n){Mdl.setmaxhp(this.target,n)},enumerable:!1,configurable:!0}),Object.defineProperty(r.prototype,"shield",{get:function(){return Mdl.getshield(this.target)},enumerable:!1,configurable:!0}),r.prototype.gainShield=function(n,u){Mdl.shield(this.target,n,u?"perm":void 0)},Object.defineProperty(r.prototype,"sp",{get:function(){return Modular.getsp(this.target)},set:function(n){var u=Modular.getsp(this.target);Modular.healsp(this.target,n-u)},enumerable:!1,configurable:!0}),Object.defineProperty(r.prototype,"unitId",{get:function(){return Mdl.getid(this.target)},enumerable:!1,configurable:!0}),Object.defineProperty(r.prototype,"instId",{get:function(){return Mdl.getinstid(this.target)},enumerable:!1,configurable:!0}),r.prototype.hasKeywordOrAssociation=function(n,u){return!!Mdl.haskey.apply(Mdl,__spreadArray([this.target,u?"OR":"AND"],n,!1))},r.prototype.actionable=function(){switch(Mdl.isactionable(this.target)){case 0:return!1;case 1:return!0;default:return null}},r.TYPES={attackTypes:{nToS:{3:"none",0:"slash",1:"pierce",2:"blunt"},sToN:{slash:0,pierce:1,blunt:2},sToI:{blunt:"HIT",slash:"SLASH",pierce:"PENETRATE"}},sin:{nToS:{0:"wrath",1:"lust",2:"sloth",3:"gluttony",4:"gloom",5:"pride",6:"envy",7:"white",8:"black",9:"red",10:"pale",11:"neutral"},sToN:{wrath:0,lust:1,sloth:2,gluttony:3,gloom:4,pride:5,envy:6,white:7,black:8,red:9,pale:10,neutral:11},sToI:{wrath:"CRIMSON",lust:"SCARLET",sloth:"AMBER",gluttony:"SHAMROCK",gloom:"AZURE",pride:"INDIGO",envy:"VIOLET",white:"WHITE",black:"BLACK",red:"RED",pale:"PALE",neutral:"NEUTRAL"}},defenseType:{nToS:{0:"none",1:"guard",2:"evade",3:"counter",4:"attack"},sToN:{none:0,guard:1,evade:2,counter:3,attack:4}}},r})(),Units={self:new Unit("Self"),mainTarget:new Unit("MainTarget")};""";

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
    public void loadFile(string fileDirectory, string modFolder)
    {
        Main.Logger.LogInfo("Loading JS FILE: =>> " + fileDirectory);

        string fileName = Path.GetFileName(fileDirectory);
        string currentScriptName = Path.GetFileNameWithoutExtension(fileDirectory);

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

        string[] lines = File.ReadAllLines(fileDirectory);
        string COMMENT_PREFIX = "// Lethe:";
        var configLine = lines.FirstOrDefault(line => line.TrimStart().StartsWith(COMMENT_PREFIX));
        if (configLine != null)
        {
            var args = configLine[(configLine.IndexOf(COMMENT_PREFIX) + COMMENT_PREFIX.Length)..]
                .TrimStart()
                .Split(' ')
                .Select(arg => arg.Trim())
                .ToHashSet();

            if (args.Contains("import-only"))
            {
                Main.Logger.LogInfo($"File {fileDirectory} is marked as import-only, skipping execution.");
                return;
            }
        }

        V8ScriptEngine engine = new(V8ScriptEngineFlags.EnableDynamicModuleImports);
        engine.DocumentSettings.AccessFlags = DocumentAccessFlags.EnableFileLoading;
        engine.DocumentSettings.SearchPath = Path.GetDirectoryName(fileDirectory);
        engine.DocumentSettings.Loader.DiscardCachedDocuments();

        // Import Modular and its shorthand.
        engine.AddHostObject("Modular", mdlFunctions["all"]);
        engine.AddHostObject("Mdl", mdlFunctions["all"]);

        // Import unique logger
        engine.AddHostObject("Logger", new
        {
            log = (Action<object>)(x => Main.Logger.LogInfo($"[JS] {x}")),
            error = (Action<object>)(x => Main.Logger.LogError($"[JS] {x}"))
        });

        // Import global game data and IO access.
        engine.AddHostObject("EncounterData", StagePatches.encounterData);
        engine.AddHostObject("GlobalData", StagePatches.globalData);
        engine.AddHostObject("IO", new IO(modFolder));

        // Import helper classes. https://pbs.twimg.com/media/FbbTu_sWIAEIR9T.jpg
        engine.Execute(EXTERNAL_UTILITY_JS);

        try
        {
            var mod = new LoadedModule(engine);

            string contents = string.Join("\n", lines);

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
            mod.exports = engine.Script.___module___;
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
    public void loadLetheJavascriptFolder(string folderDirectory)
    {
        foreach (var file in Directory.GetFiles(folderDirectory, "*.js", SearchOption.AllDirectories))
            loadFile(file, folderDirectory);
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
                Main.runtime.loadFile(jsPath, javascriptFolder);
            }
        }
    }

    private readonly Dictionary<string, FileSystemWatcher> watchers = new();
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

        bool onlyReloadSingleFile = true;

        if (onlyReloadSingleFile)
        {
            watcher.Changed += (sender, e) => Main.runtime.loadFile(e.FullPath, dir);
            watcher.Created += (sender, e) => Main.runtime.loadFile(e.FullPath, dir);
            watcher.Deleted += (sender, e) => Main.runtime.loadFile(e.FullPath, dir);
            watcher.Renamed += (sender, e) =>
            {
                Main.runtime.loadFile(e.OldFullPath, dir);
                Main.runtime.loadFile(e.FullPath, dir);
            };
        }
        else
        {
            watcher.Changed += (sender, e) => Main.runtime.loadLetheJavascriptFolder(dir);
            watcher.Created += (sender, e) => Main.runtime.loadLetheJavascriptFolder(dir);
            watcher.Deleted += (sender, e) => Main.runtime.loadLetheJavascriptFolder(dir);
            watcher.Renamed += (sender, e) =>
            {
                Main.runtime.loadLetheJavascriptFolder(dir);
                Main.runtime.loadLetheJavascriptFolder(dir);
            };
        }
        watchers.Add(dir, watcher);
    }


    public ConfigEntry<bool> ioAccess;
}