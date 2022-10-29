
/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-10-26 14:58:21
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-10-29 09:48:21
 * @FilePath: /vue3-study/packages/reactivity/src/reactive.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
//我们定义在 shared 文件夹下的工具函数方法
import { isObject } from '@vue/shared';
import { mutableHandlers } from './baseHandlers';

//ts 的枚举给意见 proxy 过的对象加个标识
export const enum ReactiveFlags {
    IS_REACTIVE = "__v_isReactive",
}

export function isReactive(target) {
    return !!(target && target[ReactiveFlags.IS_REACTIVE]);
  }

//WeakMap key 只能是对象，并且 key 清空，值的引用也清楚，利用垃圾回收
const reactiveMap = new WeakMap();

export function reactive(target) {
    /**
    *  如果传入的不是对象的话，直接不往下执行了
    */
    if (!isObject(target)) {
        return target;
    }
    //相当于我在这里强行给这个对象加了个访问操作，触发了 get，如果访问的属性名是我们定义的，说明已经代理过
    if(target[ReactiveFlags.IS_REACTIVE]){
        return target
    }

    //查看是否存储过，存储过直接返回之前的结果
    const exisitsProxy = reactiveMap.get(target);

    if (exisitsProxy) {
      return exisitsProxy;
    }
    /**
    * 内部是通过 proxy 实现的，第二个参数是一个对象，我们抽离出去
    */
   const proxy = new Proxy(target,mutableHandlers);

   //如果没有存储过，那就设置进去
   reactiveMap.set(target, proxy);

   return proxy
}