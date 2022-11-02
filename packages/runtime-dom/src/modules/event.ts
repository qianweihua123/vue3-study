/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-02 11:19:06
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-02 11:43:07
 * @FilePath: /vue3-study/packages/runtime-dom/src/modules/event.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

function createInvoker(initialValue) {
    //传入的是新事件名字
    //第一行代码是创建一个等于说是一个模版一个 invoker变量
    //这个变量上的值是一个函数，函数内部是在这个变量上定义了一个属性，value
    //上面这个变量上的 value 值就是传入的新的事件名字
    //最后返回这个变量，这个变量是一个函数，函数内部是新的事件
    //invoker.value = initialValue
    const invoker:any = (e) => invoker.value(e)
    invoker.value = initialValue  // 后续更新的时候 只需要更新invoker的value属性
    return invoker
}
export function patchEvent(el, key, nextValue) {
    //el上有一个_vel属性，默认是一个对象，给到变量 invokers 上
    const invokers = el._vel || (el._vel = {})
    //截取前两位后面的事件名字
    const name = key.slice(2).toLowerCase()

    //查看之前是否有缓存过
    const exisitingInvoker = invokers[name]

    //如果有新的事件并且有缓存说明是更新
    if (nextValue && exisitingInvoker) {
        //更新事件
        exisitingInvoker.value = nextValue
    }else{
        //新增的情况下
        if(nextValue){
          //创建 invoker并且缓存
          //createInvoker(nextValue)创建一个函数内部返回新的事件名字
          const invoker = (invokers[name] = createInvoker(nextValue))
          //注册新的事件
          el.addEventListener(name, invoker);

        } else if(exisitingInvoker) {
            //如果新的没有，但是缓存又，那就移除时间，并且删除缓存
            el.removeEventListener(name, exisitingInvoker);
            invokers[name] = null
        }
    }
}