// The quote that displays on the dashboard

import { useQuote } from "@/features/dashboard/hooks/useQuote";
import { useTheme } from "next-themes";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { BsChatQuoteFill } from "react-icons/bs";

export const Quote = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { quote, quoteLoading } = useQuote();

  const textControls = useAnimation();
  const authorControls = useAnimation();

  useEffect(() => {
    if (!quoteLoading) {
      const textArray = quote ? quote.text.split(" ") : [];
      textControls.start((i) => ({
        opacity: 1,
        transition: { delay: i * 0.025 },
      }));
      authorControls.start({
        opacity: 1,
        y: 0,
        transition: { delay: textArray.length * 0.025 + 0.5, duration: 1 },
      });
    }
  }, [textControls, authorControls, quote, quoteLoading]);

  return (
    <div
      className={`rounded-3xl px-8 py-6 select-none ${
        isDark ? "bg-black/50" : "bg-gray-100"
      }`}
    >
      <div className="flex items-start mb-1">
        <div
          className={`mt-1 mr-4 p-2 rounded-xl text-white ${
            isDark ? "bg-blue-600" : "bg-blue-400"
          }`}
          aria-label=""
        >
          <BsChatQuoteFill size={30} />
        </div>
        <div className="w-full flex flex-col">
          {!quoteLoading ? (
            <>
              <p
                className={`text-base mb-3 italic ${
                  isDark ? "text-white/90" : "text-black/90"
                }`}
              >
                {quote
                  ? quote.text.split(" ").map((word, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={textControls}
                        custom={i}
                      >
                        {word}{" "}
                      </motion.span>
                    ))
                  : "How wonderful that we have met with a paradox. Now we have some hope of making progress."}
              </p>
            </>
          ) : (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-500"></div>
          )}
        </div>
      </div>
      {quote && (
        <div className="flex justify-end">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={authorControls}>
            <p
              className={`font-medium text-right ${
                isDark ? "text-white/90" : "text-black/90"
              }`}
            >
              {quote.author}
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
};
