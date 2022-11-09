/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-10-30 11:52:31
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-09 16:59:34
 * @FilePath: /vue3-study/packages/reactivity/src/ref.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { isObject } from "@vue/shared";
import { activeEffect, trackEffects, trigger, triggerEffects } from "./effect";
import { reactive } from "./reactive";
//ref内部实现使用了 es6 的类
export function ref(value) {
    return new RefImpl(value)
}
function toReactive(value) {
    return isObject(value) ? reactive(value) : value
}
class RefImpl {
    dep = undefined; //用来收集 effect
    _value; //用来保存返回值
    _v_isRef = true;//用来表示此属性已经被 ref 过，是一个标识
    constructor(public rawValue) {
        //如果传入对象调用 reactive返回 proxy 对象，或者返回原数据
        this._value = toReactive(rawValue)
    }

    get value() { //get属性访问器
        if (activeEffect) { //存在 activeEffect的话去依赖收集
            trackEffects(this.dep || (this.dep = new Set()))
        }
        return this._value
    }

    set value(newValue) {
        //如果新老值不一样
        if (newValue !== this.rawValue) {
            //判断新设置的值是否是对象，是的话返回 proxy 对象，或者返回新值
            this._value = toReactive(newValue)
            this.rawValue = newValue//将新值变为老值
            triggerEffects(this.dep)
        }
    }
}

class ObjectRefImpl {
    _v_isRef = true;
    constructor(public _object, public _key) {

    }
    get value() {
        return this._object[this._key]
    }
    set value(newValue) {
        this._object[this._key] = newValue
    }
}

//将单个的属性转为响应式对象
export function toRef(target, key) {
    return new ObjectRefImpl(target, key)
}

export function toRefs(object) {
    const ret = {}
    for (let key in object) {
        ret[key] = toRef(object, key)
    }

    return ret
}

//将 torefs 后的对象 转换一下ref类型，省去了 .value 繁琐操作。
export function isRef(ref) {
    return !!(ref && ref._v_isRef)
}

export function unRef(ref) {
    return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWithRefs) {
    //内部去new proxy去拦截这个对象
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key))
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                //如果原数据是ref,新值不是ref,那就是直接设置ref的value
                return target[key].value = value

            } else {
                // 如果是ref替换ref直接替换
                return Reflect.set(target, key, value)
            }
        }
    })
}