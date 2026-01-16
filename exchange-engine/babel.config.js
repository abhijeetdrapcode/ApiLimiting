module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '24',
        },
      },
    ],
  ],
  plugins: [
    ['transform-remove-console', { exclude: ['log', 'error', 'warn'] }], // Removed 'log' for production
  ],
};
