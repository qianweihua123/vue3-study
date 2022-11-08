/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-10-28 20:52:10
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-08 11:35:55
 * @FilePath: /vue3-study/packages/reactivity/src/computed.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { isFunction } from "@vue/shared";
import {
    activeEffect,
    ReactiveEffect,
    track,
    trackEffects,
    triggerEffects,
} from "./effect";

class ComputedRefImpl {
    public dep = undefined; //
    public effect = undefined;//计算属性 effect
    public _v_isRef = true //这个属性 需要用.value来取值
    public _dirty = true //数据缓存的开关
    public _value; //缓存的结果值
    constructor(getter, public setter) {
        //new这个类的时候，初始化函数执行、初始化的时候创建一个 effect
        //第一个参数相当于我们使用 effect时候传入的用户函数，第二个是属于 scheduler
        /**
        * @description 描述
export class ReactiveEffect {
    // public写法相当于 this.fn = fn
    public active = true //是否激活
    public deps = []
    public parent = undefined

    constructor(public fn, private scheduler) {

        */
        this.effect = new ReactiveEffect(getter, () => {
           //这个函数，在内部依赖的属性改变时候，触发 trigger 的时候
           //因为收集了当前的计算属性 effect，执行 effect.run的方法时候
           //有 scheduler会执行这儿，就会重置开关，如果一旦取值就会重新计算
           this._dirty = true;
           //如果在 effect 中使用了，还得通知这里面的 effec 去更新
           triggerEffects(this.dep || (this.dep = new Set()));
        })
    }

    get value() {
        //使用这个计算属性的时候触发 get，去收集 effect
        // 如果有activeEffect 意味着这个计算属性在effct中使用
        // 需要让计算属性收集这个effect
        // 用户取值发生依赖收集
        if (activeEffect) {
            //调用 trakc 方法，此方法中给当前这个计算属性上的 dep 属性收集了 effect
            /**
             export function trackEffects(dep) {
    let shouldTrack = !dep.has(activeEffect)
    if (shouldTrack) {
        dep.add(activeEffect)
        //记录哪些属性存储了此 activeEffect
        activeEffect.deps.push(dep) // 后续需要通过effect来清理的时候可以去使用
    }
}
            */
          trackEffects(this.dep || (this.dep = new Set()))
        }
        if(this._dirty){//默认为 true
          //取值的时候执行用户传入的函数，在run 函数内部会把当前的 this 赋值到 activeEffect 上，那么内部的变量会收集这个计算属性 effect
          this._value = this.effect.run()//执行此方法的时候将 this 赋值到 activeEffect
          this._dirty = false //关闭开关，开启缓存
        }

        return this._value //返回结果
    }

    set value(newValue){
       this.setter(newValue)//定义了 setter 的情况下传入新值
    }
}
const noop = () => { };
export function computed(getterOrOptions) {
    //用户可能传入一个函数或者一个对象
    let onlyGetter = isFunction(getterOrOptions)
    let getter;
    let setter;
    if (onlyGetter) {
        //如果传入了函数，那就赋值到 getter
        getter = onlyGetter
        setter = noop
    } else {
        //传入对象的话
        getter = getterOrOptions.get
        setter = getterOrOptions.set || noop
    }

    return new ComputedRefImpl(getter, setter)

}