using System;
using Il2CppSystem.Collections.Generic;
using Lethe;
using LetheJavascript.Patches;
using ModularSkillScripts;

namespace LetheJavascript.Modular;

public class ModularConsequenceRunJavascript : IModularConsequence
{
    public static ModularSA lastSA = null;
    private static object tryParse(string value)
    {
        switch (value)
        {
            case "true": return true;
            case "false": return false;
            default:
                if (int.TryParse(value, out int intValue))
                    return intValue;
                if (double.TryParse(value, out double doubleValue))
                    return doubleValue;
                return value;
        }
    }
    public void ExecuteConsequence(ModularSA modular, string section, string circledSection, string[] circles)
    {
        lastSA = modular;
        
        Main.runtime.callScript(circles[0], circles[1], Array.ConvertAll(circles[2..], tryParse));
    }
}

public class ModularAcquirerEncounterUid : IModularAcquirer
{
    public int ExecuteAcquirer(ModularSA modular, string section, string circledSection, string[] circles)
    {
        return Patches.StagePatches.EncounterID;
    }
}