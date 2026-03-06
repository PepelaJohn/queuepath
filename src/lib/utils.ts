import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

export function generateReferralCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}