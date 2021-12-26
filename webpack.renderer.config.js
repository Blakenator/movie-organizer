const rules = require("./webpack.rules");
const plugins = require("./webpack.plugins");

const localRules = rules.concat([
  {
    test: /\.css$/,
    use: [{ loader: "style-loader" }, { loader: "css-loader" }],
  },
  {
    test: /\.s[ac]ss$/,
    use: [
      "style-loader", // Step3. Injects common JS to DOM
      "css-loader", // Step2. Turns CSS into common JS
      "sass-loader", // Step1. Turns SASS into valid CSS
    ],
  },
]);

module.exports = {
  module: {
    rules: localRules,
  },
  plugins: plugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
  },
};
