using BepInEx;
using BepInEx.Unity.IL2CPP;
using HarmonyLib;
using BepInEx.Logging;
using LetheJavascript.Classes;
using ModularSkillScripts;
using LetheJavascript.Modular;
using Lethe;
using System.IO;
using System.Reflection;
using System;

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

        try
        {
            updateLetheModTemplate();
        }
        catch (Exception e)
        {
            Logger.LogError(e.Message);
        }
    }
    public static string ExtractEmbed(string path)
    {
        var asm = Assembly.GetExecutingAssembly();
        using var stream = asm.GetManifestResourceStream("LetheJavascript." + path)!;

        using var reader = new StreamReader(stream);
        var file = reader.ReadToEnd();

        return file;
    }
    public static ScriptRuntime runtime;
    /// <summary>
    /// Lowkey dont run this
    /// </summary>
    private static void updateLetheModTemplate()
    {

        if (!Directory.Exists(LetheMain.templatePath.FullPath))
            return;

        string[] pathsToCreate = [
            "javascript",
            "typescript",
            Path.Combine("typescript", "ts-defs")
        ];
        
        foreach (string path in pathsToCreate)
        {
            var fullPath = Path.Combine(LetheMain.templatePath.FullPath, path);
            Directory.CreateDirectory(fullPath);
        }

        File.WriteAllText(
            Path.Combine(LetheMain.templatePath.FullPath, "typescript", "tsconfig.json"),
            ExtractEmbed("embed.typescript.tsconfig.json")
        );
        File.WriteAllText(
            Path.Combine(LetheMain.templatePath.FullPath, "typescript", "ts-defs", "modularJS.d.ts"),
            ExtractEmbed("embed.typescript.ts_defs.modularJS.d.ts")
        );
        File.WriteAllText(
            Path.Combine(LetheMain.templatePath.FullPath, "typescript", "ts-defs", "modularCS.d.ts"),
            ExtractEmbed("embed.typescript.ts_defs.modularCS.d.ts")
        );
        Logger.LogInfo("Finished updating template, updating mods if they have typescript folder.");
        updateTypescriptInLetheMods();
    }

    private static void updateTypescriptInLetheMods()
    {
        string jsDef = ExtractEmbed("embed.typescript.ts_defs.modularJS.d.ts");
        string csDef = ExtractEmbed("embed.typescript.ts_defs.modularCS.d.ts");
        string tsConfig = ExtractEmbed("embed.typescript.tsconfig.json");
        foreach (string modPath in Directory.GetDirectories(LetheMain.modsPath.FullPath))
        {
            string typescriptFolder = Path.Combine(modPath, "typescript");
            if (!Directory.Exists(typescriptFolder)) continue;

            Logger.LogInfo("Scanning for mexicans v3 =>" + typescriptFolder);

            string typescriptDefFolder = Path.Combine(typescriptFolder, "ts-defs");
            Directory.CreateDirectory(typescriptDefFolder);

            File.WriteAllText(Path.Combine(typescriptDefFolder, "modularJS.d.ts"), jsDef);
            File.WriteAllText(Path.Combine(typescriptDefFolder, "modularCS.d.ts"), csDef);
            File.WriteAllText(Path.Combine(typescriptFolder, "tsconfig.json"), tsConfig);
        }
    }
    private static void patchModular()
    {
        MainClass.consequenceDict["runjavascript"] = new ModularConsequenceRunJavascript();
    }
}