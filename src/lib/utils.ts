import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { debounce } from 'lodash-es';
import { useMemo, useRef } from 'react';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// LEXICAL.DEV
// invariant(condition, message) will refine types based on "condition", and
// if "condition" is false will throw an error. This function is special-cased
// in flow itself, so we can't name it anything else.
export default function invariant(
  cond?: boolean,
  message?: string,
  ...args: string[]
): asserts cond {
  if (cond) {
    return;
  }

  throw new Error(
    'Internal Lexical error: invariant() is meant to be replaced at compile ' +
    'time. There is no runtime version. Error: ' +
    message,
  );
}





export function useDebounce<T extends (...args: never[]) => void>(
  fn: T,
  ms: number,
  maxWait?: number,
) {
  const funcRef = useRef<T | null>(null);
  funcRef.current = fn;

  return useMemo(
    () =>
      debounce(
        (...args: Parameters<T>) => {
          if (funcRef.current) {
            funcRef.current(...args);
          }
        },
        ms,
        { maxWait },
      ),
    [ms, maxWait],
  );
}
