// A Util to check one date against another. If the date is expired, return true, else return false.

export const checkIfDateExpired = (dateToCheck: Date) => {
  const currentDate = new Date();
  const result = currentDate > dateToCheck;
  console.log("Checking if date is expired:", dateToCheck, currentDate, result);
  return result;
};
