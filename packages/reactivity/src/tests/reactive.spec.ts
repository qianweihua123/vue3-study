/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-10-26 15:34:57
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-10-26 16:42:19
 * @FilePath: /vue3-study/packages/reactivity/src/tests/reactive.spec.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { reactive } from "../reactive"
describe('reactive', () => {
    it('happy path', () => {
        const original = { foo: 1 }

        const observed = reactive(original)
        observed.foo
        expect(observed).not.toBe(original)
        expect(observed.foo).toBe(1)
    })


    it('happy path', () => {
        const original = { foo: 1 }
        const observed = reactive(original)
        const a = reactive(observed)

    })
})