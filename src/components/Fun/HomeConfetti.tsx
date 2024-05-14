import confetti from 'canvas-confetti';
import { useEffect } from 'react';

const ConfettiComponent = () => {
    // Retrieve the count from localStorage or cookies

    const getLocalConfettiCount = () => {
        const returned = localStorage.getItem('confettiCount')
        if (!returned) {
            return 0
        }
        return Number(returned)
    }

    const setLocalConfettiCount = (confettiCount: number) => {
        localStorage.setItem('confettiCount', `${confettiCount}`)
    }

    const conf = (getLocalConfettiCount())

    useEffect(() => {
        console.log(conf)
        // If the count is less than 4, trigger the confetti effect
        if (conf < 4) {
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
            // setConf((prev) => prev + 1);
            if (conf < 10) {
                setLocalConfettiCount(conf + 1)
            }
        }

    }, []);



    return null; // or return any JSX if needed
};

export default ConfettiComponent;