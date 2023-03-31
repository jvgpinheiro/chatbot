import React, { ChangeEvent, KeyboardEvent, MouseEvent } from "react";
import styles from "./chatInput.module.css";
import Image from "next/image";

type ComponentProps = {
  message: string;
  onMessageChange: (
    event: ChangeEvent<HTMLDivElement>,
    message: string
  ) => void;
  onMessageSent: (
    event: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLInputElement>,
    message: string
  ) => void;
};

export default function ChatInputComponent({
  message,
  onMessageChange,
  onMessageSent,
}: ComponentProps): JSX.Element {
  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const target = event.target;
    onMessageChange(event, target.value);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    const { key } = event;
    if (key !== "Enter" || !message) {
      return;
    }
    event.preventDefault();
    onMessageSent(event, message);
  }

  return (
    <div className={styles.inputContainer}>
      <input
        className={styles.input}
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(event) => handleInputChange(event)}
        onKeyUp={(event) => handleInputKeyDown(event)}
      ></input>
      <Image
        className={styles.sendIcon}
        src="/send.png"
        alt="send message"
        width={26}
        height={26}
        title="Send message"
        onClick={(event) => onMessageSent(event, message)}
      ></Image>
    </div>
  );
}
