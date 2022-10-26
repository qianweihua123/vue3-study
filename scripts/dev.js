/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-10-26 14:47:41
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-10-26 14:53:25
 * @FilePath: /vue3-study/scripts/dev.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const path = require('path')
const { build } = require('esbuild')

const args = require('minimist')(process.argv.slice(2)); // 解析用户执行命令行的参数
// 这个是打包的模块是哪一个
const target = args._[0] || "reactivity";
const format = args.f || 'global';

const pkg = require(path.resolve(__dirname, `../packages/${target}/package.json`)) //获取打包模块的 pageage.json reactivity

const outputFormat = format.startsWith('global') ?   //如果是 global 开始的话那就是自执行模式，如果 cjs 是 common.js esm es6 module
    'iife' : format === 'cjs'
        ? 'cjs' : 'esm';

// reactivity.global.js
// reactivity.esm.js
// reactivity.cjs.js
const outfile = path.resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`) //输出的文件名

build({
    entryPoints: [path.resolve(__dirname, `../packages/${target}/src/index.ts`)],
    outfile,
    bundle: true,
    sourcemap: true,
    format: outputFormat,
    globalName: pkg.buildOptions?.name,
    platform: format === "cjs" ? "node" : "browser",
    watch: {
        // 监控文件变化
        onRebuild(error) {
            if (!error) console.log(`rebuilt~~~~`);
        },
    },
}).then(() => {
    console.log("watching~~~");
});

