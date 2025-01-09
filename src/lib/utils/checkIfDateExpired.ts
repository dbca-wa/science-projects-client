// A Util to check one date against another. If the date is expired, return true, else return false.

export const checkIfDateExpired = (dateToCheck: Date) => {
  const currentDate = new Date();
  return currentDate > dateToCheck;
};
