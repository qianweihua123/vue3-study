/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-10-28 21:34:09
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-10-28 21:42:20
 * @FilePath: /vue3-study/packages/reactivity/src/tests/computed.spec.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { reactive } from "../reactive";
import { effect } from "../effect";
import { computed } from "../computed";

describe('effect', () => {
    it("effect path", () => {
        const state = reactive({ flag: false, name: 'jw', age: 30, n: { n: 1 } });
        let aliasName = computed({
            get() {
                console.log('默认不执行')
                return state.name
            },
            set(newValue) {
                // 这里当我们修改aliasname的时候 可以触发其他的修改
            }
        });
        let test = aliasName.value
        // setTimeout(() => {
            state.name = 'zf'
        // }, 1000);
        expect(aliasName.value).toBe('zf');
    })
})