# GlitchScript

---

## **Batch Structure**
- **Batches** are separated by forward slashes (`/`).
- A batch can include **Main Functions**, **Consequence Functions**, and **IF Statements**.
- **Consequence Functions** and **IF Statements** can co-exist in the same batch.

### **Valid Batch Examples**
- `/TIMING:WinDuel/`
- `/IF(VALUE_1<VALUE_2):healsp(Self,-7):IF(VALUE_1>VALUE_2):healsp(Self,7)/`
- `/healsp(Self,-7)/`
- `/IF(VALUE_1<VALUE_2):VALUE_1:math(VALUE_1+10)/`
- `/setdata(Self,2,10)/VALUE_0:getdata(Self,2)/buff(Self,Enhancement,VALUE_0,0,0)/`

### **Invalid Batch Example**
- `/TIMING:WinDuel:healsp(Self,-7)/`  
- `/VALUE_1:55:LOOP:EveryAlly/`
- `/LOOP:EveryAlly:TIMING:WinDuel/`
  *(MAIN functions need to be alone in their own batches)*

### **Execution Order**
- Batches are executed in the order they appear.

---
## **Main Functions**

### **TIMING Function**
Sets the timing for effect activation. Only the **last timing** in the list will apply if multiple timings are defined.

#### **Example**
```markdown
/TIMING:WinDuel/
```

### **LUA Function**
Allows a .lua file to be loaded from the `modular_lua` folder. Note: Two .lua file names should not be named the same, otherwise it will cause this function to break.

## **LUAMAIN Function**
Specifies which .lua function that Modular should call. This allows the same .lua script to be used for multiple timing's. For example: `"Modular/TIMING:RoundStart/LUA:passiveRoundStart/LUAMAIN:test_main"` would call `test_main()` in `passiveRoundStart.lua`. If you wish to pass parameters, do it like so: `"LUAMAIN:myfunction(5,true,hello)"`. These values will turn into .lua values, going in the order in which they are passed. (`"5"` becomes `5`, `"true"` becomes `true`, and `"hello"` stays as `"hello"`)

###  **LOOP Function**
This is performance intensive. Only use it if absolutely necessary.
LOOP iterates the script over a list of units, overriding the `Target` argument as the current iteration's target. See [Multi-Target](https://rentry.co/glitchscript#target-arguments) for all possible arguments.

When using the LOOP function in a .lua file, instead of using `Target`, use `MainTarget`, as `Target` is an inline modular feature, however, `MainTarget` does basically the same thing, and is compatible with both .lua and inline modular scripts.

#### **Example**
```markdown
/LOOP:AllyExceptSelf99/
```

### **RESETWHENUSE Function**
Used for passives, on odd timings like WinDuel or BeforeAttack. Resets the scale, final, base, clash, dmg, and dmgmult adders for that particular Modular Script when a skill is used. Prevents such power increases from sticking around when using more than 1 Skill per turn.

#### **Example**
```markdown
Modular/TIMING:BeforeAttack/RESETWHENUSE/scale(1)
```
### **CLEARVALUES Function**
 Sets all VALUEs to 0 every time the script is enacted. (Note: By Default, VALUES arent cleared when the script is activated twice, while that doesn't cause too many issues usually since they'd typically get overwritten by next declaration of the value, this can be useful in some situations)

```markdown
Modular/TIMING:WhenUse/CLEARVALUES/VALUE_0:getsp(Self)/healhp(VALUE_0)
```

---
### **DAMAGE_SOURCE_TYPE**
- COMBAT
- BUFF
- PASSIVE
- SKILL
- EVENT
- EGO_GIFT
- STAGE
- SYSTEM
- SYSTEM_ABILITY
- FORCED
- NONE

---

### **Skill Timings**
| Timing | Corresponding Locale | Notes |
|---------|-------------------------|---------|
| `RoundStart`      | [Turn Start] | Runs if the skill is in the bottom 2 slots of the dashboard
| `StartBattle`        | [Combat Start]
| `EndBattle`         | [Turn End]
| `WhenUse`         | [On Use]
| `BeforeAttack`    | [Before Attack]
| `BeforeUse`        | [Before Use]
| `DuelClash`         | Clash Count | Triggers On Each Individual Clash in a Duel (Clash)
| `DuelClashAfter` | Clash Count | Triggers On Each Individual Clash in a Duel (Clash) (Difference between this and `DuelClash` are unknown)
| `StartDuel`          | [Clash Start]
| `WinDuel`           | [Clash Win]
| `DefeatDuel`       | [Clash Lose] 
| `WinParrying`     | Coin Clash Win | Triggers on each "Coin clash win" in a Duel (Clash)/When this skill breaks a coin in a clash
| `DefeatParrying` | Coin Clash Lose | Triggers on each "Coin clash lose" in a Duel (Clash)/When this skill gets one of it's coins broken in a clash
| `EndSkill`             | [After Attack] | 
| `OnSucceedAttack(var_1,var_2)` | No Conditions: [On Hit], Crit Condition: [On Crit], NoCrit Condition: Only if not a critical hit
| `BeforeSA(var_1,var_2)` | Not In Vanilla | Triggers right before the hit connects
| `OnSucceedEvade` | [On Evade]
| `OnDefeatEvade` | [Failed Evade]
| `OnDiscard` | "if this Skill is Discarded" at the end of the line
| `BeforeBehaviour` | [Before Use]
| `StartBehaviour` | [On Use] | %transparent% OnStartBehaviour %%
| `EndBehaviour` | [After Attack] | %transparent% OnEndBehaviour %%
| `EnemyKill` | [On Kill]
| `OnVisualUse` | Not In Vanilla | Triggers on the visual start of a Skill being used. (Used mainly for the sound consequence, with things like VFX, and dialogue lines) %transparent% StartVisualSkillUse %%
| `OnVisualCoinToss` | Not In Vanilla | Triggers on the visual start of a Coin being tossed. (Mainly used for the sound consequence, with things like voice lines) %transparent% StartVisualCoinToss %%
| `OnCoinToss` | When a coin starts its attack | Activates each time a coin is tossed for an attack.
| `OnCoinAfterAttack` | When a coin ends its attack | Activates when a coin finishes its attack, similar to how bleed works.
| `FakePower` | Prediction Phase | (Used for prediction, only for base(), final(), and clash(). Don't use any other consequences)
| `SpecialAction` | Most Complete Certainly NOT In Vanilla | Unique Timing triggered when you ctrl+LMB the portrait of the Unit on the dashboard, for Skills the Skill with the script MUST be slotted in actively. 

### **Coin Timings**
- `OnSucceedAttack(var_1,var_2)`
- **Arguments:**
  - `var_1`: `Head`| `Tail` |`None` (Only on heads, only on tails, or no condition.)
  - `var_2`: `Crit` | `None` | `NoCrit`   (Only on crit, or only when not a crit)

- `note`: Can be Shortened to `OSA`

- `BeforeSA(var_1, var_2)`
- **Arguments:**
  - `var_1`: `Head` | `None` | `Tail`   (Heads/Tails trigger)
  - `var_2`: `Crit` | `None` | `NoCrit`   (Only on crit, or only when not a crit)

- `note`: Can be Shortened to `BSA`

- `OnCoinToss`
- `OnCoinAfterAttack`

- `ChangeMotion`


### **Passive Timings**
| Timing | Corresponding Locale | Notes |
|---------|-------------------------|---------|
| `RoundStart`      | [Turn Start]
| `EncounterStart`      | [Encounter Start]
| `AfterSlots`      | [Turn Start] | A special RoundStart timing that triggers after Slots are formed. Used for skillslotreplace()
| `StartBattle`        | [Combat Start]
| `EndBattle`         | [Turn End]
| `WhenUse`         | [On Use]
| `BeforeAttack`    | [Before Attack]
| `DuelClash`         | Clash Count | Triggers On Each Individual Clash in a Duel (Clash)
| `StartDuel`          | [Clash Start]
| `WinDuel`           | [Clash Win]
| `DefeatDuel`       | [Clash Lose]
| `WinParrying`     | Coin Clash Win | Triggers on each "Coin clash win" in a Duel (Clash)/When this skill breaks a coin in a clash
| `DefeatParrying` | Coin Clash Lose | Triggers on each "Coin clash lose" in a Duel (Clash)/When this skill gets one of it's coins broken in a clash 
| `OnRetreat`       | On Retreat 
| `EndSkill`             | [After Attack] | 
| `OnSucceedAttack(var_1,var_2)` | No Conditions: [On Hit], Crit Condition: [On Crit], NoCrit Condition: Only if not a critical hit
| `BeforeSA(var_1,var_2)` | Not In Vanilla | Triggers right before the hit connects
| `OnDiscard` | "if this Skill is Discarded" at the end of the line
| `StartBehaviour` | [On Use] |  | %transparent% OnStartBehaviour %%
| `EndBehaviour` | [After Attack] | %transparent% OnEndBehaviour %%
| `EnemyKill` | [On Kill]
| `FakePower` | Prediction Phase | (Used for prediction, only for base(), final(), and clash(). Don't use any other consequences)
| `WhenHit(var_1, var_2)` | [Before Getting Hit] | ('Target' becomes the unit BEING HIT, 'Self' becomes the unit who USED THE ATTACK)
| `BeforeWhenHit(var_1, var_2	)` | [Before Getting Hit] | ('Target' becomes the unit BEING HIT, 'Self' becomes the unit who USED THE ATTACK)
| `BeforeDefense` | Not In Vanilla | Triggers before a defense skill is used
| `OnDie` | Not In Vanilla | Triggers when This Unit dies. ("Target" becomes the dead unit unless LOOP is involved)
| `OnOtherDie` | Not In Vanilla | Triggers when another Unit dies. ("Target" becomes the dead unit unless LOOP is involved)
| `OnBreak` | Not In Vanilla | Triggers when This Unit gets staggered. ("Target" becomes the dead unit unless LOOP is involved)
| `OnOtherBreak` | Not In Vanilla | Triggers when another Unit gets staggered. ("Target" becomes the dead unit unless LOOP is involved)
| `EnemyBeforeAttack` | Not In Vanilla | Triggers when the enemy's skill used on you starts its attack. Target is victim.
| `EnemyEndSkill` | Not In Vanilla | Triggers when the enemy's skill used on you Ends. Target is victim.
| `OnImmortal` | Not In Vanilla | They trigger when the unit gets dropped to 0 HP. DURING THAT SCRIPT, if you use setimmortal(1), the unit about to be killed will remain alive and its HP will be set to 1. %transparent% Immortal %%
| `OnOtherImmortal` | Not In Vanilla | They trigger when the unit gets dropped to 0 HP. DURING THAT SCRIPT, if you use setimmortal(1), the unit about to be killed will remain alive and its HP will be set to 1. Target is the victim.  %transparent% ImmortalOther %%
| `OnCoinToss` | When a coin starts its attack | Activates each time a coin is tossed for an attack.
| `OnCoinAfterAttack` | When a coin ends its attack | Activates when a coin finishes its attack, similar to how bleed works.
| `StartBattleSkill`/can be shortened to `SBS` | Combat start, activates once for every skill chained | activates on combat start multiple times, the amount of times being dictated by the amount of chained skills, example: `Modular/TIMING:SBS/VALUE_0:getskilldeftype/IF(OR,VALUE_0=1,VALUE_0=2,VALUE_0=3):buff(Self,Protection,1,0,0)` = For every Guard, Evade, or Counter chained, gain 1 prot
| `SpecialAction` | Most Complete Certainly NOT In Vanilla | Unique Timing triggered when you ctrl+LMB the portrait of the Unit on the dashboard
| `IgnorePanic` | On Panic | Mainly used with ignorepanic consequence
| `IgnoreBreak` | On Stagger | Mainly used with ignorebreak consequence
| `OnGainBuff` | Not In Vanilla | Triggered when a unit gains a buff
| `ChangeTakeDamage` | Triggers whenever this unit takes damage from any source. During this script, if you use the consequences setdmgtaken, you can change how much damage you take. 

`OnGainBuff(opt_1)`
- **Arguments:**
	- `opt_1`: Any Buff Keyword | E.X: `OnGainBuff(Laceration)` -> Only triggers when the unit gains Bleed

`SpecialAction(opt_1)`
- **Arguments:**
	- `opt_1`: Any Unity Keycode (The key to be held that will trigger Special Action)

Keycodes correspond to keys on the keyboard
If left blank, defaults to CTRL
A list of Keycodes can be found [here](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/KeyCode.html)

 `WhenHit(var_1, var_2)`
- **Arguments:**
  - `var_1`: `Head` | `None` | `Tail`   (Heads/Tails trigger)
  - `var_2`: `Crit` | `None` | `NoCrit`   (Only on crit, or only when not a crit)
- `note`: Can be Shortened to `WH`

- `BeforeWhenHit(var_1, var_2)`
- **Arguments:**
  - `var_1`: `Head` | `None` | `Tail`   (Heads/Tails trigger)
  - `var_2`: `Crit` | `None` | `NoCrit`   (Only on crit, or only when not a crit)

- `note`: Can be Shortened to `BWH`

## **E.G.O. Passive Support**
*Do note that all passive timings work on E.G.O. Passives as well*

## **Support Passive Support**
Support Passives act out like regular passives except every unit alive has said passive, its sort of like LOOP: but instead of `target` as the unit the loop is going through its `self` (which matches the idea its a normal passive that every unit has)
Some timings like `OnOtherDie` have some odd semantics where `self` is the killer and `target` is the dead guy

#### Reliable
`RoundStart`, `AfterSlots`, `StartBattle`, `EndBattle`,  
`WhenUse`, `BeforeAttack`, `StartDuel`, `WinDuel`,  
`DefeatDuel`, `EndSkill`, `OnDiscard`,  
`StartBehaviour`, `EndBehaviour`

#### Unreliable
`BeforeDefense`, `OnDie`, `OnOtherDie`, `OnBreak`,  
`OnOtherBreak`, `OnImmortal`, `OnOtherImmortal`,  
`DuelClash`, `OnSucceedAttack`, `BeforeSA`,  
`WhenHit`, `BeforeWhenHit`, `EnemyKill`,  
`EnemyEndSkill`, `OnCoinToss`, `FakePower`,  
`StartBattleSkill`

#### Not Supported
`SpecialAction`
---

## **Value Assignment**
You can set any `VALUE` (from `VALUE_0` to `VALUE_9`) to any integer. Values beyond `VALUE_9` are not allowed.

### **Examples**
- `/VALUE_0:5/` → `VALUE_0 = 5`
- `/VALUE_1:-5/` → `VALUE_1 = -5`
- `/VALUE_2:getsp(Self)/` → Result depends on SP value
- `/VALUE_3:math(VALUE_0*VALUE_0)/` → `VALUE_3 = 25` (`5*5`)

### **Math Symbols (Integers Only)**
| Symbol | Operation                          | Example             |
|--------|------------------------------------|---------------------|
| `+`    | Add                                | `VALUE_0 + VALUE_1` |
| `-`    | Subtract                           | `VALUE_0 - VALUE_1` |
| `*`    | Multiply                           | `VALUE_0 * VALUE_1` |
| `%`    | Divide                             | `VALUE_0 % VALUE_1` |
| `!`    | Min value between two numbers  | `15!10 → 10`        |
| `¡`    | Max value between two numbers  | `1¡3 → 3`           |
| `?`    | Modulo  | `VALUE_0 ? VALUE_1`           |

In-Consequence Math:
Prefixing a consequence's integer input with `m` turns it into a math equation. `-` turns the input negative.
`VALUE_0:15/healhp(Self,10)` → Heal 10 HP
`VALUE_0:15/healhp(Self,-10)` → Lose 10 HP
`VALUE_0:15/healhp(Self,VALUE_0)` → Heal 15 HP
`VALUE_0:15/healhp(Self,-VALUE_0)` → Lose 15 HP
`VALUE_0:15/healhp(Self,VALUE_0*2)` → Invalid
`VALUE_0:15/healhp(Self,mVALUE_0*2)` → Heal 30 HP
`VALUE_0:15/healhp(Self,m-VALUE_0*2)` → Invalid math
`VALUE_0:15/healhp(Self,-mVALUE_0*2)` → Lose 30 HP

---

## **Target Arguments**
- **Single-Target**
  - `Self`
  - `SelfCore` (If the target is an abnormality PART, get the core instead)
  - `Target`  (Functionally the same as MainTarget unless you're using LOOP)
  - `TargetCore`  (If the target is an abnormality PART, get the core instead)
  - `MainTarget`
  - `Victim` (Used for OnDie, OnOtherDie, and EnemyKill TIMINGs)
  - `Killer` (Used for OnDie, OnOtherDie, and EnemyKill TIMINGs)
  - `id#####`  (Fill ##### with a unit ID or a VALUE_X)
  - `inst#####`  (Fill ##### with a unique instance ID or a VALUE_X)
  - `adjLeft` (Adjacent unit to the left)
  - `adjRight` (Adjacent unit to the right)

- **Multi-Target**
  - `Self`
  - `SelfCore` (If the target is an abnormality PART, get the core instead)
  - `SelfParts` (Only works if the user is an abnormality, applies to all of the users abnormality parts)
  - `Target`  (Functionally the same as MainTarget unless you're using LOOP)
  - `TargetCore`  (If the target is an abnormality PART, get the core instead)
  - `TargetParts` (Only works if the target is an abnormality, applies to all of the target's abnormality parts)
  - `MainTarget`
  - `EveryTarget`
  - `SubTarget`
  - `Victim` (Used for OnDie, OnOtherDie, and EnemyKill TIMINGs)
  - `Killer` (Used for OnDie, OnOtherDie, and EnemyKill TIMINGs)
  - `id#####`  (Fill ##### with a unit ID or a VALUE_X)
  - `inst#####`  (Fill ##### with a unique instance ID or a VALUE_X)
  - `adjLeft` (Adjacent unit to the left)
  - `adjRight` (Adjacent unit to the right)
  - `All` (Every fielded unit)

#### Custom Targeting:
  - Starter Sorting Tag (Mutually exclusive, must go first)
    - Slowest
    - Fastest
    - HighestHPRatio
    - LowestHPRatio
    - HighestHP
    - LowestHP
    - HighestMaxHP
    - LowestMaxHP
    - HighestSP %transparent% HighestMP %%
    - LowestSP %transparent% LowestMP %%
  - Sorting Tag (Mutually exclusive)
	- Random
	- Deploy
	- Reversedeploy
  - Special Tags (Mutually exclusive)
    - Deads (Picks all dead units)
    - Retreats (Picks all retreated, alive units (Not including un-initialized backup))
  - Team Tags (Mutually exclusive)
    - Ally (Removes all enemies from list)
    - Enemy (Removes all allies from list)
  - Exclusion Tags (Mutually exclusive)
    - AbnoOnly
    - NoAbnos
  - Exclusion Tags (Mutually exclusive)
	- NoCores
	- NoParts
  - Inclusion Tags
	- Assist (Includes Assistants to the list, otherwise excluded)
  - Exclusion Tags (Can be stacked)
    - ExceptSelf (Removes Self from list)
    - ExceptTarget (Removes Target from list, if it exists)
  - Amount Tag (Multi-Target only)
    - Any number from 1 to 999 (VALUE_X can be used)
  - Ending getbuff Tag (Must be at the end, only ONE can be used)
	- $Keyword (example: $Enhancement)

---

## **Value Acquisition Functions**
Retrieve specific values for calculations. These functions return integers.

### **gethp(var_1, var_2)** %transparent% hpcheck %%
Gets HP value based on the arguments.
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: `normal` | `%` | `max`
    - `normal`: Remaining HP
    - `%`: Percentage of remaining HP (rounded down, e.g., 349/350 = 99)
    - `max`: Max HP value
    - `missing`: Missing HP value
    - `missing%`: Missing HP percentage

### **getdefaultmaxhp(var_1)**
Gets Default Value for Max HP (Why didn't we just put it as an argument on gethp? I'm gonna kms).
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)

### **gethpincrement(var_1)**
Gets the amount of HP gained per Level (Returned 1 = 0.01).
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)

### **getsp(var_1)** %transparent% mpcheck %%
Gets SP value based on the argument.
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)

### **getbuff(var_1, var_2, var_3)** %transparent% bufcheck %%
Returns an integer based on the buff mode.
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: Buff keyword (e.g., `Enhancement`, `Agility`)
  - `var_3`: `stack` | `turn` | `+` | `*` | `consumed`
    - `stack`: Potency (0 if no buff)
    - `turn`: Count (0 if no buff)
    - `+`: Potency + Count
    - `*`: Potency * Count
	- `consumed`: Amount of the buff consumed throughout the encounter (0 if the buff doesn't track the amount consumed/isn't consumable)

### **getdmg**
Returns the damage. Only usable with OnSucceedAttack, ChangeTakeDamage and WhenHit

### **getround** %transparent% round %%
Returns the round.

### **getwave** %transparent% wave %%
Returns the wave.

### **getactivations** %transparent% activations %%
Returns the amount of times this script has been triggered before. First time = 0.

### **getunitstate(var_1)** %transparent% unitstate %%
Returns:
`-1` if the unit doesn't exist
`0` if the unit is dead
`1` if the unit is alive
`2` if the unit is staggered
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)

### **isactionable(var_1)**
Returns:
`-1` if the unit doesn't exist
`0` if the unit is unable to act.
`1` if the unit can act.
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)

### **getid(var_1)**
Returns the unitID of the target.
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)

### **getcharacterid(var_1)**
Returns the characterID of the target (Sinners only)
- **Arguments:**
	- `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)

### **getinstid(var_1)** %transparent% instid %%
Returns the unique instance ID of the target.
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)

### **getspeed(var_1,opt_2)** %transparent% speedcheck %%
Returns the speed of the target.
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)
  - `opt_2`: `VALUE_#` | any integer    (checks a specific slot index's speed)

### **getpattern(var_1)**
Returns the pattern index (integer) of the target.
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)

### **getdata(var_1,var_2)**
Gets encounter-persistent data from the target.
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments) (Can also be "Encounter" for global stage data)
  - `var_2`: `VALUE_#` | any integer   [(The Data ID)](https://rentry.co/glitchscript#setdatavar_1var_2var_3)

### **getdeadallies(var_1)** %transparent% deadallies %%
Gets number of target's dead allies.
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)

### **random(var_1,var_2)**
Returns a random integer between min and max
- **Arguments:**
  - `var_1`: `VALUE_#` | any integer   (Minimum value inclusive)
  - `var_2`: `VALUE_#` | any integer   (Maximum value inclusive)

### **getshield(var_1)**
Returns the amount of shield on target.
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)

### **areallies(var_1,var_2)** %transparent% areallied %%
Returns 1 if both units are allied. Returns 0 if they are enemies.
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)

### **getskillid(opt_1)** / **getopposkillid**
Returns the ID of the skill being used. Does not work on TIMINGs that have no Skills being used.
`getopposkillid` Gets the opponent's Skill ID in a Clash. Returns -1 if non-existent.
- **Arguments:**
  - `opt_1`: `replaced` (If used with a Defense Skill: Provides the Skill ID of the covered Skill)

### **haspassive(var_1,var_2)**
Checks if the unit has the passive id. Returns 1 if they do, returns 0 if they don't.
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: Passive ID

### **getcurrentpower(var_1)**
Gets the resulting power of the skill. Please verify if this works correctly and report it (you can use `log()`).
- **Arguments:**
  - `var_1`: `Self` | `Target`  ("Target" is only available when there is a clash)

### **getcoincount(var_1,var_2)**
Gets the coin count of the skill. Returns -1 if var_1 not found.
- **Arguments:**
  - `var_1`: `Self` | `Target`  ("Target" is only available when there is a clash)
  - `var_2`: `cur` | `og`   (Current coin count and Original coin count respectively)

### **getallcoinstates(var_1,var_2)** %transparent% allcoinstate %%
Returns the state of the coins. Returns -1 if var_1 not found.
- **Arguments:**
  - `var_1`: `Self` | `Target`  ("Target" is only available when there is a clash)
  - `var_2`: `full` | `headcount` | `tailcount` (Selecting "full" will return 0 if mixed, 1 if all Heads, 2 if all Tails)

### **getresonance(var_1)** %transparent% resonance %%
Returns the resonance of the given type
- **Arguments:**
  - `var_1`: 
		- `highres`  (Returns the highest resonance of any type)
		- `highperfect`   (Returns the highest absolute resonance of any type)
		- `?????` | `perfect?????`    (Specifies highest type of resonance. If prefixed with "perfect", only returns the highest absolute resonance of that type)
Examples:
`/VALUE_0:getresonance(perfectAZURE)`, `/VALUE_0:getresonance(INDIGO)`, `/VALUE_0:getresonance(highperfect)`

### **getresource(var_1,opt_2)** %transparent% resource %%
Returns the amount of sin resources.
  - `var_1`: `CRIMSON` | `SCARLET` | `AMBER` | `SHAMROCK` | `AZURE` | `INDIGO` | `VIOLET`
  - `opt_2`: `Enemy` (Add this optional argument to affect the enemy team)

### **haskey(var_1, var_2, var_3~X)**
Returns 1 if the selected unit has the keyword, 0 if not
- **Arguments:**
	- `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	- `var_2`: AND | OR (AND means it needs to have every keyword added to return 1, OR means it needs just one keyword to return 1)
	- `var_3~X`: Any string that could be a unitKeyword or association in the json data of a unit. More than 1 can be added, separated by commas.

### **getskillbase(var_1)** %transparent% skillbase %%
Returns skill base power.
- **Arguments:**
  - `var_1`: `Self` | `Target`

### **getskillatkweight(var_1)** %transparent% skillatkweight %%
Returns attack weight. 
- **Arguments:**
  - `var_1`: `Self` | `Target`

### **getcoinscale(var_1,var_2)** %transparent% onescale %%
Returns one coin's Coin Power.
- **Arguments:**
  - `var_1`: `Self` | `Target`
  - `var_2`: `VALUE_#` | any integer (Coin Index, starts at 0. If the index is out of range, checks the last coin instead.)

### **getskillatklevel(var_1,var_2)** %transparent% skillatklevel %%
Returns skill's offense level.
- **Arguments:**
  - `var_1`: `Self` | `Target`
  - `var_2`: `VALUE_#` | any integer (Coin Index, starts at 0. If the index is out of range, checks the last coin instead.)

### **getskilllevel(var_1)**
Returns the unit's offense level + skill offense level
- **Arguments:**
	- `var_1` `Self` | `Target`

### **getskillatk(var_1)** %transparent% skillatk %%
Returns skill atk type, 0 = Slash, 1 = Pierce, 2 = Blunt, 3 = None
- **Arguments:**
  - `var_1`: `Self` | `Target`

### **getskillattribute(var_1)** %transparent% skillattribute %%
Returns skill sin, Wrath = 0, Lust = 1, Sloth = 2, Gluttony =3, Gloom = 4, Pride = 5, Envy = 6, White = 7, Black = 8, Red = 9, Pale = 10, Neutral = 11.
- **Arguments:**
  - `var_1`: `Self` | `Target` | `replaced` (replaced: If used with a Defense Skill: Provides the Skill ID of the covered Skill)

### **getskilldeftype(var_1)** %transparent% skilldeftype %%
Returns Defense Type, None = 0, Guard = 1, Evade = 2, Counter = 3, Attack = 4, Non_Action = 5. (Non_action is only used once and by the panic skill)
- **Arguments:**
  - `var_1`: `Self` | `Target`

### **getskillrank(var_1)** %transparent% skillrank %%
Returns the tier of the target's skill
- **Arguments:**
  - `var_1`: `Self` | `Target` | `replaced` (replaced: If used with a Defense Skill: Provides the Skill ID of the covered Skill)


### **getskillegotype(var_1)** %transparent% skillegotype %%
Returns Ego Type, Skill = 0, Awaken = 1, Corrosion = 2, Corrosion Unstable = 3, Corrosion Stable = 4, Upgrade = 5, 6 = None.
- **Arguments:**
  - `var_1`: `Self` | `Target`

### **getattackamount(var_1)** %transparent% amountattacks %%
returns how many skills are attacking the specified unit
- **Arguments:**
- `var_1`; See [Single-Target](https://rentry.co/glitchscript#target-arguments)

###  **iscoinbroken()** %transparent% coinisbroken %%
if the coin this script is on is broken return 1, otherwise return 0

### **getskillslotcount(var_1,opt_2)** %transparent% skillslotcount %%
Returns the number of slots of the target
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)
  - `opt_2`: `perm` (can be optionally added to count permanent skill slots only)

### **isfocused()**
Returns 1 if the battle is a Focused Encounter, 0 if it is a Regular Encounter

### **getdmgtaken(var_1,var_2)**
Returns the amount of damage taken by the target
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2 option`: `prev` (Returns the amount of damage taken last turn)
  - `var_2 option`: `current` (Returns the amount of damage taken this turn)

### **getbuffcount(var_1,var_2)**
Returns the amount of buffs on the target (e.g if the target has Bleed and Rupture on them, return), specify either negative or positive.
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2 option`: `neg` (Returns the amount of positive buffs on self)
  - `var_2 option`: `pos` (Returns the amount of negative buffs on self)

### **getunitcount(var_1)** %transparent% unitcount %%
Returns the amount of units based off Target, (Example: getunitcount(NoParts99) would return the amount of enemies alive.)
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)

### **getbreakcount(var_1)** %transparent% breakcount %%
Returns the amount of stagger bars on the target
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)

### **getbreakvalue(var_1)** %transparent% breakvalue %%
Returns the point of the target's stagger bar
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: Stagger index (eg: 0 = first stagger bar)

### **gettime(var_1,opt_2)** %transparent% gettime %%
~~IM GOING TO KILL MYSELF WHY DOES THIS EXIST~~
Returns the time according to the parameter.
- **Arguments:**
  - `var_1 option`: `dayofweek` (Returns 0-6, starting from sunday at 0 and saturday at 6, depending on what day of the week it is)
  - `var_1 option`: `dayofmonth` (Returns 1-31, depending on what day of the month it is)
  - `var_1 option`: `dayofyear` (Returns 1-366, depending on what day of the year it is)
  - `var_1 option`: `hours` (Returns 0-23, depending on what hour of the day it is)
  - `var_1 option`: `minutes` (Returns 0-59, depending on what minute of the hour it is)
  - `var_1 option`: `seconds` (Return 0-59, depending on what second of the minute it is)
  - `var_1 option`: `milliseconds` (Returns 0-999, depending on what millisecond of the second it is, if you use this unironically i hope you die.)
  - `var_1 option`: `ticks` (Returns ??-??, what the fuck is a limbus company tick why would you ever use this just why please god answer my pleas)
  - `var_1 option`: `month` (Returns 1-12, depending on what month of the year it is)
  - `var_1 option`: `year` (Returns 1-9999, depending on what year it is right now)
  - `var_1 option`: `isleapyear` (If the year inputted via `opt_2` is a leap year, returns 1, otherwise returns 0)
  - `opt_2`: `VALUE_X` | any integer (the year, needed for isleapyear)

### **getstat(var_1,var_2)**
Returns certain stats of the specified unit based on the parameters
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2 option`: `deployment` (Returns the deployment order of the selected unit)
  - `var_2 option`: `deadAllyCount` (Returns the number of dead allies this unit has)
  - `var_2 option`: `res????` (Returns the resistance of the unit in the hundreds example if the unit had 1.5x on a resistance it would return 150, input the name of the atk or sin resistances. EG: resSLASH, resCRIMSON)
  - `var_2 option`: `panicType` (Returns the panic type id of the selected unit)
  - `var_2 option`: `isRetreated` (returns 1 if the unit is retreated)
  - `var_2 option`: `speedMin` | `speedMax` | `speedMinOG` | `speedMaxOG` (Checks speed ranges, both current and original)
  - `var_2 option`: `hasMp` (Returns 1 if the unit has SP. returns 0 if not)
  - `var_2 option`: `deflevel` (Returns Defense Level of the unit)

### **iscoinrerolled** %transparent% coinrerolled %%
Returns 1 if a coin has been rerolled; otherwise, returns 0

### **stageextraslot(var_1,opt_2)**
Gets the [stage extra slot](https://rentry.co/glitchscript#stagescript-only)

### **getbloodfeast(var_1)**
Returns bloodfeast based on the variable given
- **Arguments:**
  - `var_1 option`: `available` (Returns currently available bloodfeast)
  - `var_1 option`: `spent` (Returns shared consumed bloodfeast)

### **getlevel(var_1)**
Returns the unit's level
- **Arguments:**
	- `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)

### **isunbreakable(var_1)**
Returns if a Coin is unbreakable (Only usable with timing's that use Coins)
- **Arguments:**
	- `var_1`: Self | Target (1 if unbreakable, 0 if not)

### **isusableinduel(var_1)**
Returns if a Coin is usable in a duel (Only usable with timing's that use Coins)
- **Arguments:**
	- `var_1`: Self | Target (1 if uncracked, 0 if cracked)

### **issameunit(var_1, var_2)** %transparent% sameunit %%
Returns 1 if the 2 inputs result in the same unit, otherwise returns 0
- **Arguments:**
	- `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	- `var_2`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)


### **isbackupenabled(var_1)**
Returns 0 if null or backup disabled. Returns 1 if enabled.
- **Arguments:**
	- `var_1`: Ally | Enemy

### **countbackup(var_1, var_2)**
Counts the amount of un-initialized Backup units in a team.
- **Arguments:**
	- `var_1`: Ally | Enemy
	- `var_2`: normal | current (Just use "normal", it'll work fine. We don't know what "current" does.)

### **issameunit(var_1, var_2)** %transparent% sameunit %%
Returns 1 if the 2 inputs result in the same unit, otherwise returns 0
- **Arguments:**
	- `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	- `var_2`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)

### **getskillcanduel(var_1)**  %transparent% skillcanduel %%
Returns `1` if the Skill can Duel, `0` if not.
- **Arguments:**
	- `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)

### **getskillteamkill(var_1)** %transparent% skillteamkill %%
Returns `1` if the Skill can kill allies, `0` if not.
- **Arguments:**
	- `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)

### **getskillfixedtarget(var_1)** %transparent% skillfixedtarget %%
Returns `1` if the Skill has a fixed target, `0` if not.
- **Arguments:**
	- `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)

### **gethpdmg**
Returns the amount of damage that this unit has taken

### **getcoinoperator(var_1,var_2)** %transparent% coinoperator %%
Returns an integer to represent the Coin's operator.
`1` is `ADD`
`2` is `SUB`
`3` is `MUL` 
- **Arguments:**
	- `var_1`: Self | Target
	- `var_2`: Coin Index | 0 is the first Coin

### **getbufftype(var_1)** %transparent% bufftype %%
Returns an integer to represent the Buff's type.
`0` is `Neutral`
`1` is `Positive`
`2` is `Negative` 
- **Arguments:**
	- `var_1`: Keyword | (E.X: Combustion, Protection)

### **getatkres(var_1,var_2)**
Returns an integer that represents the resistance value. (Does not work on Abnormalities.)
x0.75 -> 75
- **Arguments:**
	- `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	- `var_2` Atk Type: `SLASH` | `PENETRATE `| `HIT`

### **getatkres(var_1,var_2)**
Returns an integer that represents the resistance value. (Does not work on Abnormalities.)
x0.01 -> 1
- **Arguments:**
	- `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	- `var_2`: Sin Affinity: `CRIMSON` | `SCARLET` | `AMBER` | `SHAMROCK` | `AZURE` | `INDIGO` | `VIOLET`

### **diduseskilllastturn(var_1)**
Returns:
`-1` if the unit doesn't exist
`0` if no skills were used last turn.
`1` if the unit used at least one skill last turn.
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)

### **hasuseddefense(var_1)** %transparent% useddefaction %%
Returns `1` if the unit used a defense action this turn, otherwise, returns `0`
- **Arguments:**
	- `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)

### **getunitfaction(var_1)** %transparent% unitfaction %%
Returns an integer representing the unit's faction. 
Returns `1` for the Sinners/Assistants
Returns `0` for any enemy
- **Arguments:**
	- `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)

### **getchainstatus(var_1)** %transparent% chainstatus %%
Returns an integer representing the status of the chain of Skills on the Dashboard.
Returns `0` if Skills cannot be found
Returns `1` if only attack and counter Skills are chained
Returns `2` if only guard and evade Skills are chained
Returns `3` if any mix of attack and defence Skills are chained
- **Arguments:**
	- `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)

### **getsinsindashboard(var_1, var_2, opt_3)**
Returns an integer representing the amount of sins in the Dashboard
- **Arguments:**
	- `var_1 option`: Sin Affinity: `CRIMSON` | `SCARLET` | `AMBER` | `SHAMROCK` | `AZURE` | `INDIGO` | `VIOLET`
		(If you put in a sin, it returns how much of it there is in the dashboard)
	- `var_1 option`:  `HIGHEST` | `LOWEST` 
		(If you put in `HIGHEST`, it returns the sin with the most of it in dashboard, if you put in `LOWEST`, it returns the sin with the least of it in the dashboard, starting with wrath at 0, similar to [getskillattribute](https://rentry.co/glitchscript#getskillattributevar_1))
	- `var_2`: Dashboard Layer to count from: `TOP` | `BOTTOM` | `BOTH` | `NEITHER`
	- `opt_3`: Include Prediction Layer? `1` | `0` (off by default)

	`note`: If using `HIGHEST/LOWEST` and there are 2 or more sins that are tied, it will always pick the sin with the lower enum value (wrath takes priority because its "0" and so on)
---

## **OnGainBuff exclusive acquirers**

### **gbsource**
Returns an integer representing the source of the buff
Returns `0` for no source
Returns `1` for a Skill
Returns `2` for an event
Returns `3` for a buff
Returns `4` for a passive
Returns `5` for a system ability
Returns `6` for an E.G.O gift
Returns `7` for a pattern
Returns `8` for a stage
Returns `9` for a unit

### **gbstack**
Returns an integer representing the amount of the buff gained

### **gbturn**
Returns an integer representing the amount of the Count gained

### **gbactiveround**
Returns an integer representing the `ActiveRound` of the buff

---

## **ChangeTakeDamage exclusive acquirers**

### **ctdsource**
Returns an integer representing the source of the damage
Returns `0` for combat
Returns `1` for a buff
Returns `2` for a passive
Returns `3` for a skill
Returns `4` for an event
Returns `5` for an E.G.O. gift
Returns `6` for a stage
Returns `7` for system
Returns `8` for a system ability
Returns `9` for forced
Returns `10` for none

---

## **Consequence Functions**
These functions define the effects that occur based on conditions or values.

### **log(var_1, var_2)**
Prints a line in the Bepinex Log with the provided VALUE
- **Arguments:**
  - `var_1`: Any string (spaces will be automatically deleted; try not to use special characters)
  - `opt_1`: `VALUE_#` | any integer

### **bonusdmg(var_1, var_2, var_3, var_4)**
Deals bonus damage.  
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: `VALUE_#` | any integer
  - `var_3`: `-1` (true damage) | `0` (slash) | `1` (pierce) | `2` (blunt)
  - `var_4`: `-1` (true damage) | `0~6` (sin types)

`note: here's a list of the numbers corresponding to every sin type`:
 - Wrath: 0
 - Lust: 1
 - Sloth: 2
 - Gluttony: 3
 - Gloom: 4
 - Pride: 5
 - Envy: 6
 - White: 7
 - Black: 8

### **bonusdmgbybuff(var_1, var_2, var_3, var_4)**
Deals bonus damage through buffs.
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: `VALUE_#` | any integer
  - `var_3`: `-1` (true damage) | `0` (slash) | `1` (pierce) | `2` (blunt)
  - `var_4`: `-1` (true damage) | `0~6` (sin types)
  - `var_5`: Determines the mode. Variables may change depending on the mode chosen.
- Mode: `Magic` (No specific source, may have some uses)
  - `var_6`: See [Single-Target](https://rentry.co/glitchscript#target-arguments) (ATTACKER UNIT, can be "Null")
  - `var_7`: [DAMAGE_SOURCE_TYPE](https://rentry.co/glitchscript#damage_source_type) (If Attacker is Null and Source is SKILL, the victims will not become staggered by damage.)
  - `var_8`: `NullAction` | `UseAction` (Determines whether you want to force the use of Actions and Coins, if present. For example, with OnSucceedAttack TIMINGs.)
  - `var_9`: Buff Keyword. Defaults to `Enhancement` if invalid.
- Mode: `BuffGiveDmg` (Requires idx=0 Valid BuffAbility)
  - `var_3`: Invalidated. Does not accept Attack Type, only Sin Type.
  - `var_6`: [DAMAGE_SOURCE_TYPE](https://rentry.co/glitchscript#damage_source_type) (If Attacker is Null and Source is SKILL, the victims will not become staggered by damage.)
- Mode: `BuffTakeDmg` (Requires idx=0 Valid BuffAbility)
  - `var_1`: Invalidated. Forced targeting on Buff Owner.
  - `var_6`: See [Single-Target](https://rentry.co/glitchscript#target-arguments) (ATTACKER UNIT, can be "Null")
  - `var_7`: [DAMAGE_SOURCE_TYPE](https://rentry.co/glitchscript#damage_source_type) (If Attacker is Null and Source is SKILL, the victims will not become staggered by damage.)
  - `var_8`: `NotByStack` | `ByStack` (Unclear what this does. Use NotByStack if you're unsure. Tests pending.)

### **healsp(var_1, var_2, opt_3)** %transparent% mpdmg %%
Will either apply SP healing or SP Damage
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: `VALUE_#` | any integer (If the number is positive, it will heal SP. If it's a negative value, it will apply SP damage)
  - `opt_3`: See [Single-Target](https://rentry.co/glitchscript#target-arguments) (SOURCE UNIT for SP damage)

### **buff(var_1, var_2, var_3, var_4, var_5, opt_6)** %transparent% buf %%
Inflicts buffs by keyword, potency, and count. Negative values consume the buff.  
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: Buff keyword (e.g., `Enhancement`, `Agility`)
  - `var_3`: `VALUE_#` | any integer (potency/stack)
  - `var_4`: `VALUE_#` | any integer (turn/count)
  - `var_5`: `VALUE_#` | any integer (active round, 0 is this turn, 1 is next turn, this function has an exclusive "2" option to apply the buff this turn AND next turn)
  - `opt_6`: `use` (Adding it and setting it to "use" will attempt to "consume" the buff instead of removing it. Mostly used for the 7 main buffs and things like Gegagorr's Fuel.)

### **shield(var_1,var_2,opt_3)**
Applies Shield.
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: `VALUE_#` | any integer
  - `opt_3`: `perm`   (Adding this optional variable makes the shield not decay after the round ends)

### **healhp(var_1, var_2)**
Heals HP to the Targets by the specified value, putting in a negative Value makes it take away HP similar to Bleed (True Damage that doesn't cause staggers)
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: `VALUE_#` | any integer (Add a % to the end to heal by percentage of max HP of the target. Example: "20%", "VALUE_0%")

### **burst(var_1, var_2)** %transparent% explosion %%
Tremor Burst.
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: `VALUE_#` | any integer   (The amount of times it triggers Tremor Burst)

### **breakdmg(var_1, var_2, opt_3)**
Raises or Lowers the first stagger bar.
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: `VALUE_#` | any integer   (Positive values deal stagger damage, negative values "heal" stagger)
  - `opt_3`: `VALUE_#` | any integer   (The amount of times it triggers)

### **break(var_1, opt_2)**
Staggers the target immediately
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
  - `opt_2`: `natural` | `force` | `both`   (Type of Stagger)

### **breakrecover(var_1)**
Recovers the target from Stagger
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)

### **breakaddbar(var_1, var_2)**
Adds a Stagger Threshold to the target. Setting it above the target's Max HP causes a stagger on the next hit.
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: `VALUE_#` | any integer (Exact HP Value to add the threshold. Add '%' to have it scale with max HP. Example: '25%')

### **scale(var_1,opt_2)**
Gains coin power (similar to vanilla for negative coins).  
- **Arguments:**
  - `var_1`: `VALUE_#` | any integer   (Adds or subtracts coin power)
  - `var_1`: `ADD` | `SUB` | `MUL`   (Changes the operatorType of the coins)
  - `opt_2`: any integer (Sets the index of the coin to be affected. WIP, tests are in order. 0 means first coin, 4 means fifth coin) (NOT usable in FakePower Timing)

### **base(var_1)**
Gains base skill power.  
- **Arguments:**
  - `var_1`: `VALUE_#` | any integer   (Adds or subtracts power)

### **final(var_1)**
Gains final power.  
- **Arguments:**
  - `var_1`: `VALUE_#` | any integer   (Adds or subtracts power)

### **clash(var_1)**
Gains clash power.  
- **Arguments:**
  - `var_1`: `VALUE_#` | any integer   (Adds or subtracts power)

### **dmgadd(var_1)**
Gains +Damage (this functions as if you are adding Final Power to a Skill Before Attack for the purposes of damage calculation
- **Arguments:**
  - `var_1`: `VALUE_#` | any integer   (Adds or subtracts)

### **dmgmult(var_1)**
Gains +Damage%.
- **Arguments:**
  - `var_1`: `VALUE_#` | any integer   (Adds or subtracts)

### **pattern(var_1)**
Sets the pattern index to the user (WIP).
- **Arguments:**
  - `var_1`: `VALUE_#` | any integer   (Pattern index)

### **setdata(var_1,var_2,var_3)**
Sets encounter-persistent data to the target.
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments) (Can also be "Encounter" for global stage data)
  - `var_2`: `VALUE_#` | any integer   (The Data ID. Make this unique so it does not conflict with other mods, e.g: Skill ID + 10 or similar)
  - `var_3`: `VALUE_#` | any integer   (The value to be set)

### **changeskill(var_1)**
Changes the skill mid-combat to another skill in this unit's arsenal.
- **Arguments:**
  - `var_1`: `VALUE_#` | any integer   (The Skill ID)

### **reusecoin(var_1,var_1...)**
Reuses any number of coins
- **Arguments:**
  - `var_1`: `VALUE_#` | any integer   (The index of the coin to be reused. You can input as many indexes as you need. -1 for coin scripts to target themselves)

### **aggro(var_1, var_2, opt_3, opt_4)**
Adds Aggro to one or all slots
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: `VALUE_#` | any integer   (Aggro amount)
  - `opt_3`: `this` | `next` (default: 'next') (Same turn or next turn Aggro)
  - `opt_4`: `VALUE_#` | any integer (slot application)
Slot application:
-2 = Used slot. If no skill is involved, or if used on someone other than Self, defaults to slot 0.
-1 = All slots (spreads equally from left to right)
0 or higher = slot index, 0 being the leftmost

### **skillreuse(var_1)**
Reuses currently used skill against all targets given.
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)

### **skillsend(var_1, var_2, var_3, opt_4,opt_5)**
Sends an attack from a unit to another. The selected skill must exist in the attacker's arsenal.
NOTE: If you want your Guards and Evades to queue for the first attack received on Combat Start, set var_2 to [Self](https://rentry.co/glitchscript#target-arguments)
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments) (ATTACKER)
  - `var_2`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments) (VICTIM)
    - The victim targets can be chained by using "+" up to the Skill's max atk weight. For example: `skillsend(Self,Target+RandomEnemyNoCores99,S1)`. It is recommended to add "RandomEnemyNoCores99" and other similar clauses to the end as a fallback, in case the main targets do not exist.
  - `var_3`: Any Skill ID | S# | D# (# being the tier or index of the Skill on the attacker's arsenal. Example: S2, D1)
  - `opt_4`: atk | def (Default: atk. If your skill isn't activating for some reason, try adding "def". Guards and Evades need this.)
  - `opt_5`: first | late (If used on Combat Start, it'll determine order for your own unit's skills. If used during combat, it'll activate either first or as late as possible.)

### **tagforsort(var_1)**
Only usable on Combat Start.
Only usable on Modular that has access to a Skill Action.
Works exactly like the "ranged" and "late" scripts for Action Sorting, tagging the selected action for sorting.
- **Arguments:**
  - `var_1`: ranged | late

### **skillslotreplace(var_1,var_2,var_3)**
Replaces all skills in the designated Skill Slot index.
Will log an error if index is invalid. Will log an error if Self is invalid (no targeting argument is allowed)
- **Arguments:**
  - `var_1`: `All` | `VALUE_#` | any integer (Slot Index, starts at 0. 'All' affects all slots instead)
  - `var_2`: `VALUE_#` | any integer (Skill ID that will be lost) | 'All' affects every skill instead.
  - `var_3`: `VALUE_#` | any integer (Skill ID that will be given)

### **setslotadder(var_1,var_2,opt_3)**
Sets `maxActionSlotNum` to the value given (Abno only)
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments) 
  - `var_2`: `VALUE_#` | any integer (Amount of Slots)
  - `opt_3`: `add` | put this third argument in if you want it to add or substract instead of setting

### **resource(var_1,var_2,opt_3)**
Gives or Removes Sin Resource from a team.
- **Arguments:**
  - `var_1`: `CRIMSON` | `SCARLET` | `AMBER` | `SHAMROCK` | `AZURE` | `INDIGO` | `VIOLET`
  - `var_2`: `VALUE_#` | any integer (Amount of resource generated. Can be negative to remove resource)
  - `opt_3`: `Enemy` (Add this optional argument to affect the enemy team)

### **discard(var_1,var_2)**
discards skills based on parameters
- **Arguments:**
  - `var_1`: `DESCENDING` (Highest skill available) | `ASCENDING` (Lowest skill available) | `RANDOM` (A random skill)
  - `var_2`: `VALUE_#` | any integer (Amount of skills to be discarded)

### **passiveadd(var_1,var_2, var_3)**
adds a passive into the selected units
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: `VALUE_#` | Passive id
  - `var_3`: `nodupe` or `yesdupe` | Default = 'yesdupe'. If "nodupe", does not add duplicate passives if the unit already has the passive.

### **passiveremove(var_1,var_2)**
removes a passive From the selected Units
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: `VALUE_#` | Passive id

### **endstage**
ends the stage instantly

### **endbattle**
ends that turn's battle, skips to next turn

### **skillcanduel(var_1)**
Sets the "canDuel" Variable on the skill to true/false, best used with RoundStart Timing on a skill
- **Arguments:**
  - `var_1`: `True` | `False`

### **passivereveal(var_1,var_2)**
Reveals the passive of the target
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: Passive ID | VALUE_X | `all`

### **skillreveal(var_1,var_2)**
Reveals the skill of the target
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: Skill ID | VALUE_X | `all`

### **resistreveal(var_1,var_2)**
Reveals the resistances of the target
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: Body Part ID | VALUE_X
  - `var_3`: res (`CRIMSON`, `HIT`, etc)
  - `var_4`: `type` | `attribute` (put in type if var_3 was an attack type, put in attribute if var_3 was a sin)

### **appearance(var_1,var_2)**
Changes the appearance of the target
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: appearance ID

- `Notes`: Due to the way visuals are handled in game, this will always activate at combat start but only if the conditions are met, since the game calculates everything at combat start, e.g: if you made it that on lose duel, the appearance changes, if the game predicted a clash will be lost, it will change appearance at combat start, otherwise it won't

### **coincancel(var_1,var_1...)**
Cancels any number of coins (similar to when you try to use a coin that needs ammo without ammo)
- **Arguments:**
  - `var_1`: `VALUE_#` | any integer (The index of the coin to be Cancelled on X. You can input as many indexes as you need.)

### **skillslotgive(var_1)**
Adds a skill slot to the unit (Works on Sinners only)
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)

### **skillslotremove(var_1,var_2)**
Removes a skill slot from a unit (Works on Sinners only?)
Note: This does not remove the slot from the UI, however, the game forces it to be untargetable and it is unusable.
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2` Slot Index | (Starts from 1)

### **summonassistant(var_1,var_2,var_3)**
Summons an Assistant Next turn after activation (Don't use with RoundStart timing as it breaks the game, you can use EndBattle to Achieve the same effect)
- **Arguments:**
  - `var_1`: Assistant ID |  VALUE_X (Determines the Assistant to be Summoned)
  - `var_2`: Assistant Level | VALUE_X (Determines the Level of the Assistant Summoned)
  - `var_3`: Assistant Uptie | VALUE_X (Determines the Uptie of the Assistant, Assistants dont use Uptie unless you make them use it, so just default it to 1)

### **summonenemy(var_1,var_2,var_3,var_4,opt_5)**
Summons an Enemy or Abnormality Next turn after activation (Don't use with RoundStart timing as it breaks the game, you can use EndBattle to Achieve the same effect)
- **Arguments:**
  - `var_1`: Enemy ID |  VALUE_X (Determines the Enemy to be Summoned)
  - `var_2`: Enemy Level | VALUE_X (Determines the Level of the Enemy Summoned)
  - `var_3`: Enemy Uptie | VALUE_X (Determines the Uptie of the Enemy, Enemies dont use Uptie, so just default it to 1)
  - `var_4`: Wave Index | VALUE_X (Determines the Wave the Enemy is summoned in)
  - `opt_5`: enemy (Adding this Optional Parameter in Makes it specifically spawn regular encounter enemies, otherwise spawns Abnos)

### **summonunitfromqueue()**
Summons the units from the subunitList

### **gnome(var_1)**
gnome.
- **Arguments:**
  - `var_1`: [Multi-Target](https://rentry.co/glitchscript#target-arguments)

### **vibrationswitch(var_1,var_2,opt_3)**
Tremor Conversion
- **Arguments:**
	- `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	- `var_2`: Buff keyword (e.g., `Enhancement`, `Agility`)
	- `opt_3`: `superpos` (Add this optional argument for superposition)

### **setimmortal(var_1)**
Used with `OnImmortal` and `OnOtherImmortal` TIMINGs.
If used with var_1 as `1`, the unit about to be killed will remain alive and its HP will be set to 1.
- **Arguments:**
	- `var_1`: `1` | `0`

### **changemap(var_1,var_2)**
Changes the Map/Background
- **Arguments:**
	- `var_1`: Map Name
	- `var_2`:  `VALUE_#` | any integer (Map Size)

### **battledialogline(var_1,var_2)**
Makes a unit show a dialog bubble.
- **Arguments:**
	- `var_1`:  See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
    - `var_2`: String (Dialog to be displayed. Use "_" instead of spaces.)
- `Note`: By using the target exclusive to this function `upper` you can make it set text to appear on the top of the screen (like in the unique cutscenes of the canto 7 or 8 where the lyrics are displayed on top of the screen like in the superbia quick time event)

- `Example`: `Modular/TIMING:RoundStart/battledialogline(Self,Yes_hello_<sprite_name=\"Combustion\">)`

### **effectlabel(var_1, var_2, var_3, var_4)**
This makes a VFX of choice appear around your target
- **Arguments:**
	- `var_1`:  See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	- `var_2`:  String | (VFX to be played)
	- `var_3`:  'VALUE_#' | active or not, int, Inactive if 0, Active if 1.
	- `var_4`:  String | effect layer type, one of: NONE, DIRECTION, ONCE, BACK, SKIN, MASKING
	- `opt_5`: isSetOverrideDie | Untested what this does, set to `false` by default
	- `opt_6`: isCenter | Untested what this does, most likely centers the VFX, `false` is the default
	- `opt_7`: scale | Untested, most likely scales the VFX size | E.X: 100 - > 1.0 (Scaling is in decimals)
	- `opt_8`: isAddScript | Untested, `false` by default


### **sanchoshield(var_1, var_2)**
This creates a swirling blood shield appear around your target (Note: only works for 8380_SanchoAppearance, 1079_Sancho_BerserkAppearance, might not work for 10310_Donquixote_DarkSanchoAppearance)
- **Arguments:**
    - `var_1`:  See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	- `var_2`:  0 - 1 | Inactive if 0, Active if 1.

### **retreat(var_1, var_2)**
Queues a unit for retreating. All retreats happens at the end of the turn.
- **Arguments:**
  - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: Buff Keyword (What appears on the unit when they retreat, like Overwatch Assignment on FullStop Heathcliff)

### **sound(var_1, var_2)**
Play a given SFX, BGM, Voice line, or Announcer line.
- **Arguments:**
   - `var_1`: bgm | sfx | voice | announcer
   - `opt_2`: GUID of the BGM/SFX/Voice line (I.e {8d76b7dd-1de4-463e-946f-b02a75cad4aa} or 7SV-062 for voice lines)
   - `opt_3`: Announcer ID, voice line to be played (I.e 20, announcer_round_takebigdmg_20_1) 

### **deluge(var_1, var_2)** %transparent% surge %%
Triggers a Sinking Deluge
- **Arguments:**
   - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
   - `var_2`: `VALUE_#` | Amount

### **addability(var_1, var_2, var_3, var_4, var_5)**
Adds a unique system ability
- **Arguments:**
   - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
   - `var_2`: See [The List of System Abilities](https://discord.com/channels/1200863040011259934/1348064934050795601/1369842255820755035)
   - `var_3`: `VALUE_#` | Stack
   - `var_4`: `VALUE_#` | Turn
   - `var_5`: `VALUE_#` | activeRound
`EXAMPLE: addability(Self,MaxSpeedAdder,2,3,1) -> Unit gains +2 max speed for 3 turns next turn`

### **removeability(var_1, var_2)**
Removes a unique system ability
- **Arguments:**
   - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
   - `var_2`: See [The List of System Abilities](https://discord.com/channels/1200863040011259934/1348064934050795601/1369842255820755035)

### **lyrics(var_1, var_2)**
Displays lyrics, like how Mili songs do for the final canto bosses.
- **Arguments:**
   - `var_1`: Hex code colour for the text to display (currently doesn't work, instead, put "reserved")
   - `var_2`: Text to be shown

### **uppertext(var_1,var_2)**
Displays text at the top of the screen.
- **Arguments:**
  - `var_1`: Hex code colour for the text to display
  - `var_2`: Text to be shown

### **makeunbreakable(var_1,var_1...)**
Makes a regular coin unbreakable
- **Arguments:**
   - `var_1`: `VALUE_#` / `all` | any integer (Index of the coin you want to make unbreakable. Index starts at 0, use -1 if this script is inside of a coin and you want to target that same coin.) / targets all coins within a skill

### **stageextraslot(var_1,opt_2)**
Sets the [stage extra slot](https://rentry.co/glitchscript#stagescript-only) to a specific value
- **Arguments:**
   - `var_1`: `VALUE_#` | Int
   - `opt_2`: `add` (Optional "add" argument to add slot capacity instead of setting it)

### **bloodfeast(var_1,var_2,opt_3)**
Changes your available bloodfeast by either adding, removing, or spending it
- **Arguments:**
  - `var_1 option`: `add` | adds bloodfeast based on var_2
  - `var_1 option`: `sub` | removes bloodfeast based on var_2
  - `var_1 option`: `use` | spends bloodfeast based on var_2, **REQUIRES A TARGET WITH OPT_3**
  - `var_2`: `VALUE_#` | any integer, the amount of bloodfeast you want to add/remove/spend
  - `opt_3`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments) | only used when spending bloodfeast with var_1

### **critchance(var_1)**
Adds a chance to deal a Critical Hit.
- **Arguments:**
	- `var_1`: `VALUE_#` | Any integer, the % chance to deal a Critical Hit (i.e 15 -> 15% chance)

### **critratio(var_1)**
Critical Hit Resistance Weakening adder (Does not work on Coin Modular).
- **Arguments:**
	- `var_1`: `VALUE_#` | Any integer, the decimal adder for the crit resistance reduction (i.e 25 -> +0.25 res)

### **assistdefense(var_1,var_2,var_3)**
Defends a unit based on the parameters. (Note: The defender Skill must have the Skill ability "SupportiveDefense", must be in the unit's defense skill list, and the unit defending must have the a buff with the ability "SupportProtect" (Mao Faust assist defense)
- **Arguments:**
	- `var_1`: Defender | See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	- `var_2`: Defended | See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	- `var_3`: Skill ID to be used by the Defender

### **ignorepanic(var_1)**
Used with the `IgnorePanic` timing (But can be used on other timings)
If used with var_1 as `1`, the affected unit's panic state will be completely disabled.
- **Arguments:**
	- `var_1`:  `1` | `0`

### **ignorebreak(var_1)**
Used with the `IgnoreBreak` timing (But can be used on other timings)
If used with var_1 as `1`, the affected unit's Stagger state will be completely disabled.
- **Arguments:**
	- `var_1`:  `1` | `0`

### **changemotion(var_1,var_2)**
Changes a Skill's "SkillMotion" based on the parameters.
- **Arguments:**
	- `var_1`: Motion Type | (i.e S1, S2, S3, S4, etc.)
	- `var_2`: Motion Index | (i.e, 0, 1, 2)

### **changeaffinity(var_1)**
Best used with the `StartBehaviour` timing (But can be used on other timings?)
Changes the Sin Affinity of a Skill on usage of said Skill.
- **Arguments:**
	- `var_1`:  Sin Affinity | (i.e AZURE, AMBER, BLACK, WHITE, etc.)

### **ovwatkres(var_1,var_2,var_3,opt_1)**
Overrides an attack's resistance value.
- **Arguments:**
	- `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	- `var_2`: atkType: `SLASH` | `PENETRATE` | `HIT`
	- `var_3`: newValue: Any integer from `0` to `200` | E.X: 200 -> 2.00
	- `opt_1`: add: If this opt exists, adds `newValue` to the unit's resistance instead of overwriting their resistance

### **ovwsinres(var_1,var_2,var_3,opt_1)**
Overrides an attack's resistance value.
- **Arguments:**
	- `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	- `var_2`: sinType: `CRIMSON` | `SCARLET` | `AMBER` | `SHAMROCK` | `AZURE` | `INDIGO` | `VIOLET`
	- `var_3`: newValue: Any integer from `0` to `200` | E.X: 200 -> 2.00
	- `opt_1`: add: If this opt exists, adds `newValue` to the unit's resistance instead of overwriting their resistance

### **refreshspeed(var_1)**
Refreshes a unit's Speed. Mainly used if you use `MaxSpeedAdder` and `MinSpeedAdder` system abilities.
- **Arguments:**
	- `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)

### **adddefaultskillbyid(var_1,var_2)**
Adds a Skill to the Default Skillset of any unit.
- **Arguments:**
	- `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	- `var_2`: Skill ID

### **addskilltopool(var_1,var_2,opt_3)**
Adds a Skill to the pool of drawn Skills for the Dashboard. Must be in the Default Skillset to work.
- **Arguments:**
	- `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	- `var_2`: Skill ID
	- `opt_3`: Skill Amount (int, 1 by Default)

### **dropskill(var_1,opt_2)**
Converts the Incoming Skill on the Dashboard to the selected Skill by ID. Must be in the Default Skillset to work.
Only works on Target: Self.
- **Arguments:**
	- `var_1`: Skill ID
	- `opt_2`: Skill Slot Index (0 by Default)

### **giveskillscript(var_1,var_2,etc)**
Applies a temporary Skill Script to the selected Skill during combat. Depending on the mode chosen, the variables required after var_2 may change.
- **Arguments:**
	- `var_1`: Self | Target
	- `var_2`: Mode Selection (int)
- Mode 0: Script that applies Skill Final Power.
	- `var_3`: Power (int)
- Mode 1: Script that applies Skill Clash Power.
	- `var_3`: Power (int)
- Mode 2: Applies a Modular Script chosen from the Skill this Consequence is being called from. The script must have the segment "Modular/TIMING:" removed from the json file.
	- `var_3`: Ability Index for the chosen Modular Script.

### **appearancelocalscale(var_1,var_2,var_3)**
Changes the xyz local scale for appearance on Self.
- **Arguments:**
	- `var_1`: x (int)
	- `var_2`: y (int)
	- `var_3`: z (int)

### **appearancelocaleuler(var_1,var_2,var_3)**
Changes the xyz local rotation for appearance on Self (Used for unsquishing identities by using 0,0,0).
- **Arguments:**
	- `var_1`: x (int)
	- `var_2`: y (int)
	- `var_3`: z (int)

### **destroybuff(var_1,var_2,var_3,opt_1,opt_2)**
Destroys a buff based on the parameters. The `opt` parameters are only to be used if `var_2` is NOT `keyword`
- **Arguments:**
	- `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	- `var_2`: `Keyword` | `Buff Type` | `Buff Category` 
	- `var_3`: activeRound: `0`  for same turn | `1` for next turn | `2` for this turn and next turn
	- `opt_1`: amount: Any integer greater than 0 (or = 0)
	- `opt_2`: includeNonDispellable: If this opt exists, include buffs that have the property `canBeDispelled = false`

### **deactivebreak(var_1, var_2, var_3, opt_1)**
Deactivate a unit's Stagger Threshold based on the parameters.
- **Arguments:**
	- `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	- `var_2`: Sort: `true` | `false`
				   		- If `true`, sort the active Stagger Thresholds in descending order.
	- `var_3`: breakIndex: Index of the Stagger Threshold. Index starts at `0`. If set to `-1`, deactivates all Stagger Thresholds.
	- `opt_1`: reverseIndex: If this opt exists, the active Stagger Threshold list is reversed. (E.X: Index 0 -> lowest Stagger Threshold)

### **buffcategory(var_1, var_2, var_3, var_4, var_5, var_6, var_7)** %transparent% bufcategory %%
Change different properties of different effects sharing the same category.
- **Arguments:**
	- `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	- `var_2`: `Buff Category`
	- `var_3`: `Stack`
	- `var_4`: `Count`
	- `var_5`: `activeRound` | `0`, `1`, or `2`.
	- `var_6`: `isRespective?` | If > 0, returns `true` | If true, adds `stack` and `count` to every buff targetted by this consequence | If false, does 2 things depending on if it has count or not. If the effect does not have count, adds `stack` + `count` to the potency of the effect. If the effect does have count, randomly distribute the `stack` and `count`.
	- `var_7`: `amount` | The amount of buffs affected by this consequence

### **setdmgtaken(var_1)**
Sets how much damage you take whenever you take damage, used in conjunction with the ChangeTakeDamage timing. Important note: This sets how much damage you take from an attack to that amount, it does not add that much. It's reccomended to combo this consequence with the getdmg acquirer
- **Arguments:**
  - `var_1`: `VALUE_#` | any integer

### **changeatktype(var_1)**
Changes the Skill's attack type (E.X Slash) into the value specified in `var_1`. This allows for you to mimic rien's changing damage types for example.
- **Arguments:**
  - `var_1`: Attack Type | `HIT`, `PENETRATE`, or `SLASH`

### **atkweight(var_1)**
adds/removes a skill's atkweight, positive numbers increase attack weight, negatives reduce. (CAN'T BE DONE MIDCOMBAT WITH TIMINGS LIKE WHENUSE)
- **Arguments:**
   - `var_1`: `VALUE_#` | Amount |  Do keep in mind that if you remove too much attack weight your skill will have no targets and therefore will not work
---

## **Buff Supporting Functions**
- **Buff Scripts Currently don't support every modular function**

#### This is the list of timings it currently supports:
- `RoundStart`
- `EncounterStart`
- `WhenUse`
- `StartDuel`
- `WinDuel`
- `DefeatDuel`
- `WinParrying`
- `DefeatParrying`
- `StartBehaviour`
- `EndBattle`
- `OnSucceedAttack`
- `WhenHit`
- `EnemyBeforeAttack`
- `EnemyEndSkill`
- `OnCoinToss`
- `OnCoinAfterAttack`
- `OnBurst`
- `StartBattle`
- `StartDuel`
- `OnDiscard`
- `EndSkill`
- `EndBehaviour`
- `WhenGained`
- `SpecialAction`

#### Exclusive Buff Script Acquisition Functions

### **stack()**
Exclusive to Scripts in Buffs, returns the stack of the buff

### **turn()**
Exclusive to Scripts in Buffs, returns the count of the buff

#### Exclusive Buff Script Consequence Functions

### **stack(var_1)**
Exclusive to Scripts in Buffs, Adds the Specified Amount to the Stack of the buff, removes if negative
- **Arguments:**
- `var_1`: Amount | VALUE_X

### **turn(var_1)**
Exclusive to Scripts in Buffs, Adds the Specified Amount to the Count of the buff, removes if negative
- **Arguments:**
- `var_1`: Amount | VALUE_X

## **Condition Functions**

### **IF Statements**
Defines conditional effects.  
- **Format:** `/IF(condition):effect/` | `/IFNOT(condition):effect/`
Can compare `<`, `>`, and `=`

### **CONTINUEIF**
If False, stops the execution of the rest of the script. if `LOOP` is involved, skip to the next iteration of the loop instead.
- **Format:** `/CONTINUEIF(condition)/`
Can compare `<`, `>`, and `=`


### **Example**
```markdown
/IF(VALUE_1<VALUE_2):healsp(Self,-7):IF(VALUE_1>VALUE_2):healsp(Self,7)/
/IF(VALUE_1<VALUE_2):VALUE_1:getbuff(Self,Vibration,stack)/
```
You can chain IF statements separated by commas. Additionally, the first element can specify the type of comparison.
Examples:
`IF(AND,VALUE>5,VALUE<10)`
`IF(OR,VALUE>5,VALUE<10)`
`IF(XOR,VALUE>5,VALUE<10)`

---
## **Embedding Acquisition**
You can Embed Acquisition functions into consequence functions to directly get the number, embedded acquisitions use {} instead of () and - instead of , to distinguish them and must begin with "G"
Example: `"Modular/TIMING:WhenUse/bonusdmg(Target,Ggethp{Self-normal},-1,-1)"`

---
## STAGESCRIPT ONLY
- **Batch Arguments:**
- `extraslot:#`  (Acts as if there are that many more free slots in battle)
- `instantslot`  (Instantly fills all possible skill slots)
### **Example**
`"Modular/extraslot:4/instantslot"`
This stage script makes it so up to 4 sinners gain extra slots, depending on max participant limit.

---
## LUA SECTION

In order for a .lua file to be compatible with Modular, it must be placed into the `modular_lua` folder. In order for these .lua files to be loaded by a Modular script, they must be placed like so:

`"Modular/TIMING:StartBattle/LUA:hello_world"`

Each mod folder has their own `modular_lua` folder, however, no two .lua files should have the same name even if they are from different mods. It is best to prefix your .lua files with the name of your mod, and the author. (i.e `wei_ShaneLitterateur`)

In order to use consequence functions and accquisition functions, you'd call them the same as you normally do in Modular. The following is an example of a .lua file doing this exact same thing.

```lua
function burn_to_dmg_multiplier(unit)
    local burn = getbuff(unit, "Combustion", "stack")
    return math.min(burn * 5, 50)
end

local multiplier = burn_to_dmg_multiplier("Self")

log("Hello, World! Damage multiplier from burn is: " .. multiplier .. "%")

dmgmult(multiplier)
```

As you can see, you can use functions in .lua files, making your modular scripts 10x cleaner. The .lua files also support using normal programming language features (i.e loops, if/else statements, etc.) meaning that you can revolutionize your Modular scripts. Yipee!

There are a few unique functions specific to the .lua files.

#### Exclusive .lua Functions

### **setldata(var_1, var_2, var_3)**
Sets encounter-persistent data from the target.
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: String (The Data ID)
  - `var_3`: Any .lua value (The value to be set)

### **getldata(var_1, var_2)**
Gets encounter-persistent data from the target (Lua version)
- **Arguments:**
  - `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)
  - `var_2`: String (The Data ID)

### **clearvalues()**
Clears the value of a Modular script

### **resetadders()**
Clears the adders of a Modular script

### **require("XXXX")**
Loads the content of another .lua file in the `modular_lua` folder. (i.e require("killallzenos")). Act's like normal inheritance.

### **selecttargets(var_1)**
Takes a multi-target selector string and returns an table of selected targets. (i.e ["inst12", "inst34"]). Inst selectors are recognized by Modular, meaning you can pass them into consequence/value acquirers that accept target selectors. 
- **Arguments:**
   - `var_1`: See [Multi-Target](https://rentry.co/glitchscript#target-arguments)

### **listfiles(var_1)**
Lists the files of a given directory. This function does NOT list folders. This function is restricted to the "Plugins" folder and any sub-folders. This function returns a .lua array.
- **Arguments:**
	- `var_1`: Path of the directory (i.e "Lethe")

### **readfile(var_1)**
Reads a given files contents. This function is restricted to the "Plugins" folder and any sub-folders. This function returns a .lua string.
- **Arguments:**
	- `var_1`: Path of the file (i.e "Lethe/modularcodesecrets.txt")

### **listdirectories(var_1)**
Lists the folders of the directory specified. This function does not list files, and is restricted to the Plugins folder and any sub-folders. This function returns a .lua array.
- **Arguments:**
	- `var_1`: Path of the directory (E.X: `"Lethe"`)

### **jsontolua(var_1)**
Converts a string representing JSON's into a lua table. (Use with readfile(), listfiles(), and listdirectories())
- **Arguments:**
	- `var_1`: Any string

### **listbuffs(var_1)**
Returns a .lua array containing all the keywords a unit has.
- **Arguments:**
	- `var_1`: See [Single-Target](https://rentry.co/glitchscript#target-arguments)

### **setgdata(var_1,var_2)**
Sets a global .lua value, which is only cleared upon a total game refresh.
- **Arguments:**
	- `var_1`: String (The data ID)
	- `var_2`: luaValue: a .lua value

### **addresource(var_1, var_2, var_3)**
Gives or Removes Sin Resource from a team.
- **Arguments:**
  - `var_1`: `CRIMSON` | `SCARLET` | `AMBER` | `SHAMROCK` | `AZURE` | `INDIGO` | `VIOLET`
  - `var_2`: `VALUE_#` | any integer (Amount of resource generated. Can be negative to remove resource)
  - `opt_3`: `Enemy` (Add this optional argument to affect the enemy team)

### **getgdata(var_1)**
Returns a global .lua value.
- **Arguments:**
	- `var_1`: String (The data ID)

### **clearallgdata()**
Clears all currently loaded .lua global values.

### **Math Functions (.lua only)**
Refer to this [website](https://www.lua.org/pil/18.html)

### **gbkeyword**
Returns a string representing the buff keyword gained (Only works with OnGainBuff timing)

### **LUAMAIN Function**
LUAMAIN is a Main Function that lets you trigger a specific LUA function in a lua file
See [This Part of the Documentation](https://rentry.co/glitchscript#luamain-function)

---
## LEGACY NAMES
Function and timing names that have been changed in favor of new names
these still technically exist and are usable and are no different from the original, they merely exist still for the sake of backwards compatibility
while you can still use these versions, it's not recommended over the new names, (literally the exact same, they are 2 labels of the same function, meaning if one gets changed so does the other)

### **Old Timing Names**

| Old name              | Renamed to         |
| --------------------- | ------------------ |
| `OnStartBehaviour`    | `StartBehaviour`   |
| `OnEndBehaviour`      | `EndBehaviour`     |
| `StartVisualSkillUse` | `OnVisualUse`      | 
| `StartVisualCoinToss` | `OnVisualCoinToss` |
| `Immortal`            | `OnImmortal`       | 
| `ImmortalOther`       | `OnOtherImmortal`  |

### **Old Acquisition Function Names**

| Old name           | Renamed to            | 
| ------------------ | --------------------- | 
| `hpcheck`          | `gethp`               | 
| `mpcheck`          | `getsp`               | 
| `bufcheck`         | `getbuff`             | 
| `round`            | `getround`            |
| `wave`             | `getwave`             | 
| `activations`      | `getactivations`      |
| `unitstate`        | `getunitstate`        |
| `instid`           | `getinstid`           | 
| `speedcheck`       | `getspeed`            | 
| `deadallies`       | `getdeadallies`       |
| `areallied`        | `areallies`           | 
| `allcoinstate`     | `getallcoinstates`    | 
| `resonance`        | `getresonance`        |
| `resource`         | `getresource`         |
| `skillbase`        | `getskillbase`        | 
| `skillatkweight`   | `getskillatkweight`   | 
| `skillatklevel`    | `getskillatklevel`    |
| `skillatk`         | `getskillatk`         |
| `skillattribute`   | `getskillattribute`   |
| `skilldeftype`     | `getskilldeftype`     |
| `skillrank`        | `getskillrank`        | 
| `skillegotype`     | `getskillegotype`     | 
| `skillslotcount`   | `getskillslotcount`   |
| `skillcanduel`     | `getskillcanduel`     | 
| `skillteamkill`    | `getskillteamkill`    | 
| `skillfixedtarget` | `getskillfixedtarget` |
| `onescale`         | `getcoinscale`        | 
| `amountattacks`    | `getattackamount`     |
| `coinisbroken`     | `iscoinbroken`        | 
| `unitcount`        | `getunitcount`        |
| `breakcount`       | `getbreakcount`       |
| `breakvalue`       | `getbreakvalue`       | 
| `timeget`          | `gettime`             | 
| `coinrerolled`     | `iscoinrerolled`      | 
| `sameunit`         | `issameunit`          | 
| `coinoperator`     | `getcoinoperator`     |
| `bufftype`         | `getbufftype`         |
| `useddefaction`    | `hasuseddefense`      | 
| `unitfaction`      | `getunitfaction`      | 
| `chainstatus`      | `getchainstatus`      |

### **Old Consequence Function Names**

| Old name      | Renamed to     |
| ------------- | -------------- | 
| `mpdmg`       | `healsp`       | 
| `buf`         | `buff`         | 
| `explosion`   | `burst`        |
| `surge`       | `deluge`       |
| `bufcategory` | `buffcategory` |

### **Old Custom Targeting Names**

| Old name    | Renamed to  |
| ----------- | ----------- |
| `HighestMP` | `HighestSP` |
| `LowestMP`  | `LowestSP`  |