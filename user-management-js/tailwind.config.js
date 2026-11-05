/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/app/**/*.{js,jsx,mdx}",
    "./src/components/**/*.{js,jsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 35px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
