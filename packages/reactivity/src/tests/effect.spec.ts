/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-10-27 14:11:40
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-10-28 20:05:06
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

   // it('happy path', () => { //skip 是任务拆分
   //    const state = reactive({
   //       age: 28,
   //       name: 'qwh',
   //       flag: false
   //    })
   //    const runner = effect(() => {
   //       //m每次执行 run 的时候都会清空之前收集了此 effect 的依赖，然后执行 run 的似乎会重新执行
   //       console.log('runner')
   //       const infor = state.flag ? state.name : state.age

   //    })

   //    state.flag = !state.flag // 值变化了
   //    state.age = 31
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

      },{ // 类似于watch api的回调
         scheduler() { // 组件更新都是基于这个scheduler来实现的
             console.log('数据变化了',)
         }
     })

      // state.flag = !state.flag // 值变化了
      state.age = 31
   })

})