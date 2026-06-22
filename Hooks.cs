using HarmonyLib;
using Il2CppInterop.Runtime.Injection;
using Il2CppSystem.Collections.Generic;
using Microsoft.ClearScript;
using UnityEngine;

namespace LetheJavascript.Hooks;


public class LetheJavascriptHooks : MonoBehaviour
{
    private static readonly List<UnityEngine.Object> _gcPrevent = new();
    public static void Setup()
    {
        ClassInjector.RegisterTypeInIl2Cpp<LetheJavascriptHooks>();

        GameObject gameObject = new("LetheJavascriptHook")
        {
            hideFlags = HideFlags.HideAndDontSave
        };
        DontDestroyOnLoad(gameObject);

        LetheJavascriptHooks letheHooks = gameObject.AddComponent<LetheJavascriptHooks>();
        
        _gcPrevent.Add(letheHooks);
    }
    internal void Update()
    {
        bool ctrlModifier =
            Input.GetKeyDown(KeyCode.LeftControl) ||
            Input.GetKeyDown(KeyCode.RightControl);

        if (!ctrlModifier)
        {
            bool keyDown = Input.GetKeyDown(KeyCode.R);
            if (keyDown)
            {
                Main.Runtime.ReloadQueued();
            }
        }
    }
}