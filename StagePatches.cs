using System.IO;
using HarmonyLib;
using MainUI;
using Lethe;
using System.Collections.Generic;

using Microsoft.ClearScript;
using System;

namespace LetheJavascript.Patches;

public class StagePatches
{
    public static readonly JS.ModData EncounterData;
    public static readonly JS.ModData GlobalData = new();
    private static Action EncounterDataClearer = () => { };
    static StagePatches()
    {
        EncounterData = new((clearer) => EncounterDataClearer = clearer);
    }
    public static int EncounterID = -1;
    [HarmonyPatch(typeof(StageModel), nameof(StageModel.Init))]
    [HarmonyPrefix]
    private static void Prefix_StageModel_Init(StageStaticData stageinfo, StageModel __instance)
    {
        EncounterDataClearer();

        // Increment the encounter ID.
        EncounterID++;
    }
}