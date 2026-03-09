/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        'cloud-blue': '#EDF4FA',
        'calm-ocean': '#8FB6D8',
        'dusty-denim': '#5F86A6',
        'midnight-blue': '#243A5E',
        'powder-sky': '#CFE3F1',
      },
    },
  },
  plugins: [],
}
