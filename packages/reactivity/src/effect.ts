/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-10-26 16:51:01
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-10-27 14:14:40
 * @FilePath: /vue3-study/packages/reactivity/src/effect.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export let activeEffect;
class ReactiveEffect {
    // public写法相当于 this.fn = fn
    public active = true //是否激活
    public deps = []
    public parent = undefined

    constructor(public fn) {

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
            return this.fn()
        } finally {
            //代码执行完后将 activeEffect 赋值为外层的 activeEffect
            activeEffect = this.parent

        }
    }
}

//track方法用来收集依赖
const targetMap = new WeakMap()//key只能是对象，方便垃圾回收，key 消除，值自动回收
export function track(target, key) {
    if(!activeEffect) return;
    //先尝试去 targetMap 中取出
    let depsMap = targetMap.get(key)
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
    let shouldTrack = !dep.has(activeEffect)
    if (shouldTrack) {
        dep.add(activeEffect)
        //记录哪些属性存储了此 activeEffect
        activeEffect.deps.push(dep) // 后续需要通过effect来清理的时候可以去使用
    }

}
export function effect(fn) {
    // effect内部使用了 es6 的类来实现
    const _effect = new ReactiveEffect(fn)
    //一进入程序默认执行一次传入的参数 fn
    _effect.run()
}