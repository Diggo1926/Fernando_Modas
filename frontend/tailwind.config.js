/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F7F5F2',
        branco: '#FFFFFF',
        borda: '#E8E4DE',
        'borda-suave': '#F0EDE8',
        preto: '#111111',
        ouro: '#B8924A',
        'ouro-claro': '#D4AA6A',
        'ouro-bg': '#FAF6EF',
        texto: '#111111',
        'texto-md': '#888888',
        'texto-leve': '#A8A098',
        verde: '#4A8C65',
        'verde-bg': '#F0F7F3',
        vermelho: '#B85A4A',
        'vermelho-bg': '#FBF0EE',
        azul: '#4A6A9C',
        'azul-bg': '#EEF2F8',
        roxo: '#7A5A9C',
        'roxo-bg': '#F4F0F8',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['Montserrat', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
    },
  },
  plugins: [],
};
