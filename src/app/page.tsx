"use client";
import { ResponseBody as BotData } from "./api/get-bot/route";
import { ResponseBody as BotConfigurationData } from "./api/configure-bot/route";
import styles from "./page.module.css";
import { ChangeEvent, KeyboardEvent, useEffect, useState, useRef } from "react";
import { CSSTransition } from "react-transition-group";
import Personality from "@/server/personality";
import Chatbot from "@/server/chatbot";
import { Message } from "@/data/databaseManager";
import Image from "next/image";
import { Trait } from "@/server/traits";
import { Team } from "@/server/teams";

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
    available_teams: [],
    messages: [],
  });
  const [bot, setBot] = useState<Chatbot>(new Chatbot(initialBot));
  const [message, setMessage] = useState("");
  const [teamId, setTeamId] = useState<string | undefined>();
  const [selectedTraits, setSelectedTraits] = useState<Set<number>>(new Set());
  const [isModalOpen, setModalVisibility] = useState<boolean>(false);
  const [isBotTyping, setBotTyping] = useState<boolean>(false);

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

    requestBot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userID]);

  useEffect(() => {
    const set = new Set(bot.personality.toTraitIdList());
    setSelectedTraits(set);
  }, [bot]);

  useEffect(() => {
    const scrollableMessagesContainerRef = document.querySelector(
      `.${styles.messagesContent}`
    );
    if (scrollableMessagesContainerRef) {
      const { scrollHeight, clientHeight } = scrollableMessagesContainerRef;
      scrollableMessagesContainerRef.scrollTop = scrollHeight - clientHeight;
    }
  }, [isBotTyping]);

  function updateBotData(data: BotData): void {
    try {
      console.log(data);
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
      setTeamId(bot.team?.id);
    } catch (err) {
      console.error(err);
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const target = event.target;
    setMessage(target.value);
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    const { key } = event;
    if (key !== "Enter" || !message) {
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
    sendMessageToAPI(url, options);
  }

  function sendMessageToAPI(url: URL, options: any): void {
    function processResponse(response: Response) {
      if (response.status !== 200) {
        setBotTyping(false);
        throw new Error("Invalid message");
      }
      return response.text();
    }

    function processMessageData(text: string): void {
      addMessage({ type: "received", content: text });
      setBotTyping(false);
      console.log(text);
    }

    function handleFailure(err: any): void {
      addMessage({
        type: "received",
        content:
          "Sorry, I'm unable to provide an answer right now. Please try again or reload the page",
      });
      setBotTyping(false);
      console.error(err);
    }

    try {
      setBotTyping(true);
      fetch(url, options)
        .then((response) => processResponse(response))
        .then((text) => processMessageData(text))
        .catch((err) => handleFailure(err));
    } catch (err) {
      handleFailure(err);
    }
  }

  function addMessage(messageData: Message): void {
    const allMessages: Array<Message> = [...botData.messages, messageData];
    const newBotData: BotData = { ...botData, messages: [...allMessages] };
    botData.messages = allMessages;
    setBotData(newBotData);
  }

  function onTraitClick({ id }: Trait): void {
    const newTraits = new Set(selectedTraits);
    selectedTraits.has(id) ? newTraits.delete(id) : newTraits.add(id);
    const traitsList = [...newTraits.values()].map((trait) => +trait);
    const personality = Personality.fromTraitsList(traitsList);
    const traitListForRequest = traitsList.map((id) => id.toString());
    configureBot(traitListForRequest, teamId);
  }

  function configureBot(
    personality_traits: Array<string>,
    team_id?: string
  ): void {
    const url = new URL("http://localhost:3000/api/configure-bot");
    const options = {
      method: "POST",
      body: JSON.stringify({
        id: userID,
        personality_traits,
        team_id,
      }),
      headers: { "Content-type": "application/json" },
    };
    const personality = Personality.fromTraitsList(
      personality_traits.map((trait) => +trait)
    );
    const newBot = new Chatbot({ personality, team: botData.current_team });
    setBot(newBot);
    sendBotConfigurationToAPI(url, options);
  }

  function sendBotConfigurationToAPI(url: URL, options: any): void {
    function processResponse(response: Response): Promise<any> {
      if (response.status !== 200) {
        throw new Error("Failed to configure bot");
      }
      return response.json();
    }

    function processConfigurationData(configData: BotConfigurationData): void {
      const newBotData: BotData = {
        ...botData,
        current_personality: configData.personality,
        current_team: configData.team,
      };
      updateBotData(newBotData);
    }
    try {
      fetch(url, options)
        .then((response) => processResponse(response))
        .then((json) => processConfigurationData(json))
        .catch((err) => console.error(err));
    } catch (err) {
      console.error(err);
    }
  }

  function openModal(): void {
    setModalVisibility(true);
  }

  function closeModal(): void {
    setModalVisibility(false);
  }

  function clearHistory(): void {
    const url = new URL("http://localhost:3000/api/clear-history");
    const options = {
      method: "POST",
      body: JSON.stringify({ id: userID }),
      headers: { "Content-type": "application/json" },
    };
    const newBotData: BotData = { ...botData, messages: [] };
    updateBotData(newBotData);
    sendClearHistoryToAPI(url, options);
  }

  function sendClearHistoryToAPI(url: URL, options: any): void {
    function processResponse(response: Response): Promise<any> {
      if (response.status !== 200) {
        throw new Error("Failed to clear history");
      }
      return response.text();
    }

    function processResponseData(): void {
      const newBotData: BotData = {
        ...botData,
        messages: [],
      };
      updateBotData(newBotData);
    }

    try {
      fetch(url, options)
        .then((response) => processResponse(response))
        .then(() => processResponseData())
        .catch((err) => console.error(err));
    } catch (err) {
      console.error(err);
    }
  }

  function makeTraitsList(
    traits: Array<Trait>,
    title: string,
    customBoxClasses: Array<string> = [],
    customItemClasses: Array<string> = []
  ): JSX.Element {
    function getBoxClasses() {
      return `${styles.modalTraitBox} ${customBoxClasses.join(" ")}`;
    }

    function getItemClasses(trait: Trait) {
      const base = styles.modalTraitItemWrapper;
      const custom = customItemClasses.join(" ");
      const selected = selectedTraits.has(trait.id) ? styles.selected : "";
      return `${base} ${custom} ${selected}`;
    }

    return (
      <div className={getBoxClasses()}>
        <span className={styles.modalTraitTitle}>{title}</span>
        <ul className={styles.modalTraitsList}>
          {traits.map((trait) => (
            <li key={trait.id} className={styles.modalTraitItem}>
              <div
                className={getItemClasses(trait)}
                onClick={() => onTraitClick(trait)}
              >
                <span>{trait.description}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  function makeTeamElement(team: Team): JSX.Element {
    function onTeamClick(): void {
      const newSelectedTeam = isSelectedTeam ? undefined : team;
      const newBotData: BotData = { ...botData, current_team: newSelectedTeam };
      const personality_traits = newBotData.current_personality
        .toTraitIdList()
        .map((id) => id.toString());
      updateBotData(newBotData);
      configureBot(personality_traits, newSelectedTeam?.id);
    }

    const isSelectedTeam = team.id === teamId;
    return (
      <div
        key={team.id}
        onClick={() => onTeamClick()}
        className={`${styles.modalTeam} ${
          isSelectedTeam ? styles.selected : ""
        }`}
      >
        <div className={styles.modalTeamLogoContainer}>
          <Image
            className={styles.modalTeamLogo}
            src={`/teams/team_${team.id}.png`}
            alt={`${team.name}'s logo`}
            width={20}
            height={20}
          ></Image>
        </div>
        <span className={styles.modalTeamName}>{team.name}</span>
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <CSSTransition
        in={isModalOpen}
        timeout={200}
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
        <div className={`${styles.modalOverlay}`}>
          <div className={styles.modal}>
            <div className={styles.modalTitlebar}>
              <span className={styles.modalTitle}>Footbot Configuration</span>
              <div className={styles.modalClose} onClick={() => closeModal()}>
                <span>X</span>
              </div>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalSectionContainer}>
                <span className={styles.modalSectionDescription}>Teams</span>
                <div className={styles.modalTeamsContainer}>
                  {botData.available_teams.map((team) => makeTeamElement(team))}
                </div>
              </div>
              <div className={styles.modalSectionContainer}>
                <span className={styles.modalSectionDescription}>Traits</span>
                <div className={styles.modalTraits}>
                  {makeTraitsList(
                    botData.available_traits.goodTraits,
                    "Good",
                    [],
                    bot.personality.hasBadTrait()
                      ? [styles.modalDisabledTraits]
                      : []
                  )}
                  {makeTraitsList(
                    botData.available_traits.badTraits,
                    "Bad",
                    [],
                    bot.personality.hasGoodTrait()
                      ? [styles.modalDisabledTraits]
                      : []
                  )}
                  {makeTraitsList(
                    botData.available_traits.neutralTraits,
                    "Neutral",
                    [styles.modalNeutralTraitBox]
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CSSTransition>
      <div className={styles.chatContainer}>
        <div className={styles.chat}>
          <div className={styles.header}>
            <div
              className={styles.headerInfo}
              onClick={() => openModal()}
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
            <div className={styles.headerButtons}>
              <Image
                className={styles.binIcon}
                src="/bin.png"
                alt="clear history bin icon"
                width={16}
                height={16}
                title="Clear history"
                onClick={() => clearHistory()}
              ></Image>
            </div>
          </div>
          <div className={styles.messagesContainer}>
            <div
              className={`${styles.messagesContent} ${
                isBotTyping ? styles.botTyping : ""
              }`}
            >
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
                      <span className={styles.messageText}>{content}</span>
                    </div>
                    <div className={styles.messageTail}></div>
                  </div>
                );
              })}
            </div>
            <div
              className={`${styles.botTypingContainer} ${
                isBotTyping ? "" : styles.hidden
              }`}
            >
              <Image
                className={styles.botIcon}
                src="/chatbot.png"
                alt="chatbot icon"
                width={16}
                height={16}
                title="Send message"
                onClick={() => sendMessage(message)}
              ></Image>
              <span className={styles.botTypingText}>Footbot is typing</span>
              <span className={styles.botTypingDots}>...</span>
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
            <Image
              className={styles.sendIcon}
              src="/send.png"
              alt="send message"
              width={26}
              height={26}
              title="Send message"
              onClick={() => sendMessage(message)}
            ></Image>
          </div>
        </div>
      </div>
    </main>
  );
}
