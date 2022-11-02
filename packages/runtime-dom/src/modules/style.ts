/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-02 11:06:19
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-02 11:18:45
 * @FilePath: /vue3-study/packages/runtime-dom/src/modules/style.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export const patchStyle = (el: any, prev: any, next: any) => {
    const style = el.style //style上的属性会更新在这上面
    for (let key in next) { //循环新的属性
        style[key] = next[key]
    }
    //如果老的类名在新的中没有，那就去之前的 style 上清除
    for (let key in prev) {
        if (next[key] == null) {
            style[key] = null
        }
    }
}