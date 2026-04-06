/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-accent-soft)',
          100: 'var(--color-accent-soft)',
          500: 'var(--color-accent)',
          600: 'var(--color-accent)',
          700: 'var(--color-accent-hover)',
        },
        app: 'var(--color-bg-app)',
        card: 'var(--color-bg-card)',
        panel: 'var(--color-bg-panel)',
        sidebar: 'var(--color-bg-sidebar)',
        input: 'var(--color-bg-input)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          soft: 'var(--color-accent-soft)',
        },
        fg: {
          DEFAULT: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
          onAccent: 'var(--color-text-on-accent)',
        },
        border: {
          DEFAULT: 'var(--color-border-default)',
          strong: 'var(--color-border-strong)',
        },
        state: {
          success: 'var(--color-success)',
          warning: 'var(--color-warning)',
          danger: 'var(--color-danger)',
          info: 'var(--color-info)',
        },
      },
      boxShadow: {
        panel: 'var(--shadow-card)',
        focus: 'var(--shadow-focus)',
      },
      backgroundImage: {
        'app-gradient': 'var(--gradient-app)',
        'accent-gradient': 'var(--gradient-accent)',
      },
    },
  },
  plugins: [],
}
