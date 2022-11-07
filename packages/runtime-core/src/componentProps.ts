import { reactive } from "@vue/reactivity";

/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-06 17:54:42
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-06 18:06:05
 * @FilePath: /vue3-study/packages/runtime-core/src/componentProps.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export function initProps(instance: any,rawProps){
    // props和 attrs 是互斥的，一个属性如果在 props里面出现，那么 attrs 里面就没有
    const props = {}
    const attrs = {}
    //vnode.type上面的 props == propsOptions
    const options = instance.propsOptions;
    //传入的这个 rawProps 是vnode.props上的
    //一个是 vnode.props 一个是 vnode.type.props上
    if(rawProps){
        for(let key in rawProps){//循环 vnode.Props
            const value = rawProps[key]//取出每一项
            if(key in options){ //vnode.type.Props
            //   如果这个 key 是在vnode.type.Props里面的
              //就是 props 里面的额属性
              props[key] = value
            }else{
                //反之就是 attrs 里面的
                attrs[key] = value
            }
        }
    }
     //最后将 props 变成响应式的，放到组件实例对象的 props 上，
     //attrs 也放上去
    instance.props = reactive(props); // 原则上props只需要管第一层就可以了
    instance.attrs = attrs;
}