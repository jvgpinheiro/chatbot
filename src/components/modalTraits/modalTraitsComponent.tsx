import React, { useEffect, useState } from "react";
import styles from "./modalTraits.module.css";
import { Trait, TraitsEnum } from "@/entities/traits";
import { ResponseBody as BotData } from "@/app/api/get-bot/route";
import Chatbot from "@/entities/chatbot";

type ComponentProps = {
  botData: BotData;
  bot: Chatbot;
  selectedTraits: Set<TraitsEnum>;
  onTraitsChange: (traits: Array<TraitsEnum>) => void;
};

export default function ModalTraitsComponent({
  botData,
  bot,
  selectedTraits,
  onTraitsChange,
}: ComponentProps): JSX.Element {
  function makeTraitsList(
    traits: Array<Trait>,
    title: string,
    customBoxClasses: Array<string> = [],
    customItemClasses: Array<string> = []
  ): JSX.Element {
    function getBoxClasses() {
      return `${styles.traitBox} ${customBoxClasses.join(" ")}`;
    }

    function getItemClasses(trait: Trait) {
      const base = styles.traitItemWrapper;
      const custom = customItemClasses.join(" ");
      const selected = selectedTraits.has(trait.id) ? styles.selected : "";
      return `${base} ${custom} ${selected}`;
    }

    function onTraitClick({ id }: Trait): void {
      const newTraits = new Set(selectedTraits);
      selectedTraits.has(id) ? newTraits.delete(id) : newTraits.add(id);
      onTraitsChange([...newTraits.values()]);
    }

    return (
      <div className={getBoxClasses()}>
        <span className={styles.traitTitle}>{title}</span>
        <ul className={styles.traitsList}>
          {traits.map((trait) => (
            <li key={trait.id} className={styles.traitItem}>
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

  return (
    <div className={styles.traits}>
      {makeTraitsList(
        botData.available_traits.goodTraits,
        "Good",
        [],
        bot.personality.hasBadTrait() ? [styles.disabledTraits] : []
      )}
      {makeTraitsList(
        botData.available_traits.badTraits,
        "Bad",
        [],
        bot.personality.hasGoodTrait() ? [styles.disabledTraits] : []
      )}
      {makeTraitsList(botData.available_traits.neutralTraits, "Neutral", [
        styles.neutralTraitBox,
      ])}
    </div>
  );
}
