using Il2CppSystem;
using Il2CppSystem.Collections.Generic;
using Lethe;
using LetheJavascript.Modular;
using LetheJavascript.Patches;
using ModularSkillScripts;
using Microsoft.ClearScript.V8;

using Microsoft.ClearScript;
namespace LetheJavascript.JS;

public static class V8JSUtilities
{
    private static readonly V8ScriptEngine engine;
    static V8JSUtilities()
    {
        engine = new();
        engine.Execute(
            Main.ExtractEmbed("embed.javascript.dotNetUtility.js")
        );
    }

    public static ScriptObject GetEmptyObject() => (ScriptObject)engine.Invoke("returnNewObject");
    public static ScriptObject TurnIterableIntoJSArray(IEnumerable<object> iterable)
        => (ScriptObject)engine.Invoke("turnIterableIntoArray", iterable);
    public static ScriptObject ConstructGameData()
        => (ScriptObject)engine.Invoke("constructGameData");
}


// public class ModData
// {
//     private readonly Dictionary<string, ScriptObject> Data = new();
//     public ScriptObject get(string modkey, ScriptObject defaultValue = null)
//     {
//         if (Data.TryGetValue(modkey, out var data))
//             return data;

//         Data.Add(modkey, defaultValue ?? V8JSUtilities.GetEmptyObject());
//         return Data[modkey];
//     }
// }

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
    public static BattleActionModel SelfAction() => ModularConsequenceRunJavascript.lastSA.modsa_selfAction;
    public class BattleUnitModelUtility
    {
        public static BattleUnitModel GetCore(BattleUnitModel bum)
        {
            BattleUnitModel_Abnormality_Part part = bum.TryCast<BattleUnitModel_Abnormality_Part>();
            if (part != null) 
                return part.Abnormality;
            else return null;
        }
        public static void ChangeHp(BattleUnitModel bum, int number)
        {
            bum.ChangeHp(number, DAMAGE_SOURCE_TYPE.NONE, BATTLE_EVENT_TIMING.NONE);
        }
    }
}