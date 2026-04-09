/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        wechat: {
          green: '#07C160',
          'light-green': '#09BB07',
          bg: '#EDEDED',
          'bubble-me': '#95EC69',
          'nav': '#F7F7F7',
          'border': '#E0E0E0'
        }
      }
    }
  },
  plugins: []
};
