/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-11 16:01:47
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-11 16:23:27
 * @FilePath: /vue3-study/packages/runtime-core/src/teleport.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export const TeleportImpl = {
    __isTeleport: true, // 此组件是一个特殊的组件类型
    process(n1, n2, container, anchor, operators) {//提供了一个 process 方法
      // 等会组件初始化会调用此方法
      let { mountChildren, patchChildren, move, query } = operators;
      if (!n1) {
        //首次挂载 获取要挂载的节点标识 target，然后通过 query 就是 document.queryseletr方法
        const target = (n2.target = query(n2.props.to));
        if (target) {
            //去穿梭的节点上挂载
          mountChildren(n2.children, target, anchor);
        }
      } else {
        //更新
        patchChildren(n1, n2, n1.target); // 只是比较了儿子的差异
        n2.target = n1.target; //更新的时候复用老的 target 节点
        if (n2.props.to !== n1.props.to) {  //如果前后穿梭的节点不一样那就重新找到新的，然后移动过去
          const nextTarget = (n2.target = query(n2.props.to));
          n2.children.forEach((child) => move(child, nextTarget, anchor));
        }
      }
    },
  };

  export const isTeleport = (type) => !!type.__isTeleport;