import "./modularJS.d.ts";

// # Only Include Below

function property<T, Y>(parent: Y, factory: (parent: Y) => T): T {
    return factory(parent)
}

abstract class UnitPropertyClass {
    constructor(public readonly parent: Unit) {
        this.target = parent.target;
        this._targetAsSelfOrTarget = parent.target as "Self";
    }
    protected target;
    protected _targetAsSelfOrTarget: "Self";
}

/** A class representing a unit in the game. */
class Unit {
    private static TYPES = {
        attackTypes: {
            intToName: {
                3: "none",
                0: "slash",
                1: "pierce",
                2: "blunt",
            },
            nameToInt: {
                "slash": 0,
                "pierce": 1,
                "blunt": 2,
            },
            nameToInternal: {
                "blunt": "HIT",
                "slash": "SLASH",
                "pierce": "PENETRATE",
            }
        },
        sin: {
            intToName: {
                0: "wrath", 1: "lust", 2: "sloth",
                3: "gluttony", 4: "gloom", 5: "pride",
                6: "envy",
                7: "white", 8: "black",
                9: "red", 10: "pale",
                11: "neutral",
            },
            nameToInt: {
                "wrath": 0, "lust": 1, "sloth": 2,
                "gluttony": 3, "gloom": 4, "pride": 5,
                "envy": 6,
                "white": 7, "black": 8,
                "red": 9, "pale": 10,
                "neutral": 11
            },
            nameToInternal: {
                "wrath": "CRIMSON", "lust": "SCARLET", "sloth": "AMBER",
                "gluttony": "SHAMROCK", "gloom": "AZURE", "pride": "INDIGO",
                "envy": "VIOLET",
                "white": "WHITE", "black": "BLACK",
                "red": "RED", "pale": "PALE",
                "neutral": "NEUTRAL"
            }
        },
        defenseType: {
            intToName: {
                0: "none",
                1: "guard",
                2: "evade",
                3: "counter",
                4: "attack",
            },
            nameToInt: {
                "none": 0,
                "guard": 1,
                "evade": 2,
                "counter": 3,
                "attack": 4,
            }
        }
    } as const;

    /** Classes that serve as categories for properties. */
    private static GROUPS = {
        Speed: class extends UnitPropertyClass {
            /** The minimum speed roll for this unit. */
            get min() { return Modular.getstat(this.target, "speedMin") }
            /** The maximum speed roll for this unit. */
            get max() { return Modular.getstat(this.target, "speedMax") }
            /** The current speed for this unit. */
            get current() { return Modular.getspeed(this.target) }
            /**
             * Get the speed of a specific slot.
             * @param index - The slot index
             */
            getSlotSpeed(index: number) { return Modular.getspeed(this.target, index); }
        },
        Stagger: class extends UnitPropertyClass {
            /**
             * Add a stagger bar at a specific HP threshold.
             */
            addAt(hp: number) { Modular.breakaddbar(this.target, hp) }
            /**
             * Trigger tremor burst on this unit.
             * @param times - Number of times to trigger. (defaults to once)
             * @param lowerCount - Lower the count of Tremor by this amount.
             */
            tremorBurst(times?: number, lowerCount?: number) {
                Modular.burst(this.target, times ?? 1);
                if (lowerCount) {
                    Modular.buff(this.target, "Vibration", 0, -lowerCount, 0);
                }
            }
            /**
             * Raise this unit's stagger threshold by the provided amount.
             * @param amount - The amount of stagger damage.
             * @param times - Number of times to trigger.
             */
            staggerDamage(amount?: number, times?: number) {
                Modular.breakdmg(this.target, amount ?? 1, times);
            }
            /**
             * Instantly stagger this unit.
             * @param type - Type of stagger: "natural", "force", or "both" (optional)
             */
            instantStagger(type?: "natural" | "force" | "both") {
                Modular.break(this.target, type);
            }
            /**
             * Immediately recover from stagger.
             */
            recover() { Modular.breakrecover(this.target); }
            /**
             * Get all stagger thresholds.
             * @returns Array of stagger threshold values
             */
            getThresholds() {
                return new Array(Modular.getbreakcount(this.target)).fill(null).map((_, index) => {
                    return Modular.getbreakvalue(this.target, index);
                })
            }
        },
        Buff: class extends UnitPropertyClass {
            /**
             * Get buff information on this unit by keyword.
             * @param keyword - The buff keyword to look up
             */
            get(keyword: string) {
                return {
                    potency: Modular.getbuff(this.target, keyword, "stack") as number,
                    count: Modular.getbuff(this.target, keyword, "turn") as number,
                    consumed: Modular.getbuff(this.target, keyword, "consumed") as number,
                }
            }
            /**
             * Give this unit a buff.
             * @param keyword - The buff keyword.
             * @param potency - How much potency to inflict.
             * @param count - How much count to inflict.
             * @param activeRound - When the buff should become active.
             */
            add(keyword: string, potency: number, count: number, activeRound?: "this turn" | "next turn" | "this and next turn", use?: boolean) {
                const turnToAcivate = activeRound == undefined ? 0 : { "this turn": 0, "next turn": 1, "this and next turn": 2 }[activeRound];
                Modular.buff(this.target, keyword,
                    potency, count,
                    turnToAcivate,
                    use ? "use" : undefined
                );
            }
            /**
             * Get the count of buffs on this unit.
             * @param type - The type of buff to count.
             */
            getCount(type?: "neg" | "pos") {
                return type ?
                    Modular.getbuffcount(this.target, type) :
                    Modular.getbuffcount(this.target, "neg") + Modular.getbuffcount(this.target, "pos");
            }
        },
        Passive: class extends UnitPropertyClass {
            /**
             * Adds a passive to this unit.
             * @param id The passive ID to add.
             * @param allowDupe If true, allows duplicates of the passive to be added. (default: false)
             */
            add(id: number, allowDupe?: boolean) {
                Modular.passiveadd(this.target, id, allowDupe ? "yesdupe" : "nodupe")
            }
            /**
             * Removes a passive from this unit.
             * @param id The passive ID to remove.
             */
            remove(id: number) {
                Modular.passiveremove(this.target, id)
            }
            /**
             * Check to see if this unit has a specific passive.
             * @param id The passive ID to check.
             */
            includes(id: number) {
                return !!Modular.haspassive(this.target, id)
            }
        },
        Skill: class extends UnitPropertyClass {
            /** The current skill's base power. */
            get basePower() { return Modular.getskillbase(this._targetAsSelfOrTarget) }
            /** Add to the skill's base power. */
            addBasePower(v: number) { Modular.base(v); }

            /** The current skill's coin power. */
            get coinPower() { return Modular.getcoinscale(this._targetAsSelfOrTarget, 0) }
            /** Add to the current skill's coin power. */
            addCoinPower(v: number) { Modular.scale(v); }
            /** The current skill's coin power at a specific index. */
            getCoinAtIndexPower(index: number) { return Modular.getcoinscale(this._targetAsSelfOrTarget, index) }

            /** Add to the current skill's clash power. */
            addClashPower(v: number) { Modular.clash(v) }

            /** Get the current skill's power. */
            get power() { return Modular.getcurrentpower(this._targetAsSelfOrTarget); }

            /** Get the current skill's rank. */
            get rank() { return Modular.getskillrank(this._targetAsSelfOrTarget); }

            /** Get or set the skill's attack weight. */
            get weight() { return Modular.getskillatkweight(this._targetAsSelfOrTarget) }
            set weight(v) {
                const cur = Modular.getskillatkweight(this._targetAsSelfOrTarget);
                Modular.atkweight(v - cur);
            }

            /** Get the current skill's level correction + this unit's offense level. */
            get level() { return Modular.getskilllevel(this._targetAsSelfOrTarget) }
            /** Get the current skill's level correction. */
            get correction() { return Modular.getskillatklevel(this._targetAsSelfOrTarget) }

            /** The current skill's attack type. */
            get attackType() {
                return Unit.TYPES.attackTypes.intToName[
                    Modular.getskillatk(this._targetAsSelfOrTarget)
                ] ?? "none"
            }
            set attackType(v) { if (v !== "none") Modular.changeatktype(Unit.TYPES.attackTypes.nameToInternal[v]) }

            /** The current skill's sin affinity. */
            get sin() {
                return Unit.TYPES.sin.intToName[
                    Modular.getskillattribute(this._targetAsSelfOrTarget) as keyof typeof Unit.TYPES.sin.intToName
                ] ?? "neutral"
            }
            set sin(v) { Modular.changeaffinity(Unit.TYPES.sin.nameToInternal[v]); }

            /** The current skill's defense type, if any. */
            get defenseType() {
                return Unit.TYPES.defenseType.intToName[
                    Modular.getskilldeftype(this._targetAsSelfOrTarget) as keyof typeof Unit.TYPES.defenseType.intToName
                ] ?? "none"
            }

            /** Get the skill's ID. */
            get id() {
                const id = Modular.getskillid() as number;
                return id !== -1 ? id : null;
            }

            /** Whether the current skill is clashable. */
            get clashable() { return !!Modular.getskillcanduel(this.target); }
            set clashable(v) { Modular.skillcanduel(v ? "True" : "False"); }
        },
        Shield: class extends UnitPropertyClass {
            /** How much shield this unit has. */
            get amount() { return Modular.getshield(this.target); }
            /**
             * Give shield for this unit.
             * @param amount - The amount of shield to gain
             * @param persist - Whether the shield should persist permanently
             */
            gainShield(amount: number, persist?: boolean) {
                Modular.shield(this.target, amount, persist ? "perm" : undefined);
            }
        },
        Meta: class extends UnitPropertyClass {
            /** This unit's UID. */
            get unitId() { return Modular.getid(this.target) }
            /** This unit's instance ID. */
            get instId() { return Modular.getinstid(this.target) }
            /** This unit's Character ID. Only for Sinners */
            get characterId() { return Modular.getcharacterid(this.target) }
            /**
            * Check if this unit has a keyword or association.
            * @param keywordAssoc - A keyword or array of keywords to check
            * @param matchAny - If true, match any keyword (OR); if false/not specified, match all keywords (AND)
            */
            hasKeywordOrAssociation(keywordAssoc: string | string[], matchAny?: boolean) {
                return !!Modular.haskey(
                    this.target, matchAny ? "OR" : "AND",
                    ...(Array.isArray(keywordAssoc) ? keywordAssoc : [keywordAssoc])
                );
            }
        },
    } as const satisfies Record<string, typeof UnitPropertyClass>

    constructor(public readonly target: string) {
        switch (target) {
            case "Self":
                this.core = new Unit("SelfCore");
                break;
            case "MainTarget":
            case "Target":
                this.core = new Unit(target + "Core");
                break;
            default:
                this.core = null;
        }
    }
    core: Unit | null;

    /** Returns whether this unit is an ally (left side) or an enemy (right side). */
    get faction() { return (["ally", "enemy"] as const)[Modular.getunitfaction(this.target)]; }

    /** The level of this unit. */
    get level() { return Modular.getlevel(this.target) }
    set level(v) {
        //@ts-ignore 
        Modular.setlevel(this.target, v)
    }

    /** How much HP this unit has. */
    get hp() { return Modular.gethp(this.target, "normal"); }
    set hp(v) {
        const cur = Modular.gethp(this.target, "normal");
        Modular.healhp(this.target, v - cur);
    }

    /** The maximum HP this unit can have. */
    get maxHp() { return Modular.gethp(this.target, "max") }
    set maxHp(v) {
        //@ts-ignore
        Modular.setmaxhp(this.target, v)
    }

    /** The SP value for this unit. */
    get sp() { return Modular.getsp(this.target) }
    set sp(v) {
        const cur = Modular.getsp(this.target);
        Modular.healsp(this.target, v - cur);
    }

    /**
     * Check if this unit is actionable.
     * If the unit does not exist, this returns null.
     */
    actionable() {
        switch (Modular.isactionable(this.target)) {
            case 0: return false;
            case 1: return true;
            default: return null
        }
    }

    speed = new Unit.GROUPS.Speed(this);
    stagger = new Unit.GROUPS.Stagger(this);
    buff = new Unit.GROUPS.Buff(this);
    passive = new Unit.GROUPS.Passive(this);
    skill = new Unit.GROUPS.Skill(this);
    shield = new Unit.GROUPS.Shield(this);
    meta = new Unit.GROUPS.Meta(this);

    /** The resistance values for this unit. */
    resist = property(this, self => {
        type Resist = keyof (typeof Unit.TYPES.attackTypes.nameToInternal & typeof Unit.TYPES.sin.nameToInternal);
        return new Proxy<{ [K in Resist]: number }>({} as any, {
            get(_, key) {
                const atkType = Unit.TYPES.attackTypes.nameToInternal[key as keyof typeof Unit.TYPES.attackTypes.nameToInternal]
                if (atkType)
                    return Modular.getatkres(self.target, atkType) / 100;

                const sin = Unit.TYPES.sin.nameToInternal[key as keyof typeof Unit.TYPES.sin.nameToInternal];
                if (sin)
                    //@ts-ignore
                    return Modular.getsinres(self.target, sin) / 100;

                return 0;
            },
            set(_, key, v) {
                const atkType = Unit.TYPES.attackTypes.nameToInternal[key as keyof typeof Unit.TYPES.attackTypes.nameToInternal]
                if (atkType) {
                    Modular.ovwatkres(self.target, atkType, v * 100);
                    return true;
                }
                const sin = Unit.TYPES.sin.nameToInternal[key as keyof typeof Unit.TYPES.sin.nameToInternal];

                if (sin) {
                    Modular.ovwsinres(self.target, sin, v * 100);
                    return true;
                }
                return false;
            }
        })
    })
}

const self = new Unit("Self");

Modular.buff("Self", "Laceration", 5, 5, 0);
self.skill.weight += 2

function CreateUnitTarget(target: string) { return new Unit(target); }

const Mathf = {
    ...Math,
    /** Clamp a value between a minimum and maximum. */
    clamp(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max);
    },
    lerp(start: number, end: number, t: number) {
        return start + (end - start) * t;
    },
    /** Get the value of a number rounded to the nearest multiple of a given number. */
    roundToMultiple(value: number, multiple: number) {
        return Math.round(value / multiple) * multiple;
    },
    /** Get the value of a number rounded down to the nearest multiple of a given number. */
    floorToMultiple(value: number, multiple: number) {
        return Math.floor(value / multiple) * multiple;
    },
    /** Returns a pseudorandom number between the provided values, or 0 and 1 if none provided. */
    random(x?: number, y?: number) {
        if (x === undefined) return Math.random();
        if (y === undefined) return Math.random() * x;
        return (Math.random() * (y - x)) + x;
    }
}

const Units = {
    self: new Unit("Self"),
    mainTarget: new Unit("MainTarget"),
}

function InvokeModular(name: string, ...args: any[]) {
    const func = Modular[name as unknown as keyof typeof Modular];
    if (!func) {
        Logger.error(`Could not find function ${name}`)
        return 0;
    }
    //@ts-ignore
    return +func(...args);
}

type Units = typeof Units;
type Mathf = typeof Mathf;
type CreateUnitTarget = typeof CreateUnitTarget;
type InvokeModular = typeof InvokeModular;

declare global {
    /** References to the self and main target units. */
    const Units: Units;
    const CreateUnitTarget: CreateUnitTarget;

    const InvokeModular: InvokeModular;

    /**
    * Contains functions that allow you to read and write files, as well as list directories and files.
    * * Full system access is disabled by default, so read methods can only access the plugin's folder, and write methods can only write inside of the mod's folder.
    */
    const IO: {
        /** The user's profile folder, or an empty string if full IO access is not enabled. */
        readonly userFolder: string;
        /** Reads a file's content. If the file doesn't exist, this will return an empty string. */
        read(fileDir: string): string;
        /** Writes content to a file. If the file doesn't exist, it will be created. If it already exists, it will be overwritten. */
        write(fileDir: string, content: string): boolean;
        /** Lists all directory names in a directory. If the directory doesn't exist, this will return an empty iterable. */
        listDirectories(folderDir: string): Iterable<string>;
        /** Lists all file names and their extension in a directory. If the directory doesn't exist, this will return an empty iterable. */
        listFiles(folderDir: string): Iterable<string>;
        /** Deletes a file. Returns true if the file was successfully deleted, false otherwise. */
        delete(fileDir: string): boolean;
    }
    /**
     * Writable Record that persists throughout the encounter. 
     * It is recommended that you apply a property directly to it under your mod's name
     * or a similar identifier, and write inside of that property to avoid collisions.
    */
    const EncounterData: Record<any, any>
    /**
     * Writable Record that persists throughout the Limbus Company session. 
     * It is recommended that you apply a property directly to it under your mod's name
     * or a similar identifier, and write inside of that property to avoid collisions.
    */
    const GlobalData: Record<any, any>;
    /** A logger for recording messages and errors. */
    const Logger: {
        log(toLog: any): void
        error(toLog: any): void
    };
    /** An extension of the intrinsic `Math` object that provides additional mathematics functionality and constants. */
    const Mathf: Mathf;
}