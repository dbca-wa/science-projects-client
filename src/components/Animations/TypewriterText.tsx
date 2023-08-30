// Component for presenting text to users line by line with a fade in (based on breaks and \n)

import { motion } from "framer-motion";

interface IText {
    text: string;
}
export const TypewriterText = ({ text }: IText) => {
    const lines = text.split(/\r?\n|\r|\n/);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {lines.map((line, index) => (
                <motion.div
                    key={index}
                    style={{ marginBottom: "0.5em" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + index * 0.3, duration: 0.5 }}
                >
                    {line}
                </motion.div>
            ))}
        </motion.div>
    );
};

