using System;
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
        engine.Execute(@"
            function returnNewObject() {
                return {};
            }

            function turnIterableIntoArray(itr) {
                return [...itr]
            }
        ");
    }
    public static ScriptObject GetEmptyObject()
    {
        return (ScriptObject)engine.Invoke("returnNewObject");
    }
    public static ScriptObject TurnIterableIntoJSArray(IEnumerable<object> iterable)
    {
        return (ScriptObject)engine.Invoke("turnIterableIntoArray", iterable);
    }
}


public class ModData
{
    public ModData(Action<Action> clear)
    {
        clear(() => Data.Clear());
    }
    public ModData() { }
    private static readonly Dictionary<string, ScriptObject> Data = new();
    public static ScriptObject get(string modkey, ScriptObject defaultValue = null)
    {
        if (Data.TryGetValue(modkey, out var data))
            return data;

        Data.Add(modkey, defaultValue ?? V8JSUtilities.GetEmptyObject());
        return Data[modkey];
    }
}

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
        public static void ChangeHp(BattleUnitModel bum, int number)
        {
            bum.ChangeHp(number, DAMAGE_SOURCE_TYPE.NONE, BATTLE_EVENT_TIMING.NONE);
        }
    }
}