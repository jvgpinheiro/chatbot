import { Trait, Personality } from "./personalities";
import { Team } from "./teams";

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

  private getDescription(): string {
    const { good, bad, neutral } = this.personality;
    const hasGoodTraits = this.personality.good.length > 0;
    const goodTraitsText = this.getTraitsDescription(good);
    const badTraitsText = this.getTraitsDescription(bad);
    const neutralTraitsText = this.getTraitsDescription(neutral);
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
      return `${newStr} and ${cur.description}`;
    }, "");
  }

  private getTeamDescription(): string {
    return this.team ? `${this.team.name} fan` : "Football fan";
  }
}
