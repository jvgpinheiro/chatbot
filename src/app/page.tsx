"use client";
import { ResponseBody as BotData } from "./api/get-bot/route";
import {
  ResponseBody as BotConfigurationData,
  ConfigurableData,
} from "./api/configure-bot/route";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { CSSTransition } from "react-transition-group";
import Personality from "@/entities/personality";
import Chatbot from "@/entities/chatbot";
import { Message } from "@/data/databaseManager";
import ModalComponent from "@/components/modal/modalComponent";
import ChatComponent from "@/components/chat/chatComponent";
import {
  getBotFromAPI,
  sendBotConfigurationToAPI,
  sendClearHistoryToAPI,
  sendMessageToAPI,
} from "@/utils/apiUtils";
import { getUserID } from "@/utils/localStorageUtils";

export default function Home() {
    const teste = 1 satisfies number | string;
  const initialBot = new Chatbot({
    personality: Personality.DEFAULT_PERSONALITY,
  });

  const [userID, setUserID] = useState<string>("");
  const [botData, setBotData] = useState<BotData>({
    available_traits: Personality.FULL_PERSONALITY,
    current_personality: Personality.DEFAULT_PERSONALITY,
    available_teams: [],
    messages: [],
  });
  const [bot, setBot] = useState<Chatbot>(new Chatbot(initialBot));
  const [isModalOpen, setModalVisibility] = useState<boolean>(false);
  const [isBotTyping, setBotTyping] = useState<boolean>(false);

  useEffect(() => {
    setUserID(getUserID());
  }, []);

  useEffect(() => {
    function requestBot(): void {
      if (!userID) {
        return;
      }
      getBotFromAPI([["id", `${userID}`]])
        .then((data) => updateBotData(data))
        .catch((err) => console.error(err));
    }

    requestBot();
  }, [userID]);

  function updateBotData(data: BotData): void {
    try {
      const botData: BotData = {
        ...data,
        available_traits: new Personality(data.available_traits),
        current_personality: new Personality(data.current_personality),
      };
      setBotData(botData);
      const bot = new Chatbot({
        personality: botData.current_personality,
        team: botData.current_team,
      });
      setBot(bot);
    } catch (err) {
      console.error(err);
    }
  }

  function sendMessage(message: string): void {
    addMessage({ type: "sent", content: message });
    setBotTyping(true);
    sendMessageToAPI({ id: userID, message })
      .then((text) => addMessage({ type: "received", content: text }))
      .catch(({ text }) => addMessage({ type: "received", content: text }))
      .finally(() => setBotTyping(false));
  }

  function addMessage(messageData: Message): void {
    const allMessages: Array<Message> = [...botData.messages, messageData];
    const newBotData: BotData = { ...botData, messages: [...allMessages] };
    botData.messages = allMessages;
    setBotData(newBotData);
  }

  function configureBot(data: ConfigurableData): void {
    function onSuccess(configData: BotConfigurationData): void {
      const newBotData: BotData = {
        ...botData,
        current_personality: configData.personality,
        current_team: configData.team,
      };
      updateBotData(newBotData);
    }

    const { personality_traits } = data;
    const personality = Personality.fromTraitsList(
      personality_traits.map((trait) => +trait)
    );
    const newBot = new Chatbot({ personality, team: botData.current_team });
    setBot(newBot);
    sendBotConfigurationToAPI({ id: userID, ...data })
      .then((responseData) => onSuccess(responseData))
      .catch((err) => console.error(err));
  }

  function clearHistory(): void {
    const newBotData: BotData = { ...botData, messages: [] };
    updateBotData(newBotData);
    sendClearHistoryToAPI({ id: userID });
  }

  function onBotConfigChange(updatedBot: Chatbot): void {
    const current_personality = updatedBot.personality;
    const current_team = updatedBot.team;
    const team_id = current_team?.id ?? "-1";
    const personality_traits = current_personality
      .toTraitIdList()
      .map((id) => id.toString());
    updateBotData({ ...botData, current_personality, current_team });
    configureBot({ personality_traits, team_id });
  }

  function openModal(): void {
    setModalVisibility(true);
  }

  function closeModal(): void {
    setModalVisibility(false);
  }

  return (
    <main className={styles.main}>
      <CSSTransition
        in={isModalOpen}
        timeout={300}
        classNames={{
          appear: styles.modalTransitionAppear,
          appearActive: styles.modalTransitionAppearActive,
          appearDone: styles.modalTransitionAppearDone,
          enter: styles.modalTransitionEnter,
          enterActive: styles.modalTransitionEnterActive,
          enterDone: styles.modalTransitionEnterDone,
          exit: styles.modalTransitionExit,
          exitActive: styles.modalTransitionExitActive,
          exitDone: styles.modalTransitionExitDone,
        }}
      >
        <ModalComponent
          botData={botData}
          bot={bot}
          onClose={() => closeModal()}
          onBotConfigChange={(bot) => onBotConfigChange(bot)}
        ></ModalComponent>
      </CSSTransition>
      <div className={styles.chatContainer}>
        <ChatComponent
          botData={botData}
          bot={bot}
          isBotTyping={isBotTyping}
          onConfig={() => openModal()}
          onHistoryClear={() => clearHistory()}
          onMessageSent={(event, message) => sendMessage(message)}
        ></ChatComponent>
      </div>
    </main>
  );
}
