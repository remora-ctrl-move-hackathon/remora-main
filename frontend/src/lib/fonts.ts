import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";

const ppSupplyMonoFont = localFont({
  variable: "--supply-mono",
  src: [
    {
      path: "../styles/fonts/PPSupplyMono-Ultralight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../styles/fonts/PPSupplyMono-Regular.woff2",
      weight: "400", 
      style: "normal",
    },
    {
      path: "../styles/fonts/PPSupplyMono-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../styles/fonts/PPSupplyMono-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

const ppSupplySansFont = localFont({
  variable: "--supply-sans",
  src: [
    {
      path: "../styles/fonts/PPSupplySans-Ultralight.woff2", 
      weight: "200",
      style: "normal",
    },
    {
      path: "../styles/fonts/PPSupplySans-Regular.woff2",
      weight: "400",
      style: "normal", 
    },
    {
      path: "../styles/fonts/PPSupplySans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../styles/fonts/PPSupplySans-Bold.woff2",
      weight: "700", 
      style: "normal",
    },
  ],
});

export const fontClassNames = `${GeistSans.variable} ${ppSupplySansFont.variable} ${ppSupplyMonoFont.variable}`;

export { ppSupplyMonoFont, ppSupplySansFont, GeistSans };