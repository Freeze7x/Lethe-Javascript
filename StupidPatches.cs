using HarmonyLib;
using Il2CppSystem;
using Il2CppSystem.Collections.Generic;
using Microsoft.ClearScript;

namespace LetheJavascript.Patches;


public class StupidPatches
{
    [HarmonyPatch(typeof(Lethe.Patches.Menu), "ExtractEmbeddedVideo")]
    [HarmonyPrefix]
    static bool Prefix(ref string __result)
    {
        __result = @"C:/Users/Freez/Videos/Captures/Lethe_maintheme.mp4";
        return false;
    }
}