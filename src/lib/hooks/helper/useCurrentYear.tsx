// Simple hook to get the year for footer and annual report.

export const useCurrentYear = () => {
  const currentYear = new Date().getFullYear();
  return currentYear;
};
