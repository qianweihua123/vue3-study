/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-11 10:57:05
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-11 12:01:13
 * @FilePath: /vue3-study/packages/runtime-core/src/apiLifecycle.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { currentInstance, setCurrentInstance } from "./component";
export const enum LifecycleHoos {
    //枚举一些关联生命周期的变量
    BEFORE_MOUNT = "bm",
    MOUNTED = "m",
    BEFORE_UPDATE = "bu",
    UPDATED = "u",
}

function createHook(type){
    //这个 type就是枚举里面的变量值，传入进来，例如LifecycleHoos.BEFORE_MOUNT
    //返回一个函数，所以这是一个高阶函数
    return (hook,target = currentInstance) => {
       //因为我们的生命周期是在 setup结束后执行的，但是执行后组件实例就被清空了
       //如果我们还需要再生命周期里面获取这个，就利用闭包
       //定义的函数在这，但是不在当前作用域执行，被引用了，无法销毁
       if(target){
        console.log('生命周期');

        const wrapperHook = () => {
            setCurrentInstance(target)
            //这个 hook就是用户使用的时候传入的函数
            // onBeforeMount = createHook(LifecycleHoos.BEFORE_MOUNT);返回一个函数

            hook()

            //执行完销毁
            setCurrentInstance(null)
        }
                    //在当前的实例上根据我们枚举的变量作为名字，定义一个数组
                    const hooks = target[type] || (target[type] = []);
                    hooks.push(wrapperHook);//将用户传入的函数封装后 push 进去，收集起来
       }
    }
}
export const onBeforeMount = createHook(LifecycleHoos.BEFORE_MOUNT);
export const onMounted = createHook(LifecycleHoos.MOUNTED);
export const onBeforeUpdate = createHook(LifecycleHoos.BEFORE_UPDATE);
export const onUpdated = createHook(LifecycleHoos.UPDATED);