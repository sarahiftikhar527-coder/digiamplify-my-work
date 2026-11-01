/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        digi: {
          red: '#D90012',
          darkRed: '#7A0010',
          dashboard: '#E50914',
          black: '#000000',
          card: '#0B0B0B',
          cardLight: '#111111',
          label: '#9CA3AF'
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        urbanist: ['Urbanist', 'sans-serif']
      },
      boxShadow: {
        redGlow: '0 10px 40px rgba(217, 0, 18, 0.35)',
        redSoft: '0 0 40px rgba(217, 0, 18, 0.18)'
      },
      borderRadius: {
        digi: '10px'
      },
      maxWidth: {
        digi: '1200px'
      },
      backgroundImage: {
        'dark-gradient': 'linear-gradient(180deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
        'dark-radial': 'radial-gradient(circle at center, #1a1a1a 0%, #000000 70%)',
        'red-radial': 'radial-gradient(circle at top right, rgba(217,0,18,.22), transparent 45%)'
      }
    }
  },
  plugins: []
}