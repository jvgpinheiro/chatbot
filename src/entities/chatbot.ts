import { Trait } from "./traits";
import { Team } from "./teams";
import Personality from "./personality";

type ConstructorArgs = { personality?: Readonly<Personality>; team?: Team };

export default class Chatbot {
  public personality: Readonly<Personality>;
  public team?: Team;
  private botDescription: string;

  constructor({ personality, team }: ConstructorArgs) {
    this.personality = personality ?? Personality.DEFAULT_PERSONALITY;
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

  public makeReasonDetectionPrompt(messages: Array<string>): string {
    const matchesReasonDetection = `"Reason: partidas" if the context messages are about partidas`;
    const teamsReasonDetection = `"Reason: teams" if the context messages are about teams/clubs`;
    const playersReasonDetection = `"Reason: jogadores" if the context messages are about jogadores`;
    const refereesReasonDetection = `"Reason: arbitragem" if the context messages are about arbitragem`;
    const stadiumsReasonDetection = `"Reason: stadiums" if the context messages are about stadiums`;
    const otherReasonDetection = `"Reason: other" if the context messages are about any other topic`;

    const reasonsList = `\n\n-${matchesReasonDetection}\n\n${playersReasonDetection}\n\n-${refereesReasonDetection}\n\n-${teamsReasonDetection}\n\n-${stadiumsReasonDetection}\n\n-${otherReasonDetection}`;
    const contextMessages = messages.map((str) => `\n\n-${str}`);

    const previousMessages = `Context messages in order:${contextMessages}`;
    const core = `Answer with ONLY the reason for the context messages:${reasonsList}`;
    return `${previousMessages}${core}`;
  }

  public makePrompt(prompt: string): string {
    const core = `Assuming I don't support any club, impersonate a ${this.botDescription} and answer in the same language as asked the following prompt: "${prompt}".`;
    const userMainTopic = `\n\nAlso, add at the end of your answer after 2 line breaks the following: "Tópico resposta: Jogadores" if the main topic about the given prompt is about players, "Tópico resposta: Arbitragem" if the main topic about the given prompt is about referees, "Tópico resposta: Times" if the main topic about the given prompt is about teams/clubs, "Tópico resposta: Estádios" if the main topic about the given prompt is about stadiums and "Tópico Principal Respondido: Outro" for every other main topic the user talks about`;
    const aiMainTopic = `\n\nAlso, add at the end of your answer after 1 line break the following: "Tópico Principal Respondido: Jogadores" if the main topic about what you said is about players, "Tópico Principal Respondido: Arbitragem" if the main topic about what you said is about referees, "Tópico Principal Respondido: Times" if the main topic about what you said is about teams/clubs, "Tópico Principal Respondido: Estádios" if the main topic about what you said is about stadiums and "Tópico Principal Respondido: Outro" for everything else you said`;
    return `${core}${userMainTopic}`;
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
