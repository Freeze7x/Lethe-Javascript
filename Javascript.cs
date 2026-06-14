using System;
using Il2CppSystem.Collections.Generic;
using Lethe;
using LetheJavascript.Modular;
using LetheJavascript.Patches;
using ModularSkillScripts;

namespace LetheJavascript.JS;

public static class Pipeline
{
    public static BattleUnitModel[] GetBattleUnitModelListFromTarget(string target)
    {
        return [.. ModularConsequenceRunJavascript.lastSA.GetTargetModelList(target)];
    }

    public static BattleUnitModel GetBattleUnitModelFromTarget(string target)
    {
        return ModularConsequenceRunJavascript.lastSA.GetTargetModel(target);
    }
    public static StageController GetStageController()
    {
        return Singleton<StageController>.Instance;
    }
    public static int EncounterID => StagePatches.EncounterID;
}