using System.IO;
using HarmonyLib;
using MainUI;
using Lethe;
using System.Collections.Generic;

using Microsoft.ClearScript;

namespace LetheJavascript.Patches;

public class StagePatches
{
    public static PropertyBag encounterData = new();
    public static PropertyBag globalData = new();
    static StagePatches()
    {

    }
    [HarmonyPatch(typeof(StageModel), nameof(StageModel.Init))]
    [HarmonyPrefix]
    private static void Prefix_StageModel_Init(StageStaticData stageinfo, StageModel __instance)
    {
        encounterData = new();
    }
}