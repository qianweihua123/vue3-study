/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-02 16:45:35
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-02 21:05:18
 * @FilePath: /vue3-study/packages/runtime-core/src/tests/h.spec.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { h } from '../h'

describe('h', () => {
    it("h1 render", () => {
        //如果是传的两个，会进入参数 2 的判断，如果第二个参数不是对象并且不是数组，走分支
        // createVNode(type, null, propsOrChildren); 将 hello 文本放到第三个参数上
       const a =  h('div', 'hellow')//参数是两个的情况
    })

    it("h2 render", () => {
        //这个方法中传入的第二个是子节点，一进去会先调用子节点的方法
        //因为内层的 h 方法只有一个参数，所以在 h 方法中走到最后的 createVNode
        //内层的执行完后返回了一个对象，所以第二个参数是一个对象
        //在执行外部 h 的时候就会再去匹配，这个时候第二个参数就是一个虚拟对象
        //再进去执行的时候就会创建一个 type 为 div 的对象，children是第二个参数
        /**
        * @description 描述  进入到下面这个判断分支中
        *     if (l == 2) { // 只有属性，或者一个元素儿子的时候
        //如果长度为 2 的话有上面这几种情况
        if (isObject(propsOrChildren) && !Array.isArray(propsOrChildren)) {
                      //如果是对象并且不是数组 h(type,{})
            if (isVNode(propsOrChildren)) {
        */
       const b =  h('div',h('span')) //参数是两个的情况
    })

    it("h3 render", () => {
        //如果是传的两个，会进入参数 2 的判断
       const c =  h('div',{style:{color:'red'}});//参数是两个的情况
    })

    it("h4 render", () => {
        //如果是传的两个，会进入参数 2 的判断
        //一进去先执行数组中的两个 span
        //最后执行外层的数组，执行外层数组的时候，还是三个参数
        //第一个是 div ，第二个 null，第三个是一个数组，放着已经执行过 h 的两个 span vnode 对象

        /**
        * @description 描述
     } else if (l === 3 && isVNode(children)) {
            children = [children];
        }
        return createVNode(type, propsOrChildren, children);
        */
       const c = h('div',null,[h('span'),h('span')])//参数是两个的情况
    })

    it("h5 render", () => {
        //如果是传的三个
       const d =   h('div',{},h('div',{},[h('span')]))
    })
})