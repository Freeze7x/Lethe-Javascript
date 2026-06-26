using HarmonyLib;
using System;
using System.Collections.Generic;
using Microsoft.ClearScript;
using System.Collections.Concurrent;

namespace LetheJavascript.Patches;


public class StagePatches
{
    // public static readonly JS.ModData EncounterData;
    public static class GameData
    {
        public static readonly PropertyBag _RegistryGlobal = [];
        public static readonly PropertyBag _RegistryEncounter = [];
    }
    static StagePatches()
    {
        // EncounterData = new((clearer) => EncounterDataClearer = clearer);
    }
    public static int EncounterID = -1;
    [HarmonyPatch(typeof(StageModel), nameof(StageModel.Init))]
    [HarmonyPrefix]
    private static void Prefix_StageModel_Init(StageStaticData stageinfo, StageModel __instance)
    {
        // Increment the encounter ID.
        EncounterID++;
        GameData._RegistryEncounter.ClearNoCheck();
    }
}