/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'primary-dark': 'var(--primary-dark)',
        'primary-purple': 'var(--primary-purple)',
        'primary-magenta': 'var(--primary-magenta)',
        'primary-light-purple': 'var(--primary-light-purple)',
        'primary-pink': 'var(--primary-pink)',
        'secondary-purple': 'var(--secondary-purple)',
        'secondary-dark': 'var(--secondary-dark)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'accent-blue': 'var(--accent-blue)',
        'accent-green': 'var(--accent-green)',
        'accent-orange': 'var(--accent-orange)',
        'accent-red': 'var(--accent-red)',
        'surface-primary': 'var(--surface-primary)',
        'surface-secondary': 'var(--surface-secondary)',
        'surface-tertiary': 'var(--surface-tertiary)',
        'border-primary': 'var(--border-primary)',
        'border-secondary': 'var(--border-secondary)',
      },
    },
  },
  plugins: [],
}
