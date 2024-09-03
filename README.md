# 鸿蒙页面模板插件

## 使用示例
```
const path = require('path')
const HarmonyPagePlugin= require('@hummer/harmony-page-generator')

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
注意：需发包使用
