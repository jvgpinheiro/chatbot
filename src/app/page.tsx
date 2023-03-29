"use client";
import { ResponseBody as BotData } from "./api/get-bot/route";
import { Inter } from "next/font/google";
import styles from "./page.module.css";
import { ChangeEvent, KeyboardEvent, useEffect, useState } from "react";
import Personality from "@/server/personality";
import Chatbot from "@/server/chatbot";
import { Message } from "@/data/databaseManager";

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
  const userID = getUserID();
  const initialBot = new Chatbot({
    personality: Personality.DEFAULT_PERSONALITY,
  });

  const [botData, setBotData] = useState<BotData>({
    available_traits: Personality.FULL_PERSONALITY,
    current_personality: Personality.DEFAULT_PERSONALITY,
    messages: [],
  });
  const [bot, setBot] = useState<Chatbot>(new Chatbot(initialBot));
  const [message, setMessage] = useState("");

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
      } catch (err) {
        // Ignore
      }
    }

    requestBot();
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
          <span>BI</span>
          <span>{`${bot.getTeamDescription()}bot`}</span>
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
