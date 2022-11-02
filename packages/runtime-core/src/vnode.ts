/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-02 14:21:53
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-02 16:54:45
 * @FilePath: /vue3-study/packages/runtime-core/src/vnode.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { isString, ShapeFlags } from "@vue/shared";

export function isVNode(vnode) {
    return vnode.__v_isVnode == true;
}

export function isSameVNode(n1, n2) {
    return n1.type === n2.type && n1.key === n2.key;
}

//type其实就是标签名
export function createVNode(type, props = null, children = null) {
    const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;
    // 虚拟节点要对应真实节点
    const vnode = {
        __v_isVnode: true, // 添加标识是不是vnode
        type,
        props,
        children,
        shapeFlag,
        key: props?.key,
        el: null, // 对应的真实节点
    };
    if (children) {
        let type = 0
        if (Array.isArray(children)) {
            // [vnode，'文本']
            type = ShapeFlags?.ARRAY_CHILDREN
        } else {
            // 文本
            type = ShapeFlags.TEXT_CHILDREN;
        }

        vnode.shapeFlag |= type;
    }
    return vnode; // 根据  vnode.shapeFlag  来判断自己的类型和孩子的类型
}