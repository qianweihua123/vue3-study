/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-10-29 10:38:02
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-10-30 10:58:03
 * @FilePath: /vue3-study/packages/runtime-core/src/tests/apiWatch.spec.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { watch, watchEffect } from '../apiWatch'
import { reactive } from '../../../reactivity/src/reactive'
describe('watch', () => {
    it("watch", () => {
        const state = reactive({ flag: false, name: 'jw', age: 30 });
        // watch 就是effect， 状态会收集watch effect， 属性变化后 会触发scheduler
        let a = 1
        watch(() => state.name, (newValue, oldValue) => { // 对象是引用地址 无法区分新的老的
            console.log(newValue, oldValue)
            a++
        }, { immediate: true });
        state.name = 'zf';
        expect(a).toBe(3);
    })

    it("watchEffect", () => {
        const state = reactive({ flag: false, name: 'jw', age: 30 });
        // watch 就是effect， 状态会收集watch effect， 属性变化后 会触发scheduler
        let a = 1
        watchEffect(() => {
            a++
            state.name
        });
        state.name = 'zf';
        expect(a).toBe(3);
    })

    it("cleanup", () => {
        const state = reactive({ flag: false, name: 'jw', age: 30 });
        // 第一次接口速度比较慢  第二次比较快，但是用第一次的结果覆盖掉了第二次
        let timer = 3000;
        function getData(data) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(data)
                }, timer -= 1000)
            })
        }

        // 用户输入1 返回1  在输入2 返回2
        let arr = []
        let a:any = ''
        watch(() => state.name, async function (newValue, oldValue, onCleanup) {
            let flag = true;
            onCleanup(() => { // 这个函数是一个闭包
                flag = false;
                // 清除token
            })
            let r = await getData(newValue);
            if (flag) {
                console.log(r)
                a = r
                expect(a).toBe(2);
            }
        });
        // 什么叫闭包
        state.name = 1;
        state.name = 2;

    })
})