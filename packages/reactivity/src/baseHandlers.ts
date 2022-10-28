/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-10-26 15:05:11
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-10-28 10:08:20
 * @FilePath: /vue3-study/packages/reactivity/src/baseHandlers.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { ReactiveFlags } from "./reactive";
import { track, trigger } from "./effect";
export const mutableHandlers = {
    // reflect 的 优势，内置对象，以及它的 api 和 proxy 是一一对应的，根据下发的例子，可以看出通过反射的方式可以拦截到内部的两次触发，如果是 target[key]是只能拦截到外层的访问

    /**
    * let person = {
    name: 'jw',
    get aliasName() { // this = person
        return '**' + this.name + '**'
     }
    }

    let proxy = new Proxy(person, {
       get(target, key, receiver) {
          console.log(key)
          return Reflect.get(target, key, receiver); // person.alianame
        },
       set(target, key, value, receiver) {

        return Reflect.set(target, key, value, receiver);;
       },
      })
     // 这样我们只监控到了aliasName 的取值  name的取值操作监控不到
      console.log(proxy.aliasName); // 取aliasName的时候 触发了获取 name的操作  2
    *
    *
    */

    // 有三个参数，目标 target对象,key属性名，receiver指向  当前的proxy对象
    get(target, key, receiver) {
        if (ReactiveFlags.IS_REACTIVE == key) {
            return true;
        }
        track(target, key)
        return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
        //取出旧的值
        let oldValue = target[key]
        let result = Reflect.set(target, key, value, receiver)
        if (oldValue != value) {
            //新老值不相同的情况下,执行 trigger 触发更新
            trigger(target, key, value, oldValue)
        }
        return result
    }
}