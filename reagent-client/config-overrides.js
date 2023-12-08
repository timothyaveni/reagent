// config-overrides.js
module.exports = function override(config, env) {
  // New config, e.g. config.plugins.push...
  config.module.rules.push({
    test: /\.m?js/,
    resolve: {
      fullySpecified: false,
    },
  });
  return config;
};

