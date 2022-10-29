/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-10-28 21:34:09
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-10-29 16:57:32
 * @FilePath: /vue3-study/packages/reactivity/src/tests/computed.spec.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { reactive } from "../reactive";
import { effect } from "../effect";
import { computed } from "../computed";

describe('happy path', () => {
    it("computed", () => {
        const state = reactive({ flag: false, name: 'jw', age: 30,});
        let aliasName = computed({
            get() {
                return state.name
            },
            set(newValue) {
                // 这里当我们修改aliasname的时候 可以触发其他的修改
            }
        });
        let str = aliasName.value +'*'
        state.name = 'zf'
        expect(aliasName.value).toBe('zf');
    })
})