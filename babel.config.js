module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        safe: false,
        allowUndefined: true,
      },
    ],
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@navigation': './src/navigation',
          '@hooks': './src/hooks',
          '@utils': './src/utils',
          '@services': './src/services',
          '@constants': './src/constants',
          '@types': './src/types',
          '@features': './src/features',
          '@assets': './src/assets',
          '@context': './src/context',
          '@config': './src/config',
        },
      },
    ],
    'react-native-worklets/plugin',
  ],
};
