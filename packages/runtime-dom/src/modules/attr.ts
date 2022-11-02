/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-02 11:43:58
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-02 11:44:04
 * @FilePath: /vue3-study/packages/runtime-dom/src/modules/attr.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
//更新属性

export const patchAttr = (el, key, value) => {
    if (value == null) {
        el.removeAttribute(key);
    } else {
        el.setAttribute(key, value);
    }
}