import React, { MouseEvent } from "react";
import styles from "./chatHeader.module.css";
import Image from "next/image";
import Chatbot from "@/server/chatbot";

type ComponentProps = {
  bot: Chatbot;
  onConfig: (event: MouseEvent<HTMLDivElement>) => void;
  onHistoryClear: (event: MouseEvent<HTMLDivElement>) => void;
};

export default function ChatHeaderComponent({
  bot,
  onConfig,
  onHistoryClear,
}: ComponentProps): JSX.Element {
  return (
    <div className={styles.header}>
      <div
        className={styles.headerInfo}
        onClick={(event) => onConfig(event)}
        title="Edit bot"
      >
        <Image
          className={styles.botIcon}
          src="/chatbot.png"
          alt="chatbot-icon"
          width={30}
          height={30}
        ></Image>
        <span className={styles.botName}>Footbot</span>
        {bot.team && (
          <Image
            className={`${styles.teamIcon} ${`team_${bot.team.id}`}`}
            src={`/teams/team_${bot.team.id}.png`}
            alt="team-icon"
            width={30}
            height={30}
          ></Image>
        )}
      </div>
      <div className={styles.headerButtons}>
        <Image
          className={styles.binIcon}
          src="/bin.png"
          alt="clear history bin icon"
          width={16}
          height={16}
          title="Clear history"
          onClick={(event) => onHistoryClear(event)}
        ></Image>
      </div>
    </div>
  );
}
