/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      transitionTimingFunction: {
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'out-back-expo': 'cubic-bezier(0.175, 1.885, 0.32, 1.275)',
        'out-back': 'cubic-bezier(0.175, 2.885, 0.32, 1.275)',
        'out-back-little': 'cubic-bezier(0.175, 2.885, 0.32, 1.275)',
      },
      scale: {
        '250': 'scale(250%)'
      }
    },
  },
  plugins: [],
}