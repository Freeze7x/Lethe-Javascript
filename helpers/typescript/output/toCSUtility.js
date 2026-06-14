// This file is auto-generated for review purposes.

"use strict";
class UnitPropertyClass {
    parent;
    constructor(parent) {
        this.parent = parent;
    }
    get target() {
        return this.parent.target;
    }
    ;
    get getTargetOrSelf() {
        return this.parent.getIsTargetOrSelf;
        // return this.parent.target as "Self";
    }
}
/** A class representing a unit in the game. */
class Unit {
    get isSelf() {
        return !!this.invoke("issameunit", "Self");
    }
    /** Returns a string usable by functions that only take "Self" or "Target". */
    get getIsTargetOrSelf() {
        if (this.isSelf)
            return "Self";
        return "Target";
    }
    /** Classes that serve as categories for properties. */
    static GROUPS = {
        Hp: class extends UnitPropertyClass {
            /** The maximum HP this unit can have. */
            get max() { return this.parent.battleUnitModel.MaxHp; }
            set max(v) {
                InvokeModular("setmaxhp", this.target, v);
            }
            /** How much HP this unit has. */
            get current() {
                return this.parent.battleUnitModel.Hp;
            }
            set current(v) {
                InvokeModular("healhp", this.target, (v | 0) - this.current);
            }
            /** The HP% of this unit. */
            get normalized() { return this.current / this.max; }
            /** Heal this unit by a certain amount. */
            heal(amount) {
                InvokeModular("healhp", this.target, amount);
            }
            /** Heal this unit by a percentage of its max HP  */
            healPercent(percentAsFloat) {
                InvokeModular("healhp", this.target, this.max * percentAsFloat);
            }
        },
        Speed: class extends UnitPropertyClass {
            /** The minimum speed roll for this unit. */
            get min() { return InvokeModular("getstat", this.target, "speedMin"); }
            /** The maximum speed roll for this unit. */
            get max() { return InvokeModular("getstat", this.target, "speedMax"); }
            /** The current speed for this unit. */
            get current() { return InvokeModular("getspeed", this.target); }
            /**
             * Get the speed of a specific slot.
             * @param index - The slot index
             */
            getSlotSpeed(index) { return InvokeModular("getspeed", this.target, index); }
        },
        Stagger: class extends UnitPropertyClass {
            /**
             * Add a stagger bar at a specific HP threshold.
             */
            addAt(hp) { InvokeModular("breakaddbar", this.target, hp); }
            /**
             * Trigger tremor burst on this unit.
             * @param times - Number of times to trigger. (defaults to once)
             * @param lowerCount - Lower the count of Tremor by this amount.
             */
            tremorBurst(times, lowerCount) {
                InvokeModular("burst", this.target, times ?? 1);
                if (lowerCount) {
                    InvokeModular("buff", this.target, "Vibration", 0, -lowerCount, 0);
                }
            }
            /**
             * Raise this unit's stagger threshold by the provided amount.
             * @param amount - The amount of stagger damage.
             * @param times - Number of times to trigger.
             */
            staggerDamage(amount, times) {
                InvokeModular("breakdmg", this.target, amount ?? 1, times);
            }
            /**
             * Instantly stagger this unit.
             * @param type - Type of stagger: "natural", "force", or "both" (optional)
             */
            instantStagger(type) {
                InvokeModular("break", this.target, type);
            }
            /**
             * Immediately recover from stagger.
             */
            recover() { InvokeModular("breakrecover", this.target); }
            /**
             * Get all stagger thresholds.
             * @returns Array of stagger threshold values
             */
            getThresholds() {
                return new Array(InvokeModular("getbreakcount", this.target)).fill(null).map((_, index) => {
                    return InvokeModular("getbreakvalue", this.target, index);
                });
            }
        },
        Buff: class extends UnitPropertyClass {
            /**
             * Get buff information on this unit by keyword.
             * @param keyword - The buff keyword to look up
             */
            get(keyword) {
                return {
                    potency: InvokeModular("getbuff", this.target, keyword, "stack"),
                    count: InvokeModular("getbuff", this.target, keyword, "turn"),
                    consumed: InvokeModular("getbuff", this.target, keyword, "consumed"),
                };
            }
            /**
             * Give this unit a buff.
             * @param keyword - The buff keyword.
             * @param potency - How much potency to inflict.
             * @param count - How much count to inflict.
             * @param activeRound - When the buff should become active.
             */
            add(keyword, potency, count, activeRound, use) {
                const turnToAcivate = activeRound == undefined ? 0 : { "this turn": 0, "next turn": 1, "this and next turn": 2 }[activeRound];
                InvokeModular("buff", this.target, keyword, potency, count, turnToAcivate, use ? "use" : undefined);
            }
            /**
             * Inflict a buff on a target unit.
             * @param target - The unit to inflict the buff on.
             * @param keyword - The buff keyword.
             * @param potency - How much potency to inflict.
             * @param count - How much count to inflict.
             * @param activeRound - When the buff should become active.
             */
            inflict(target, keyword, potency, count, activeRound) {
                target.buff.add(keyword, potency, count, activeRound, true);
            }
            /**
             * Get the count of buffs on this unit.
             * @param type - The type of buff to count.
             */
            getCount(type) {
                return type ?
                    InvokeModular("getbuffcount", this.target, type) :
                    InvokeModular("getbuffcount", this.target, "neg") + InvokeModular("getbuffcount", this.target, "pos");
            }
        },
        Passive: class extends UnitPropertyClass {
            /**
             * Adds a passive to this unit.
             * @param id The passive ID to add.
             * @param allowDupe If true, allows duplicates of the passive to be added. (default: false)
             */
            add(id, allowDupe) {
                InvokeModular("passiveadd", this.target, id, allowDupe ? "yesdupe" : "nodupe");
            }
            /**
             * Removes a passive from this unit.
             * @param id The passive ID to remove.
             */
            remove(id) {
                InvokeModular("passiveremove", this.target, id);
            }
            /**
             * Check to see if this unit has a specific passive.
             * @param id The passive ID to check.
             */
            has(id) {
                return !!InvokeModular("haspassive", this.target, id);
            }
        },
        Skill: class extends UnitPropertyClass {
            /** The current skill's base power. */
            get basePower() { return InvokeModular("getskillbase", this.getTargetOrSelf); }
            /** Add to the skill's base power. */
            addBasePower(v) { InvokeModular("base", v); }
            /** The current skill's coin power. */
            get coinPower() { return InvokeModular("getcoinscale", this.getTargetOrSelf, 0); }
            /** Add to the current skill's coin power. */
            addCoinPower(v) { InvokeModular("scale", v); }
            /** The current skill's coin power at a specific index. */
            getCoinAtIndexPower(index) { return InvokeModular("getcoinscale", this.getTargetOrSelf, index); }
            /** Add to the current skill's clash power. */
            addClashPower(v) { InvokeModular("clash", v); }
            /** Get the current skill's power. */
            get power() { return InvokeModular("getcurrentpower", this.getTargetOrSelf); }
            /** Get the current skill's rank. */
            get rank() { return InvokeModular("getskillrank", this.getTargetOrSelf); }
            /** Get or set the skill's attack weight. */
            get weight() { return InvokeModular("getskillatkweight", this.getTargetOrSelf); }
            set weight(v) {
                v |= 0;
                const cur = InvokeModular("getskillatkweight", this.getTargetOrSelf);
                InvokeModular("atkweight", v - cur);
            }
            /** Get the current skill's level correction + this unit's offense level. */
            get level() { return InvokeModular("getskilllevel", this.getTargetOrSelf); }
            /** Get the current skill's level correction. */
            get correction() { return InvokeModular("getskillatklevel", this.getTargetOrSelf); }
            /** The current skill's attack type. */
            get attackType() {
                switch (InvokeModular("getskillatk", this.getTargetOrSelf)) {
                    case 0: return "slash";
                    case 1: return "pierce";
                    case 2: return "blunt";
                    default: return "none";
                }
            }
            set attackType(v) {
                if (!this.parent.isSelf)
                    return;
                switch (v) {
                    case "slash": InvokeModular("changeatktype", "SLASH");
                    case "pierce": InvokeModular("changeatktype", "PENETRATE");
                    case "blunt": InvokeModular("changeatktype", "HIT");
                }
            }
            /** The current skill's sin affinity. */
            get sin() {
                switch (InvokeModular("getskillattribute", this.getTargetOrSelf)) {
                    case 0: return "wrath";
                    case 1: return "lust";
                    case 2: return "sloth";
                    case 3: return "gluttony";
                    case 4: return "gloom";
                    case 5: return "pride";
                    case 6: return "envy";
                    default: return "none";
                }
            }
            set sin(v) {
                if (!this.parent.isSelf)
                    return;
                switch (v) {
                    case "wrath": InvokeModular("changeaffinity", "CRIMSON");
                    case "lust": InvokeModular("changeaffinity", "SCARLET");
                    case "sloth": InvokeModular("changeaffinity", "AMBER");
                    case "gluttony": InvokeModular("changeaffinity", "SHAMROCK");
                    case "gloom": InvokeModular("changeaffinity", "AZURE");
                    case "pride": InvokeModular("changeaffinity", "INDIGO");
                    case "envy": InvokeModular("changeaffinity", "VIOLET");
                    default: InvokeModular("changeaffinity", "NEUTRAL");
                }
            }
            /** The current skill's defense type, if any. */
            get defenseType() {
                switch (InvokeModular("getskilldeftype", this.getTargetOrSelf)) {
                    case 1: return "guard";
                    case 2: return "evade";
                    case 3: return "counter";
                    case 4: return "attack";
                    default: return "none";
                }
            }
            /** Get the skill's ID. */
            get id() {
                const id = InvokeModular("getskillid");
                return id !== -1 ? id : null;
            }
            get operator() {
                switch (InvokeModular("getcoinoperator", this.getTargetOrSelf, 0)) {
                    case 1: return "+";
                    case 2: return "-";
                    case 3: return "*";
                    default: return "?";
                }
            }
            set operator(v) {
                if (v === "?")
                    return;
                InvokeModular("scale", { "+": "ADD", "-": "SUB", "*": "MUL" }[v]);
            }
            /** Whether the current skill is clashable. */
            get clashable() { return !!InvokeModular("getskillcanduel", this.target); }
            set clashable(v) { InvokeModular("skillcanduel", v ? "True" : "False"); }
        },
        Shield: class extends UnitPropertyClass {
            /** How much shield this unit has. */
            get amount() { return InvokeModular("getshield", this.target); }
            /**
             * Give shield for this unit.
             * @param amount - The amount of shield to gain
             * @param persist - Whether the shield should persist permanently
             */
            gainShield(amount, persist) {
                InvokeModular("shield", this.target, amount, persist ? "perm" : undefined);
            }
            ;
        },
        Meta: class extends UnitPropertyClass {
            /** This unit's UID. */
            get unitId() { return InvokeModular("getid", this.target); }
            /** This unit's instance ID. */
            get instId() { return InvokeModular("getinstid", this.target); }
            /** This unit's Character ID. Only for Sinners */
            get characterId() { return InvokeModular("getcharacterid", this.target); }
            /**
            * Check if this unit has a keyword or association.
            * @param keywordAssoc - A keyword or array of keywords to check
            * @param matchAny - If true, match any keyword (OR); if false/not specified, match all keywords (AND)
            */
            hasKeywordOrAssociation(keywordAssoc, matchAny) {
                return !!InvokeModular("haskey", this.target, matchAny ? "OR" : "AND", ...(Array.isArray(keywordAssoc) ? keywordAssoc : [keywordAssoc]));
            }
        },
        Ability: class extends UnitPropertyClass {
            add(systemAbility, stack, turn, activeRound) {
                InvokeModular("addability", this.target, systemAbility, stack, turn, activeRound);
            }
            remove(systemAbility) {
                InvokeModular("removeability", this.target, systemAbility);
            }
        },
        Damage: class extends UnitPropertyClass {
            bonus(amount, args) {
                let sin = -1;
                let type = -1;
                if (args) {
                    if (args.sin)
                        switch (args.sin) {
                            case "wrath": sin = 0;
                            case "lust": sin = 1;
                            case "sloth": sin = 2;
                            case "gluttony": sin = 3;
                            case "gloom": sin = 4;
                            case "pride": sin = 5;
                            case "envy": sin = 6;
                        }
                    if (args.type)
                        switch (args.type) {
                            case "slash": type = 0;
                            case "pierce": type = 1;
                            case "blunt": type = 2;
                        }
                }
                this.parent.invoke("bonusdmg", amount, type, sin);
            }
        },
    };
    constructor(bum) {
        this.battleUnitModel = bum;
        this.instanceId = this.battleUnitModel.InstanceID;
        this.target = "inst" + this.instanceId;
    }
    /** A reference to the in-game BattleUnitModel that it represents.
     *
     *  Be careful using this, as a lot of things may not work as you think outside of the intended context
     */
    battleUnitModel;
    instanceId;
    target;
    /** Invokes a modular function, with the first parameter as this unit's target selector.
     * * Do not use this to invoke functions that don't use targets as the first parameter.
     */
    invoke(funcName, ...args) {
        return InvokeModular(funcName, this.target, ...args);
    }
    /** Returns whether this unit is an ally (left side) or an enemy (right side). */
    get faction() { return ["enemy", "ally"][InvokeModular("getunitfaction", this.target)]; }
    /** The level of this unit. */
    get level() { return InvokeModular("getlevel", this.target); }
    set level(v) {
        v |= 0;
        InvokeModular("setlevel", this.target, v);
    }
    /** The SP value for this unit. */
    get sp() { return InvokeModular("getsp", this.target); }
    set sp(v) {
        v |= 0;
        const cur = InvokeModular("getsp", this.target);
        InvokeModular("healsp", this.target, v - cur);
    }
    /**
     * Check if this unit is actionable.
     * If the unit does not exist, this returns null.
     */
    actionable() {
        switch (InvokeModular("isactionable", this.target)) {
            case 0: return false;
            case 1: return true;
            default: return null;
        }
    }
    hp = new Unit.GROUPS.Hp(this);
    speed = new Unit.GROUPS.Speed(this);
    stagger = new Unit.GROUPS.Stagger(this);
    buff = new Unit.GROUPS.Buff(this);
    passive = new Unit.GROUPS.Passive(this);
    skill = new Unit.GROUPS.Skill(this);
    shield = new Unit.GROUPS.Shield(this);
    meta = new Unit.GROUPS.Meta(this);
    ability = new Unit.GROUPS.Ability(this);
    resist = new Proxy(this, {
        get(self, p) {
            switch (p) {
                case "slash": return self.invoke("getatkres", "SLASH") / 100;
                case "pierce": return self.invoke("getatkres", "PENETRATE") / 100;
                case "blunt": return self.invoke("getatkres", "HIT") / 100;
                case "wrath": return self.invoke("getsinres", "CRIMSON") / 100;
                case "lust": return self.invoke("getsinres", "SCARLET") / 100;
                case "sloth": return self.invoke("getsinres", "AMBER") / 100;
                case "gluttony": return self.invoke("getsinres", "SHAMROCK") / 100;
                case "gloom": return self.invoke("getsinres", "AZURE") / 100;
                case "pride": return self.invoke("getsinres", "INDIGO") / 100;
                case "envy": return self.invoke("getsinres", "VIOLET") / 100;
            }
        },
        set(self, p, value) {
            switch (p) {
                case "slash":
                    self.invoke("ovwatkres", "SLASH", (value * 100) | 0);
                    return true;
                case "pierce":
                    self.invoke("ovwatkres", "PENETRATE", (value * 100) | 0);
                    return true;
                case "blunt":
                    self.invoke("ovwatkres", "HIT", (value * 100) | 0);
                    return true;
                case "wrath":
                    self.invoke("ovwsinres", "CRIMSON", (value * 100) | 0);
                    return true;
                case "lust":
                    self.invoke("ovwsinres", "SCARLET", (value * 100) | 0);
                    return true;
                case "sloth":
                    self.invoke("ovwsinres", "AMBER", (value * 100) | 0);
                    return true;
                case "gluttony":
                    self.invoke("ovwsinres", "SHAMROCK", (value * 100) | 0);
                    return true;
                case "gloom":
                    self.invoke("ovwsinres", "AZURE", (value * 100) | 0);
                    return true;
                case "pride":
                    self.invoke("ovwsinres", "INDIGO", (value * 100) | 0);
                    return true;
                case "envy":
                    self.invoke("ovwsinres", "VIOLET", (value * 100) | 0);
                    return true;
            }
            return false;
        }
    });
}
/** A collection of properties related to the current encounter. */
const Encounter = {
    get turn() { return InvokeModular("getround"); },
    get wave() { return InvokeModular("getwave"); },
    get id() { return InvokeModular("getencounteruid"); }
};
/** A collection of mathematical functions not available in the standard Math object. */
const Mathf = {
    // ...Math,
    /** Clamp a value between a minimum and maximum. */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    lerp(start, end, t) {
        return start + (end - start) * t;
    },
    /** Get the value of a number rounded to the nearest multiple of a given number. */
    roundToMultiple(value, multiple) {
        return Math.round(value / multiple) * multiple;
    },
    /** Get the value of a number rounded down to the nearest multiple of a given number. */
    floorToMultiple(value, multiple) {
        return Math.floor(value / multiple) * multiple;
    },
    /** Returns a pseudorandom number between the provided values, or 0 and 1 if none provided. */
    random(x, y) {
        if (x === undefined)
            return Math.random();
        if (y === undefined)
            return Math.random() * x;
        return (Math.random() * (y - x)) + x;
    }
};
const __UnitCache__ = {
    registry: new WeakMap(),
    encounterId: null,
    get(bum) {
        return this.registry.get(bum) ?? this.registry.set(bum, new Unit(bum)).get(bum);
    },
    resetIfEncounterUpdated() {
        if (this.encounterId !== Encounter.id) {
            this.registry = new WeakMap();
            this.encounterId = Encounter.id;
        }
    }
};
/*
const __OldUnits = new Proxy<Record<(string & {}) | MultiTarget, Unit>>({} as any, {
    get(target, targetSelector) {
        if (typeof targetSelector !== "string")
            throw new Error("Symbol keys are not usable here.");

        const unit = target[targetSelector] ??= new Unit(targetSelector);
        return unit;
    },
});

/** Returns a Unit based on the Modular target selector. */
function GetUnit(target) {
    try {
        // This will throw if modular gets angry idfk.
        const bum = JSPipeline.GetBattleUnitModelFromTarget(target);
        return __UnitCache__.get(bum);
    }
    catch (e) {
        return null;
    }
}
/** Declares the behaviour of this file.
*
* Ensure that the array contains explict strings, and not variable/property references.
*
* The top-most instance of redeclaration in the file will be read.
* * `do-not-load`/`import-only` prevents the file from being loaded at all.
*     * `import-only` should be used to clarify it's an import.
*     * `do-not-load` should be used to "deactivate" scripts.
*/
let ScriptBehaviour;
ScriptBehaviour = [];
