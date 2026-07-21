import { Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";

/** Expressive grotesque for display headings and the wordmark (the "Lattice" face). */
export const fontDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display-face",
  display: "swap",
});

/** Clean grotesque for body and UI. */
export const fontSans = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body-face",
  display: "swap",
});

/** Technical monospace for eyebrows, section markers, and crypto identifiers. */
export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono-face",
  display: "swap",
});

export const fontVariables = `${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`;
