/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-10-29 09:21:20
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-10-30 11:48:56
 * @FilePath: /vue3-study/packages/runtime-core/src/apiWatch.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { isFunction, isObject } from "@vue/shared";
import { isReactive } from '../../reactivity/src/reactive'
import { ReactiveEffect } from "../../reactivity/src/effect";
//第一个参数观察的源，第二个回调函数，三是配置的选项
export function watch(source, cb, options?) {
    return doWatch(source, cb, options)
}

//这的 effect 相当于 watch 里面的 source，是一个函数，用于重新计算，options是配置项
export function watchEffect(effect, options?) {
    //此方法没有回调函数
    doWatch(effect, null, options);
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
    } else if (isFunction(source)) { //如果是函数，赋值到 getter
        getter = source
    }

    let oldValue;//用于存储老值
    let cleanup;
    //用户如果使用 onCleanup 会传入一个函数 ，用户在外部一旦调用这个函数那就好讲用户传入
    //的函数赋值到内部的 cleanup 上，这上面就有值了
    //onCleanup是源码中定义的一个函数，放到了 cb 的第三个参数上面
    //一旦执行将用户传入的函数放到 cleanup变量上了
    const onCleanup = (userCb) => {
        cleanup = userCb;
    }
    //定义调度函数
    const job = () => {
        if (cb) {
            let newValue = effect.run() //return 执行的是 getter
            //第一次执行的时候这个值 cleanup 是空的，因为还没执行 cb，cb 里面才会赋值
            //如果 watch 观测的变量连续改，那么第二次执行的 cb的某段依赖传入变量的程序 会被屏蔽掉，因为这个时候 cleanup 已经有值了
            //因为利用了闭包，所以第一次执行 cb 保存了第一次的 flag，第二次执行回调的时候有值（这个值是第一次的 包含flag的函数）
            //将这个 flag 改 false，等到第一次的异步函数执行完，再执行 flag 标识下面程序的时候已经改完 flag，已经屏蔽掉了
            if (cleanup) cleanup();
            //用户传入的回调函数如果传入了三个参数，说明第三个对应 oncleanup
            cb(newValue, oldValue, onCleanup) //调用回调函数传入新值和老值
            //然后将新值赋值到老值上
            oldValue = newValue
        } else {
            //没有回调的情况下，直接执行 getter
            effect.run()
        }
    }
    //getter是 fn，job 是 schedluer 回调函数
    const effect = new ReactiveEffect(getter, job)
    //如果配置了 immediate 那就立即执行
    if (options?.immediate) {
        return job()
    }

    oldValue = effect.run()//赋值老值

}