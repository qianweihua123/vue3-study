/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-02 09:37:57
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-02 21:23:05
 * @FilePath: /vue3-study/packages/runtime-dom/src/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { nodeOps } from "./nodeOps";

import { patchProp } from "./pathProp";
import { createRenderer } from "@vue/runtime-core";

const renderOptions = Object.assign(nodeOps, { patchProp })

export const render = (vnode, container) => {
    return createRenderer(renderOptions).render(vnode, container);
  };
  export * from "@vue/runtime-core";