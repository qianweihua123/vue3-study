/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-10-26 15:38:35
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-10-26 15:42:28
 * @FilePath: /vue3-study/babel.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
module.exports = {
    presets: [['@babel/preset-env', {targets: {node: 'current'}}]],
  };
  module.exports = {
      presets: [
          ['@babel/preset-env', {targets: {node: 'current'}}],
          '@babel/preset-typescript',
      ], //以我当前的 node 版本去转换 ,让 jest 识别 ts
  };