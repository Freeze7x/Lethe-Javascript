export function Fire() {
    const target = Units.target;
    const bleed = target.buff.get("Laceration");

    const toAdd = Math.min(Math.floor(bleed.potency/4), 3);

    target.skill.addCoinPower(toAdd);
}