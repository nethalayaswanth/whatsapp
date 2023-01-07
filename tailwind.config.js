/** @type {import('tailwindcss').Config} */

const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          default: "#3b4a54",
          strong: " #111b21",

          stronger: "#111b21",

          strongest: " #111b21",

          title: "#41525d",

          teal: "#008069",
          green: "#00a884",
          backdrop: "#f5f6f6",
          danger: "#ea0038",
          background: "#f0f2f5",
        },
        danger: { DEFAULT: "#ea0038", lighter: "#fcf0ed" },
        icon: {
          active: "rgba(11,20,26,0.1)",
          startup: "#bbc5cb",
        },
        text: {
          primary: "#111b21",
          secondary: "#667781",
        },
        secondary: {
          stronger: "#3b4a54",
          lighter: "#8696a0",
        },
        tab: {
          active: "#008069",
        },
        app: {
          default: "#eae6df",

          deeper: " #d1d7db",

          stripe: "#00a884",
          conversation: "#efeae2",
          danger: "#ea0038",
        },
        panel: {
          header: { DEFAULT: "#f0f2f5", icon: "#54656f", coloured: "#008069" },
          bg: { lighter: "#f7f8fa", deeper: "#e9edef", hover: "#f5f6f6" },
          primary: "rgba(17,27,33,0.35)",
          secondary: "#667781",
          deeper: "rgba(11,20,26,0.05)",
          DEFAULT: "#f0f2f5",
        },
        drawer: {
          bg: "#f0f2f5",
          active: "#25d366",
        },
        unread: {
          timestamp: "#1fa855",
          marker: { bg: "#25d366", text: "#fff" },
          background: "#fff",
        },
        border: {
          list: "#e9edef",
          panel: "#e9edef",
          header: "#d1d7db",
          thumb: {
            active: "#d1d7db",
          },
        },
        input: {
          active: "#00a884",
          inactive: "#667781",
          placeHolder: "#667781",
          panel: "#e9edef",
        },
        media: {
          thumb: {
            bg: "#dfe3e7",
          },
        },
        message: {
          primary: "#111b21",
          outgoing: {
            DEFAULT: "#d9fdd3",
            deeper: "#d1f4cc",
          },
          incoming: {
            DEFAULT: "#fff",
            deeper: "#f5f6f6",
          },
          quoted: "#667781",
          label: {
            green: "#06cf9c",
            blue: "#53bdeb",
          },
          audio: {
            control: {
              incoming: "#9c8d8d",
              outgoing: "#6f8171",
            },
            progress: "#e7e8e9",
          },
          timestamp: { read: "#667781", unread: "" },
        },
        bubble: {
          icon: "#8696a0",
          read: "#53bdeb",
        },

        // toolbar: {
        //   active: "#008069",
        // },
      },
      animation: {
        slide: "slide 1s cubic-bezier(.1,.82,.25,1) ",
        pop: "pop .75s cubic-bezier(.1,.82,.25,1) ",
        land: "land 0.5s cubic-bezier(.1,.82,.25,1)",
        zoomIn: "zoomIn 0.3s cubic-bezier(.1,.82,.25,1)",
        fadeIn: "fadeIn 0.3s cubic-bezier(.1,.82,.25,1)",
        fade: "fade 0.3s cubic-bezier(.1,.82,.25,1)",
        collapse: "collapse 0.3s cubic-bezier(.1,.82,.25,1)",
        spinner: "spinner 2s linear infinite",
        stroke: "stroke 1.5s ease-in-out infinite",
      },
      keyframes: {
        slide: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0%)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        pop: {
          "0%, 40%": { transform: "scale(0)" },
          "100%": { transform: "scale(1)" },
        },
        land: {
          "0%,40%": { transform: "translateY(-10px)" },

          "100%": { transform: "translateY(0px)" },
        },
        zoomIn: {
          "0%": { transform: "translateZ(100px) scale(1.4)  " },

          "100%": { transform: "translateZ(0px) scale(1)" },
        },
        fade: {
          "0%": {
            transform: "translate3d(0px,-5px,3px) ",
            opacity: 0,
          },

          "100%": {
            transform: "translate3d(0px,0px,0px)",
            opacity: 1,
          },
        },
        fadeIn: {
          "0%": {
         
            opacity: 0,
          },

          "100%": {
           
            opacity: 1,
          },
        },
        spinner: {
          "100%": { transform: "rotate(360deg)" },
        },
        stroke: {
          "0%": { "stroke-dasharray": " 1,150", "stroke-dashoffset": 0 },
          "100%": { "stroke-dasharray": "90,150", "stroke-dashoffset": -124 },
          "50%": { "stroke-dasharray": "90,150", "stroke-dashoffset": -35 },
        },
        shimmer: {
          from: {
            left: " calc(50% - 72px * 2 - 72px / 2)",
          },

          to: {
            left: " calc(50% - 72px / 2)",
          },
        },
      },
    },
    screens: {
      mobile: { max: "420px" },
      xs: { min: "421px", max: "540px" },
      tablet: "540px",
      ...defaultTheme.screens,
      sm: { min: "541px", max: "739px" },
      md: "740px",
    },
  },
  plugins: [require("tailwind-scrollbar"), require("@tailwindcss/line-clamp")],
};
