"use client";
import { ResponseBody as BotData } from "./api/get-bot/route";
import { Inter } from "next/font/google";
import styles from "./page.module.css";
import { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import Personality from "@/server/personality";
import Chatbot from "@/server/chatbot";
import { Message } from "@/data/databaseManager";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

function getUserID(): string {
  const userID = localStorage.getItem("userID");
  if (userID) {
    return userID;
  }
  const newUserID = generateUserID();
  localStorage.setItem("userID", newUserID);
  return newUserID;
}

function generateUserID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (character) => {
      const hex = 16;
      const random = (Math.random() * hex) | 0;
      // eslint-disable-next-line no-magic-numbers
      const value = character === "x" ? random : (random & 0x3) | 0x8;
      return value.toString(hex);
    }
  );
}

export default function Home() {
  const initialBot = new Chatbot({
    personality: Personality.DEFAULT_PERSONALITY,
  });

  const [userID, setUserID] = useState<string>("");
  const [botData, setBotData] = useState<BotData>({
    available_traits: Personality.FULL_PERSONALITY,
    current_personality: Personality.DEFAULT_PERSONALITY,
    messages: [],
  });
  const [bot, setBot] = useState<Chatbot>(new Chatbot(initialBot));
  const [message, setMessage] = useState("");
  const [teamId, setTeamId] = useState<string | undefined>();

  useEffect(() => {
    setUserID(getUserID());
  }, []);

  useEffect(() => {
    function requestBot(): void {
      const url = new URL("http://localhost:3000/api/get-bot");
      const params = [["id", `${userID}`]];
      url.search = new URLSearchParams(params).toString();
      fetch(url, { method: "GET" })
        .then((response) => response.json())
        .then((data) => updateBotData(data));
    }

    function updateBotData(data: any): void {
      try {
        const botData: BotData = {
          ...data,
          available_traits: new Personality(data.available_traits),
          current_personality: new Personality(data.current_personality),
        };
        setBotData(botData);
        console.log(botData);
        const bot = new Chatbot({
          personality: botData.current_personality,
          team: botData.current_team,
        });
        setBot(bot);
        console.log(bot.team?.id);
        setTeamId(bot.team?.id);
      } catch (err) {
        // Ignore
      }
    }

    requestBot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userID]);

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const target = event.target;
    setMessage(target.value);
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    const { key } = event;
    if (key !== "Enter") {
      return;
    }
    event.preventDefault();
    sendMessage(message);
    setMessage("");
  }

  function sendMessage(message: string): void {
    const url = new URL("http://localhost:3000/api/process-message");
    const options = {
      method: "POST",
      body: JSON.stringify({ id: userID, message }),
      headers: { "Content-type": "application/json" },
    };
    addMessage({ type: "sent", content: message });
    fetch(url, options)
      .then((response) => response.text())
      .then((text) => addMessage({ type: "received", content: text }));
  }

  function addMessage(messageData: Message): void {
    const allMessages: Array<Message> = [...botData.messages, messageData];
    const newBotData: BotData = { ...botData, messages: [...allMessages] };
    botData.messages = allMessages;
    setBotData(newBotData);
  }

  return (
    <main className={styles.main}>
      <div className={styles.chat}>
        <div className={styles.header}>
          <div className={styles.info}>
            <Image
              className={styles.botIcon}
              src="/chatbot.png"
              alt="chatbot-icon"
              width={30}
              height={30}
            ></Image>
            <span>Futebot</span>
            <Image
              className={`${styles.teamIcon} ${
                teamId ? `team_${teamId}` : styles.hidden
              }`}
              src={`/teams/team_${teamId ?? 999}.png`}
              alt="team-icon"
              width={30}
              height={30}
            ></Image>
          </div>
        </div>
        <div className={styles.messagesContainer}>
          <div className={styles.messagesContent}>
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
                    <span>{content}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className={styles.inputContainer}>
          <input
            className={styles.input}
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(event) => handleInputChange(event)}
            onKeyUp={(event) => onInputKeyDown(event)}
          ></input>
          <button className={styles.send} value="Send"></button>
        </div>
      </div>
    </main>
  );
}
