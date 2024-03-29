import React, { KeyboardEvent, MouseEvent, useEffect, useState } from "react";
import styles from "./chatMessages.module.css";
import Image from "next/image";
import { ResponseBody as BotData } from "@/app/api/get-bot/route";

type ComponentProps = {
  botData: BotData;
  isBotTyping: boolean;
  message: string;
  onMessageSent: (
    event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLInputElement>,
    message: string
  ) => void;
};

export default function ChatMessagesComponent({
  botData,
  isBotTyping,
  message,
  onMessageSent,
}: ComponentProps): JSX.Element {
  const [botTypingClass, setBotTypingClass] = useState<string>();

  useEffect(
    () => setBotTypingClass(isBotTyping ? styles.botTyping : ""),
    [isBotTyping]
  );

  useEffect(() => scrollToTheBottom(), [botData.messages, botTypingClass]);

  function scrollToTheBottom() {
    const scrollableMessagesContainerRef = document.querySelector(
      `.${styles.messagesContent}`
    );
    if (scrollableMessagesContainerRef) {
      const { scrollHeight, clientHeight } = scrollableMessagesContainerRef;
      scrollableMessagesContainerRef.scrollTop = scrollHeight - clientHeight;
    }
  }

  return (
    <div className={styles.messagesContainer}>
      <div className={`${styles.messagesContent} ${botTypingClass}`}>
        {botData.messages.map(({ type, content }, index) => {
          return (
            <div
              className={`${styles.messageSpace} ${
                type === "sent"
                  ? styles.messageSpaceSent
                  : styles.messageSpaceReceived
              }`}
              key={index}
            >
              <div className={styles.message}>
                <p className={styles.messageText}>{content}</p>
              </div>
              <div className={styles.messageTail}></div>
            </div>
          );
        })}
      </div>
      <div className={`${styles.botTypingContainer} ${botTypingClass}`}>
        <Image
          className={styles.botIcon}
          src="/chatbot.png"
          alt="chatbot icon"
          width={16}
          height={16}
          title="Send message"
          onClick={(event) => onMessageSent(event, message)}
        ></Image>
        <span className={styles.botTypingText}>Footbot is typing</span>
        <span className={styles.botTypingDots}>...</span>
      </div>
    </div>
  );
}
