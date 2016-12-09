import flow from 'rollup-plugin-flow';
import jsx from 'rollup-plugin-jsx'
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

const plugins = [
  flow(),
  jsx({factory: 'React.createElement'}),
  commonjs({
    include: [
      'node_modules/react/**',
      'node_modules/react-dom/**',
    ],
    namedExports: {
      'node_modules/react/react.js': ['PropTypes'],
    },
  }),
  nodeResolve({
    module: false,
    browser: true,
  }),
  // babel({
  //   babelrc: false,
  //   exclude: 'node_modules/**',
  //   presets: [
  //     ['es2015', {modules: false}],
  //     'react',
  //   ],
  // }),
];

export default [{
  entry: 'src/popup.js',
  dest: 'extension/dist/popup.js',
  format: 'iife',
  moduleName: 'soundControl',
  moduleId: 'sound-control',
  plugins,
  sourceMap: true,
}];
