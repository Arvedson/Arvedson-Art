/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      overrideBrowserslist: ['safari >= 10', 'iOS >= 10'], // Ajusta las versiones de Safari 
    },
  },
};

export default config;