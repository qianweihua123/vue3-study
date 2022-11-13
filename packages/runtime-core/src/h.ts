/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-02 16:16:50
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-13 19:55:27
 * @FilePath: /vue3-study/packages/runtime-core/src/h.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 提供多样的api 根据参数来区分

import { isObject } from "@vue/shared";
import { createVNode, isVNode } from "./vnode";

export function h(type, propsOrChildren?, children?) {

    //h 的传参是多种多样的，可以通过判断参数的长度
    const l = arguments.length
    // h(type,{})   h(type,h('span')) => h(type,[h('span')])
    //  h(type,[])   h(type,'文本')
    if (l == 2) { // 只有属性，或者一个元素儿子的时候
        //如果长度为 2 的话有上面这几种情况
        if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
            //如果是对象并且不是数组 h(type,{})
            if (isVNode(propsOrChildren)) {
                return createVNode(type, null, [propsOrChildren]);
            }
            return createVNode(type, propsOrChildren);
        } else {
            // 数组 或者文本
            return createVNode(type, null, propsOrChildren);
        }
    } else {
        if (l > 3) {
            children = Array.from(arguments).slice(2);
            // h('div',{},'a','b','c') 这样操作第二个参数必须是属性 h('div','e','a','b','c')

            // h('div',{},h('span')) => h('div',{},[h('span')])
        } else if (l === 3 && isVNode(children)) {
            children = [children];
        }
        return createVNode(type, propsOrChildren, children);
    }
}