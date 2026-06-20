using HarmonyLib;
using Il2CppSystem;
using Il2CppSystem.Collections.Generic;
using Microsoft.ClearScript;

namespace LetheJavascript.Patches;


public class StagePatches
{
    // public static readonly JS.ModData EncounterData;
    public static class GameData
    {
        public static readonly Dictionary<string, dynamic> _RegistryGlobal = new();
        public static readonly Dictionary<string, dynamic> _RegistryEncounter = new();
        public static dynamic Get(string type, string key)
        {
            return type switch
            {
                "global" => _RegistryGlobal[key],
                "encounter" => _RegistryEncounter[key],
                _ => null,
            };
        }
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
        GameData._RegistryGlobal.Clear();
    }
}