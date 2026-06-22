using System.IO;
using HarmonyLib;
using MainUI;
using Lethe;
using System.Collections.Generic;
namespace LetheJavascript.Patches;

public class ReloadPatches
{
    [HarmonyPatch(typeof(LobbyUIPresenter), nameof(LobbyUIPresenter.Initialize))]
    [HarmonyPostfix]
    private static void PostMainUILoad()
    {
        if (Main.Runtime.config_reloadBehaviour == Classes.reloadBehaviour.onLobby)
            Main.Runtime.LoadLetheModFolder();
    }
}