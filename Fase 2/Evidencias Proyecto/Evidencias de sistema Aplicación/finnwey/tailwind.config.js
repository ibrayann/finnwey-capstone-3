/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary-dark': '#151E3F', // Azul muy oscuro (fondo superior)
        primary: '#2C3E7B', // Azul medio
        'primary-light': '#405AAA', // Azul más claro
        'card-bg': '#F5F7FF', // Color claro para la tarjeta
        secondary: '#D1D5DB', // Gris para elementos secundarios
        text: {
          primary: '#1f2937',
          secondary: '#6b7280',
          light: '#ffffff',
          dark: '#374151',
        },
        border: {
          light: '#e5e7eb',
          dark: '#374151',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui'],
      },
    },
  },
  plugins: [],
}
