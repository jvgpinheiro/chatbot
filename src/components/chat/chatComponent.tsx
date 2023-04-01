import React, { KeyboardEvent, MouseEvent, useState } from "react";
import styles from "./chat.module.css";
import { ResponseBody as BotData } from "@/app/api/get-bot/route";
import Chatbot from "@/entities/chatbot";
import ChatHeaderComponent from "../chatHeader/chatHeaderComponent";
import ChatMessagesComponent from "../chatMessages/chatMessagesComponent";
import ChatInputComponent from "../chatInput/chatInputComponent";

type ComponentProps = {
  botData: BotData;
  bot: Chatbot;
  isBotTyping: boolean;
  onConfig: (event: MouseEvent<HTMLDivElement>) => void;
  onHistoryClear: (event: MouseEvent<HTMLDivElement>) => void;
  onMessageSent: (
    event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLInputElement>,
    message: string
  ) => void;
};

export default function ChatComponent({
  botData,
  bot,
  isBotTyping,
  onConfig,
  onHistoryClear,
  onMessageSent,
}: ComponentProps): JSX.Element {
  const [message, setMessage] = useState<string>("");

  function handleMessageChange(newMessage: string): void {
    setMessage(newMessage);
  }

  function handleMessageSent(
    event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLInputElement>
  ): void {
    onMessageSent(event, message);
    setMessage("");
  }

  return (
    <div className={styles.chat}>
      <ChatHeaderComponent
        bot={bot}
        onConfig={(event) => onConfig(event)}
        onHistoryClear={(event) => onHistoryClear(event)}
      ></ChatHeaderComponent>
      <ChatMessagesComponent
        botData={botData}
        isBotTyping={isBotTyping}
        message={message}
        onMessageSent={(event, message) => onMessageSent(event, message)}
      ></ChatMessagesComponent>
      <ChatInputComponent
        message={message}
        onMessageChange={(event, message) => handleMessageChange(message)}
        onMessageSent={(event) => handleMessageSent(event)}
      ></ChatInputComponent>
    </div>
  );
}
