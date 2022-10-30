/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-10-26 16:51:01
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-10-30 17:44:23
 * @FilePath: /vue3-study/packages/reactivity/src/effect.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export let activeEffect;

function cleanupEffect(effect) {
    //effect这个传入的是实例，实例上有个 deps 属性，在此处删除依赖的时候 targetMap里面的存储的也清空了，断点调试可查看
    let { deps } = effect
    for (let i = 0; i < deps.length; i++) {
        deps[i].delete(effect) //删除当前的 effect依赖
    }
    effect.deps.length = 0 //删除后但是数组的长度还在那，所有设置为 0
}
export class ReactiveEffect {
    // public写法相当于 this.fn = fn
    public active = true //是否激活
    public deps = []
    public parent = undefined

    constructor(public fn, private scheduler) {

    }
    run() {
        if (!this.active) {
            //如果当前 effect 未激活,那就只执行下用户传入的 fn
            return this.fn()
        }
        //激活状态的情况下
        try {
            //this代表当前的 effect，赋值到 activeEffect上
            //多层 effect 嵌套的情况下，外层 parent 默认值是 undefined
            //当里层 effect 执行的时候这个时候 activeEffect因为是全局变量已经有值了，外层的 parent 是 undefined,内层的 parent 这个时候
            //activeEffect已经有值了，所以它的 parent是外层的这个 this
            this.parent = activeEffect
            activeEffect = this
            //每次 run 的时候清空此 effect 上收集的哪些属性存储了这个依赖，在这一清楚 targetmap中也清除了，清除后会执行 fn，这个时候又会重新把 effect 收集进去，可以断点调试
            //可以看下单测中的事例，当 flag 改变时，另外一个变量不用了，如果不清除，那就又会执行 run 方法，但是这个时候里面没有用到这属性了
            cleanupEffect(this)
            return this.fn()
        } finally {
            //代码执行完后将 activeEffect 赋值为外层的 activeEffect
            activeEffect = this.parent

        }
    }
    stop() {
        if (this.active) {
            //调用 stop 方法的时候可以清空此 effect 上的依赖
            cleanupEffect(this)
            this.active = false //变成失活状态
        }
    }
}

//track方法用来收集依赖
const targetMap = new WeakMap()//key只能是对象，方便垃圾回收，key 消除，值自动回收
export function track(target, key) {
    if (!activeEffect) return;
    //先尝试去 targetMap 中取出
    let depsMap = targetMap.get(target)
    //如果不存在那就设置下
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()))
    }
    //如果能正常取出，那就通过 key 去取出 set结构
    let dep = depsMap.get(key)
    //如果不存在那就设置进去
    if (!dep) {
        depsMap.set(key, (dep = new Set()))
    }
    //最后将 effect 设置进入 set 结构
    trackEffects(dep)

}

export function trackEffects(dep) {
    let shouldTrack = !dep.has(activeEffect)
    if (shouldTrack) {
        dep.add(activeEffect)
        //记录哪些属性存储了此 activeEffect
        activeEffect.deps.push(dep) // 后续需要通过effect来清理的时候可以去使用
    }
}

export function trigger(target, key, newValue, oldValue) {
    //reactive过的数据已经存储过到 weakMap 结构
    let depsMap = targetMap.get(target)
    //未记录过的直接 return
    if (!depsMap) {
        return
    }
    //在 map 结构中根据属性 key 名，取出 dep，dep 是一个 set 结构，存储 effect
    let dep = depsMap.get(key)
    if (dep) {
        //将 dep拿一份出来去循环执行 run 方法，对比 effects和 dep 是false不相等的，独立的
        triggerEffects(dep)
    }


}

export function triggerEffects(dep) {
    // if(!dep.length) return
    if (dep) {
        const effects = [...dep]
        effects.forEach(effect => {
            // 当我重新执行此effect时，会将当前的effect放到全局上 activeEffect,防止多次执行此effct
            //如果上一个还没有执行完这个时候activeEffect和下一个一样，就不用重复执行了
            if (activeEffect != effect) {
                if (!effect.scheduler) {
                    effect.run()
                } else {
                    effect.scheduler();
                }
            }
        });
    }
}
export function effect(fn, options: any = {}) {
    // effect内部使用了 es6 的类来实现
    const _effect = new ReactiveEffect(fn, options.scheduler)
    //一进入程序默认执行一次传入的参数 fn
    _effect.run()
    //此函数还需要返回用户传入的函数，调用可以执行，起始就是返回 run 方法
    const runner = _effect.run.bind(_effect)
    //并将此 effect 放到 runner 上
    runner.effect = _effect
    return runner
}
