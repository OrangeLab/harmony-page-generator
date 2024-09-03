# 使用示例
```
const path = require('path')
const HarmonyPagePlugin= require('@didi/harmony-page-generator')

module.exports = {
  type: 'hummer',
  webpack: {
    // entries: "src/*/index.ts",
    entries: "src/*.js",
    output: {
      path: path.resolve(__dirname, './dist'),
      filename: "[name].js"
    },
    plugins: [
      new HarmonyPagePlugin({
        outputDir:  './template',
        hummerApiDir: path.resolve(__dirname, './dist')
      }),
    ]
  }
}
```
