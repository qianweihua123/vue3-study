/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-10-29 09:36:45
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-13 19:15:05
 * @FilePath: /vue3-study/packages/runtime-core/src/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

// Vue模块划分中，将createRenderer、h方法放在了runtime-core模块中 1
export * from "./apiWatch";
export * from "./h";
export * from "./vnode";
export * from "./renderer";
export * from "./component";
export * from "./apiLifecycle";
export * from "./defineAyncComponent";
export * from "./apiInject"
export { TeleportImpl as Teleport } from "./teleport";