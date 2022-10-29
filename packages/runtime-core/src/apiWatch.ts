/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-10-29 09:21:20
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-10-29 10:32:36
 * @FilePath: /vue3-study/packages/runtime-core/src/apiWatch.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { isFunction, isObject } from "@vue/shared";
import { isReactive } from '../../reactivity/src/reactive'
import { ReactiveEffect } from "../../reactivity/src/effect";
//第一个参数观察的源，第二个回调函数，三是配置的选项
export function watch(source, cb, options) {
    return doWatch(source, cb, options)
}

function traverse(source, s = new Set()) {
    if (!isObject(source)) {
        return source
    }
    if (s.has(source)) { //采用 set 结构来存储
        return source
    }
    s.add(source) //存储进去
    for (let key in source) {
        traverse(source[key], s) //递归取值，一旦访问就会收集 effect
    }

    return source
}
function doWatch(source, cb, options) {
    let getter //稍微会传入 effect类 中作为第一个函数，
    if (isReactive(source)) { //是代理后的对象的情况下
        getter = () => traverse(source)
    }else if(isFunction(source)){ //如果是函数，赋值到 getter
        getter = source
    }

    let oldValue;//用于存储老值
    //定义调度函数
    const job = () => {
        let newValue = effect.run() //return 执行的是 getter
        cb(newValue,oldValue) //调用回调函数传入新值和老值
        //然后将新值赋值到老值上
        oldValue = newValue
    }
    //getter是 fn，job 是 schedluer 回调函数
    const effect = new ReactiveEffect(getter,job)
    //如果配置了 immediate 那就立即执行
    if(options.immediate){
        return job()
    }

    oldValue = effect.run()//赋值老值

}