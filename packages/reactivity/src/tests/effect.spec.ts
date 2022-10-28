/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-10-27 14:11:40
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-10-28 19:39:35
 * @FilePath: /vue3-study/packages/reactivity/src/tests/effect.spec.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { effect } from '../effect';
import { reactive } from '../reactive'


describe('effect', () => {

   // it('happy path', () => { //skip 是任务拆分
   //    const user = reactive({
   //       age: 10
   //    })
   //    let nextAge;
   //    effect(() => {
   //       nextAge = user.age + 1;
   //    })
   //    expect(nextAge).toBe(11) //断言验证
   //    //  验证更新
   //    user.age++;
   //    expect(nextAge).toBe(12) //triger还没有完成
   // })

   it('happy path', () => { //skip 是任务拆分
      const state = reactive({
         age: 28,
         name: 'qwh',
         flag: false
      })
      const runner = effect(() => {
         //m每次执行 run 的时候都会清空之前收集了此 effect 的依赖，然后执行 run 的似乎会重新执行
         console.log('runner')
         const infor = state.flag ? state.name : state.age

     })

   //   setTimeout(() => {
      state.flag = !state.flag // 值变化了
      // setTimeout(() => {
      //     console.log('修改了age')
          state.age = 31
      // }, 1000)
//   }, 1000);
   })

})