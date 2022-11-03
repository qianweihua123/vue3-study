/*
 * @Author: qwh 15806293089@163.com1
 * @Date: 2022-11-02 21:10:41
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-03 18:53:41
 * @FilePath: /vue3-study/packages/runtime-core/src/tests/render.spec.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { render } from "@vue/runtime-dom"
import { h } from '../h'
describe('render', () => {
    it("renderTest", () => {
        render(h('div', [h('span', '1'), h('span', '2')]), "app")
        setTimeout(() => {
            render(h('div', 'hellow'),'app')
        }, 1000)
    })
})