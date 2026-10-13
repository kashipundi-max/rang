import { Inter, Montserrat, Poppins } from "next/font/google";

/**
 * Typefaces of the landing / auth skin (see `bg-skin.css`): Inter for
 * headings and figures, Montserrat for body copy, Poppins for the auth
 * headings. Exposed as CSS variables on <body> so only the skinned surfaces
 * pick them up.
 */
export const interFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const montserratFont = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const poppinsFont = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const skinFontVariables = `${interFont.variable} ${montserratFont.variable} ${poppinsFont.variable}`;
