/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-11 10:57:05
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-11 11:11:25
 * @FilePath: /vue3-study/packages/runtime-core/src/apiLifecycle.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

export const enum LifecycleHoos {
    //枚举一些关联生命周期的变量
    BEFORE_MOUNT = "bm",
    MOUNTED = "m",
    BEFORE_UPDATE = "bu",
    UPDATED = "u",
}

// function createHook(type){
//     //这个 type就是枚举里面的变量值，传入进来，例如LifecycleHoos.BEFORE_MOUNT
//     //返回一个函数，所以这是一个高阶函数
//     return (hook,) => {

//     }
// }