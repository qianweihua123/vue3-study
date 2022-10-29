/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-10-29 10:38:02
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-10-29 16:57:52
 * @FilePath: /vue3-study/packages/runtime-core/src/tests/apiWatch.spec.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { watch } from '../apiWatch'
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
})