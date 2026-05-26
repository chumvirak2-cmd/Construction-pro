/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Performance-optimized breakpoints
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      // Optimized animation timing
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin': 'spin 1s linear infinite',
        'bounce': 'bounce 1s infinite',
      },
      // Optimized transitions
      transitionDuration: {
        'default': '150ms',
        'fast': '100ms',
        'slow': '200ms',
      },
    },
  },
  plugins: [],
  // Performance optimizations
  corePlugins: {
    // Disable unused utilities to reduce CSS bundle
    preflight: true, // Keep for resets
  },
  // Future features for better compatibility
  future: {
    respectDefaultRingColorOpacity: true,
  },
  // Optimize for production
  safelist: [],
}