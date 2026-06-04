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
    public Dictionary<string, ScriptObject> exports = [];

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
            Main.Logger.LogError("[JS] Attempted to read a file outside of the plugins folder: " + fileDir);
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
            Main.Logger.LogError("[JS] Attempted to write a file outside of the mod folder: " + fileDir);
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
            Main.Logger.LogError("[JS] Attempted to list a directory outside of the plugins folder: " + folderDir);
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
            Main.Logger.LogError("[JS] Attempted to list a directory outside of the plugins folder: " + folderDir);
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
            Main.Logger.LogError("[JS] Attempted to delete a file outside of the mod folder: " + fileDir);
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
    public PropertyBag mdlFunctions = [];

    // ts is laced and that damn dog got it im so sorry.
    private const string EXTERNAL_UTILITY_JS = """ "use strict";function property(r,t){return t(r)}class Unit{target;static TYPES={attackTypes:{nToS:{3:"none",0:"slash",1:"pierce",2:"blunt"},sToN:{slash:0,pierce:1,blunt:2},sToI:{blunt:"HIT",slash:"SLASH",pierce:"PENETRATE"}},sin:{nToS:{0:"wrath",1:"lust",2:"sloth",3:"gluttony",4:"gloom",5:"pride",6:"envy",7:"white",8:"black",9:"red",10:"pale",11:"neutral"},sToN:{wrath:0,lust:1,sloth:2,gluttony:3,gloom:4,pride:5,envy:6,white:7,black:8,red:9,pale:10,neutral:11},sToI:{wrath:"CRIMSON",lust:"SCARLET",sloth:"AMBER",gluttony:"SHAMROCK",gloom:"AZURE",pride:"INDIGO",envy:"VIOLET",white:"WHITE",black:"BLACK",red:"RED",pale:"PALE",neutral:"NEUTRAL"}},defenseType:{nToS:{0:"none",1:"guard",2:"evade",3:"counter",4:"attack"},sToN:{none:0,guard:1,evade:2,counter:3,attack:4}}};constructor(t){switch(this.target=t,t){case"Self":this.core=new Unit("SelfCore");break;case"MainTarget":case"Target":this.core=new Unit(t+"Core");break;default:this.core=null}}core;get faction(){return["ally","enemy"][Modular.getunitfaction(this.target)]}get level(){return Modular.getlevel(this.target)}set level(t){Modular.setlevel(this.target,t)}get hp(){return Modular.gethp(this.target,"normal")}set hp(t){const e=Modular.gethp(this.target,"normal");Modular.healhp(this.target,t-e)}get maxHp(){return Modular.gethp(this.target,"max")}set maxHp(t){Modular.setmaxhp(this.target,t)}get shield(){return Modular.getshield(this.target)}gainShield(t,e){Modular.shield(this.target,t,e?"perm":void 0)}get sp(){return Modular.getsp(this.target)}set sp(t){const e=Modular.getsp(this.target);Modular.healsp(this.target,t-e)}get unitId(){return Modular.getid(this.target)}get instId(){return Modular.getinstid(this.target)}hasKeywordOrAssociation(t,e){return!!Modular.haskey(this.target,e?"OR":"AND",...t)}actionable(){switch(Modular.isactionable(this.target)){case 0:return!1;case 1:return!0;default:return null}}speed=property(this,t=>({get min(){return Modular.getstat(t.target,"speedMin")},get max(){return Modular.getstat(t.target,"speedMax")},get current(){return Modular.getspeed(t.target)},getSlotSpeed(e){return Modular.getspeed(t.target,e)}}));stagger=property(this,t=>({addAt(e){Modular.breakaddbar(t.target,e)},tremorBurst(e,a){Modular.burst(t.target,e??1),a&&Modular.buff(t.target,"Vibration",0,-a,0)},staggerDamage(e,a){Modular.breakdmg(t.target,e??1,a)},instantStagger(e){Modular.break(t.target,e)},recover(){Modular.breakrecover(t.target)},getThresholds(){return new Array(Modular.getbreakcount(t.target)).fill(null).map((e,a)=>Modular.getbreakvalue(t.target,a))}}));buff=property(this,t=>({get(e){return{potency:Modular.getbuff(t.target,e,"stack"),count:Modular.getbuff(t.target,e,"turn"),consumed:Modular.getbuff(t.target,e,"consumed")}},inflict(e,a,u,n,o){const s=n==null?0:{"this turn":0,"next turn":1,"this and next turn":2}[n];Modular.buff(t.target,e,a,u,s,o?"use":void 0)},getCount(e){return e?Modular.getbuffcount(t.target,e):Modular.getbuffcount(t.target,"neg")+Modular.getbuffcount(t.target,"pos")}}));passive={add:(t,e)=>{Modular.passiveadd(this.target,t,e?"yesdupe":"nodupe")},remove:t=>{Modular.passiveremove(this.target,t)},includes:t=>!!Modular.haspassive(this.target,t)};resist=property(this,t=>new Proxy({},{get(e,a){const u=Unit.TYPES.attackTypes.sToI[a];if(u)return Modular.getatkres(t.target,u)/100;const n=Unit.TYPES.sin.sToI[a];return n?Modular.getsinres(t.target,n)/100:0},set(e,a,u){const n=Unit.TYPES.attackTypes.sToI[a];if(n)return Modular.ovwatkres(t.target,n,u*100),!0;const o=Unit.TYPES.sin.sToI[a];return o?(Modular.ovwsinres(t.target,o,u*100),!0):!1}}));skill=property(this,t=>({get basePower(){return Modular.getskillbase(t.target)},addBasePower(e){Modular.base(e)},get coinPower(){return Modular.getcoinscale(t.target,0)},addCoinPower(e){Modular.scale(e)},getCoinAtIndexPower(e){return Modular.getcoinscale(t.target,e)},addClashPower(e){Modular.clash(e)},get power(){return Modular.getcurrentpower(t.target)},get rank(){return Modular.getskillrank(t.target)},get weight(){return Modular.getskillatkweight(t.target)},set weight(e){const a=Modular.getskillatkweight(t.target);Modular.atkweight(e-a)},get level(){return Modular.getskilllevel(t.target)},get correction(){return Modular.getskillatklevel(t.target)},get attackType(){return Unit.TYPES.attackTypes.nToS[Modular.getskillatk(t.target)]??"none"},set attackType(e){e!=="none"&&Modular.changeatktype(Unit.TYPES.attackTypes.sToI[e])},get sin(){return Unit.TYPES.sin.nToS[Modular.getskillattribute(t.target)]??"neutral"},set sin(e){Modular.changeaffinity(Unit.TYPES.sin.sToI[e])},get defenseType(){return Unit.TYPES.defenseType.nToS[Modular.getskilldeftype(t.target)]??"none"},get id(){const e=Modular.getskillid();return e!==-1?e:null},get clashable(){return!!Modular.getskillcanduel(t.target)},set clashable(e){Modular.skillcanduel(e?"True":"False")}}))}function createUnitTarget(r){return new Unit(r)}const Mathf={...Math,clamp(r,t,e){return Math.min(Math.max(r,t),e)},lerp(r,t,e){return r+(t-r)*e},roundToMultiple(r,t){return Math.round(r/t)*t},floorToMultiple(r,t){return Math.floor(r/t)*t},random(r,t){return r===void 0?Math.random():t===void 0?Math.random()*r:Math.random()*(t-r)+r}},Units={self:new Unit("Self"),mainTarget:new Unit("MainTarget")};function InvokeModular(r,...t){const e=Modular[r];return e?+e(...t):(Logger.error(`Could not find function ${r}`),0)} """;

    public ScriptRuntime(dynamic config = null)
    {
        Main.Logger.LogInfo("ScriptRuntime Init Begun");

        PropertyBag cons = [];
        PropertyBag acq = [];

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

    public readonly Dictionary<string, LoadedModule> LoadedModules = [];
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
        string COMMENT_PREFIX = "// # Lethe ";
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

        watcher.Changed += (sender, e) => Main.runtime.loadFile(e.FullPath, dir);
        watcher.Created += (sender, e) => Main.runtime.loadFile(e.FullPath, dir);
        watcher.Deleted += (sender, e) => Main.runtime.loadFile(e.FullPath, dir);
        watcher.Renamed += (sender, e) =>
        {
            Main.runtime.loadFile(e.OldFullPath, dir);
            Main.runtime.loadFile(e.FullPath, dir);
        };

        watchers.Add(dir, watcher);
    }
}