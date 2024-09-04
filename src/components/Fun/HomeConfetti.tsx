import confetti from "canvas-confetti";
import { useEffect } from "react";

const HomeConfetti = () => {
  // Retrieve the version from the environment variables served by Vite on build
  const VERSION = import.meta.env.VITE_SPMS_VERSION || "3.1.1";
  // Retrieve the count from localStorage or cookies
  const getLocalConfettiCount = () => {
    const returned = localStorage.getItem(`confettiCount-${VERSION}`);
    if (!returned) {
      return 0;
    }
    return Number(returned);
  };

  const setLocalConfettiCount = (confettiCount: number) => {
    localStorage.setItem(`confettiCount-${VERSION}`, `${confettiCount}`);
  };

  const conf = getLocalConfettiCount();

  useEffect(() => {
    // If the count is less than 4, trigger the confetti effect
    if (conf < 1) {
      confetti({
        particleCount: 100,
        spread: 360,
        origin: {
          x: 0.385,
          y: 0.3,
        },
      });
      // Clear the confetti after 5 seconds
      setTimeout(() => {
        confetti.reset();
      }, 5000);
      if (conf < 10) {
        setLocalConfettiCount(conf + 1);
      }
    }
  }, []);

  return null;
};

export default HomeConfetti;
