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

export type Trait = {
  id: TraitsEnum;
  description: string;
  category: "good" | "bad" | "neutral";
};

const politeTrait: Readonly<Trait> = Object.freeze({
  id: TraitsEnum.POLITE,
  description: "polite",
  category: "good",
});
const funnyTrait: Readonly<Trait> = Object.freeze({
  id: TraitsEnum.FUNNY,
  description: "funny",
  category: "good",
});
const helpfulTrait: Readonly<Trait> = Object.freeze({
  id: TraitsEnum.HELPFUL,
  description: "helpful",
  category: "good",
});
const cockyTrait: Readonly<Trait> = Object.freeze({
  id: TraitsEnum.COCKY,
  description: "cocky",
  category: "bad",
});
const braggyTrait: Readonly<Trait> = Object.freeze({
  id: TraitsEnum.BRAGGY,
  description: "braggy",
  category: "bad",
});
const bitterTrait: Readonly<Trait> = Object.freeze({
  id: TraitsEnum.BITTER,
  description: "bitter",
  category: "bad",
});
const frustratedTrait: Readonly<Trait> = Object.freeze({
  id: TraitsEnum.FRUSTRATED,
  description: "frustrated with the team",
  category: "neutral",
});
const excitedTrait: Readonly<Trait> = Object.freeze({
  id: TraitsEnum.EXCITED,
  description: "excited with the team",
  category: "neutral",
});
const confidentTrait: Readonly<Trait> = Object.freeze({
  id: TraitsEnum.HELPFUL,
  description: "confident in the team",
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

export const allTraits = Object.freeze({
  goodTraits: [politeTrait, funnyTrait, helpfulTrait],
  badTraits: [cockyTrait, braggyTrait, bitterTrait],
  neutralTraits: [frustratedTrait, excitedTrait, confidentTrait],
});
