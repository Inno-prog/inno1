// src/lib/utils.ts
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  
  export type ClassValue = string | null | undefined | ClassValue[];
  
  // Installer les dépendances nécessaires si ce n'est pas fait
  // npm install clsx tailwind-merge
  import { clsx } from "clsx";
  import { twMerge } from "tailwind-merge";