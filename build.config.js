import { terser } from 'rollup-plugin-terser'
export default {
  input: 'index.js',
  output: {
    file: 'pjax.shokax.min.js',
    format: 'umd',
    name: 'Pjax'
  },
  plugins: [
    terser({
      keep_classnames: true,
      keep_fnames: true
    })
  ]
};