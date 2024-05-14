/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./app/**/*.{js,jsx}", "./src/**/*.{js,jsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1200px",
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        "very-dark-purple": "#120338", // replace with your desired hex code
        "very-dark-blue": "#070724", // replace with your desired hex code
      },
      boxShadow: {
        "white-small": "0px 0px 15px #c6c5ed",
        "white-large": "0px 0px 30px #c6c5ed",
        "white-xl": "0px 0px 45px #c6c5ed",
        "red-small": "0px 0px 15px #323354",
        "red-large": "0px 0px 30px #323354",
      },
      transitionDuration: {
        300: "300ms",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in-vigor": {
          "0%": { transform: "translate(0, 0) rotate(0deg)", opacity: "0" },
          "10%": { transform: "translate(-0.1rem, -0.2rem) rotate(-0.1deg)" },
          "20%": { transform: "translate(-0.2rem, 0rem) rotate(0.1deg)" },
          "30%": { transform: "translate(0.2rem, 0.2rem) rotate(0deg)" },
          "40%": { transform: "translate(0.1rem, -0.1rem) rotate(0.1deg)" },
          "50%": { transform: "translate(-0.1rem, 0.2rem) rotate(-0.1deg)" },
          "60%": { transform: "translate(-0.2rem, 0.1rem) rotate(0deg)" },
          "70%": { transform: "translate(0.2rem, 0.1rem) rotate(-0.1deg)" },
          "80%": { transform: "translate(-0.1rem, -0.1rem) rotate(0.1deg)" },
          "90%": { transform: "translate(0.1rem, 0.2rem) rotate(0deg)" },
          "100%": { transform: "translate(0, 0) rotate(0deg)", opacity: "1" },
        },
        slideOutLeft: {
          "0%": {
            transform: "translateX(0)",
            opacity: "1",
            backgroundColor: "initial", // Note: Tailwind doesn't support 'initial' by default
          },
          "100%": {
            transform: "translateX(100%)",
            opacity: "0",
            backgroundColor: "#20203d",
          },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "25%, 75%": { opacity: "0.5" },
          "50%": { opacity: "0.25" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-out-left": "slideOutLeft 0.5s forwards",
        "fade-in-vigor": "fade-in-vigor 0.5s ease-out",
        pulse: "pulse 1s ease-in-out infinite",
      },
      fontFamily: {
        lato: ["var(--font-lato)", "Bebas Neue", "sans-serif"],
        montserrat: [
          "Montserrat",
          "var(--font-montserrat)",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          '"Fira Sans"',
          '"Droid Sans"',
          '"Helvetica Neue"',
          "sans-serif",
        ],
      },
      backgroundImage: {
        "gradient-radial-light": "radial-gradient(ellipse at center, #ffffff, #fbfaff)",
        "gradient-radial-light-2": "radial-gradient(ellipse at center, #bebed3, #fbfaff)",
        "gradient-radial-dark": "radial-gradient(ellipse at center, #050523, #0a0a33)",
        "gradient-radial-dark-2": "radial-gradient(ellipse at center, #14142d, #070722)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
