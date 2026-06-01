using System.IO;
using HarmonyLib;
using MainUI;
using Lethe;
using System.Collections.Generic;

using Microsoft.ClearScript;

namespace LetheJavascript.Patches;

public class StagePatches
{
    public static PropertyBag jsData = new();
    static StagePatches()
    {
        // this HAS to work right??
        jsData["encounter"] = new();
        jsData["global"] = new();
    }
    [HarmonyPatch(typeof(StageModel), nameof(StageModel.Init))]
    [HarmonyPrefix]
    private static void Prefix_StageModel_Init(StageStaticData stageinfo, StageModel __instance)
    {
        jsData["encounter"] = new();
    }
}