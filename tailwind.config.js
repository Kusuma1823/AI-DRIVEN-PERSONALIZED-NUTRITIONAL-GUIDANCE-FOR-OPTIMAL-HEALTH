/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        chai: {
          50: "#FDFBD4",
          100: "#D47E30",
          200: "#8D5A2B",
          300: "#825E34",
          900: "#825E34"
        },
        ink: {
          900: "#2D2D2D"
        },
        spice: {
          cream: "#FDFBD4",
          orange: "#D47E30",
          brown: "#8D5A2B",
          dark: "#825E34"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(45,45,45,0.08)",
        md: "0 4px 12px rgba(212,126,48,0.1)"
      },
      borderRadius: {
        lg: "16px",
        xl: "20px"
      }
    }
  },
  plugins: []
};

