/** @type {import('tailwindcss').Config} */
module.exports = {
     darkMode: 'class',
     content: [
       './pages/**/*.{js,ts,jsx,tsx,mdx}',
       './components/**/*.{js,ts,jsx,tsx,mdx}',
       './app/**/*.{js,ts,jsx,tsx,mdx}',
     ],
     theme: {
       extend: {
         fontSize: {
           'subtitle': '1.25rem',
           'large-subtitle': '1.5rem',
         },
         colors: {
           'glass': 'rgba(255, 255, 255, 0.95)',
           'dark-glass': 'rgba(31, 41, 55, 0.95)',
         }
       },
     },
     plugins: [],
   }
   