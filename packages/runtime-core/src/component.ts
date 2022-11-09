import { reactive } from "@vue/reactivity";
import { hasOwn, isFunction } from "@vue/shared";
import { proxyRefs } from "packages/reactivity/src/ref";
import { initProps } from "./componentProps";

//创建组件实例
export function createComponentInstance(vnode) {
    const instance = {
        data: null || {}, //需要先给个默认对象，不然 null 的话报错
        isMounted: false,
        subTree: null,
        vnode,
        update: null,
        props: {},
        attrs: {},
        propsOptions: vnode.type.props || {},
        proxy: null,
        setupState: null,
        exopsed: {},
        slots: {},
    }

    return instance;
}

//在组件实例对象上新增一个 proxy 对象，当我们访问实例对象上的，
const publicProperties = {
    $attrs: (i) => i.attrs,
    $props: (i) => i.props,
};
const PublicInstancePropxyHandlers = {
    get(target, key) {
        //从实例对象上拿到 data,props
        let { data, props,setupState } = target
        if (hasOwn(key, data)) {
            //当我们访问 instance 上 proxy 的属性的时候，我们先去
            //data上查找有没有这个 key 的，有的话，我们返回 data 上的
            return data[key];
        } else if (hasOwn(key, props)) {
            //如果 data 上没有，再去 props 上查找，有的话，返回 props 上的值
            return props[key];
        }else if (setupState && hasOwn(key, setupState)) {
            return setupState[key];
          }
        //将$attrs,$props维护到一个对象，如果取值就从对象中执行函数
        let getter = publicProperties[key];
        if (getter) {
            return getter(target);
        }
    },
    set(target, key, value) {
        //当我们设置值的时候，也是先去优先设置 data上的，props 上的不允许改，弹出提醒
        let { data, props, setupState } = target;
        if (hasOwn(key, data)) {
            data[key] = value;
        } else if (hasOwn(key, props)) {
            console.log("warn ");
            return false;
        } else if (setupState && hasOwn(key, setupState)) {
            //增加从这个变量上取值，这是 setup如果返回对象的话赋值到这
            setupState[key] = value;
        }
        return true;
    },
}

export function setupComponent(instance) {
    // 组件的对象 render(component,{a:1})
    const { type, props, children } = instance.vnode;
    // 用用户传递的props 和 把他解析成 attrs 和 props放到实例上
    initProps(instance, props);
    instance.proxy = new Proxy(instance, PublicInstancePropxyHandlers)

    //接下来处理 setUp函数
    let { setup } = type
    if (setup) {
        //如果存在的情况下，我们创建一个执行的上下文
        const setupContext = {
            attrs: instance.attrs,
            emit: (event, ...args) => {
                //我们用的时候第一个参数执行的方法名字 ctx.emit('myEvent')
                //我们处理下事件名字带上 on
                const eventName = `on${event[0].toUpperCase() + event.slice(1)}`;
                //编译后的事件会存在虚拟节点的 props上，我们取出来，然后再 emit 种调用，所有，一旦使用 emit 就会调用用户事件
                const handler = instance.vnode.props[eventName];
                handler && handler(...args);
            }
        }
        //调用setup函数，第一个参数是props，第二个是 我们上面创建的执行上下文
        const setupResult = setup(instance.props, setupContext);
        // setup返回的是render函数
        if (isFunction(setupResult)) {
            instance.render = setupResult;
        } else {
            // 将返回结果作为了数据源 如果非函数的话作为数据源头
            instance.setupState = proxyRefs(setupResult);
        }
    }
    let data = type.data;
    if (data) {
        // vue2 传递的data
        if (isFunction(data)) {
            // 用户将props 转换成了data
            instance.data = reactive(data.call(instance.proxy));
        }
    }

    if (!instance.render) {
        instance.render = type.render; // 将用户写的render作为实力的render方法
    }
}