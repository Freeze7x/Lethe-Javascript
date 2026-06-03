import "../../../typescript/modularJS.d.ts"

// # Only Include Below

function property<T>(parent: Unit, factory: (parent: Unit) => T): T {
    return factory(parent)
}

class Unit {
    private static TYPES = {
        attackTypes: {
            nToS: {
                3: "none",
                0: "slash",
                1: "pierce",
                2: "blunt",
            },
            sToN: {
                "slash": 0,
                "pierce": 1,
                "blunt": 2,
            },
            sToI: {
                "blunt": "HIT",
                "slash": "SLASH",
                "pierce": "PENETRATE",
            }
        },
        sin: {
            nToS: {
                0: "wrath", 1: "lust", 2: "sloth",
                3: "gluttony", 4: "gloom", 5: "pride",
                6: "envy",
                7: "white", 8: "black",
                9: "red", 10: "pale",
                11: "neutral",
            },
            sToN: {
                "wrath": 0, "lust": 1, "sloth": 2,
                "gluttony": 3, "gloom": 4, "pride": 5,
                "envy": 6,
                "white": 7, "black": 8,
                "red": 9, "pale": 10,
                "neutral": 11
            },
            sToI: {
                "wrath": "CRIMSON", "lust": "SCARLET", "sloth": "AMBER",
                "gluttony": "SHAMROCK", "gloom": "AZURE", "pride": "INDIGO",
                "envy": "VIOLET",
                "white": "WHITE", "black": "BLACK",
                "red": "RED", "pale": "PALE",
                "neutral": "NEUTRAL"
            }
        },
        defenseType: {
            nToS: {
                0: "none",
                1: "guard",
                2: "evade",
                3: "counter",
                4: "attack",
            },
            sToN: {
                "none": 0,
                "guard": 1,
                "evade": 2,
                "counter": 3,
                "attack": 4,
            }
        }
    } as const;
    constructor(private readonly target: string) {
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

    /** The faction this unit belongs to. */
    get faction() { return (["ally", "enemy"] as const)[Mdl.getunitfaction(this.target)]; }

    /** The level of this unit. */
    get level() { return Mdl.getlevel(this.target) }
    set level(v) {
        //@ts-ignore 
        Mdl.setlevel(this.target, v)
    }

    /** How much HP this unit has. */
    get hp() { return Modular.gethp(this.target, "normal"); }
    set hp(v) {
        const cur = Modular.gethp(this.target, "normal");
        Modular.healhp(this.target, v - cur);
    }

    /** The maximum HP this unit can have. */
    get maxHp() { return Mdl.gethp(this.target, "max") }
    set maxHp(v) {
        //@ts-ignore
        Mdl.setmaxhp(this.target, v)
    }

    /** How much shield this unit has. */
    get shield() { return Mdl.getshield(this.target); }
    /**
     * Gain shield for this unit.
     * @param amount - The amount of shield to gain
     * @param persist - Whether the shield should persist permanently
     */
    gainShield(amount: number, persist?: boolean) {
        Mdl.shield(this.target, amount, persist ? "perm" : undefined);
    }

    /** The SP value for this unit. */
    get sp() { return Modular.getsp(this.target) }
    set sp(v) {
        const cur = Modular.getsp(this.target);
        Modular.healsp(this.target, v - cur);
    }

    /** This unit's UID. */
    get unitId() { return Mdl.getid(this.target) }
    /** This unit's instance ID. */
    get instId() { return Mdl.getinstid(this.target) }

    /**
     * Check if this unit has a keyword or association.
     * @param keywordAssoc - A keyword or array of keywords to check
     * @param matchAny - If true, match any keyword (OR); if false, match all keywords (AND)
     */
    hasKeywordOrAssociation(keywordAssoc: string | string[], matchAny?: boolean) {
        return !!Mdl.haskey(this.target, matchAny ? "OR" : "AND", ...keywordAssoc)
    }

    /**
     * Check if this unit is actionable.
     * If the unit does not exist, this returns null.
     */
    actionable() {
        switch (Mdl.isactionable(this.target)) {
            case 0: return false;
            case 1: return true;
            default: return null
        }
    }

    speed = property(this, self => {
        return {
            /** The minimum speed roll for this unit. */
            get min() { return Mdl.getstat(self.target, "speedMin") },
            /** The maximum speed roll for this unit. */
            get max() { return Mdl.getstat(self.target, "speedMax") },
            /** The current speed for this unit. */
            get current() { return Mdl.getspeed(self.target) },
            /**
             * Get the speed of a specific slot.
             * @param index - The slot index
             */
            getSlotSpeed(index: number) {
                return Mdl.getspeed(self.target, index);
            }
        }
    })

    stagger = property(this, self => {
        return {
            /**
             * Add a stagger bar at a specific HP threshold.
             */
            addAt(hp: number) { Mdl.breakaddbar(self.target, hp) },
            /**
             * Trigger tremor burst on this unit.
             * @param times - Number of times to trigger. (defaults to once)
             * @param lowerCount - Lower the count of Tremor by this amount.
             */
            tremorBurst(times?: number, lowerCount?: number) {
                Mdl.burst(self.target, times ?? 1);
                if (lowerCount) {
                    Mdl.buff(self.target, "Vibration", 0, -lowerCount, 0);
                }
            },
            /**
             * Raise this unit's stagger threshold by the provided amount.
             * @param amount - The amount of stagger damage.
             * @param times - Number of times to trigger.
             */
            staggerDamage(amount?: number, times?: number) {
                Modular.breakdmg(self.target, amount ?? 1, times);
            },
            /**
             * Instantly stagger this unit.
             * @param type - Type of stagger: "natural", "force", or "both" (optional)
             */
            instantStagger(type?: "natural" | "force" | "both") {
                Mdl.break(self.target, type);
            },
            /**
             * Immediately recover from stagger.
             */
            recover() { Mdl.breakrecover(self.target); },
            /**
             * Get all stagger thresholds.
             * @returns Array of stagger threshold values
             */
            getThresholds() {
                return new Array(Mdl.getbreakcount(self.target)).fill(null).map((_, index) => {
                    Mdl.getbreakvalue(self.target, index);
                })
            }
        }
    })


    buff = property(this, self => {
        return {
            /**
             * Get buff information on this unit by keyword.
             * @param keyword - The buff keyword to look up
             */
            get(keyword: string) {
                return {
                    potency: Mdl.getbuff(self.target, keyword, "stack"),
                    count: Mdl.getbuff(self.target, keyword, "turn"),
                    consumed: Mdl.getbuff(self.target, keyword, "consumed"),
                }
            },
            /**
             * Inflict a buff on this unit.
             * @param keyword - The buff keyword.
             * @param potency - How much potency to inflict.
             * @param count - How much count to inflict.
             * @param activeRound - When the buff should become active.
             */
            inflict(keyword: string, potency: number, count: number, activeRound?: "this turn" | "next turn" | "this and next turn", use?: boolean) {
                const turnToAcivate = activeRound == undefined ? 0 : { "this turn": 0, "next turn": 1, "this and next turn": 2 }[activeRound];
                Mdl.buff(self.target, keyword,
                    potency, count,
                    turnToAcivate,
                    use ? "use" : undefined
                );
            },
            /**
             * Get the count of buffs on this unit.
             * @param type - The type of buff to count.
             */
            getCount(type?: "neg" | "pos") {
                return type ?
                    Mdl.getbuffcount(self.target, type) :
                    Mdl.getbuffcount(self.target, "neg") + Mdl.getbuffcount(self.target, "pos");
            }
        }
    })

    passive = {
        /**
         * Adds a passive to this unit.
         * @param id The passive ID to add.
         * @param allowDupe If true, allows duplicates of the passive to be added. (default: false)
         */
        add: (id: number, allowDupe?: boolean) => {
            Modular.passiveadd(this.target, id, allowDupe ? "yesdupe" : "nodupe")
        },
        /**
         * Removes a passive from this unit.
         * @param id The passive ID to remove.
         */
        remove: (id: number) => {
            Modular.passiveremove(this.target, id)
        },
        /**
         * Check to see if this unit has a specific passive.
         * @param id The passive ID to check.
         */
        includes: (id: number) => {
            return !!Modular.haspassive(this.target, id)
        }
    }

    /** Get or set the resistance values for this unit. */
    resist = property(this, self => {
        type Resist = keyof (typeof Unit.TYPES.attackTypes.sToI & typeof Unit.TYPES.sin.sToI);
        return new Proxy<{ [K in Resist]: number }>({} as any, {
            get(_, key) {
                const atkType = Unit.TYPES.attackTypes.sToI[key as keyof typeof Unit.TYPES.attackTypes.sToI]
                if (atkType)
                    return Mdl.getatkres(self.target, atkType) / 100;

                const sin = Unit.TYPES.sin.sToI[key as keyof typeof Unit.TYPES.sin.sToI];
                if (sin)
                    //@ts-ignore
                    return Mdl.getsinres(self.target, sin) / 100;

                return 0;
            },
            set(_, key, v) {
                const atkType = Unit.TYPES.attackTypes.sToI[key as keyof typeof Unit.TYPES.attackTypes.sToI]
                if (atkType) {
                    Mdl.ovwatkres(self.target, atkType, v * 100);
                    return true;
                }
                const sin = Unit.TYPES.sin.sToI[key as keyof typeof Unit.TYPES.sin.sToI];

                if (sin) {
                    Mdl.ovwsinres(self.target, sin, v * 100);
                    return true;
                }
                return false;
            }
        })
    })

    skill = property(this, self => {
        return {
            /** The current skill's base power. */
            get basePower() { return Modular.getskillbase(self.target as "Self") },
            /** Add to the skill's base power. */
            addBasePower(v: number) { Modular.base(v); },

            /** The current skill's coin power. */
            get coinPower() { return Modular.getcoinscale(self.target as "Self", 0) },
            /** Add to the current skill's coin power. */
            addCoinPower(v: number) { Modular.scale(v); },
            /** The current skill's coin power at a specific index. */
            getCoinAtIndexPower(index: number) { return Modular.getcoinscale(self.target as "Self", index) },

            /** Add to the current skill's clash power. */
            addClashPower(v: number) { Mdl.clash(v) },

            /** Get the current skill's power. */
            get power() { return Mdl.getcurrentpower(self.target as "Self"); },

            /** Get the current skill's rank. */
            get rank() { return Mdl.getskillrank(self.target as "Self"); },

            /** Get or set the skill's attack weight. */
            get weight() { return Mdl.getskillatkweight(self.target as "Self") },
            set weight(v) {
                const cur = Mdl.getskillatkweight(self.target as "Self");
                Mdl.atkweight(v - cur);
            },

            /** Get the current skill's level correction + this unit's offense level. */
            get level() { return Mdl.getskilllevel(self.target as "Self") },
            /** Get the current skill's level correction. */
            get correction() { return Mdl.getskillatklevel(self.target as "Self") },

            /** The current skill's attack type. */
            get attackType() {
                return Unit.TYPES.attackTypes.nToS[
                    Mdl.getskillatk(self.target as "Self")
                ] ?? "none"
            },
            set attackType(v) { if (v !== "none") Mdl.changeatktype(Unit.TYPES.attackTypes.sToI[v]) },

            /** The current skill's sin affinity. */
            get sin() {
                return Unit.TYPES.sin.nToS[
                    Mdl.getskillattribute(self.target as "Self") as keyof typeof Unit.TYPES.sin.nToS
                ] ?? "neutral"
            },
            set sin(v) { Mdl.changeaffinity(Unit.TYPES.sin.sToI[v]); },

            /** The current skill's defense type, if any. */
            get defenseType() {
                return Unit.TYPES.defenseType.nToS[
                    Mdl.getskilldeftype(self.target as "Self") as keyof typeof Unit.TYPES.defenseType.nToS
                ] ?? "none"
            },

            /** Get the skill's ID. */
            get id() {
                const id = Modular.getskillid();
                return id !== -1 ? id : null;
            },

            /** Whether the current skill is clashable. */
            get clashable() { return !!Mdl.getskillcanduel(self.target); },
            set clashable(v) { Mdl.skillcanduel(v ? "True" : "False"); }
        }
    })
}

// # Document Above

const Units = {
    self: new Unit("Self"),
    mainTarget: new Unit("MainTarget"),
}