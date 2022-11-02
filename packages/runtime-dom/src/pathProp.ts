/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-02 10:53:28
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-02 11:45:27
 * @FilePath: /vue3-study/packages/runtime-dom/src/pathProp.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import { patchAttr } from "./modules/attr";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/event";
import { patchStyle } from "./modules/style";
//此方法是用来处理属性，事件的

export const patchProp = (el, key, prevValue, nextValue) => {
    if (key === 'class') {
        patchClass(el, nextValue)
    } else if (key === 'style') {
        patchStyle(el, prevValue, nextValue);
    } else if (/^on[^a-z]/.test(key)) {
        patchEvent(el, key, nextValue);
    } else {
        patchAttr(el, key, nextValue);
    }
}