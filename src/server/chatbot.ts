import { Trait } from "./traits";
import { Team } from "./teams";
import Personality from "./personality";

type ConstructorArgs = { personality: Readonly<Personality>; team?: Team };

export default class Chatbot {
  public personality: Readonly<Personality>;
  public team?: Team;
  private botDescription: string;

  constructor({ personality, team }: ConstructorArgs) {
    this.personality = personality;
    this.team = team;
    this.botDescription = this.getDescription();
  }

  public updatePersonality(personality: Personality): void {
    this.personality = personality;
    this.botDescription = this.getDescription();
  }

  public updateTeam(team: Team): void {
    this.team = team;
    this.botDescription = this.getDescription();
  }

  public makePrompt(prompt: string): string {
    return `Assuming I don't support any club, impersonate a ${this.botDescription} and answer the following prompt: "${prompt}"`;
  }

  public getDescription(): string {
    const { goodTraits, badTraits, neutralTraits } = this.personality;
    const hasGoodTraits = goodTraits.length > 0;
    const goodTraitsText = this.getTraitsDescription(goodTraits);
    const badTraitsText = this.getTraitsDescription(badTraits);
    const neutralTraitsText = this.getTraitsDescription(neutralTraits);
    const supportedTeamText = this.getTeamDescription();
    const nonNeutralTraitsText = hasGoodTraits ? goodTraitsText : badTraitsText;
    return `${nonNeutralTraitsText} ${supportedTeamText} ${neutralTraitsText}`;
  }

  private getTraitsDescription(traits: Array<Trait>): string {
    return traits.reduce((acc, cur) => {
      if (acc === "") {
        return cur.description;
      }
      const newStr = acc.replaceAll("and", ",");
      return `${newStr} and ${cur.promptOutput}`;
    }, "");
  }

  public getTeamDescription(): string {
    return this.team ? `${this.team.name} fan` : "Football fan";
  }
}
