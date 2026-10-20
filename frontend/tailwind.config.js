/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:   '#ff6600',   // KIET orange
        secondary: '#88b77b',   // green (login btn, category highlights)
        accent:    '#1e4f8a',   // KIET blue (links, header text)
        dark:      '#2f2f2f',   // footer bg
        moodle: {
          header:  '#ffffff',
          topbar:  '#1a1a1a',
          nav:     '#f8f8f8',
          border:  '#dee2e6',
          block:   '#f7f7f7',
          blockhead: '#6d6d6d',
          link:    '#1177d1',   // Moodle blue links
          linkdark:'#0f5fa8',
          orange:  '#ff6600',
          green:   '#5f7a3a',
          card:    '#ffffff',
        }
      },
      fontFamily: {
        sans: ['"Century Gothic"', 'CenturyGothic', 'AppleGothic', 'Arial', 'Helvetica', 'sans-serif']
      },
      fontSize: {
        'xs':  ['0.75rem',  { lineHeight: '1.4' }],
        'sm':  ['0.8125rem',{ lineHeight: '1.5' }],  // 13px — Moodle body
        'base':['0.875rem', { lineHeight: '1.5' }],  // 14px
        'lg':  ['1rem',     { lineHeight: '1.4' }],
        'xl':  ['1.125rem', { lineHeight: '1.3' }],
        '2xl': ['1.25rem',  { lineHeight: '1.3' }],
      },
      maxWidth: {
        'content': '1180px',
      },
      boxShadow: {
        'block': '0 2px 4px rgba(0,0,0,.08)',
        'card':  '0 1px 3px rgba(0,0,0,.12)',
      },
      borderRadius: {
        DEFAULT: '4px',
      }
    }
  },
  plugins: []
};
