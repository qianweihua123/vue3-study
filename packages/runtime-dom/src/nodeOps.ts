/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-02 09:47:17
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-06 11:59:51
 * @FilePath: /vue3-study/packages/runtime-dom/src/nodeOps.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
//nodeOps 这个文件是操作 dom 的一些方法

export const nodeOps = {
    //创建元素的方法
    createElement(tageName) {
        debugger
        return document.createElement(tageName)
    },
    //移动节点的方法 anchor是锚点，parent 是父节点
    /**
    * @description 描述在html中，如果需要动态的插入数据标签(li、a等)，
    * 则需要使用到标题所示的appendChild()或insertBefore()来实现。
    * appednChild只能向末尾添加子节点
    * nsertBefore() 方法：可在已有的子节点前插入一个新的子节点。
    * 语法 ：insertBefore(newchild,refchild)//第一个参数是新的节点变量
    * 如果第二个参数为 null 往后追加，如果有值，则是将新的节点插入到第二个参数位置的前面1
    */
    insert(child, parent, anchor) {
        //insertBefore这个方法是移动性的     A B C D  -> A C B  D
        parent.insertBefore(child, anchor || null);
    },
    //移除节点的方法，通过找到父节点去移除
    remove(child){
        const parent =child.parentNode;
        if(parent){
            parent.removeChild(child)
        }
    },

    //查找节点
    querySelector(selector){
        return document.querySelector(selector)
    },

    //查找父节点
    parentNode(node){
        return node.parentNode
    },

    //查找兄弟节点

    nextSibling(node){
        return node.nextSibling
    },

    //设置文本
    setElementText(el,text){
        el.textContent = text
    },

    //创建文本
    createText(text){
        return document.createTextNode(text)
    },

    setText(node,text){
        node.nodeValue = text
    }
}