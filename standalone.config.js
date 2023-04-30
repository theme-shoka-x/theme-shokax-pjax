import cleanup from 'rollup-plugin-cleanup'
export default {
  input: 'index.js',
  output: {
    file: 'theme-shokax-pjax.js',
    format: 'umd',
    name: 'Pjax'
  },
  plugins: [cleanup()]
};