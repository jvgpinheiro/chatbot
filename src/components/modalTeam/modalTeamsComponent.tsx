import React, { MouseEvent } from "react";
import styles from "./modalTeams.module.css";
import Image from "next/image";
import { Team } from "@/server/teams";

type ComponentProps = {
  teams: Array<Team>;
  selectedTeam?: Team;
  onTeamChange: (team?: Team) => void;
};

export default function ModalTeamsComponent({
  teams,
  selectedTeam,
  onTeamChange,
}: ComponentProps): JSX.Element {
  function onTeamClick(team: Team): void {
    const newSelectedTeam = selectedTeam?.id === team.id ? undefined : team;
    onTeamChange(newSelectedTeam);
  }

  return (
    <div className={styles.teamsContainer}>
      {teams.map((team) => (
        <div
          key={team.id}
          onClick={() => onTeamClick(team)}
          className={`${styles.team} ${
            selectedTeam?.id === team.id ? styles.selected : ""
          }`}
        >
          <div className={styles.teamLogoContainer}>
            <Image
              className={styles.teamLogo}
              src={`/teams/team_${team.id}.png`}
              alt={`${team.name}'s logo`}
              width={20}
              height={20}
            ></Image>
          </div>
          <span className={styles.teamName}>{team.name}</span>
        </div>
      ))}
    </div>
  );
}
