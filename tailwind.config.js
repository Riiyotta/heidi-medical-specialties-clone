/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        page: '#FCFAF8',
        'text-primary': '#28030F',
        'text-secondary': '#755760',
        'accent-yellow': '#FBF582',
        'border-base': '#F0DFD1',
        'card-white': '#FFFFFF',
        'dark-fill': '#28030F',
        'drawer-invert': '#F9F4F1',
        'badge-check': '#3C6DDD',
        'badge-check-tick': '#F9F4F1',
        forest: '#194B22',
        // Nav flyout icons + active nav label, sampled live: rgb(88,143,96).
        sage: '#588F60',
        // Active-tab 4px stroke under the nav trigger: rgb(64,118,72).
        'sage-stroke': '#407648',
        'forest-700': '#0F3416',
        accent: '#F9F4F1',
        // Skeleton fills, sampled from live's loading placeholders.
        'sand-75': '#F6EFEA',
        'sand-100': '#F6ECE4',
        'sand-150': '#F4E7DD',
      },
      fontFamily: {
        sans: ['inter', 'inter Fallback', 'system-ui', 'sans-serif'],
        serif: ['exposure', 'exposure Fallback', 'Georgia', 'serif'],
      },
      maxWidth: {
        'container-xl': '1920px',
        'container-lg': '1280px',
      },
      spacing: {
        global: '64px',
        'global-mobile': '20px',
      },
      padding: {
        'section-md': '80px',
        'section-lg-inset-y': '176px',
        'section-lg-inset-x': '128px',
      },
      gap: {
        'section-md': '80px',
      },
      borderRadius: {
        card: '24px',
        testimonial: '16px',
        button: '12px',
        'drawer-tab': '18.75px 18.75px 0 0',
      },
      boxShadow: {
        'btn-primary': '0 1px 3px 1px rgba(120,90,60,.06), 0 1px 1px 0 rgba(120,90,60,.03)',
        'testimonial-md': '0 6px 18px 8px rgba(120,90,60,.07), 0 2px 6px 1px rgba(120,90,60,.04)',
        xs: '0 1px 2px 0 rgba(120,90,60,.05)',
      },
      fontSize: {
        'h1-desktop': ['56px', { lineHeight: '56px', letterSpacing: '-2.8px' }],
        'h1-mobile': ['40px', { lineHeight: '40px', letterSpacing: '-2px' }],
        'h2-desktop': ['48px', { lineHeight: '52.8px', letterSpacing: '-2.4px' }],
        'h2-mobile': ['36px', { lineHeight: '39.6px', letterSpacing: '-1.8px' }],
        'h2-lg-desktop': ['56px', { lineHeight: '56px', letterSpacing: '-2.8px' }],
        'h3-desktop': ['24px', { lineHeight: '30px', letterSpacing: '-1.2px' }],
        'h3-faq': ['16px', { lineHeight: '24px' }],
        'h6-quote': ['24px', { lineHeight: '30px', letterSpacing: '-1.2px' }],
        body: ['16px', { lineHeight: '22.4px' }],
        'nav-link': ['16px', { lineHeight: '24px' }],
        'nav-small': ['14px', { lineHeight: '19.6px' }],
        'btn-outline': ['16px', { lineHeight: '24px' }],
        'btn-pill': ['14px', { lineHeight: '19.6px', letterSpacing: '-0.42px' }],
        caption: ['12px', { lineHeight: '16.8px' }],
        'card-title': ['18px', { lineHeight: '25.2px' }],
        'card-author': ['14px', { lineHeight: '19.6px' }],
      },
    },
  },
  plugins: [],
}
