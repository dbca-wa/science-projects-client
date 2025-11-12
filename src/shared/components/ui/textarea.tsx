import * as React from "react";

import { cn } from "@/shared/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "text-md bg-background ring-offset-background placeholder:text-muted-foreground flex w-full rounded-md border border-slate-200 px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
