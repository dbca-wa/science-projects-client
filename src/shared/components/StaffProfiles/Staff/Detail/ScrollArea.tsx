import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  CSSProperties,
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface ScrollAreaProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showOverflowIndicator?: boolean;
  showIndicatorButton?: boolean;
  hideScrollbar?: boolean;
  indicatorColor?: CSSProperties["background"];
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

// Use React.forwardRef to allow ref forwarding
const InnerScrollContainer = forwardRef<
  HTMLDivElement,
  { hideScrollbar: boolean; children: ReactNode }
>(({ hideScrollbar, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`flex h-full w-full overflow-auto`}
      style={
        hideScrollbar ? { scrollbarWidth: "none", msOverflowStyle: "none" } : {}
      }
      {...props}
    >
      {children}
    </div>
  );
});

interface IndicatorProps {
  visible: boolean;
  position?: "start" | "end";
  indicatorColor?: CSSProperties["background"];
  showIndicatorButton?: boolean;
}

const Indicator: FC<IndicatorProps> = ({
  visible,
  position,
  indicatorColor,
  showIndicatorButton,
}) => {
  const baseStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    // paddingTop: "50px",
    width: "64px",
    height: "100%",
    opacity: visible ? 1 : 0,
    transition: "opacity 300ms ease-in-out",
    background:
      position === "start"
        ? `linear-gradient(to right, ${indicatorColor}, transparent)`
        : `linear-gradient(to left, ${indicatorColor}, transparent)`,
    borderLeft: position === "start" ? "1px solid #252525" : undefined,
    borderRight: position === "end" ? "1px solid #252525" : undefined,
    left: position === "start" ? 0 : undefined,
    right: position === "end" ? 0 : undefined,
  };

  return (
    <div className="pointer-events-none" style={baseStyle}>
      <div
        className={`flex h-full items-center ${position === "start" ? "justify-start" : "justify-end"}`}
      >
        {/* `${position === "start" ? "flex justify-start align-middle" : "flex justify-end align-middle"}` */}
        {showIndicatorButton ? (
          position === "start" ? (
            <ChevronLeft className="rounded-full bg-black text-slate-300 dark:bg-slate-700" />
          ) : (
            <ChevronRight className="rounded-full bg-black text-slate-300 dark:bg-slate-700" />
          )
        ) : null}
      </div>
    </div>
  );
};

const ScrollArea = ({
  children,
  showOverflowIndicator = false,
  hideScrollbar = true,
  indicatorColor = "black",
  showIndicatorButton = true,
  onScroll,
  ...props
}: ScrollAreaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [overflowing, setOverflowing] = useState(false);
  const [showStartIndicator, setShowStartIndicator] = useState(false);
  const [showEndIndicator, setShowEndIndicator] = useState(false);

  const checkOverflow = (el: HTMLDivElement) => {
    const isOverflowing =
      el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;
    return isOverflowing;
  };

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const {
        scrollLeft,
        scrollTop,
        scrollWidth,
        scrollHeight,
        clientWidth,
        clientHeight,
      } = containerRef.current;
      const isAtStart = scrollLeft === 0;
      const isAtEnd = Math.abs(scrollLeft + clientWidth - scrollWidth) <= 1;

      setShowStartIndicator(!isAtStart);
      setShowEndIndicator(!isAtEnd);

      if (onScroll) {
        onScroll({
          currentTarget: containerRef.current,
        } as React.UIEvent<HTMLDivElement>);
      }
    }
  }, [onScroll]);

  useEffect(() => {
    const handleOverflow = () => {
      if (containerRef.current) {
        const isOverflowing = checkOverflow(containerRef.current);
        setOverflowing(isOverflowing);
        handleScroll();
      }
    };

    handleOverflow();

    const resizeObserver = new ResizeObserver(handleOverflow);
    const currentContainer = containerRef.current; // Copy the current ref to a variable
    if (currentContainer) {
      resizeObserver.observe(currentContainer);
      currentContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (currentContainer) {
        // Use the copied ref variable in the cleanup function
        currentContainer.removeEventListener("scroll", handleScroll);
      }
      resizeObserver.disconnect();
    };
  }, [children, showOverflowIndicator, showIndicatorButton, handleScroll]);

  return (
    // Scroll Container
    <div className="relative overflow-hidden">
      {/* Inner Scroll Container */}
      <InnerScrollContainer
        ref={containerRef}
        hideScrollbar={hideScrollbar}
        {...props}
      >
        {children}
      </InnerScrollContainer>
      {showOverflowIndicator && overflowing && (
        <div className="h-full w-full">
          <Indicator
            visible={showStartIndicator}
            position="start"
            indicatorColor={indicatorColor}
            showIndicatorButton={showIndicatorButton}
          />
          <Indicator
            visible={showEndIndicator}
            position="end"
            indicatorColor={indicatorColor}
            showIndicatorButton={showIndicatorButton}
          />
        </div>
      )}
    </div>
  );
};

export default ScrollArea;
