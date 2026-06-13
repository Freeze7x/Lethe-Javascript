using BepInEx;
using BepInEx.Unity.IL2CPP;
using HarmonyLib;
using BepInEx.Logging;
using LetheJavascript.Classes;
using ModularSkillScripts;
using LetheJavascript.Modular;
using Lethe;
using Il2CppSystem.IO;


namespace LetheJavascript;

[BepInPlugin(GUID, NAME, VERSION)]
[BepInDependency("GlitchGames.ModularSkillScripts")]
public class Main : BasePlugin
{
    public const string GUID = $"{AUTHOR}.{NAME}";
    public const string NAME = "LetheJavascript";
    public const string VERSION = "1.0.0";
    public const string AUTHOR = "Freeze";

    public static ManualLogSource Logger;

    public override void Load()
    {
        Harmony harmony = new(GUID);
        harmony.PatchAll(typeof(Patches.ReloadPatches));

        Logger = BepInEx.Logging.Logger.CreateLogSource("LetheJavascript");
        Logger.LogInfo("runtime about to be init hell yeah");
        Logger.LogInfo($"lowkey hijacking lethe rn {LetheMain.modsPath}");

        patchModular();

        runtime = new()
        {
            config_IoFullAccess = Config.Bind(
                "Permission", "IOAccess", false,
                "Allow .js files to access the entire file system instead of just the plugins folder. Leave this off unless you know what you are doing."
            ).Value,
            config_reloadBehaviour = Config.Bind(
                "General", "HotReload", true,
                "Whether to hot reload .js files when they are changed. If false, you will have to reload the lobby to see changes. If true, changes will be applied when the file is saved."
            ).Value ? reloadBehaviour.onFileSave : reloadBehaviour.onLobby
        };
        
        runtime.LoadAllFromModPath();
    }
    public static ScriptRuntime runtime;
    /// <summary>
    /// Lowkey dont run this
    /// </summary>
    private static void updateLetheModTemplate()
    {
        // # TDIFU
        const string tsconfig = "";
        const string tsdts = "";

        if (Directory.Exists(LetheMain.templatePath.FullPath))
        {
            string[] pathsToCreate = ["javascript", "typescript", Path.Combine("typescript", "ts-defs")];
            foreach (string path in pathsToCreate)
            {
                var fullPath = Path.Combine(LetheMain.templatePath.FullPath, path);
                if (!Directory.Exists(fullPath))
                    Directory.CreateDirectory(fullPath);
            }

            File.WriteAllText(tsconfig, Path.Combine(LetheMain.templatePath.FullPath, "typescript", "tsconfig.json"));
            File.WriteAllText(tsdts, Path.Combine(LetheMain.templatePath.FullPath, "typescript", "ts-defs", "modular.d.ts"));

            Directory.CreateDirectory("");
        }
    }

    private static void patchModular()
    {
        MainClass.consequenceDict["runjavascript"] = new ModularConsequenceRunJavascript();
    }
}