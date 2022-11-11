/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-11 13:28:42
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-11 16:00:33
 * @FilePath: /vue3-study/packages/runtime-core/src/defineAyncComponent.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Fragment, Text } from "./vnode";
import { h } from "./h";
import { ref } from "@vue/reactivity";

export function defineAsyncComponent(options) {
    //可以传入对象或者一个函数
    if (typeof options === "function") {
        //如果传入的是一个函数包装成对象
        options = { loader: options }
    }
    //申明 3 个变量
    let Component = null;
    let timer = null;
    let loadingTimer = null;

    // 因为异步组件也是作为组件去渲染的，交给 render 函数
    //所以我们也是返回一个对象，对象里面有 setup
    return {
        //提供一个 setup 函数
        setup() {
            // debugger
            //拿到用户传入的 loader,这个 loader 就是一个加载器，函数，返回一个 promise
            let { loader } = options;

            //定义三个状态
            const loaded = ref(false);
            const error = ref(false); //报错
            const loading = ref(false); //加载状态

            //定义一个 load函数,内部执行 loader了。因为 loader 内部是个 promise
            //所以可以去捕获错误
            function load() {
                debugger
                //这个 loader 就是用户传入的渲染的组件，是通过 promise 返回的
                return loader().catch((err) => {
                    //因为 loader 里面的定时器变成了失败状态，所有等这执行的时候会不停调用
                    if (options.onError) {
                        /**
                        * @description 描述 用户使用的时候陪着了 onError 选项
                        onError(err, retry, fail) {
                        console.log('网络加载失败')
                        retry()
                         }
                        */
                        //接着返回一个 promise
                        return new Promise((resolve, reject) => {
                            //定义个 retry 方法，内部去 resolve 接着调用 load()
                            const retry = () => resolve(load());
                            //定义一个 faill 方法，捕获错误的话
                            const fail = () => reject(err);
                            //调用配置传入的 onError,传入这几个参数，
                            //onError 内部又接着调用 load又会走到这个方法里面
                            //如果一直捕获错误，就会不停的调用
                            options.onError(err, retry, fail);
                        })
                    } else { //如果使用者没有配置 onError.就抛出错误
                        throw err
                    }
                })
            }


            //如果配置了 delay 时间 // 展示加载组件前的延迟时间，默认为 200ms
            if (options.delay) { //因为这儿是异步任务，这执行的时候组件的 render 已经执行过一遍，所有这执行的时候这三个属性收集了组件 effect
                //延迟 delay 时间打开 loading 状态
                loadingTimer = setTimeout(() => {
                    console.log('dealy执行');

                    loading.value = true;
                }, options.delay);
            }

            //接着接着调用我们上面定义的 load 函数,是在 setup 中调用
            load().then( (c) => { //load这是同步的，是在上面这个 delay 之后执行的。load 函数里面的 loader 执行的时候里面先打印，然后又是一个定时器，也不会先执行

                // c是异步组件执行完 resolve 返回的组件内容
                Component = c //保存到 Component变量上
                loaded.value = true; //将 loaded 的值改为 true
                clearTimeout(timer); //清除超时报错使用的定时器
            }).catch((err) => (error.value = err))//如果执行错误 将 error 变量赋值报错信息
            .finally(() => {
                //最终都会执行到这，将加载状态关闭，清空
                loading.value = false;
                clearTimeout(loadingTimer); //清除展示加载组件前的延迟时间定时器
              });

              if (options.timeout) {//如果配置了超时时间就将错误控制的变量改为 true
                timer = setTimeout(() => {
                    console.log('加载超时执行');

                  error.value = true;
                }, options.timeout);
              }


              //最后返回一个函数，setup 中返回函数会被作为 render 函数
              //因为这个 render 是同步返回的，上面有很多异步任务，会先执行这，上面的几个任务会等待状态
              //断点调试的时候第一次调用 render 的时候渲染 Fragment
              //然后 delay 的时间短，一调用触发依赖属性变化，触发刷新，再执行 render 刷新页面 loading状态
              //然后 timeout 的逻辑执行，还会触发元素变更，刷新组件 effect 重新刷新页面，进入下面的加载中状态
              //最后用户传入的 loader 执行，因为它的时间最长 3s，手动改成了失败状态，会被捕获到，然后不停的调用这个用户 loader
              return () => {
                if (loaded.value) {
                  return h(Component); // 成功组件
                } else if (error.value && options.errorComponent) {
                  return h(options.errorComponent); // 错误组件
                } else if (loading.value && options.loadingComponent) {
                    console.log('加载中状态');
                  return h(options.loadingComponent);
                }
                console.log('初始空节点');

                return h(Fragment, []);
              };
        }
    }
}