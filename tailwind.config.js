module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        diwa: {
          orange: "#FBA002",
          olive: "#313B2F",
          cream: "#F4EDE4",
          bg: "#0D0B0C",
          surface: "#1A1614",
          muted: "#A8A29B",
        },
      },
    },
  },
  plugins: [],
};
