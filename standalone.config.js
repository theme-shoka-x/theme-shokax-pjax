import cleanup from 'rollup-plugin-cleanup'
export default {
  input: 'index.js',
  output: {
    file: 'pjax.shokax.js',
    format: 'umd',
    name: 'Pjax'
  },
  plugins: [cleanup()]
};