/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Portrait Design System Colors
        'portrait-ink': '#08304c',
        'nautical-teal': '#084e72',
        'charcoal-outline': '#353535',
        'graphite-body': '#2c2c2c',
        'slate-helper': '#797979',
        'iron-quiet': '#585858',
        'ash-divider': '#dedede',
        'fog-edge': '#c7c7c7',
        'mist-hairline': '#eeeeee',
        'white-canvas': '#ffffff',
        'mint-wash': '#d7ffe2',
        'sky-wash': '#e8f1ff',
        'peach-wash': '#ffebd6',
        // Rainbow spectrum colors
        'rainbow': {
          'blue': '#26c0ff',
          'magenta': '#e600c2',
          'red': '#ff4940',
          'orange': '#ffa130',
          'yellow': '#ffc837',
          'green': '#00cc3d'
        }
      },
      fontFamily: {
        'switzer': ['Switzer', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'basier': ['Basier Circle', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      backgroundImage: {
        'rainbow-gradient': 'linear-gradient(90deg, #26c0ff, #e600c2 20%, #ff4940 40%, #ffa130 60%, #ffc837 80%, #00cc3d)'
      }
    },
  },
  plugins: [],
}