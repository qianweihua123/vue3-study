/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-02 14:25:59
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-07 10:44:27
 * @FilePath: /vue3-study/packages/shared/src/shapeFlags.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export const enum ShapeFlags {
  ELEMENT = 1, // 虚拟节点是一个元素 000000001
  FUNCTIONAL_COMPONENT = 1 << 1, // 函数式组件 000000010
  STATEFUL_COMPONENT = 1 << 2, // 普通组件 000000100
  TEXT_CHILDREN = 1 << 3, // 儿子是文本的
  ARRAY_CHILDREN = 1 << 4, // 儿子是数组
  SLOTS_CHILDREN = 1 << 5, // 插槽
  TELEPORT = 1 << 6,
  SUSPENSE = 1 << 7,
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8,
  COMPONENT_KEPT_ALIVE = 1 << 9,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT, //000000110
}

// console.log(ShapeFlags.COMPONENT); //
// 000000110
// 000000010

// 000000010

// 用大的和小的做与运算 > 0 就说明涵盖
// console.log(ShapeFlags.COMPONENT & ShapeFlags.FUNCTIONAL_COMPONENT);

// <<   000000100
// | 有1个是1 就是1
// 00000100
// 00000010

// 000000110

// & 运算就是都是1 才是1

// COMPONENT & FUNCTIONAL_COMPONENT
