import {
  allTraits,
  isBadTrait,
  isGoodTrait,
  isNeutralTrait,
  Trait,
  traitsByID,
  TraitsEnum,
} from "./traits";

type ConstructorArgs = {
  goodTraits: Array<Trait>;
  badTraits: Array<Trait>;
  neutralTraits: Array<Trait>;
};

export default class Personality {
  public readonly goodTraits: Array<Trait> = [];
  public readonly badTraits: Array<Trait> = [];
  public readonly neutralTraits: Array<Trait> = [];

  public static readonly DEFAULT_PERSONALITY: Personality = new Personality({
    goodTraits: [],
    badTraits: [],
    neutralTraits: [],
  });
  public static readonly FULL_PERSONALITY: Personality = new Personality(
    allTraits
  );

  constructor({ goodTraits, badTraits, neutralTraits }: ConstructorArgs) {
    this.goodTraits = goodTraits;
    this.badTraits = badTraits;
    this.neutralTraits = neutralTraits;
  }

  public static fromTraitsList(traitIds: Array<Trait>): Personality;
  public static fromTraitsList(traitIds: Array<TraitsEnum>): Personality;
  public static fromTraitsList(
    traitIds: Array<Trait> | Array<TraitsEnum>
  ): Personality {
    const traits = traitIds
      .map((trait) =>
        typeof trait === "number" ? traitsByID.get(trait) : trait
      )
      .filter((trait) => !!trait) as Array<Trait>;

    const args: ConstructorArgs = {
      goodTraits: [],
      badTraits: [],
      neutralTraits: [],
    };
    traits.forEach((trait) => args[`${trait.category}Traits`].push(trait));

    return new Personality(args);
  }

  public toTraitIdList(): Array<TraitsEnum> {
    const toId = (trait: Trait) => trait.id;
    return [
      ...this.goodTraits.map(toId),
      ...this.badTraits.map(toId),
      ...this.neutralTraits.map(toId),
    ];
  }

  public hasGoodTrait(): boolean {
    return this.goodTraits.some((trait) => isGoodTrait(trait.id));
  }

  public hasBadTrait(): boolean {
    return this.badTraits.some((trait) => isBadTrait(trait.id));
  }

  public hasNeutralTrait(): boolean {
    return this.neutralTraits.some((trait) => isNeutralTrait(trait.id));
  }
}
