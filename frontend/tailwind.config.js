// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff0000',
        secondary: '#cc0000',
        danger: '#dc3545',
        'danger-hover': '#c82333',
        info: '#6c757d',
        'info-hover': '#5a6268',
        'gray-light': '#f9f9f9',
        'border-light': '#ddd',
        'text-dark': '#333'
      },
      keyframes: {
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        pulseOnce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' } // ¡Hazlo muy obvio para probar!
        }
      },
      animation: {
        scaleIn: 'scaleIn 0.3s ease-out forwards'
      }
    }
  },
  plugins: []
}
