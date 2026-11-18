import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn/ui class-name helper: merge conditional classes, letting
 * Tailwind classes override each other predictably. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
