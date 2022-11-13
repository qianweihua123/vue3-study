/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-13 18:25:14
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-13 19:55:51
 * @FilePath: /vue3-study/packages/runtime-core/src/apiInject.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { currentInstance } from "./component";

//vue3中的 provide 是一个函数
export function provide(key, value) {
  // 如何判断 在不在组件中？ 只能在 setup 中使用，在 setup 执行之前我们会设置组件实例，所有乐园判断组件实例是否有值
  if (!currentInstance) return;
  // 第一次我的provides 是来自于父亲的
  // 所以一样就拷贝一个 作为自己新的provides
  // 下一次调用provides 用的是自己的provides肯定和父亲的不是一个
  // 我就不创建provides了；

  //先拿到我们在实例上初始化的 provides，初始化是来自于父级
  let provides = currentInstance.provides;

  // 我要知道在当前组件中我是第一次调用的provide 还是不是第一次

  //取出父级身上的 provides
  const parentProvides =
    currentInstance.parent && currentInstance.parent.provides;

    //判断父级的 provides和子级初始化的 provides是否是同一个
  if (provides === parentProvides) {
    //如果是同一个的话，那就使用 Object.create 创建一个对象，原型链指向父级的 provides,可以通过原型链查找到父级的属性
    // 每个组件都有自己的provides， 这样实现每次调用provide 都会产生一个新的
    provides = currentInstance.provides = Object.create(provides);

    // xxx.__proto__ = provides
  }
  //将用户使用这个函数传入的 key 和值设置到当前的 provides 上去
  provides[key] = value;

}


//在 vue3中 inject 也是一个函数
export function inject(key, value) {
    //也需要在 setup 种使用，setup 调用的时候是设置了组件实例的
  if (!currentInstance) return;
  //找到当前组件实例的父级，父级身上有 provides
  const provides = currentInstance.parent?.provides;

  // 上级有提供过这个属性
  if (provides && key in provides) {
    //如果 inject 传入的 key 可以父级的 provides中找到，那就返回，这个找的操作会沿着父级原型链查找
    return provides[key];
  } else if (value) { //如果 key 不在 provides 中一般是使用者提供了默认值，返回
    return value;
  }
}
