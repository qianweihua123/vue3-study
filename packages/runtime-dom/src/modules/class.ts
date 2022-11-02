/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-02 11:01:02
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-02 11:05:45
 * @FilePath: /vue3-study/packages/runtime-dom/src/modules/class.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */


export const patchClass = (el, value) => {
    if (value === null) {
        //如果类名为空，移除掉之前的
        el.removeAttribute('class')
    } else {
        el.className = value
    }
}