// Button wrapper to handle fade in of buttons

import { motion } from "framer-motion";
import { type ReactElement, useEffect, useState } from "react";

interface IAnimatedToggleButtonProps {
  open: boolean;
  buttonComponent: ReactElement;
  delay: number; // in ms
}

export const AnimatedToggleButton = ({
  open,
  buttonComponent,
  delay,
}: IAnimatedToggleButtonProps) => {
  const [visible, setVisible] = useState(true);
  const [initial, setInitial] = useState(true);

  useEffect(() => {
    if (initial) {
      setInitial(false);
    }

    if (open) {
      setVisible(false);
      setTimeout(() => setVisible(true), delay);
    } else {
      setVisible(true);
    }
  }, [open, delay]);

  const transition = initial
    ? { opacity: { duration: 0 } } // No transition on initial render
    : visible
      ? { opacity: { duration: 0.6 } } // transition for fade-in, delay converted to seconds
      : { opacity: { duration: 0 } }; // transition for fade-out

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={transition}
    >
      {buttonComponent}
    </motion.div>
  );
};
