export const enum TraitsEnum {
  POLITE = 1,
  FUNNY = 2,
  EXCITED = 3,
  COCKY = 4,
  BRAGGY = 5,
  BITTER = 6,
  FRUSTRATED = 7,
  HELPFUL = 8,
  CONFIDENT = 9,
}

export type TraitCategory = "good" | "bad" | "neutral";
export type Trait = {
  id: TraitsEnum;
  description: string;
  promptOutput: string;
  category: TraitCategory;
};

const politeTrait: Readonly<Trait> = Object.freeze({
  id: TraitsEnum.POLITE,
  description: "polite",
  promptOutput: "polite",
  category: "good",
});
const funnyTrait: Readonly<Trait> = Object.freeze({
  id: TraitsEnum.FUNNY,
  description: "funny",
  promptOutput: "funny",
  category: "good",
});
const helpfulTrait: Readonly<Trait> = Object.freeze({
  id: TraitsEnum.HELPFUL,
  description: "helpful",
  promptOutput: "helpful",
  category: "good",
});
const cockyTrait: Readonly<Trait> = Object.freeze({
  id: TraitsEnum.COCKY,
  description: "cocky",
  promptOutput: "cocky",
  category: "bad",
});
const braggyTrait: Readonly<Trait> = Object.freeze({
  id: TraitsEnum.BRAGGY,
  description: "braggy",
  promptOutput: "braggy",
  category: "bad",
});
const bitterTrait: Readonly<Trait> = Object.freeze({
  id: TraitsEnum.BITTER,
  description: "bitter",
  promptOutput: "bitter",
  category: "bad",
});
const frustratedTrait: Readonly<Trait> = Object.freeze({
  id: TraitsEnum.FRUSTRATED,
  description: "frustrated",
  promptOutput: "frustrated with the team",
  category: "neutral",
});
const excitedTrait: Readonly<Trait> = Object.freeze({
  id: TraitsEnum.EXCITED,
  description: "excited",
  promptOutput: "excited with the team",
  category: "neutral",
});
const confidentTrait: Readonly<Trait> = Object.freeze({
  id: TraitsEnum.CONFIDENT,
  description: "confident",
  promptOutput: "confident in the team",
  category: "neutral",
});

export const traitsByID = new Map<TraitsEnum, Trait>([
  [TraitsEnum.POLITE, politeTrait],
  [TraitsEnum.FUNNY, funnyTrait],
  [TraitsEnum.HELPFUL, helpfulTrait],
  [TraitsEnum.COCKY, cockyTrait],
  [TraitsEnum.BRAGGY, braggyTrait],
  [TraitsEnum.BITTER, bitterTrait],
  [TraitsEnum.FRUSTRATED, frustratedTrait],
  [TraitsEnum.EXCITED, excitedTrait],
  [TraitsEnum.CONFIDENT, confidentTrait],
]);

export function isGoodTrait(trait: Trait): boolean;
export function isGoodTrait(trait: TraitsEnum): boolean;
export function isGoodTrait(trait: Trait | TraitsEnum): boolean {
  return isTraitInList(trait, allTraits.goodTraits);
}

export function isBadTrait(trait: Trait): boolean;
export function isBadTrait(trait: TraitsEnum): boolean;
export function isBadTrait(trait: Trait | TraitsEnum): boolean {
  return isTraitInList(trait, allTraits.badTraits);
}

export function isNeutralTrait(trait: Trait): boolean;
export function isNeutralTrait(trait: TraitsEnum): boolean;
export function isNeutralTrait(trait: Trait | TraitsEnum): boolean {
  return isTraitInList(trait, allTraits.neutralTraits);
}

function isTraitInList(
  trait: Trait | TraitsEnum,
  traits: Array<Trait>
): boolean {
  const id = typeof trait === "number" ? trait : trait.id;
  return traits.some((trait) => trait.id === id);
}

export const allTraits = Object.freeze({
  goodTraits: [politeTrait, funnyTrait, helpfulTrait],
  badTraits: [cockyTrait, braggyTrait, bitterTrait],
  neutralTraits: [frustratedTrait, excitedTrait, confidentTrait],
});
