// This file is auto-generated for review purposes.

"use strict";
class UnitPropertyClass {
    parent;
    constructor(parent) {
        this.parent = parent;
    }
    invoke(funcName, ...args) {
        return this.parent.invoke(funcName, ...args);
    }
    get target() {
        return this.parent.target;
    }
    ;
    get selfOrTarget() {
        return this.parent.selfOrTarget;
    }
}
/** A class representing a unit in the game. */
class Unit {
    constructor(bum) {
        this.battleUnitModel = bum;
        const coreBum = JSPipeline.BattleUnitModelUtility.GetCore(bum);
        this.core = coreBum ? Unit.unitCache.get(coreBum) : null;
        this.instanceId = this.battleUnitModel.InstanceID;
        this.target = "inst" + this.instanceId;
    }
    get isSelf() { return !!this.invoke("issameunit", "Self"); }
    /** Returns a string usable by functions that only take "Self" or "Target". */
    get selfOrTarget() {
        return this.isSelf ? "Self" : "Target";
    }
    core;
    static unitCache = {
        registry: new WeakMap(),
        get(bum) {
            return this.registry.get(bum) ??
                this.registry.set(bum, new Unit(bum)).get(bum);
        }
    };
    /** Returns a Unit based on the Modular target selector. */
    static get(target) {
        return this.getAny(target);
    }
    static getAny(target) {
        try {
            // This will throw if modular gets angry idfk.
            const bum = JSPipeline.GetBattleUnitModelFromTarget(target);
            return this.unitCache.get(bum);
        }
        catch (e) {
            return null;
        }
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
                // InvokeModular("healhp", this.target, (v | 0) - this.current);
                JSPipeline.BattleUnitModelUtility.ChangeHp(this.parent.battleUnitModel, v | 0);
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
            addBarAt(hp) { this.invoke("breakaddbar", hp); }
            /**
             *
             * @param barIndex The index to remove. If negative, counts from the end instead
             * Removes a stagger threshold at an index in descending order.
             */
            removeBar(barIndex) {
                if (barIndex === "all") {
                    this.invoke("deactivebreak", true, -1);
                    return;
                }
                barIndex |= 0;
                if (barIndex >= 0)
                    this.invoke("deactivebreak", true, barIndex);
                else
                    this.invoke("deactivebreak", true, -1 - barIndex, true);
            }
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
             * Raise or lower this unit's stagger threshold by the provided amount.
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
                return Array.from({ length: InvokeModular("getbreakcount", this.target) }, (_, index) => InvokeModular("getbreakvalue", this.target, index));
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
                const turnToActivate = activeRound == undefined ? 0 : { "this turn": 0, "next turn": 1, "this and next turn": 2 }[activeRound];
                InvokeModular("buff", this.target, keyword, potency, count, turnToActivate, use ? "use" : undefined);
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
                    InvokeModular("getbuffcount", this.target, { negative: "neg", positive: "pos" }[type]) :
                    InvokeModular("getbuffcount", this.target, "neg") + InvokeModular("getbuffcount", this.target, "pos");
            }
            amplitudeConversion(buff, superPosition) {
                if (superPosition)
                    this.invoke("vibrationswitch", buff, true);
                else
                    this.invoke("vibrationswitch", buff);
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
            get basePower() { return InvokeModular("getskillbase", this.selfOrTarget); }
            /** Add to the skill's base power. */
            addBasePower(v) {
                if (!this.parent.isSelf)
                    return;
                InvokeModular("base", v);
            }
            /** The current skill's coin power. */
            get coinPower() { return InvokeModular("getcoinscale", this.selfOrTarget, 0); }
            /** Add to the current skill's coin power. */
            addCoinPower(v) {
                if (!this.parent.isSelf)
                    return;
                InvokeModular("scale", v);
            }
            /** The current skill's coin power at a specific index. */
            getCoinAtIndexPower(index) {
                return InvokeModular("getcoinscale", this.selfOrTarget, index);
            }
            /** Add to the current skill's clash power. */
            addClashPower(v) {
                if (!this.parent.isSelf)
                    return;
                InvokeModular("clash", v);
            }
            /** Get the current skill's power. */
            get power() { return InvokeModular("getcurrentpower", this.selfOrTarget); }
            /** Get the current skill's rank. */
            get rank() { return InvokeModular("getskillrank", this.selfOrTarget); }
            /** Get or set the skill's attack weight. */
            get weight() { return InvokeModular("getskillatkweight", this.selfOrTarget); }
            set weight(v) {
                v |= 0;
                const cur = InvokeModular("getskillatkweight", this.selfOrTarget);
                InvokeModular("atkweight", v - cur);
            }
            /** Get the current skill's level correction + this unit's offense level. */
            get level() { return InvokeModular("getskilllevel", this.selfOrTarget); }
            /** Get the current skill's level correction. */
            get correction() { return InvokeModular("getskillatklevel", this.selfOrTarget); }
            /** The current skill's attack type. */
            get attackType() {
                switch (InvokeModular("getskillatk", this.selfOrTarget)) {
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
                    case "slash":
                        InvokeModular("changeatktype", "SLASH");
                        break;
                    case "pierce":
                        InvokeModular("changeatktype", "PENETRATE");
                        break;
                    case "blunt":
                        InvokeModular("changeatktype", "HIT");
                        break;
                }
            }
            /** The current skill's sin affinity. */
            get sin() {
                switch (InvokeModular("getskillattribute", this.selfOrTarget)) {
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
                    case "wrath":
                        InvokeModular("changeaffinity", "CRIMSON");
                        break;
                    case "lust":
                        InvokeModular("changeaffinity", "SCARLET");
                        break;
                    case "sloth":
                        InvokeModular("changeaffinity", "AMBER");
                        break;
                    case "gluttony":
                        InvokeModular("changeaffinity", "SHAMROCK");
                        break;
                    case "gloom":
                        InvokeModular("changeaffinity", "AZURE");
                        break;
                    case "pride":
                        InvokeModular("changeaffinity", "INDIGO");
                        break;
                    case "envy":
                        InvokeModular("changeaffinity", "VIOLET");
                        break;
                    default: InvokeModular("changeaffinity", "NEUTRAL");
                }
            }
            /** The current skill's defense type, if any. */
            get defenseType() {
                switch (InvokeModular("getskilldeftype", this.selfOrTarget)) {
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
                switch (InvokeModular("getcoinoperator", this.selfOrTarget, 0)) {
                    case 1: return "+";
                    case 2: return "-";
                    case 3: return "*";
                    default: return "?";
                }
            }
            set operator(v) {
                if (!this.parent.isSelf)
                    return;
                if (v === "?")
                    return;
                InvokeModular("scale", { "+": "ADD", "-": "SUB", "*": "MUL" }[v]);
            }
            /** https://rentry.co/glitchscript#assistdefensevar_1var_2var_3 */
            assistDefend(target, skillId) {
                this.invoke("assistdefense", target.target, skillId);
            }
            gainSlot(amount) {
                for (let i = 0; i < amount; i++)
                    this.invoke("skillslotgive");
            }
            /**
             * @param index 0-based
             */
            removeSlot(index) {
                this.invoke("skillslotremove", index + 1);
            }
            discard(tier, amount = 1) {
                if (!this.parent.isSelf)
                    return;
                const lu = {
                    highest: "DESCENDING",
                    lowest: "ASCENDING",
                    random: "RANDOM"
                };
                InvokeModular("discard", lu[tier], amount);
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
            /** The sinner this unit is, if applicable. */
            get sinner() {
                switch (this.characterId) {
                    case 1: return "yi-sang";
                    case 2: return "faust";
                    case 3: return "don-quixote";
                    case 4: return "ryoshu";
                    case 5: return "meursault";
                    case 6: return "hong-lu";
                    case 7: return "heathcliff";
                    case 8: return "ishmael";
                    case 9: return "rodion";
                    case 10: return "sinclair";
                    case 11: return "outis";
                    case 12: return "gregor";
                    default: return null;
                }
            }
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
                const sinMap = {
                    wrath: 0,
                    lust: 1,
                    sloth: 2,
                    gluttony: 3,
                    gloom: 4,
                    pride: 5,
                    envy: 6
                };
                const typeMap = {
                    slash: 0,
                    pierce: 1,
                    blunt: 2
                };
                if (args?.sin)
                    sin = sinMap[args.sin];
                if (args?.type)
                    type = typeMap[args.type];
                this.invoke("bonusdmg", amount, type, sin);
            }
            sinkingDeluge(amount) {
                this.invoke("deluge", amount);
            }
        },
    };
    static lookup = {
        sin: {
            "wrath": "CRIMSON",
            "lust": "SCARLET",
            "sloth": "AMBER",
            "gluttony": "SHAMROCK",
            "gloom": "AZURE",
            "pride": "INDIGO",
            "envy": "VIOLET",
        }
    };
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
    get actionable() {
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
    damage = new Unit.GROUPS.Damage(this);
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
/** A collection of properties related to combat as a whole. */
class Battle {
    constructor() { }
    static get turn() { return InvokeModular("getround"); }
    static get wave() { return InvokeModular("getwave"); }
    static get id() { return InvokeModular("getencounteruid"); }
    static get encounterType() { return InvokeModular("isfocused") ? "focused" : "unfocused"; }
    static getSinsInDashboard(sin, layer) {
        const sinMap = {
            wrath: "CRIMSON",
            lust: "SCARLET",
            sloth: "AMBER",
            gluttony: "SHAMROCK",
            gloom: "AZURE",
            pride: "INDIGO",
            envy: "VIOLET",
            highest: "HIGHEST",
            lowest: "LOWEST"
        };
        const layerMap = {
            "bottom": ["BOTTOM", 0],
            "top": ["TOP", 0],
            "upcoming": ["NEITHER", 1],
            "bottom-and-top": ["BOTH", 0],
            "bottom-top-and-upcoming": ["BOTH", 1]
        };
        const sinMapped = sinMap[sin] || "HIGHEST";
        const [layerType, upcomingFlag] = layerMap[layer] || ["BOTH", 0];
        return InvokeModular("getsinsindashboard", sinMapped, layerType, upcomingFlag);
    }
    static resourceProxy(getter, setter) {
        return new Proxy({}, {
            get(t, key) {
                switch (key) {
                    case "wrath": return getter(0);
                    case "lust": return getter(1);
                    case "sloth": return getter(2);
                    case "gluttony": return getter(3);
                    case "gloom": return getter(4);
                    case "pride": return getter(5);
                    case "envy": return getter(6);
                    default: return 0;
                }
            },
            set(t, key, value) {
                switch (key) {
                    case "wrath": return setter(0, value);
                    case "lust": return setter(1, value);
                    case "sloth": return setter(2, value);
                    case "gluttony": return setter(3, value);
                    case "gloom": return setter(4, value);
                    case "pride": return setter(5, value);
                    case "envy": return setter(6, value);
                    default: return false;
                }
            }
        });
    }
    static egoResources = {
        ally: this.resourceProxy((i) => InvokeModular("getresource", i), (i, v) => {
            InvokeModular("resource", i, v - InvokeModular("getresource", i));
            return true;
        }),
        enemy: this.resourceProxy((i) => InvokeModular("getresource", i, "Enemy"), (i, v) => {
            InvokeModular("resource", i, v - InvokeModular("getresource", i, "Enemy"), "Enemy");
            return true;
        }),
    };
    static getResonance(sin, perfect) {
        return sin === "highest" ?
            InvokeModular("getresonance", perfect ? "highperfect" : "highres")
            :
                InvokeModular("getresonance", (perfect ? "perfect" : "") + Unit.lookup.sin[sin]);
    }
}
;
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
/**
 * Dynamic proxy for invoking Modular functions.
 *
 * Any property access is treated as a modular function name and returns
 * a callable wrapper around `InvokeModular`.
 *
 * Function names are case-insensitive and cached after first access.
 *
 * @example
 * Modular.healhp("Self", 10);
 * Modular["healsp"]("Self", -10);
 * M.haspassive("Target", 100000);
 */
const Modular = (() => {
    const cache = new Map();
    return new Proxy({}, {
        get(_, funcName) {
            funcName = funcName.toLowerCase();
            if (!cache.has(funcName))
                cache.set(funcName, (...args) => InvokeModular(funcName, ...args));
            return cache.get(funcName);
        },
        set() { return false; }
    });
})(), 
/**@see Modular*/
M = Modular;
const test = [];
class LetheStorage {
    concurDict;
    constructor(concurDict) {
        this.concurDict = concurDict;
    }
    setItem(key, value) {
        this.concurDict[key] =
            typeof value === "string" ? ["string", value] : ["any", JSON.stringify(value)];
    }
    getItem(key) {
        const dat = this.concurDict[key];
        if (!dat)
            return null;
        return dat[0] === "string" ? dat[1] : JSON.parse(dat[1]);
    }
}
//@ts-ignore
const console = {
    log(...args) {
        //@ts-ignore
        return logger.log(args.join(', '));
    },
    error(...args) {
        //@ts-ignore
        return logger.error(args.join(', '));
    }
};
const SessionData = {
    //@ts-ignore
    encounter: new LetheStorage(__encDict), global: new LetheStorage(__gloDict),
};
