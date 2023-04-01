import React, { MouseEvent, useEffect, useState } from "react";
import styles from "./modal.module.css";
import { ResponseBody as BotData } from "@/app/api/get-bot/route";
import Chatbot from "@/entities/chatbot";
import ModalTeamsComponent from "../modalTeam/modalTeamsComponent";
import { Team } from "@/entities/teams";
import ModalTraitsComponent from "../modalTraits/modalTraitsComponent";
import { TraitsEnum } from "@/entities/traits";
import Personality from "@/entities/personality";

type ComponentProps = {
  botData: BotData;
  bot: Chatbot;
  onClose: (event: MouseEvent<HTMLDivElement>) => void;
  onBotConfigChange: (bot: Chatbot) => void;
};

export default function ModalComponent({
  botData,
  bot,
  onClose,
  onBotConfigChange,
}: ComponentProps): JSX.Element {
  const [selectedTraits, setSelectedTraits] = useState<Set<TraitsEnum>>(
    new Set()
  );

  useEffect(() => {
    const set = new Set(bot.personality.toTraitIdList());
    setSelectedTraits(set);
  }, [bot]);

  function onTraitsChange(traits: Array<TraitsEnum>): void {
    const newBot = new Chatbot({
      personality: Personality.fromTraitsList(traits),
      team: bot.team,
    });
    onBotConfigChange(newBot);
  }

  function onTeamChange(selectedTeam?: Team): void {
    const newBot = new Chatbot({
      personality: bot.personality,
      team: selectedTeam,
    });
    onBotConfigChange(newBot);
  }

  return (
    <div className={`${styles.overlay}`}>
      <div className={styles.modal}>
        <div className={styles.titlebar}>
          <span className={styles.title}>Footbot Configuration</span>
          <div className={styles.close} onClick={(event) => onClose(event)}>
            <span>X</span>
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.sectionContainer}>
            <span className={styles.sectionTitle}>Teams</span>
            <ModalTeamsComponent
              teams={botData.available_teams}
              selectedTeam={bot.team}
              onTeamChange={(team) => onTeamChange(team)}
            ></ModalTeamsComponent>
          </div>
          <div className={styles.sectionContainer}>
            <span className={styles.sectionTitle}>Traits</span>
            <ModalTraitsComponent
              botData={botData}
              bot={bot}
              selectedTraits={selectedTraits}
              onTraitsChange={(traits) => onTraitsChange(traits)}
            ></ModalTraitsComponent>
          </div>
        </div>
      </div>
    </div>
  );
}
