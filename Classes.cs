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
using System.Text.RegularExpressions;
using System.Runtime.CompilerServices;

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
        parent.loadFile(FileDirectory, ModFolder);
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

    // ts is laced and that damn dog got it im so sorry.
    private const string EXTERNAL_UTILITY_JS = """ "use strict";class UnitPropertyClass{parent;constructor(e){this.parent=e}get target(){return this.parent.target}get getTargetOrSelf(){return this.parent.getIsTargetOrSelf()}}class Unit{target;static TYPES={attackTypes:{intToName:{3:"none",0:"slash",1:"pierce",2:"blunt"},nameToInt:{slash:0,pierce:1,blunt:2},nameToInternal:{blunt:"HIT",slash:"SLASH",pierce:"PENETRATE"}},sin:{intToName:{0:"wrath",1:"lust",2:"sloth",3:"gluttony",4:"gloom",5:"pride",6:"envy",7:"white",8:"black",9:"red",10:"pale",11:"neutral"},nameToInt:{wrath:0,lust:1,sloth:2,gluttony:3,gloom:4,pride:5,envy:6,white:7,black:8,red:9,pale:10,neutral:11},nameToInternal:{wrath:"CRIMSON",lust:"SCARLET",sloth:"AMBER",gluttony:"SHAMROCK",gloom:"AZURE",pride:"INDIGO",envy:"VIOLET",white:"WHITE",black:"BLACK",red:"RED",pale:"PALE",neutral:"NEUTRAL"}},defenseType:{intToName:{0:"none",1:"guard",2:"evade",3:"counter",4:"attack"},nameToInt:{none:0,guard:1,evade:2,counter:3,attack:4}}};getIsTargetOrSelf(){return this.invoke("issameunit","Self")?"Self":this.invoke("issameunit","MainTarget")?"Target":""}static GROUPS={Hp:class extends UnitPropertyClass{get max(){return InvokeModular("gethp",this.target,"max")}set max(e){e|=0,InvokeModular("setmaxhp",this.target,e)}get current(){return InvokeModular("gethp",this.target,"normal")}set current(e){e|=0;const t=InvokeModular("gethp",this.target,"normal");InvokeModular("healhp",this.target,e-t)}get normalized(){return this.current/this.max}heal(e){InvokeModular("healhp",this.target,e)}healPercent(e){InvokeModular("healhp",this.target,`${e}%`)}},Speed:class extends UnitPropertyClass{get min(){return InvokeModular("getstat",this.target,"speedMin")}get max(){return InvokeModular("getstat",this.target,"speedMax")}get current(){return InvokeModular("getspeed",this.target)}getSlotSpeed(e){return InvokeModular("getspeed",this.target,e)}},Stagger:class extends UnitPropertyClass{addAt(e){InvokeModular("breakaddbar",this.target,e)}tremorBurst(e,t){InvokeModular("burst",this.target,e??1),t&&InvokeModular("buff",this.target,"Vibration",0,-t,0)}staggerDamage(e,t){InvokeModular("breakdmg",this.target,e??1,t)}instantStagger(e){InvokeModular("break",this.target,e)}recover(){InvokeModular("breakrecover",this.target)}getThresholds(){return new Array(InvokeModular("getbreakcount",this.target)).fill(null).map((e,t)=>InvokeModular("getbreakvalue",this.target,t))}},Buff:class extends UnitPropertyClass{get(e){return{potency:InvokeModular("getbuff",this.target,e,"stack"),count:InvokeModular("getbuff",this.target,e,"turn"),consumed:InvokeModular("getbuff",this.target,e,"consumed")}}add(e,t,n,a,o){const s=a==null?0:{"this turn":0,"next turn":1,"this and next turn":2}[a];InvokeModular("buff",this.target,e,t,n,s,o?"use":void 0)}inflict(e,t,n,a,o){e.buff.add(t,n,a,o,!0)}getCount(e){return e?InvokeModular("getbuffcount",this.target,e):InvokeModular("getbuffcount",this.target,"neg")+InvokeModular("getbuffcount",this.target,"pos")}},Passive:class extends UnitPropertyClass{add(e,t){InvokeModular("passiveadd",this.target,e,t?"yesdupe":"nodupe")}remove(e){InvokeModular("passiveremove",this.target,e)}has(e){return!!InvokeModular("haspassive",this.target,e)}},Skill:class extends UnitPropertyClass{get basePower(){return InvokeModular("getskillbase",this.getTargetOrSelf)}addBasePower(e){InvokeModular("base",e)}get coinPower(){return InvokeModular("getcoinscale",this.getTargetOrSelf,0)}addCoinPower(e){InvokeModular("scale",e)}getCoinAtIndexPower(e){return InvokeModular("getcoinscale",this.getTargetOrSelf,e)}addClashPower(e){InvokeModular("clash",e)}get power(){return InvokeModular("getcurrentpower",this.getTargetOrSelf)}get rank(){return InvokeModular("getskillrank",this.getTargetOrSelf)}get weight(){return InvokeModular("getskillatkweight",this.getTargetOrSelf)}set weight(e){e|=0;const t=InvokeModular("getskillatkweight",this.getTargetOrSelf);InvokeModular("atkweight",e-t)}get level(){return InvokeModular("getskilllevel",this.getTargetOrSelf)}get correction(){return InvokeModular("getskillatklevel",this.getTargetOrSelf)}get attackType(){return Unit.TYPES.attackTypes.intToName[InvokeModular("getskillatk",this.getTargetOrSelf)]??"none"}set attackType(e){e!=="none"&&InvokeModular("changeatktype",Unit.TYPES.attackTypes.nameToInternal[e])}get sin(){return Unit.TYPES.sin.intToName[InvokeModular("getskillattribute",this.getTargetOrSelf)]??"neutral"}set sin(e){InvokeModular("changeaffinity",Unit.TYPES.sin.nameToInternal[e])}get defenseType(){return Unit.TYPES.defenseType.intToName[InvokeModular("getskilldeftype",this.getTargetOrSelf)]??"none"}get id(){const e=InvokeModular("getskillid");return e!==-1?e:null}get operator(){switch(InvokeModular("getcoinoperator",this.getTargetOrSelf,0)){case 1:return"+";case 2:return"-";case 3:return"*";default:return"?"}}set operator(e){e!=="?"&&InvokeModular("scale",{"+":"ADD","-":"SUB","*":"MUL"}[e])}get clashable(){return!!InvokeModular("getskillcanduel",this.target)}set clashable(e){InvokeModular("skillcanduel",e?"True":"False")}},Shield:class extends UnitPropertyClass{get amount(){return InvokeModular("getshield",this.target)}gainShield(e,t){InvokeModular("shield",this.target,e,t?"perm":void 0)}},Meta:class extends UnitPropertyClass{get unitId(){return InvokeModular("getid",this.target)}get instId(){return InvokeModular("getinstid",this.target)}get characterId(){return InvokeModular("getcharacterid",this.target)}hasKeywordOrAssociation(e,t){return!!InvokeModular("haskey",this.target,t?"OR":"AND",...Array.isArray(e)?e:[e])}},Ability:class extends UnitPropertyClass{add(e,t,n,a){InvokeModular("addability",this.target,e,t,n,a)}remove(e){InvokeModular("removeability",this.target,e)}}};constructor(e){switch(this.target=e,e){case"Self":this.core=new Unit("SelfCore");break;case"MainTarget":case"Target":this.core=new Unit(e+"Core");break;default:this.core=null}this._battleUnitModel=Utility.GetBattleUnitModelFromTarget(this.target)}_battleUnitModel;core;invoke(e,...t){return InvokeModular(e,this.target,...t)}get faction(){return["enemy","ally"][InvokeModular("getunitfaction",this.target)]}get level(){return InvokeModular("getlevel",this.target)}set level(e){e|=0,InvokeModular("setlevel",this.target,e)}get sp(){return InvokeModular("getsp",this.target)}set sp(e){e|=0;const t=InvokeModular("getsp",this.target);InvokeModular("healsp",this.target,e-t)}actionable(){switch(InvokeModular("isactionable",this.target)){case 0:return!1;case 1:return!0;default:return null}}hp=new Unit.GROUPS.Hp(this);speed=new Unit.GROUPS.Speed(this);stagger=new Unit.GROUPS.Stagger(this);buff=new Unit.GROUPS.Buff(this);passive=new Unit.GROUPS.Passive(this);skill=new Unit.GROUPS.Skill(this);shield=new Unit.GROUPS.Shield(this);meta=new Unit.GROUPS.Meta(this);ability=new Unit.GROUPS.Ability(this);resist=new Proxy(this,{get(e,t){const n=Unit.TYPES.attackTypes.nameToInternal[t];if(n)return InvokeModular("getatkres",e.target,n)/100;const a=Unit.TYPES.sin.nameToInternal[t];return a?InvokeModular("getsinres",e.target,a)/100:0},set(e,t,n){const a=Unit.TYPES.attackTypes.nameToInternal[t];if(a)return InvokeModular("ovwatkres",e.target,a,n*100),!0;const o=Unit.TYPES.sin.nameToInternal[t];return o?(InvokeModular("ovwsinres",e.target,o,n*100),!0):!1}})}const Encounter={get turn(){return InvokeModular("getround")},get wave(){return InvokeModular("getwave")},get id(){return InvokeModular("getencounteruid")}},Mathf={clamp(r,e,t){return Math.min(Math.max(r,e),t)},lerp(r,e,t){return r+(e-r)*t},roundToMultiple(r,e){return Math.round(r/e)*e},floorToMultiple(r,e){return Math.floor(r/e)*e},random(r,e){return r===void 0?Math.random():e===void 0?Math.random()*r:Math.random()*(e-r)+r}},__UnitCache__={registry:new Map,encounterId:null,get(r){return this.registry.get(r)??this.registry.set(r,new Unit("inst"+r)).get(r)},resetIfEncounterUpdated(){this.encounterId!==Encounter.id&&(this.registry.clear(),this.encounterId=Encounter.id)}};function GetUnit(r){__UnitCache__.resetIfEncounterUpdated();try{const e=InvokeModular("getinstid",r);return __UnitCache__.get(e)}catch{return null}}function GetUnits(r){__UnitCache__.resetIfEncounterUpdated();try{return[...Utility.GetInstIdFromMultiTarget(r)].map(t=>__UnitCache__.get(t))}catch{return[]}}let ScriptBehaviour;ScriptBehaviour=[]; """;

    public ScriptRuntime(dynamic config = null)
    {
        Main.Logger.LogInfo("ScriptRuntime Init Begun");
        Main.Logger.LogInfo("ScriptRuntime Init Done");
    }

    public readonly Dictionary<string, LoadedModule> LoadedModules = [];
    /// <summary>
    /// key is file path
    /// 
    /// value is files that rely on the provided key
    /// </summary>
    public readonly Dictionary<string, HashSet<string>> Dependencies = [];
    public void loadFile(string fileDirectory, string modFolder)
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
        engine.AddHostObject("InvokeModular", InvokeModular);

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

        engine.AddHostType("Utility", typeof(LetheJavascript.Modular.Utility));

        // Import helper classes. https://pbs.twimg.com/media/FbbTu_sWIAEIR9T.jpg
        engine.Execute(EXTERNAL_UTILITY_JS);
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
                Main.runtime.loadFile(jsPath, javascriptFolder);
            }
        }
    }
    private static string[] getImportsFromJs(string code, string filePath)
    {
        Regex regex = new(@"""(.*)""");
        List<string> imports = [];

        using (StringReader reader = new(code))
        {
            string line;
            while ((line = reader.ReadLine()) != null)
            {
                line = line.Trim();
                if (line.StartsWith("import "))
                {
                    var match = regex.Match(line);
                    foreach (Capture capture in match.Groups[1].Captures)
                    {
                        imports.Add(capture.Value);
                        Main.Logger.LogInfo("Found import: " + capture.Value);
                    }
                }
            }
        }

        return [.. imports.Select(import =>
        {
            // Turn relative paths in absolute paths.
            if (import.StartsWith("."))
            {
                return Path.GetFullPath(
                    Path.Join(
                        Path.GetDirectoryName(filePath),
                        import
                    )
                );
            }
            return import;
        })];
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

    private void FileChanged(string filePath, string modFolder)
    {
        loadFile(filePath, modFolder);
        if (Dependencies.TryGetValue(filePath, out var dependants))
        {
            foreach (var dependant in dependants)
            {
            }
        }
    }
}