module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo (SDK 50+) already wires up Expo Router.
    // The "@/*" alias is resolved by Metro via tsconfig "paths".
    presets: ['babel-preset-expo'],
  };
};
