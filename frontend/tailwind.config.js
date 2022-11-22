/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "blue-primary": "rgb(1,123,196)",
        "green-primary": "#007f49",
        "card": "#F7F7F7",
        'card-border': "#dddddd",
      },
      backgroundImage: {
        'login': "url('https://testonline.uet.vnu.edu.vn/logos/bg.png')",
      }
    },
  },
  plugins: [],
}
