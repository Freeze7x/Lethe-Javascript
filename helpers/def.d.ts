// __Section Alpha

type Functions = {
  /** Gets HP value based on the arguments. */
  gethp(var_1: number, var_2): any

  /** Gets Default Value for Max HP (Why didn't we just put it as an argument on gethp? I'm gonna kms). */
  getdefaultmaxhp(var_1): any

  /** Gets the amount of HP gained per Level (Returned 1 = 0.01). */
  gethpincrement(var_1): any

  /** Gets SP value based on the argument. */
  getsp(var_1): any

  /** Returns an integer based on the buff mode. */
  getbuff(var_1, var_2, var_3): any

  /** Returns the damage. Only usable with OnSucceedAttack, ChangeTakeDamage and WhenHit */
  getdmg(): any

  /** Returns the round. */
  getround(): any

  /** Returns the wave. */
  getwave(): any

  /** Returns the amount of times this script has been triggered before. First time = 0. */
  getactivations(): any

  /** Returns:
  `-1` if the unit doesn't exist
  `0` if the unit is dead
  `1` if the unit is alive
  `2` if the unit is staggered */
  getunitstate(var_1): any

  /** Returns:
  `-1` if the unit doesn't exist
  `0` if the unit is unable to act.
  `1` if the unit can act. */
  isactionable(var_1): any

  /** Returns the unitID of the target. */
  getid(var_1): any

  /** Returns the characterID of the target (Sinners only) */
  getcharacterid(var_1): any

  /** Returns the unique instance ID of the target. */
  getinstid(var_1): any

  /** Returns the speed of the target. */
  getspeed(var_1): any

  /** Returns the pattern index (integer) of the target. */
  getpattern(var_1): any

  /** Gets encounter-persistent data from the target. */
  getdata(var_1): any

  /** Gets number of target's dead allies. */
  getdeadallies(var_1): any

  /** Returns a random integer between min and max */
  random(var_1): any

  /** Returns the amount of shield on target. */
  getshield(var_1): any

  /** Returns 1 if both units are allied. Returns 0 if they are enemies. */
  areallies(var_1): any

  /** Returns the ID of the skill being used. Does not work on TIMINGs that have no Skills being used.
  `getopposkillid` Gets the opponent's Skill ID in a Clash. Returns -1 if non-existent. */
  getskillid(opt_1): any

  /** Checks if the unit has the passive id. Returns 1 if they do, returns 0 if they don't. */
  haspassive(var_1): any

  /** Gets the resulting power of the skill. Please verify if this works correctly and report it (you can use `log()`). */
  getcurrentpower(var_1): any

  /** Gets the coin count of the skill. Returns -1 if var_1 not found. */
  getcoincount(var_1): any

  /** Returns the state of the coins. Returns -1 if var_1 not found. */
  getallcoinstates(var_1): any

  /** Returns the resonance of the given type */
  getresonance(var_1): any

  /** Returns the amount of sin resources.
    - `var_1`: `CRIMSON` | `SCARLET` | `AMBER` | `SHAMROCK` | `AZURE` | `INDIGO` | `VIOLET`
    - `opt_2`: `Enemy` (Add this optional argument to affect the enemy team) */
  getresource(var_1): any

  /** Returns 1 if the selected unit has the keyword, 0 if not */
  haskey(var_1, var_2, var_3): any

  /** Returns skill base power. */
  getskillbase(var_1): any

  /** Returns attack weight. */
  getskillatkweight(var_1): any

  /** Returns one coin's Coin Power. */
  getcoinscale(var_1): any

  /** Returns skill's offense level. */
  getskillatklevel(var_1): any

  /** Returns the unit's offense level + skill offense level */
  getskilllevel(var_1): any

  /** Returns skill atk type, 0 = Slash, 1 = Pierce, 2 = Blunt, 3 = None */
  getskillatk(var_1): any

  /** Returns skill sin, Wrath = 0, Lust = 1, Sloth = 2, Gluttony =3, Gloom = 4, Pride = 5, Envy = 6, White = 7, Black = 8, Red = 9, Pale = 10, Neutral = 11. */
  getskillattribute(var_1): any

  /** Returns Defense Type, None = 0, Guard = 1, Evade = 2, Counter = 3, Attack = 4, Non_Action = 5. (Non_action is only used once and by the panic skill) */
  getskilldeftype(var_1): any

  /** Returns the tier of the target's skill */
  getskillrank(var_1): any

  /** Returns Ego Type, Skill = 0, Awaken = 1, Corrosion = 2, Corrosion Unstable = 3, Corrosion Stable = 4, Upgrade = 5, 6 = None. */
  getskillegotype(var_1): any

  /** returns how many skills are attacking the specified unit */
  getattackamount(var_1): any

  /** if the coin this script is on is broken return 1, otherwise return 0 */
  iscoinbroken(): any

  /** Returns the number of slots of the target */
  getskillslotcount(var_1): any

  /** Returns 1 if the battle is a Focused Encounter, 0 if it is a Regular Encounter */
  isfocused(): any

  /** Returns the amount of damage taken by the target */
  getdmgtaken(var_1): any

  /** Returns the amount of buffs on the target (e.g if the target has Bleed and Rupture on them, return), specify either negative or positive. */
  getbuffcount(var_1): any

  /** Returns the amount of units based off Target, (Example: getunitcount(NoParts99) would return the amount of enemies alive.) */
  getunitcount(var_1): any

  /** Returns the amount of stagger bars on the target */
  getbreakcount(var_1): any

  /** Returns the point of the target's stagger bar */
  getbreakvalue(var_1): any

  /** ~~IM GOING TO KILL MYSELF WHY DOES THIS EXIST~~
  Returns the time according to the parameter. */
  gettime(var_1): any

  /** Returns certain stats of the specified unit based on the parameters */
  getstat(var_1): any

  /** Returns 1 if a coin has been rerolled; otherwise, returns 0 */
  iscoinrerolled(): any

  /** Gets the [stage extra slot](https://rentry.co/glitchscript#stagescript-only) */
  stageextraslot(var_1): any

  /** Returns bloodfeast based on the variable given */
  getbloodfeast(var_1): any

  /** Returns the unit's level */
  getlevel(var_1): any

  /** Returns if a Coin is unbreakable (Only usable with timing's that use Coins) */
  isunbreakable(var_1): any

  /** Returns if a Coin is usable in a duel (Only usable with timing's that use Coins) */
  isusableinduel(var_1): any

  /** Returns 1 if the 2 inputs result in the same unit, otherwise returns 0 */
  issameunit(var_1, var_2): any

  /** Returns 0 if null or backup disabled. Returns 1 if enabled. */
  isbackupenabled(var_1): any

  /** Counts the amount of un-initialized Backup units in a team. */
  countbackup(var_1, var_2): any

  /** Returns 1 if the 2 inputs result in the same unit, otherwise returns 0 */
  issameunit(var_1, var_2): any

  /** Returns `1` if the Skill can Duel, `0` if not. */
  getskillcanduel(var_1): any

  /** Returns `1` if the Skill can kill allies, `0` if not. */
  getskillteamkill(var_1): any

  /** Returns `1` if the Skill has a fixed target, `0` if not. */
  getskillfixedtarget(var_1): any

  /** Returns the amount of damage that this unit has taken */
  gethpdmg(): any

  /** Returns an integer to represent the Coin's operator.
  `1` is `ADD`
  `2` is `SUB`
  `3` is `MUL` */
  getcoinoperator(var_1): any

  /** Returns an integer to represent the Buff's type.
  `0` is `Neutral`
  `1` is `Positive`
  `2` is `Negative` */
  getbufftype(var_1): any

  /** Returns an integer that represents the resistance value. (Does not work on Abnormalities.)
  x0.75 -> 75 */
  getatkres(var_1): any

  /** Returns an integer that represents the resistance value. (Does not work on Abnormalities.)
  x0.01 -> 1 */
  getatkres(var_1): any

  /** Returns:
  `-1` if the unit doesn't exist
  `0` if no skills were used last turn.
  `1` if the unit used at least one skill last turn. */
  diduseskilllastturn(var_1): any

  /** Returns `1` if the unit used a defense action this turn, otherwise, returns `0` */
  hasuseddefense(var_1): any

  /** Returns an integer representing the unit's faction. 
  Returns `1` for the Sinners/Assistants
  Returns `0` for any enemy */
  getunitfaction(var_1): any

  /** Returns an integer representing the status of the chain of Skills on the Dashboard.
  Returns `0` if Skills cannot be found
  Returns `1` if only attack and counter Skills are chained
  Returns `2` if only guard and evade Skills are chained
  Returns `3` if any mix of attack and defence Skills are chained */
  getchainstatus(var_1): any

  /** Returns an integer representing the amount of sins in the Dashboard */
  getsinsindashboard(var_1, var_2, opt_3): any

  
}/*END*/


// __Section Beta