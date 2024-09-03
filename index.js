const path = require('path');
const fs = require('fs');

class HarmonyPageGeneratorPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('WrapFunctionPlugin', (compilation, callback) => {
      const outputDir = this.options.outputDir || './template';
      // const hummerApiDir = '../dist';
      // 获取所有输出的文件名
      const outputNames = Object.keys(compilation.assets);
      const jsName2path = {}
      outputNames.forEach(outputName => { 
        // 产生template模版
        if (outputName.match(/\.map\b/)) {
          console.log('outputName', outputName)
          return
        }

        const templateContent =`
import { renderFunc } from './${outputName}'
export { renderFunc }
        `

        const { name: prefixName } = path.parse(outputName);

        const filePath = path.join(outputDir, prefixName + 'Entry' + `.ets`);

        jsName2path[outputName] = prefixName + 'Entry'

        console.log(filePath)
        const folderPath = path.join(outputDir);
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }
        // 生成ets文件
        fs.writeFile(filePath, templateContent, (err) => {
          if (err) {
            console.error(filePath + '写入文件时出错：', err);
          } else {
            console.log(filePath+ '文件生成成功');
          }
        });

      });


      const genPathMapStr = () => {
        let str = ''
        for (const jsName in jsName2path) {
          str = str + `'./${jsName}': './${jsName2path[jsName]}',`
        }
        return str
      }
      // 输出动态导入模板
      // TODO: 需要修改路径
      const DynamicImportTemplate = `
import { HMContext, IContentProvider } from 'path/to/ohhummer';

export class DynamicImportContentProvider implements IContentProvider {

  render(context: HMContext) {
    const filePath = urlToFilePathMap[context.baseUrl];
    import(filePath).then((ns:ESObject)=>{
      ns.renderFunc(context.harmonyRuntime.hummerObject, context.harmonyRuntime.globalObject);
    }).catch((e:Error)=>{
      context.handleError('动态import模块失败：'+ context.baseUrl + JSON.stringify(e))
    });
  }
}

const urlToFilePathMap:Record<string , string> = {
  ${genPathMapStr()}
}
      `

      const dynamicImportTemplatePath = path.join(outputDir, `DynamicImportContentProvider.ets`);
      // 生成ets文件
      fs.writeFile(dynamicImportTemplatePath, DynamicImportTemplate, (err) => {
        if (err) {
          console.error('DynamicImportContentProvider.ets写入文件时出错：', err);
        } else {
          console.log('DynamicImportContentProvider.ets 已生成');
        }
      });

      

      const genSourcesStr = () => {
        const etsArray = Object.values(jsName2path).map((path) => `"./src/main/ets/Page/tenon/${path}.ets"`);
        return etsArray.join(',')
      }

      // 输出build-profile.json5
      const buildProfileContent = `
{
  // ...
  "buildOption": {
    // ...
    "arkOptions": {
      // ...
      "runtimeOnly": {
        // ...
        //TODO:请修改项目中build-profile.json5的这个位置,确保sources文件路径引用正确
        "sources": [${genSourcesStr()}]
      }
    }
  },
}
      `
      const buildProfilePath = path.join(outputDir, `build-profile.json5`);
      // 生成ets文件
      fs.writeFile(buildProfilePath, buildProfileContent, (err) => {
        if (err) {
          console.error('build-profile.json5写入文件时出错：', err);
        } else {
          console.log('build-profile.json5 已生成');
        }
      });

      callback();
    });
  }
}

module.exports = HarmonyPageGeneratorPlugin;
