export type Team = {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
};

const teams = new Map<string, Team>([
  ["1", { id: "1", name: "América-MG", primaryColor: "", secondaryColor: "" }],
  [
    "2",
    { id: "2", name: "Athletico-PR", primaryColor: "", secondaryColor: "" },
  ],
  ["3", { id: "3", name: "Atlético-MG", primaryColor: "", secondaryColor: "" }],
  ["4", { id: "4", name: "Bahia", primaryColor: "", secondaryColor: "" }],
  ["5", { id: "5", name: "Botafogo", primaryColor: "", secondaryColor: "" }],
  ["6", { id: "6", name: "Bragantino", primaryColor: "", secondaryColor: "" }],
  ["7", { id: "7", name: "Corinthians", primaryColor: "", secondaryColor: "" }],
  ["8", { id: "8", name: "Coritiba", primaryColor: "", secondaryColor: "" }],
  ["9", { id: "9", name: "Cruzeiro", primaryColor: "", secondaryColor: "" }],
  ["10", { id: "1", name: "Cuiabá", primaryColor: "", secondaryColor: "" }],
  ["11", { id: "11", name: "Flamengo", primaryColor: "", secondaryColor: "" }],
  [
    "12",
    { id: "12", name: "Fluminense", primaryColor: "", secondaryColor: "" },
  ],
  ["13", { id: "13", name: "Fortaleza", primaryColor: "", secondaryColor: "" }],
  ["14", { id: "14", name: "Goiás", primaryColor: "", secondaryColor: "" }],
  ["15", { id: "15", name: "Grêmio", primaryColor: "", secondaryColor: "" }],
  [
    "16",
    { id: "16", name: "Internacional", primaryColor: "", secondaryColor: "" },
  ],
  ["17", { id: "17", name: "Palmeiras", primaryColor: "", secondaryColor: "" }],
  ["18", { id: "18", name: "Santos", primaryColor: "", secondaryColor: "" }],
  ["19", { id: "19", name: "São Paulo", primaryColor: "", secondaryColor: "" }],
  ["20", { id: "20", name: "Vasco", primaryColor: "", secondaryColor: "" }],
]);

export function getTeamByID(id: string): Team | undefined {
  return teams.get(id);
}
