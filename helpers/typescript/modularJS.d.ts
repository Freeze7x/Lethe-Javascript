type anyString<T extends string> = (string & {}) | T

type SingleTarget = anyString<
	"Self" | "SelfCore" |
	"MainTarget" |
	"TargetCore" |
	"Victim" | "Killer" |
	"id" |
	"inst" |
	"adjLeft" | "adjRight"
>

type MultiTarget = SingleTarget | anyString<
	"SelfParts" | "TargetParts" |
	"EveryTarget" | "SubTarget" |
	"All"
>

type Sin = {
	caps: "CRIMSON" | "SCARLET" | "AMBER" | "SHAMROCK" | "AZURE" | "INDIGO" | "VIOLET" | "WHITE" | "BLACK" | "RED" | "PALE" | "NEUTRAL"
	number: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
}
type AttackType = {
	caps: "SLASH" | "PENETRATE" | "HIT"
}

type AcquisitionFunctions = {
	/**
	Gets HP value based on the arguments.
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 `normal` | `%` | `max`
	*/
	gethp(var_1: SingleTarget, var_2: "normal" | "%" | "max" | "missing" | "missing%"): number

	/**
	Gets Default Value for Max HP (Why didn't we just put it as an argument on gethp? I'm gonna kms).
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	getdefaultmaxhp(var_1: SingleTarget): number

	/**
	Gets the amount of HP gained per Level (Returned 1 = 0.01).
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	gethpincrement(var_1: SingleTarget): number

	/**
	Gets SP value based on the argument.
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	getsp(var_1: SingleTarget): number

	/**
	Returns an integer based on the buff mode.
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 Buff keyword (e.g., `Enhancement`, `Agility`)
	@param var_3 `stack` | `turn` | `+` | `*` | `consumed`
	*/
	getbuff(var_1: SingleTarget, var_2: string, var_3: "stack" | "turn" | "+" | "*" | "consumed"): number

	/**
	No Description Provided
	
	*/
	getdmg(): number

	/**
	No Description Provided
	
	*/
	getround(): number

	/**
	No Description Provided
	
	*/
	getwave(): number

	/**
	No Description Provided
	
	*/
	getactivations(): number

	/**
	Returns:
	`-1` if the unit doesn't exist
	`0` if the unit is dead
	`1` if the unit is alive
	`2` if the unit is staggered
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	getunitstate(var_1: SingleTarget): number

	/**
	Returns:
	`-1` if the unit doesn't exist
	`0` if the unit is unable to act.
	`1` if the unit can act.
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	isactionable(var_1: SingleTarget): number

	/**
	Returns the unitID of the target.
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	getid(var_1: SingleTarget): number

	/**
	Returns the characterID of the target (Sinners only)
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	getcharacterid(var_1: SingleTarget): number

	/**
	Returns the unique instance ID of the target.
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	getinstid(var_1: SingleTarget): number

	/**
	Returns the speed of the target.
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	@param opt_2 `VALUE_#` | any integer    (checks a specific slot index's speed)
	*/
	getspeed(var_1: SingleTarget, opt_2?: number): number

	/**
	Returns the pattern index (integer) of the target.
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	getpattern(var_1: SingleTarget): number

	/**
	Gets encounter-persistent data from the target.
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments) (Can also be "Encounter" for global stage data)
	@param var_2 `VALUE_#` | any integer   [(The Data ID)](https://rentry.co/glitchscript#setdatavar_1var_2var_3)
	*/
	getdata(var_1: SingleTarget, var_2: number): number

	/**
	Gets number of target's dead allies.
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	getdeadallies(var_1: SingleTarget): number

	/**
	Returns a random integer between min and max
	@param var_1 `VALUE_#` | any integer   (Minimum value inclusive)
	@param var_2 `VALUE_#` | any integer   (Maximum value inclusive)
	*/
	random(var_1: number, var_2: number): number

	/**
	Returns the amount of shield on target.
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	getshield(var_1: SingleTarget): number

	/**
	Returns 1 if both units are allied. Returns 0 if they are enemies.
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	areallies(var_1: SingleTarget, var_2: SingleTarget): number

	/**
	Returns the ID of the skill being used. Does not work on TIMINGs that have no Skills being used.
	`getopposkillid` Gets the opponent's Skill ID in a Clash. Returns -1 if non-existent.
	@param opt_1 `replaced` (If used with a Defense Skill: Provides the Skill ID of the covered Skill)
	*/
	getskillid(opt_1?: "replaced"): number

	/**
	Checks if the unit has the passive id. Returns 1 if they do, returns 0 if they don't.
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 Passive ID
	*/
	haspassive(var_1: SingleTarget, var_2: number): number

	/**
	Gets the resulting power of the skill. Please verify if this works correctly and report it (you can use `log()`).
	@param var_1 `Self` | `Target`  ("Target" is only available when there is a clash)
	*/
	getcurrentpower(var_1: "Self" | "Target"): number

	/**
	Gets the coin count of the skill. Returns -1 if var_1 not found.
	@param var_1 `Self` | `Target`  ("Target" is only available when there is a clash)
	@param var_2 `cur` | `og`   (Current coin count and Original coin count respectively)
	*/
	getcoincount(var_1: "Self" | "Target", var_2: "cur" | "og"): number

	/**
	Returns the state of the coins. Returns -1 if var_1 not found.
	@param var_1 `Self` | `Target`  ("Target" is only available when there is a clash)
	@param var_2 `full` | `headcount` | `tailcount` (Selecting "full" will return 0 if mixed, 1 if all Heads, 2 if all Tails)
	*/
	getallcoinstates(var_1: "Self" | "Target", var_2: "full" | "headcount" | "tailcount"): number

	/**
	Returns the resonance of the given type
	@param var_1 highres, highperfect
	*/
	getresonance(var_1: "highres" | "highperfect" | Sin["caps"] | `perfect${Sin["caps"]}`): number

	/**
	Returns the amount of sin resources.
	- `var_1`: `CRIMSON` | `SCARLET` | `AMBER` | `SHAMROCK` | `AZURE` | `INDIGO` | `VIOLET`
	@param var_1 `CRIMSON` | `SCARLET` | `AMBER` | `SHAMROCK` | `AZURE` | `INDIGO` | `VIOLET`
	@param opt_2 `Enemy` (Add this optional argument to affect the enemy team)
	*/
	getresource(var_1: Sin["caps"], opt_2?: "Enemy"): number

	/**
	Returns 1 if the selected unit has the keyword, 0 if not
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 AND | OR (AND means it needs to have every keyword added to return 1, OR means it needs just one keyword to return 1)
	@param var_3~X Any string that could be a unitKeyword or association in the json data of a unit. More than 1 can be added, separated by commas.
	*/
	haskey(var_1: SingleTarget, var_2: "AND" | "OR", ...var_3: string[]): number

	/**
	Returns skill base power.
	@param var_1 `Self` | `Target`
	*/
	getskillbase(var_1: "Self" | "Target"): number

	/**
	Returns attack weight.
	@param var_1 `Self` | `Target`
	*/
	getskillatkweight(var_1: "Self" | "Target"): number

	/**
	Returns one coin's Coin Power.
	@param var_1 `Self` | `Target`
	@param var_2 `VALUE_#` | any integer (Coin Index, starts at 0. If the index is out of range, checks the last coin instead.)
	*/
	getcoinscale(var_1: "Self" | "Target", var_2: number): number

	/**
	Returns skill's offense level.
	@param var_1 `Self` | `Target`
	*/
	getskillatklevel(var_1: "Self" | "Target"): number

	/**
	Returns the unit's offense level + skill offense level
	@param var_1
	*/
	getskilllevel(var_1: "Self" | "Target"): number

	/**
	Returns skill atk type, 0 = Slash, 1 = Pierce, 2 = Blunt, 3 = None
	@param var_1 `Self` | `Target`
	*/
	getskillatk(var_1: "Self" | "Target"): 0 | 1 | 2 | 3

	/**
	Returns skill sin, Wrath = 0, Lust = 1, Sloth = 2, Gluttony =3, Gloom = 4, Pride = 5, Envy = 6, White = 7, Black = 8, Red = 9, Pale = 10, Neutral = 11.
	@param var_1 `Self` | `Target` | `replaced` (replaced: If used with a Defense Skill: Provides the Skill ID of the covered Skill)
	*/
	getskillattribute(var_1: "Self" | "Target" | "replaced"): number

	/**
	Returns Defense Type, None = 0, Guard = 1, Evade = 2, Counter = 3, Attack = 4, Non_Action = 5. (Non_action is only used once and by the panic skill)
	@param var_1 `Self` | `Target`
	*/
	getskilldeftype(var_1: "Self" | "Target"): number

	/**
	Returns the tier of the target's skill
	@param var_1 `Self` | `Target` | `replaced` (replaced: If used with a Defense Skill: Provides the Skill ID of the covered Skill)
	*/
	getskillrank(var_1: "Self" | "Target" | "replaced"): number

	/**
	Returns Ego Type, Skill = 0, Awaken = 1, Corrosion = 2, Corrosion Unstable = 3, Corrosion Stable = 4, Upgrade = 5, 6 = None.
	@param var_1 `Self` | `Target`
	*/
	getskillegotype(var_1: "Self" | "Target"): number

	/**
	returns how many skills are attacking the specified unit
	@param var_1 //rentry.co/glitchscript#target-arguments)
	*/
	getattackamount(var_1: SingleTarget): number

	/**
	No Description Provided
	
	*/
	iscoinbroken(): number

	/**
	Returns the number of slots of the target
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	@param opt_2 `perm` (can be optionally added to count permanent skill slots only)
	*/
	getskillslotcount(var_1: SingleTarget, opt_2?: "perm"): number

	/**
	No Description Provided
	
	*/
	isfocused(): number

	/**
	Returns the amount of damage taken by the target
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 `prev` | `current` |
	*/
	getdmgtaken(var_1: SingleTarget, var_2: "prev" | "current"): number

	/**
	Returns the amount of buffs on the target (e.g if the target has Bleed and Rupture on them, return), specify either negative or positive.
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 `neg` | `pos` |
	*/
	getbuffcount(var_1: SingleTarget, var_2: "neg" | "pos"): number

	/**
	Returns the amount of units based off Target, (Example: getunitcount(NoParts99) would return the amount of enemies alive.)
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	getunitcount(var_1: MultiTarget): number

	/**
	Returns the amount of stagger bars on the target
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	getbreakcount(var_1: SingleTarget): number

	/**
	Returns the point of the target's stagger bar
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 Stagger index (eg: 0 = first stagger bar)
	*/
	getbreakvalue(var_1: SingleTarget, var_2: number): number

	/**
	~~IM GOING TO KILL MYSELF WHY DOES THIS EXIST~~
	Returns the time according to the parameter.
	@param var_1 `dayofweek` | `dayofmonth` | `dayofyear` | `hours` | `minutes` | `seconds` | `milliseconds` | `ticks` | `month` | `year` | `isleapyear` |
	@param opt_2 `VALUE_X` | any integer (the year, needed for isleapyear)
	*/
	gettime(var_1: "dayofweek" | "dayofmonth" | "dayofyear" | "hours" | "minutes" | "seconds" | "milliseconds" | "ticks" | "month" | "year" | "isleapyear", opt_2?: number): number

	/**
	Returns certain stats of the specified unit based on the parameters
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 `deployment` | `deadAllyCount` | `res????` | `panicType` | `isRetreated` | `speedMin` | `hasMp` | `deflevel` |
	*/
	getstat(var_1: SingleTarget, var_2: "deployment" | "deadAllyCount" | `res${Sin["caps"] | AttackType["caps"]}` | "panicType" | "isRetreated" | "speedMin" | "speedMax" | "speedMinOG" | "speedMaxOG" | "hasMp" | "deflevel"): number

	/**
	No Description Provided
	
	*/
	iscoinrerolled(): number

	/**
	No Description Provided
	
	*/
	stageextraslot(): number

	/**
	Returns bloodfeast based on the variable given
	@param var_1 `available` | `spent`
	*/
	getbloodfeast(var_1: "available" | "spent"): number

	/**
	Returns the unit's level
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	getlevel(var_1: SingleTarget): number

	/**
	Returns if a Coin is unbreakable (Only usable with timing's that use Coins)
	@param var_1 Self | Target (1 if unbreakable, 0 if not)
	*/
	isunbreakable(var_1: "Self" | "Target"): number

	/**
	Returns if a Coin is usable in a duel (Only usable with timing's that use Coins)
	@param var_1 Self | Target (1 if uncracked, 0 if cracked)
	*/
	isusableinduel(var_1: "Self" | "Target"): number

	/**
	Returns 1 if the 2 inputs result in the same unit, otherwise returns 0
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	issameunit(var_1: SingleTarget, var_2: SingleTarget): number

	/**
	Returns 0 if null or backup disabled. Returns 1 if enabled.
	@param var_1 Ally | Enemy
	*/
	isbackupenabled(var_1: "Ally" | "Enemy"): number

	/**
	Counts the amount of un-initialized Backup units in a team.
	@param var_1 Ally | Enemy
	@param var_2 normal | current (Just use "normal", it'll work fine. We don't know what "current" does.)
	*/
	countbackup(var_1: "Ally" | "Enemy", var_2: "normal" | "current"): number

	/**
	Returns `1` if the Skill can Duel, `0` if not.
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	getskillcanduel(var_1: SingleTarget): number

	/**
	Returns `1` if the Skill can kill allies, `0` if not.
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	getskillteamkill(var_1: SingleTarget): number

	/**
	Returns `1` if the Skill has a fixed target, `0` if not.
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	getskillfixedtarget(var_1: SingleTarget): number

	/**
	No Description Provided
	
	*/
	gethpdmg(): number

	/**
	Returns an integer to represent the Coin's operator.
	`1` is `ADD`
	`2` is `SUB`
	`3` is `MUL`
	@param var_1 Self | Target
	@param var_2 Coin Index | 0 is the first Coin
	*/
	getcoinoperator(var_1: "Self" | "Target", var_2: number): number

	/**
	Returns an integer to represent the Buff's type.
	`0` is `Neutral`
	`1` is `Positive`
	`2` is `Negative`
	@param var_1 Keyword | (E.X: Combustion, Protection)
	*/
	getbufftype(var_1: "Keyword" | "(E.X: Combustion, Protection)"): number

	/**
	Returns an integer that represents the resistance value. (Does not work on Abnormalities.)
	x0.01 -> 1
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 Sin Affinity: `CRIMSON` | `SCARLET` | `AMBER` | `SHAMROCK` | `AZURE` | `INDIGO` | `VIOLET`
	*/
	getatkres(var_1: SingleTarget, var_2: Sin["caps"] | AttackType["caps"]): number

	/**
	Returns:
	`-1` if the unit doesn't exist
	`0` if no skills were used last turn.
	`1` if the unit used at least one skill last turn.
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	diduseskilllastturn(var_1: SingleTarget): number

	/**
	Returns `1` if the unit used a defense action this turn, otherwise, returns `0`
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	hasuseddefense(var_1: SingleTarget): number

	/**
	Returns an integer representing the unit's faction.
	Returns `1` for the Sinners/Assistants
	Returns `0` for any enemy
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	getunitfaction(var_1: SingleTarget): 0 | 1

	/**
	Returns an integer representing the status of the chain of Skills on the Dashboard.
	Returns `0` if Skills cannot be found
	Returns `1` if only attack and counter Skills are chained
	Returns `2` if only guard and evade Skills are chained
	Returns `3` if any mix of attack and defence Skills are chained
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	getchainstatus(var_1: SingleTarget): number

	/**
	Returns an integer representing the amount of sins in the Dashboard
	@param var_1 Sin | `HIGHEST` |
	@param var_2 Dashboard Layer to count from: `TOP` | `BOTTOM` | `BOTH` | `NEITHER`
	@param opt_3 Include Prediction Layer? `1` | `0` (off by default)
	*/
	getsinsindashboard(var_1: "Sin" | "HIGHEST", var_2: "TOP" | "BOTTOM" | "BOTH" | "NEITHER", opt_3?: "1" | "0"): number
}//#

type ConsequenceFunctions = {
	/**
	Prints a line in the Bepinex Log with the provided VALUE
	@param var_1 Any string (spaces will be automatically deleted; try not to use special characters)
	@param opt_1 `VALUE_#` | any integer
	*/
	log(var_1: string, opt_1?: number): void

	/**
	Deals bonus damage.
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 `VALUE_#` | any integer
	@param var_3 `-1` (true damage) | `0` (slash) | `1` (pierce) | `2` (blunt)
	@param var_4 `-1` (true damage) | `0~6` (sin types)
	*/
	bonusdmg(var_1: MultiTarget, var_2: number, var_3: "-1" | "0" | "1" | "2", var_4: "-1" | "0~6"): void

	/**
	Deals bonus damage through buffs.
	im lowkey not documenting this bro wtf.
	@param var_1 Invalidated. Forced targeting on Buff Owner.
	@param var_2 `VALUE_#` | any integer
	@param var_3 Invalidated. Does not accept Attack Type, only Sin Type.
	@param var_4 `-1` (true damage) | `0~6` (sin types)
	@param var_5 Determines the mode. Variables may change depending on the mode chosen.
	@param var_6 See [Single-Target](https://rentry.co/glitchscript#target-arguments) (ATTACKER UNIT, can be "Null")
	@param var_7 [DAMAGE_SOURCE_TYPE](https://rentry.co/glitchscript#damage_source_type) (If Attacker is Null and Source is SKILL, the victims will not become staggered by damage.)
	@param var_8 `NotByStack` | `ByStack` (Unclear what this does. Use NotByStack if you're unsure. Tests pending.)
	@param var_9 Buff Keyword. Defaults to `Enhancement` if invalid.
	*/
	bonusdmgbybuff(...args: any[]): void

	/**
	Will either apply SP healing or SP Damage
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 `VALUE_#` | any integer (If the number is positive, it will heal SP. If it's a negative value, it will apply SP damage)
	@param opt_3 See [Single-Target](https://rentry.co/glitchscript#target-arguments) (SOURCE UNIT for SP damage)
	*/
	healsp(var_1: MultiTarget, var_2: number, opt_3?: SingleTarget): void

	/**
	Inflicts buffs by keyword, potency, and count. Negative values consume the buff.
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 Buff keyword (e.g., `Enhancement`, `Agility`)
	@param var_3 `VALUE_#` | any integer (potency/stack)
	@param var_4 `VALUE_#` | any integer (turn/count)
	@param var_5 `VALUE_#` | any integer (active round, 0 is this turn, 1 is next turn, this function has an exclusive "2" option to apply the buff this turn AND next turn)
	@param opt_6 `use` (Adding it and setting it to "use" will attempt to "consume" the buff instead of removing it. Mostly used for the 7 main buffs and things like Gegagorr's Fuel.)
	*/
	buff(var_1: MultiTarget, var_2: string, var_3: number, var_4: number, var_5: number, opt_6?: "use"): void

	/**
	Applies Shield.
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 `VALUE_#` | any integer
	@param opt_3 `perm`   (Adding this optional variable makes the shield not decay after the round ends)
	*/
	shield(var_1: MultiTarget, var_2: number, opt_3?: "perm"): void

	/**
	Heals HP to the Targets by the specified value, putting in a negative Value makes it take away HP similar to Bleed (True Damage that doesn't cause staggers)
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 `VALUE_#` | any integer (Add a % to the end to heal by percentage of max HP of the target. Example: "20%", "VALUE_0%")
	*/
	healhp(var_1: MultiTarget, var_2: number | `${number}%`): void

	/**
	Tremor Burst.
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 `VALUE_#` | any integer   (The amount of times it triggers Tremor Burst)
	*/
	burst(var_1: MultiTarget, var_2: number): void

	/**
	Raises or Lowers the first stagger bar.
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 `VALUE_#` | any integer   (Positive values deal stagger damage, negative values "heal" stagger)
	@param opt_3 `VALUE_#` | any integer   (The amount of times it triggers)
	*/
	breakdmg(var_1: MultiTarget, var_2: number, opt_3?: number): void

	/**
	Staggers the target immediately
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param opt_2 `natural` | `force` | `both`   (Type of Stagger)
	*/
	break(var_1: MultiTarget, opt_2?: "natural" | "force" | "both"): void

	/**
	Recovers the target from Stagger
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	breakrecover(var_1: MultiTarget): void

	/**
	Adds a Stagger Threshold to the target. Setting it above the target's Max HP causes a stagger on the next hit.
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 `VALUE_#` | any integer (Exact HP Value to add the threshold. Add '%' to have it scale with max HP. Example: '25%')
	*/
	breakaddbar(var_1: MultiTarget, var_2: number): void

	/**
	Gains coin power (similar to vanilla for negative coins).
	@param var_1 `ADD` | `SUB` | `MUL` (Changes the operatorType of the coins)
	@param var_1 power to gain.
	@param opt_2 any integer (Sets the index of the coin to be affected. WIP, tests are in order. 0 means first coin, 4 means fifth coin) (NOT usable in FakePower Timing)
	*/
	scale(var_1: "ADD" | "SUB" | "MUL" | number, opt_2?: number): void

	/**
	Gains base skill power.
	@param var_1 `VALUE_#` | any integer   (Adds or subtracts power)
	*/
	base(var_1: number): void

	/**
	Gains final power.
	@param var_1 `VALUE_#` | any integer   (Adds or subtracts power)
	*/
	final(var_1: number): void

	/**
	Gains clash power.
	@param var_1 `VALUE_#` | any integer   (Adds or subtracts power)
	*/
	clash(var_1: number): void

	/**
	Gains +Damage (this functions as if you are adding Final Power to a Skill Before Attack for the purposes of damage calculation
	@param var_1 `VALUE_#` | any integer   (Adds or subtracts)
	*/
	dmgadd(var_1: number): void

	/**
	Gains +Damage%.
	@param var_1 `VALUE_#` | any integer   (Adds or subtracts)
	*/
	dmgmult(var_1: number): void

	/**
	Sets the pattern index to the user (WIP).
	@param var_1 `VALUE_#` | any integer   (Pattern index)
	*/
	pattern(var_1: number): void

	/**
	Sets encounter-persistent data to the target.
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments) (Can also be "Encounter" for global stage data)
	@param var_2 `VALUE_#` | any integer   (The Data ID. Make this unique so it does not conflict with other mods, e.g: Skill ID + 10 or similar)
	@param var_3 `VALUE_#` | any integer   (The value to be set)
	*/
	setdata(var_1: MultiTarget, var_2: number, var_3: number): void

	/**
	Changes the skill mid-combat to another skill in this unit's arsenal.
	@param var_1 `VALUE_#` | any integer   (The Skill ID)
	*/
	changeskill(var_1: number): void

	/**
	Reuses any number of coins
	@param var_1 `VALUE_#` | any integer   (The index of the coin to be reused. You can input as many indexes as you need. -1 for coin scripts to target themselves)
	*/
	reusecoin(var_1: number): void

	/**
	Adds Aggro to one or all slots
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 `VALUE_#` | any integer   (Aggro amount)
	@param opt_3 `this` | `next` (default: 'next') (Same turn or next turn Aggro)
	@param opt_4 `VALUE_#` | any integer (slot application)
	*/
	aggro(var_1: MultiTarget, var_2: number, opt_3?: "this" | "next", opt_4?: number): void

	/**
	Reuses currently used skill against all targets given.
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	skillreuse(var_1: MultiTarget): void

	/**
	Sends an attack from a unit to another. The selected skill must exist in the attacker's arsenal.
	NOTE: If you want your Guards and Evades to queue for the first attack received on Combat Start, set var_2 to [Self](https://rentry.co/glitchscript#target-arguments)
	@param var_1 See [Single-Target](https://rentry.co/glitchscript#target-arguments) (ATTACKER)
	@param var_2 See [Multi-Target](https://rentry.co/glitchscript#target-arguments) (VICTIM)
	@param var_3 Any Skill ID | S# | D# (# being the tier or index of the Skill on the attacker's arsenal. Example: S2, D1)
	@param opt_4 atk | def (Default: atk. If your skill isn't activating for some reason, try adding "def". Guards and Evades need this.)
	@param opt_5 first | late (If used on Combat Start, it'll determine order for your own unit's skills. If used during combat, it'll activate either first or as late as possible.)
	*/
	skillsend(var_1: SingleTarget, var_2: MultiTarget, var_3: number, opt_4?: "atk" | "def"): void

	/**
	Only usable on Combat Start.
	Only usable on Modular that has access to a Skill Action.
	Works exactly like the "ranged" and "late" scripts for Action Sorting, tagging the selected action for sorting.
	@param var_1 ranged | late
	*/
	tagforsort(var_1: "ranged" | "late"): void

	/**
	Replaces all skills in the designated Skill Slot index.
	Will log an error if index is invalid. Will log an error if Self is invalid (no targeting argument is allowed)
	@param var_1 `All` | `VALUE_#` | any integer (Slot Index, starts at 0. 'All' affects all slots instead)
	@param var_2 `VALUE_#` | any integer (Skill ID that will be lost) | 'All' affects every skill instead.
	@param var_3 `VALUE_#` | any integer (Skill ID that will be given)
	*/
	skillslotreplace(var_1: number, var_2: number, var_3: number): void

	/**
	Sets `maxActionSlotNum` to the value given (Abno only)
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 `VALUE_#` | any integer (Amount of Slots)
	@param opt_3 `add` | put this third argument in if you want it to add or substract instead of setting
	*/
	setslotadder(var_1: MultiTarget, var_2: number, opt_3?: "add" | "put this third argument in if you want it to add or substract instead of setting"): void

	/**
	Gives or Removes Sin Resource from a team.
	@param var_1 `CRIMSON` | `SCARLET` | `AMBER` | `SHAMROCK` | `AZURE` | `INDIGO` | `VIOLET`
	@param var_2 `VALUE_#` | any integer (Amount of resource generated. Can be negative to remove resource)
	@param opt_3 `Enemy` (Add this optional argument to affect the enemy team)
	*/
	resource(var_1: Sin["caps"], var_2: number, opt_3?: "Enemy"): void

	/**
	discards skills based on parameters
	@param var_1 `DESCENDING` (Highest skill available) | `ASCENDING` (Lowest skill available) | `RANDOM` (A random skill)
	@param var_2 `VALUE_#` | any integer (Amount of skills to be discarded)
	*/
	discard(var_1: "DESCENDING" | "ASCENDING" | "RANDOM", var_2: number): void

	/**
	adds a passive into the selected units
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 `VALUE_#` | Passive id
	@param var_3 `nodupe` or `yesdupe` | Default = 'yesdupe'. If "nodupe", does not add duplicate passives if the unit already has the passive.
	*/
	passiveadd(var_1: MultiTarget, var_2: number, var_3: "nodupe" | "yesdupe"): void

	/**
	removes a passive From the selected Units
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 `VALUE_#` | Passive id
	*/
	passiveremove(var_1: MultiTarget, var_2: number): void

	/**
	No Description Provided
	
	*/
	endstage(): void

	/**
	No Description Provided
	
	*/
	endbattle(): void

	/**
	Sets the "canDuel" Variable on the skill to true/false, best used with RoundStart Timing on a skill
	@param var_1 `True` | `False`
	*/
	skillcanduel(var_1: "True" | "False"): void

	/**
	Reveals the passive of the target
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 Passive ID | VALUE_X | `all`
	*/
	passivereveal(var_1: MultiTarget, var_2: number): void

	/**
	Reveals the skill of the target
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 Skill ID | VALUE_X | `all`
	*/
	skillreveal(var_1: MultiTarget, var_2: number): void

	/**
	Reveals the resistances of the target
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 Body Part ID | VALUE_X
	@param var_3 res (`CRIMSON`, `HIT`, etc)
	@param var_4 `type` | `attribute` (put in type if var_3 was an attack type, put in attribute if var_3 was a sin)
	*/
	resistreveal(var_1: MultiTarget, var_2: number, var_3: "CRIMSON", var_4: "type" | "attribute"): void

	/**
	Changes the appearance of the target
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 appearance ID
	*/
	appearance(var_1: MultiTarget, var_2: number): void

	/**
	Cancels any number of coins (similar to when you try to use a coin that needs ammo without ammo)
	@param var_1 `VALUE_#` | any integer (The index of the coin to be Cancelled on X. You can input as many indexes as you need.)
	*/
	coincancel(var_1: number): void

	/**
	Adds a skill slot to the unit (Works on Sinners only)
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	skillslotgive(var_1: MultiTarget): void

	/**
	Removes a skill slot from a unit (Works on Sinners only?)
	Note: This does not remove the slot from the UI, however, the game forces it to be untargetable and it is unusable.
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 Slot Index | (Starts from 1)
	*/
	skillslotremove(var_1: MultiTarget, var_2: number): void

	/**
	Summons an Assistant Next turn after activation (Don't use with RoundStart timing as it breaks the game, you can use EndBattle to Achieve the same effect)
	@param var_1 Assistant ID |  VALUE_X (Determines the Assistant to be Summoned)
	@param var_2 Assistant Level | VALUE_X (Determines the Level of the Assistant Summoned)
	@param var_3 Assistant Uptie | VALUE_X (Determines the Uptie of the Assistant, Assistants dont use Uptie unless you make them use it, so just default it to 1)
	*/
	summonassistant(var_1: number, var_2: "Assistant Level" | "VALUE_X (Determines the Level of the Assistant Summoned)", var_3: "Assistant Uptie" | "VALUE_X (Determines the Uptie of the Assistant, Assistants dont use Uptie unless you make them use it, so just default it to 1)"): void

	/**
	Summons an Enemy or Abnormality Next turn after activation (Don't use with RoundStart timing as it breaks the game, you can use EndBattle to Achieve the same effect)
	@param var_1 Enemy ID |  VALUE_X (Determines the Enemy to be Summoned)
	@param var_2 Enemy Level | VALUE_X (Determines the Level of the Enemy Summoned)
	@param var_3 Enemy Uptie | VALUE_X (Determines the Uptie of the Enemy, Enemies dont use Uptie, so just default it to 1)
	@param var_4 Wave Index | VALUE_X (Determines the Wave the Enemy is summoned in)
	@param opt_5 enemy (Adding this Optional Parameter in Makes it specifically spawn regular encounter enemies, otherwise spawns Abnos)
	*/
	summonenemy(var_1: number, var_2: number, var_3: number, var_4: number, opt_5?: "enemy"): void

	/**
	No Description Provided
	
	*/
	summonunitfromqueue(): void

	/**
	gnome.
	@param var_1 [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	gnome(var_1: MultiTarget): void

	/**
	Tremor Conversion
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 Buff keyword (e.g., `Enhancement`, `Agility`)
	@param opt_3 `superpos` (Add this optional argument for superposition)
	*/
	vibrationswitch(var_1: MultiTarget, var_2: string, opt_3?: "superpos"): void

	/**
	Used with `OnImmortal` and `OnOtherImmortal` TIMINGs.
	If used with var_1 as `1`, the unit about to be killed will remain alive and its HP will be set to 1.
	@param var_1 `1` | `0`
	*/
	setimmortal(var_1: "1" | "0"): void

	/**
	Changes the Map/Background
	@param var_1 Map Name
	@param var_2 `VALUE_#` | any integer (Map Size)
	*/
	changemap(var_1: string, var_2: number): void

	/**
	Makes a unit show a dialog bubble.
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 String (Dialog to be displayed. Use "_" instead of spaces.)
	*/
	battledialogline(var_1: MultiTarget, var_2: string): void

	/**
	This makes a VFX of choice appear around your target
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 String | (VFX to be played)
	@param var_3 'VALUE_#' | active or not, int, Inactive if 0, Active if 1.
	@param var_4 String | effect layer type, one of: NONE, DIRECTION, ONCE, BACK, SKIN, MASKING
	@param opt_5 isSetOverrideDie | Untested what this does, set to `false` by default
	@param opt_6 isCenter | Untested what this does, most likely centers the VFX, `false` is the default
	@param opt_7 scale | Untested, most likely scales the VFX size | E.X: 100 - > 1.0 (Scaling is in decimals)
	@param opt_8 isAddScript | Untested, `false` by default
	*/
	effectlabel(var_1: MultiTarget, var_2: "String" | "(VFX to be played)", var_3: "'VALUE_#'" | "active or not, int, Inactive if 0, Active if 1.", var_4: "String" | "effect layer type, one of: NONE, DIRECTION, ONCE, BACK, SKIN, MASKING", opt_5?: "isSetOverrideDie" | "false", opt_6?: "isCenter" | "false", opt_7?: "scale" | "Untested, most likely scales the VFX size" | "E.X: 100 - > 1.0 (Scaling is in decimals)", opt_8?: "isAddScript" | "false"): void

	/**
	This creates a swirling blood shield appear around your target (Note: only works for 8380_SanchoAppearance, 1079_Sancho_BerserkAppearance, might not work for 10310_Donquixote_DarkSanchoAppearance)
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 0 - 1 | Inactive if 0, Active if 1.
	*/
	sanchoshield(var_1: MultiTarget, var_2: "0 - 1" | "Inactive if 0, Active if 1."): void

	/**
	Queues a unit for retreating. All retreats happens at the end of the turn.
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 Buff Keyword (What appears on the unit when they retreat, like Overwatch Assignment on FullStop Heathcliff)
	*/
	retreat(var_1: MultiTarget, var_2: string): void

	/**
	Play a given SFX, BGM, Voice line, or Announcer line.
	@param var_1 bgm | sfx | voice | announcer
	@param opt_2 GUID of the BGM/SFX/Voice line (I.e {8d76b7dd-1de4-463e-946f-b02a75cad4aa} or 7SV-062 for voice lines)
	@param opt_3 Announcer ID, voice line to be played (I.e 20, announcer_round_takebigdmg_20_1)
	*/
	sound(var_1: "bgm" | "sfx" | "voice" | "announcer", opt_2?: number, opt_3?: number): void

	/**
	Triggers a Sinking Deluge
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 `VALUE_#` | Amount
	*/
	deluge(var_1: MultiTarget, var_2: number): void

	/**
	Adds a unique system ability
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 See [The List of System Abilities](https://discord.com/channels/1200863040011259934/1348064934050795601/1369842255820755035)
	@param var_3 `VALUE_#` | Stack
	@param var_4 `VALUE_#` | Turn
	@param var_5 `VALUE_#` | activeRound
	*/
	addability(var_1: MultiTarget, var_2: string, var_3: number, var_4: number, var_5: number): void

	/**
	Removes a unique system ability
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 See [The List of System Abilities](https://discord.com/channels/1200863040011259934/1348064934050795601/1369842255820755035)
	*/
	removeability(var_1: MultiTarget, var_2: string): void

	/**
	Displays lyrics, like how Mili songs do for the final canto bosses.
	@param var_1 Hex code colour for the text to display (currently doesn't work, instead, put "reserved")
	@param var_2 Text to be shown
	*/
	lyrics(var_1: anyString<"reserved">, var_2: string): void

	/**
	Displays text at the top of the screen.
	@param var_1 Hex code colour for the text to display
	@param var_2 Text to be shown
	*/
	uppertext(var_1: string, var_2: string): void

	/**
	Makes a regular coin unbreakable
	@param var_1 `VALUE_#` / `all` | any integer (Index of the coin you want to make unbreakable. Index starts at 0, use -1 if this script is inside of a coin and you want to target that same coin.) / targets all coins within a skill
	*/
	makeunbreakable(var_1: number): void

	/**
	Sets the [stage extra slot](https://rentry.co/glitchscript#stagescript-only) to a specific value
	@param var_1 `VALUE_#` | Int
	@param opt_2 `add` (Optional "add" argument to add slot capacity instead of setting it)
	*/
	stageextraslot(var_1: number, opt_2?: "add"): void

	/**
	Changes your available bloodfeast by either adding, removing, or spending it
	@param var_1 `add` | `sub` | `use` |
	@param var_2 `VALUE_#` | any integer, the amount of bloodfeast you want to add/remove/spend
	@param opt_3 See [Multi-Target](https://rentry.co/glitchscript#target-arguments) | only used when spending bloodfeast with var_1
	*/
	bloodfeast(var_1: "add" | "sub" | "use", var_2: number, opt_3?: MultiTarget): void

	/**
	Adds a chance to deal a Critical Hit.
	@param var_1 `VALUE_#` | Any integer, the % chance to deal a Critical Hit (i.e 15 -> 15% chance)
	*/
	critchance(var_1: number): void

	/**
	Critical Hit Resistance Weakening adder (Does not work on Coin Modular).
	@param var_1 `VALUE_#` | Any integer, the decimal adder for the crit resistance reduction (i.e 25 -> +0.25 res)
	*/
	critratio(var_1: number): void

	/**
	Defends a unit based on the parameters. (Note: The defender Skill must have the Skill ability "SupportiveDefense", must be in the unit's defense skill list, and the unit defending must have the a buff with the ability "SupportProtect" (Mao Faust assist defense)
	@param var_1 Defender | See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 Defended | See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_3 Skill ID to be used by the Defender
	*/
	assistdefense(var_1: MultiTarget, var_2: MultiTarget, var_3: number): void

	/**
	Used with the `IgnorePanic` timing (But can be used on other timings)
	If used with var_1 as `1`, the affected unit's panic state will be completely disabled.
	@param var_1 `1` | `0`
	*/
	ignorepanic(var_1: "1" | "0"): void

	/**
	Used with the `IgnoreBreak` timing (But can be used on other timings)
	If used with var_1 as `1`, the affected unit's Stagger state will be completely disabled.
	@param var_1 `1` | `0`
	*/
	ignorebreak(var_1: "1" | "0"): void

	/**
	Changes a Skill's "SkillMotion" based on the parameters.
	@param var_1 Motion Type | (i.e S1, S2, S3, S4, etc.)
	@param var_2 Motion Index | (i.e, 0, 1, 2)
	*/
	changemotion(var_1: "Motion Type" | "(i.e S1, S2, S3, S4, etc.)", var_2: number): void

	/**
	Best used with the `StartBehaviour` timing (But can be used on other timings?)
	Changes the Sin Affinity of a Skill on usage of said Skill.
	@param var_1 Sin Affinity | (i.e AZURE, AMBER, BLACK, WHITE, etc.)
	*/
	changeaffinity(var_1: Sin["caps"]): void

	/**
	Overrides an attack's resistance value.
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 atkType: `SLASH` | `PENETRATE` | `HIT`
	@param var_3 newValue: Any integer from `0` to `200` | E.X: 200 -> 2.00
	@param opt_1 add: If this opt exists, adds `newValue` to the unit's resistance instead of overwriting their resistance
	*/
	ovwatkres(var_1: MultiTarget, var_2: "SLASH" | "PENETRATE" | "HIT", var_3: number, opt_1?: "newValue"): void

	/**
	Overrides an attack's resistance value.
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 sinType: `CRIMSON` | `SCARLET` | `AMBER` | `SHAMROCK` | `AZURE` | `INDIGO` | `VIOLET`
	@param var_3 newValue: Any integer from `0` to `200` | E.X: 200 -> 2.00
	@param opt_1 add: If this opt exists, adds `newValue` to the unit's resistance instead of overwriting their resistance
	*/
	ovwsinres(var_1: MultiTarget, var_2: Sin["caps"], var_3: number, opt_1?: "newValue"): void

	/**
	Refreshes a unit's Speed. Mainly used if you use `MaxSpeedAdder` and `MinSpeedAdder` system abilities.
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	*/
	refreshspeed(var_1: MultiTarget): void

	/**
	Adds a Skill to the Default Skillset of any unit.
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 Skill ID
	*/
	adddefaultskillbyid(var_1: MultiTarget, var_2: number): void

	/**
	Adds a Skill to the pool of drawn Skills for the Dashboard. Must be in the Default Skillset to work.
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 Skill ID
	@param opt_3 Skill Amount (int, 1 by Default)
	*/
	addskilltopool(var_1: MultiTarget, var_2: number, opt_3?: number): void

	/**
	Converts the Incoming Skill on the Dashboard to the selected Skill by ID. Must be in the Default Skillset to work.
	Only works on Target: Self.
	@param var_1 Skill ID
	@param opt_2 Skill Slot Index (0 by Default)
	*/
	dropskill(var_1: number, opt_2?: number): void

	/**
	Applies a temporary Skill Script to the selected Skill during combat. Depending on the mode chosen, the variables required after var_2 may change.
	@param var_1 Self | Target
	@param var_2 Mode Selection (int)
	@param var_3 Ability Index for the chosen Modular Script.
	*/
	giveskillscript(var_1: "Self" | "Target", var_2: number, var_3: number): void

	/**
	Changes the xyz local scale for appearance on Self.
	@param var_1 x (int)
	@param var_2 y (int)
	@param var_3 z (int)
	*/
	appearancelocalscale(var_1: number, var_2: number, var_3: number): void

	/**
	Changes the xyz local rotation for appearance on Self (Used for unsquishing identities by using 0,0,0).
	@param var_1 x (int)
	@param var_2 y (int)
	@param var_3 z (int)
	*/
	appearancelocaleuler(var_1: number, var_2: number, var_3: number): void

	/**
	Destroys a buff based on the parameters. The `opt` parameters are only to be used if `var_2` is NOT `keyword`
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 `Keyword` | `Buff Type` | `Buff Category`
	@param var_3 activeRound: `0`  for same turn | `1` for next turn | `2` for this turn and next turn
	@param opt_1 amount: Any integer greater than 0 (or = 0)
	@param opt_2 includeNonDispellable: If this opt exists, include buffs that have the property `canBeDispelled = false`
	*/
	destroybuff(var_1: MultiTarget, var_2: "Keyword" | "Buff Type" | "Buff Category", var_3: "0" | "1" | "2", opt_1?: number, opt_2?: "canBeDispelled = false"): void

	/**
	Deactivate a unit's Stagger Threshold based on the parameters.
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 Sort: `true` | `false`
	@param var_3 breakIndex: Index of the Stagger Threshold. Index starts at `0`. If set to `-1`, deactivates all Stagger Thresholds.
	@param opt_1 reverseIndex: If this opt exists, the active Stagger Threshold list is reversed. (E.X: Index 0 -> lowest Stagger Threshold)
	*/
	deactivebreak(var_1: MultiTarget, var_2: "true" | "false", var_3: number, opt_1?: number): void

	/**
	Change different properties of different effects sharing the same category.
	@param var_1 See [Multi-Target](https://rentry.co/glitchscript#target-arguments)
	@param var_2 `Buff Category`
	@param var_3 `Stack`
	@param var_4 `Count`
	@param var_5 `activeRound` | `0`, `1`, or `2`.
	@param var_6 `isRespective?` | If > 0, returns `true` | If true, adds `stack` and `count` to every buff targetted by this consequence | If false, does 2 things depending on if it has count or not. If the effect does not have count, adds `stack` + `count` to the potency of the effect. If the effect does have count, randomly distribute the `stack` and `count`.
	@param var_7 `amount` | The amount of buffs affected by this consequence
	*/
	buffcategory(var_1: MultiTarget, var_2: "Buff Category", var_3: "Stack", var_4: "Count", var_5: "activeRound" | "0", var_6: "isRespective?" | "true" | "stack" | "stack", var_7: "amount" | "The amount of buffs affected by this consequence"): void

	/**
	Sets how much damage you take whenever you take damage, used in conjunction with the ChangeTakeDamage timing. Important note: This sets how much damage you take from an attack to that amount, it does not add that much. It's reccomended to combo this consequence with the getdmg acquirer
	@param var_1 `VALUE_#` | any integer
	*/
	setdmgtaken(var_1: number): void

	/**
	Changes the Skill's attack type (E.X Slash) into the value specified in `var_1`. This allows for you to mimic rien's changing damage types for example.
	@param var_1 Attack Type | `HIT`, `PENETRATE`, or `SLASH`
	*/
	changeatktype(var_1: "HIT" | "PENETRATE" | "SLASH"): void

	/**
	adds/removes a skill's atkweight, positive numbers increase attack weight, negatives reduce. (CAN'T BE DONE MIDCOMBAT WITH TIMINGS LIKE WHENUSE)
	@param var_1 `VALUE_#` | Amount |  Do keep in mind that if you remove too much attack weight your skill will have no targets and therefore will not work
	*/
	atkweight(var_1: number): void
}//#

declare global {
	const Modular: ConsequenceFunctions & AcquisitionFunctions;
	const Mdl: typeof Modular;
}

export { }