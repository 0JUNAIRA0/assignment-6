// This works with the Tailwind CDN when loaded BEFORE the CDN script.
window.tailwind = {
  config: {
    theme: {
      extend: {
        container: { center: true, padding: '1rem' },
        colors: {
          brand: {
            DEFAULT: '#166534',
            light: '#22c55e',
            dark: '#064e3b'
          }
        },
        borderRadius: { '2xl': '1rem' }
      }
    }
  }
};
