import confetti from "canvas-confetti";
import { useEffect } from "react";

const HomeConfetti = () => {
  // Retrieve the version from the environment variables served by Vite on build
  const VERSION = import.meta.env.VITE_SPMS_VERSION || "3.3.3";

  useEffect(() => {
    // Function to clear all previous confetti counts from localStorage
    const clearPreviousConfettiCounts = () => {
      // Get all keys from localStorage
      const keys = Object.keys(localStorage);

      // Filter for confetti-related keys that don't match the current version
      const previousConfettiKeys = keys.filter(
        (key) =>
          key.startsWith("confettiCount-") &&
          key !== `confettiCount-${VERSION}`,
      );

      // Remove all previous confetti count entries
      previousConfettiKeys.forEach((key) => {
        localStorage.removeItem(key);
      });
    };

    // Get the last version that was seen
    const lastSeenVersion = localStorage.getItem("lastSeenVersion");

    // If this is a new version, show confetti and update tracking
    if (lastSeenVersion !== VERSION) {
      // Clear all previous confetti counts
      clearPreviousConfettiCounts();

      // Store the current version as last seen
      localStorage.setItem("lastSeenVersion", VERSION);

      // Reset the confetti count for this version (ensures confetti shows again)
      localStorage.setItem(`confettiCount-${VERSION}`, "0");

      // Show confetti
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

      // Update the count for this version
      localStorage.setItem(`confettiCount-${VERSION}`, "1");
    } else {
      // Get the current count for this version
      const currentCount = Number(
        localStorage.getItem(`confettiCount-${VERSION}`) || "0",
      );

      // Only show confetti if we haven't reached the limit
      if (currentCount < 1) {
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

        // Update the count
        localStorage.setItem(
          `confettiCount-${VERSION}`,
          String(currentCount + 1),
        );
      }
    }
  }, []);

  return null;
};

export default HomeConfetti;
