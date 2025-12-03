/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xxs': '360px',   // Pantallas muy pequeñas (arriba de 360px)
        'xs': '475px',    // Celulares pequeños
        '2xl': '1536px',  // Pantallas extra grandes (TV)
        '3xl': '1920px',  // Full HD
      },
      fontSize: {
        'xxs': '0.625rem', // 10px para pantallas muy pequeñas
      },
    },
  },
  plugins: [],
}