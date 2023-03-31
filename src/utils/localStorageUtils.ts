export function getUserID(): string {
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
