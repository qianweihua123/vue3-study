import { reactive } from "@vue/reactivity";
import { ShapeFlags, hasOwn, invokeArrayFn } from "@vue/shared";
import { ReactiveEffect } from "packages/reactivity/src/effect";
import { initProps } from "./componentProps";
import { isSameVNode, Text, Fragment } from "./vnode";
import { queueJob } from "./scheduler"
import { createComponentInstance, setupComponent } from "./component";
export function createRenderer(options) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    querySelector: hostQuerySelector,
  } = options;
  //挂载子节点，内部也是循环调用 patch
  const mountChildren = (children, el, anchor = null) => {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], el, anchor)
    }
  };
  //卸载子节点
  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i]);
    }
  };
  const mountElement = (vnode, container, anchor) => {
    const { type, props, children, shapeFlag } = vnode;
    // 创建元素
    const el = (vnode.el = hostCreateElement(type));
    // 增添属性
    if (props) {
      for (let key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    // 处理子节点
    if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el);
    } else if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children);
    }
    hostInsert(el, container, anchor);
  };

  const patchProps = (oldProps, newProps, el) => {
    if (oldProps !== newProps) {
      for (let key in newProps) {
        const prev = oldProps[key];
        const next = newProps[key];
        if (prev != next) {
          // 用新的改掉老的
          hostPatchProp(el, key, prev, next);
        }
      }
      for (let key in oldProps) {
        if (!(key in newProps)) {
          // 老的存在的新的没有了
          const prev = oldProps[key];
          hostPatchProp(el, key, prev, null);
        }
      }
    }
  };
  const patchKeyedChildren = (c1, c2, el) => {
    // 全量的diff算法  比对过程是深度遍历，先遍历父亲 在遍历孩子 从父-> 子 都要比对一遍
    // 目前没有优化比对，没有关心 只比对变化的部分 blockTree patchFlags
    // 同级比对 父和父比  子和子比  孙子和孙子比  采用的是深度遍历e

    let i = 0; // 默认从0 开始比对

    let e1 = c1.length - 1;
    let e2 = c2.length - 1;

    // i = 0, e1 = 2 , e2 = 3

    // a b    e d
    // a b c   e d
    // 从头开始比较
    while (i <= e1 && i <= e2) {
      // 并且是一方不成功就是false
      const n1 = c1[i];
      const n2 = c2[i];

      if (isSameVNode(n1, n2)) {
        patch(n1, n2, el); // 深度遍历
      } else {
        break;
      }
      i++;
    }
    // i = 2, e1 = 3 , e2 = 4
    // 从尾部开始进行比较
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVNode(n1, n2)) {
        patch(n1, n2, el); // 深度遍历
      } else {
        break;
      }
      e1--;
      e2--;
    }

    // a b
    // a b c d   i = 2  e1 = 1  e2 =3

    //    a b
    //d c a b    i = 0   e1= -1 e2 = 1

    // 我要知道 我是添加还是删除 ？ i 比 e1 大说明新的长老的短

    // 同序列挂载
    if (i > e1) {
      // 有新增
      if (i <= e2) {
        while (i <= e2) {
          // 看一下 如果e2 往前移动了，那么e2 的下一个值肯定存在，意味着向前插入
          // 如果e2 没有动 那么e2 下一个就是空，意味着是向后插入

          const nextPos = e2 + 1;
          // 保存之前的e2
          // vue2 是看下一个元素存不存在
          // vue3 是看下一个元素的长度 是否越界

          const anchor = nextPos < c2.length ? c2[nextPos].el : null;
          patch(null, c2[i], el, anchor); // 没有判断 是向前插入还是向后插入？
          i++;
        }
      }
    }
    // a b  c d
    // a b      i = 2  e1 = 3  e2= 1
    //  c d a b
    //      a b   i=0     e1=1   e2=-1
    else if (i > e2) { //i 如果大于e2说明有卸载的情况
      while (i <= e1) {
        unmount(c1[i]);
        i++;
      }
    }
    // 什么情况是老的多 新的少

    // a b c d e   f g
    // a b e c d h f g

    // c d e
    // e c d h

    //剩下的就是无序的一组区间的对比
    let s1 = i; // s1 -> e1
    let s2 = i; // s2 -> e2

    // i =2  e1 =4   e2 = 5

    // 这里我们要复用老节点？  key  vue2 中根据老节点创建的索引表  vue3 中根据新的key 做了一个映射表

    const keyToNewIndexMap = new Map();
    //循环 i 到e2 之间，这个e2 是新节点，生成一个 map 映射记录
    for (let i = s2; i <= e2; i++) { //循环新的虚拟节点中i 到 e2 之间的节点（这个时候头尾的比对都走过了）
      const vnode = c2[i];  //拿出虚拟节点的 key 和下标去做一个映射
      keyToNewIndexMap.set(vnode.key, i);
    }
    // 有了新的映射表后，去老的中查找一下，看一下是否存在，如果存在需要复用了

    // a b  c d e    f g
    // a b  e c d h  f g

    // h f
    // d h f
    // c d h f
    // e c d h f
    const toBePatched = e2 - s2 + 1; //这个是循环下来无法正常比对新 vnode 里面节点的长度(拿到常规逻辑无法比对的长度)
    const newIndexToOldMapIndex = new Array(toBePatched).fill(0); // [0,0,0,0] （根据上面常规逻辑无法比对的长度创建一个都是 0 的数组）
    for (let i = s1; i <= e1; i++) { //循环无序的老的节点
      const child = c1[i];
      let newIndex = keyToNewIndexMap.get(child.key); // 通过老的key 来查找对应的新的索引
      // 如果newIndex有值说明有
      if (newIndex == undefined) {
        // 老的里面有 新的没有 那就去 el 上卸载掉
        unmount(child);
      } else {
        // 比对两个属性
        // 如果前后两个能复用，则比较这两个节点 这个 newIndex 就是新节点在老节点查找到了的情况下，我们拿到存储的新节点映射表里面新节点的下标，减去 s 2 就是它在新newIndexToOldMapIndex数组从 0 开始往后对应的位置，在这个位置存储上能复用的老节点的下标 +1
        newIndexToOldMapIndex[newIndex - s2] = i + 1; //newIndex 是存储的下标值，下标减去 s2 就是减去常规比对的结束的位置，在新节点对应的位置存储老节点+1//在新节点辅助数组中，记录下老的下标+1，之所以加 1 是因为 0 的话没有意义，0 代表新增的节点
        patch(child, c2[newIndex], el); // 这个地方复用了，插入到了真实节点中
      }
    }
    // return
    // 写到这里 我们已经复用了节点，并且更新了复用节点的属性，差移动操作，和新的里面有老的中没有的操作
    // 如何知道 新的里面有 老的里面没有 （老的没有映射表）

    // [5, 3, 4, 0]  对应的位置就是 老索引+1
    // 最长递增子序列是用来移动优化的
    const seq = getSequence(newIndexToOldMapIndex);
    //newIndexToOldMapIndex是一个数组，值是能复用的老节点的下标+1，或者 0
    //调用getSequence函数后返回的是一个下标，这个下标最长递增子序列后，并追溯后的下标
    //seq[j]取到的是下标，这个下标是由newIndexToOldMapIndex变化得到的，seq长度和下面的toBePatched一样
    //seq的存储的值是下标，这个下标其实和下面的循环toBePatched i是一样的，不过 seq 存储过的被最长递增算法和追溯算法处理过了
    let j = seq.length - 1; // 获取seq最后的索引
    for (let i = toBePatched - 1; i >= 0; i--) {//i 的初始值是新虚拟 dom 的最后一项
      //这里的s2 是 i跳出循环的第一项let s2 = i; // s2 -> e2
      //s2 加上    const toBePatched = e2 - s2 + 1  toBePatched是乱序比对元素的长度 i是长度减去 1，这时候拿到乱序比对的最后一项
      //也就是下面的nextIndex
      const nextIndex = s2 + i; // 循环的需要全量比对的当前项 的索引（也就是最后一项，倒序插入的）//这个值根据循环会一直变化，所有可以更换锚点
      const nextChild = c2[nextIndex]; //根据索引去新节点中找到这个元素 先拿到的h  根据我们上面说的需要乱序比对的最后一项的索引取到值
      // 看一下 h 后面是否有值 ，有值就将h 插入到这个元素的前面，没有值就是appendChild
      const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null; //看下乱序比对最后一项后面是否有值，有值的话那就拿到作为锚点，没有的话说明乱序比对最后一项元素就是最后一个了，锚点就是 null，传入的话就是追加
      // 默认找到f 把 h 插入到f前面
      //   a b [e c d h] f g
      if (newIndexToOldMapIndex[i] == 0) { //如果当前循环项在新值映射表里面值是 0，说明没有能复用的，那我们就通过调用 patch 去创建，（第一个参数传空，说明是新建）
        //   insert(child, parent, anchor) {
        //insertBefore这个方法是移动性的     A B C D  -> A C B  D
        // parent.insertBefore(child, anchor || null); 会去父元素中找到这个锚点插入
        // },
        patch(null, nextChild, el, anchor); // 将h插入到 f前面
        // 找到新增的了
        // 创建元素在插入
      } else {
        // 直接做插入操作即可
        //  倒序插入
        //这个方法会移动节点比如移动前位置 abcdehfg ，实际我们 d 需要移动到h前面，
        //移动后变成 abcedhfg，之所以能移动是因为 insertBefore这个方法是移动性的
        // hostInsert(nextChild.el, el, anchor); // insert是移动节点 //如果值不为 0 的话，那就直接以锚点为基准去插入
        if (i !== seq[j]) {
          hostInsert(nextChild.el, el, anchor); // insert是移动节点
        } else {
          //如果 toBePatched的下标和 seq 处理过的存储的下标值一样只是 seq 存储的下标值顺序是打乱的，那就跳过
          //换句话说如果 seq 的值完全和 toBePatched的下标一样，那就不用处理了，是最优解，如果不一样，那就一项项比有一样的就跳过
          j--; // 不做移动跳过节点即可
        }
        // 这个插入操作比较暴利， 整个做了一次移动，但是我们需要优化不动的那一项
        // [5, 3, 4, 0]  -》 [1,2] 最长递增子序列
        // 索引为 1 和 2的不用动

        //  2 5 8 6 7 9    找递增序列中最长的   2 5 6 7 9
      }
    }
  }
  const patchChildren = (n1, n2, el) => {
    // 比较 两方孩子的差异 更新el中的孩子
    const c1 = n1.children;
    const c2 = n2.children;
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {//如果新节点是文本
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {//老的节点是数组
        unmountChildren(c1); //那就将老的节点卸载
      }
      if (c1 !== c2) { //如果新的是文本，老节点也是文本，内容不同那就重新插入文本
        // 文本内容不相同
        hostSetElementText(el, c2);
      }
    } else {
      // 老儿子是数组, 新的是数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          console.log('新老都是儿子比对');

          // diff算法
          patchKeyedChildren(c1, c2, el);
        } else { //新的不是数组
          // 老的是数组  新的不是数组.删除来的
          unmountChildren(c1);
        }
      } else {
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, "");
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el);
        }
      }
    }
  };
  const patchElement = (n1, n2) => {
    // 比对n1 和 n2的属性差异
    let el = (n2.el = n1.el);
    const oldProps = n1.props || {};

    const newProps = n2.props || {};

    patchProps(oldProps, newProps, el);

    patchChildren(n1, n2, el);
  };

  const processElement = (n1, n2, container, anchor) => {
    if (n1 == null) {
      // 初次渲染
      mountElement(n2, container, anchor);
    } else {
      // diff算法 在比对的时候，我们都会复用出渲染创建的真实 el，给n2，所有 diff 的时候都是去这个复用的节点上去操作的

      patchElement(n1, n2);
    }
  };
  const processText = (n1, n2, el) => {
    if (n1 == null) {
      //初次渲染文本节点,那就创建节点放到 n2 的 el 上去记录上，并且插入到真实节点
      hostInsert(n2.el = hostCreateText(n2.children), el);
    } else {
      let el = (n2.el = n1.el) //因为这个方法都是处理文本节点，我们可以复用老的真实节点
      //然后去更新Text文本的值，这个值是存在 children 上的
      if (n1.children !== n2.children) {
        //文本值不一样的话，那就新建去插入
        hostSetText(el, n2.children)
      }
    }
  }

  const processFragment = (n1, n2, el) => {
    if (n1 == null) {
      //初始化调用 mountChildren,内部是调用 patch 方法，
      /**
      * @description 描述
  const mountChildren = (children, el) => {
    for (let i = 0; i < children.length; i++) {
      patch(null, children[i], el);
    }
  };
      */
      mountChildren(n2.children, el)
    } else { //如果n1 和n2都有值，那就相当于是比较双方的 children 节点
      patchKeyedChildren(n1.children, n2.children, el)
    }
  }

  //在更新组件的时候，如果需要更新 props
  const updateProps = (prevProps, nextProps) => {
    for (let key in nextProps) {
      //循环新属性，将新属性的每个 key 都设置到旧属性中，相同的会覆盖
      prevProps[key] = nextProps[key]
    }
    //循环老的属性，如果不在新的里面就删除
    for (let key in prevProps) {
      if (!(key in nextProps)) {
        delete prevProps[key]
      }
    }
  }

  //这个方法是处理更新的
  const updateComponentPreRender = (instance, next) => {
    //确认需要更新的情况下，将保存的 next 清空，为下次留位置
    instance.next = null
    instance.vnode = next  // 用新的虚拟节点 换掉老的虚拟节点
    //更新下属性
    updateProps(instance.props, next.props)

    // 插槽更新
    // 将新的children 合并到插槽中
    instance.slots = next.children; // 直接用孩子、替换掉插槽
  }
  const setupRenderEffect = (instance, container, anchor) => {
    const { render } = instance;
    //接下来定义一个函数，这个函数就是我们创建组件 effect 传入的第一个参数
    //也就是 effect.run()执行的
    const componentFn = () => {
      console.log('test');

      //在渲染函数执行之前处理我们收集到的sh
      const { bm, m } = instance;
      if (!instance.isMounted) {
        if (bm) {
          //渲染之前
          invokeArrayFn(bm);
        }
        // 这里会做依赖收集，数据变化会再次调用effect
        //得到组件的节点树
        const subTree = render.call(instance.proxy, instance.proxy);
        //然后通过 patch 将组件内部的节点树变成真实的节点
        patch(null, subTree, container, anchor);
        //将第一次渲染的节点树保存起来
        instance.subTree = subTree; // 第一次渲染产生的vnode
        //标识下已经挂载过
        instance.isMounted = true;

        if (m) {
          invokeArrayFn(m);
        }
      } else {
        //已经挂载过更新的情况
        //拿到新的节点树虚拟 dom
        //我们可以在这通过 next 是否有值，去判断是否需要更新
        let { next, bu, u } = instance;
        if (next) {
          // 如果有next 说明 属性或者插槽 更新了
          updateComponentPreRender(instance, next);
        }

        if (bu) {
          invokeArrayFn(bu);
        }
        // 组件的更新会执行组件的 render 函数拿到新的虚拟 dom 数据结构
        const subTree = render.call(instance.proxy, instance.proxy); // 这里也更新了？
        //进行 patch 更新
        patch(instance.subTree, subTree, container, anchor);
        //保存这一次的虚拟节点树
        instance.subTree = subTree;

        if (u) {
          invokeArrayFn(u);
        }
      }
    }
    //生成一个组件 effect,第二个参数相当于 scheduler,c
    //初次执行 render 后里面的变量收集了这个组件 effect
    //当变量的值改变的时候，就会触发更新 effect，
    //有 scheduler的话会执行 scheduler
    //这个时候如果频繁更新，将会多次执行scheduler，这个时候就需要异步更新
    const effect = new ReactiveEffect(componentFn, () => {
      // 我需要做异步更新
      queueJob(instance.update);
    });
    //将 effect的 run 方法绑定到 effect 上返回一个新的返回，去调用执行
    const update = (instance.update = effect.run.bind(effect));
    update(); // 强制更新
  }
  const mountComponent = (vnode, container, anchor) => {
    //第一步 创建组件实例1
    const instance = (vnode.component = createComponentInstance(vnode)); // 让虚拟节点知道对应的组件是谁
    //第二步给实例赋予属性
    setupComponent(instance)
    //第三步创建组件的 effect
    setupRenderEffect(instance, container, anchor);
    // 如何挂载组件？  vnode 指代的是组件的虚拟节点  subTree render函数返回的虚拟节点
    //组件虚拟节点的 type 上有 render,props等配置信息
    // const { data = () => ({}), render, props: propsOptions = {} } = vnode.type;
    // const state = reactive(data()); // 将数据变成响应式的
    //定义一个对象代表组件实例的对象
    // const instance = {
    //   // 组件的实例
    //   data: state,
    //   isMounted: false,
    //   subTree: null,
    //   vnode,
    //   update: null, // 组件的更新方法 effect.run()
    //   props: {},
    //   attrs: {},
    //   propsOptions,
    //   proxy: null,
    // };
    //组件的虚拟节点上增加 component 属性，记住当前的组件实例
    // vnode.component = instance; // 让虚拟节点知道对应的组件是谁
    //初始化 props
    // instance.propsOptions 用户接受了哪些属性的列表 ，  vnode.props
    // initProps(instance, vnode.props);
    //在组件实例对象上新增一个 proxy 对象，当我们访问实例对象上的，
    // const publicProperties = {
    //   $attrs: (i) => i.attrs,
    //   $props: (i) => i.props,
    // };
    //data 或者 props 里面的值的时候，建议一个映射返回关系
    // instance.proxy = new Proxy(instance, {
    //   get(target, key) {
    //     //从实例对象上拿到 data,props
    //     let { data, props } = target
    //     if (hasOwn(key, data)) {
    //       //当我们访问 instance 上 proxy 的属性的时候，我们先去
    //       //data上查找有没有这个 key 的，有的话，我们返回 data 上的
    //       return data[key];
    //     } else if (hasOwn(key, props)) {
    //       //如果 data 上没有，再去 props 上查找，有的话，返回 props 上的值
    //       return props[key];
    //     }
    //     //将$attrs,$props维护到一个对象，如果取值就从对象中执行函数
    //     let getter = publicProperties[key];
    //     if (getter) {
    //       return getter(target);
    //     }
    //   },
    //   set(target, key, value) {
    //     //当我们设置值的时候，也是先去优先设置 data上的，props 上的不允许改，弹出提醒
    //     let { data, props } = target;
    //     if (hasOwn(key, data)) {
    //       data[key] = value;
    //     } else if (hasOwn(key, props)) {
    //       console.log("warn ");
    //       return false;
    //     }
    //     return true;
    //   },
    // })


  }

  //这里只是对比了属性有变化，实际我们还需要把变化的部分操作掉，也就是写一个 updateProps 方法
  const hasPropsChanged = (prevProps = {}, nextProps = {}) => {
    //取出两个 props 的属性，拼成属性
    let l1 = Object.keys(prevProps)
    let l2 = Object.keys(nextProps)
    if (l1.length !== l2.length) {
      return true
    }
    //循环老的 props的 key，同时去新的 props 里面取
    for (let i = 0; i < l1.length; i++) {
      const key = l2[i];
      if (nextProps[key] !== prevProps[key]) {
        return true; // 属性有变化
      }
    }
    return false
  }
  //判断组件是否需要更新
  const shouldComponentUpdate = (n1, n2) => {
    const { props: prevProps, children: prevChildren } = n1;
    const { props: nextProps, children: nextChildren } = n2;
    // 对于插槽而言 只要前后有插槽 那么就意味着组件要更新
    if (prevChildren || nextChildren) return true;
    //如果 props 一样不更新
    if (prevProps === nextProps) return false;
    return hasPropsChanged(prevProps, nextProps);
  }
  //更新组件
  const updateComponent = (n1, n2) => {
    //更新属性的时候先复用组件
    let instance = (n2.component = n1.component)
    if (shouldComponentUpdate(n1, n2)) {//如果需要更新，我们就重新调用 run 方法
      // 比对属性 和 插槽 看一下要不要更新
      instance.next = n2; // 我们将新的虚拟节点挂载到实例上
      instance.update();//这的 update 就是 effect.run方法 1
    }
  }
  const processComponent = (n1, n2, container, anchor = null) => {
    if (n1 === null) {
      //我们在初始化组件的时候，分为出渲染
      mountComponent(n2, container, anchor)
    } else {
      // 更新
      // 组件更新  指代的是组件的属性 更新、插槽更新,render的更新已经在 proxy 中自动触发了
      // let instance = (n2.component = n1.component);
      // instance.props.a = n2.props.a;
      //组件更新的时候去更新属性
      updateComponent(n1, n2)
    }

  }
  const patch = (n1, n2, container, anchor = null) => {
    if (n1 == n2) {
      return; // 无需更新
    }
    // n1 div -》 n2 p

    // 如果  n1 n2 都有值 但是类型不同则删除n1 换n2
    if (n1 && !isSameVNode(n1, n2)) {
      unmount(n1); // 删除节点
      n1 = null;
    }
    let { shapeFlag, type } = n2
    switch (type) {
      case Text:
        //处理文本消息
        processText(n1, n2, container)
        break;
      case Fragment:
        processFragment(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          //处理元素节点
          processElement(n1, n2, container, anchor);
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          //处理组件节点
          processComponent(n1, n2, container, anchor);
        } else if (shapeFlag & ShapeFlags.TELEPORT) {
          //在此处处理 teleport组件，因为它提供了一个 process方法
          type.process(n1, n2, container, anchor, {
            mountChildren,
            patchChildren,
            query: hostQuerySelector,
            move(vnode, container, anchor) {
              hostInsert(
                vnode.component ? vnode.component.subTree.el : vnode.el,
                container,
                anchor
              );
            },
          })
        }
    }

    // ...
  };
  const unmount = (vnode) => {
    const { shapeFlag } = vnode;
    // fragment卸载的时候  不是卸载的自己，而是他所有的儿子
    if (vnode.type === Fragment) {
      return unmountChildren(vnode.children);
    } else if (shapeFlag & ShapeFlags.COMPONENT) {
      return unmount(vnode.component.subTree);
    }
    hostRemove(vnode.el)
  };
  const render = (vnode, container) => {
    debugger
    if (vnode == null) {
      // 卸载：删除节点

      if (container._vnode) {
        // 说明渲染过了，我才需要进行卸载操作
        unmount(container._vnode);
      }
    } else {
      // 初次渲染  更新

      patch(container._vnode || null, vnode, container);
    }
    container._vnode = vnode; // 第一次渲染保存虚拟节点
  };
  return {
    // createRenderer 可以用户自定义渲染方式
    // createRenderer 返回的render方法 接受参数是虚拟节点和容器
    render,
  };
}


// 最长递增子序列
// 最优的情况 [1,2,3,4,5,6]  -> [0,1,2,3,4,5]

function getSequence(arr) {
  let len = arr.length; // 总长度
  let result = [0]; // 默认连续的最终结果 组成的索引
  let resultLastIndex;
  let start;
  let end;
  let middle;
  let p = arr.slice(0); // 用来标识索引的
  for (let i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      // vue 中序列中不会出现0  如果序列中出现 0 的话忽略就可以
      resultLastIndex = result[result.length - 1];
      if (arr[resultLastIndex] < arrI) {
        result.push(i);
        p[i] = resultLastIndex; // 让当前最后一项记住前一项的索引
        continue;
      }
      // [1,2,3,4,5,6]
      // 这里就会出现 当前项比最后一项的值大  [0,1,2]
      start = 0;
      end = result.length - 1;
      while (start < end) {
        middle = ((start + end) / 2) | 0;
        if (arr[result[middle]] < arrI) {
          start = middle + 1;
        } else {
          end = middle;
        }
      }
      // middle 就是第一个比当前值大的值
      if (arrI < arr[result[start]]) {
        p[i] = result[start - 1]; // 记住换的那个人的前一项的索引
        result[start] = i;
      }
    }
  }
  // 追溯
  let i = result.length; // 获取数组长度
  let last = result[i - 1]; // 最后一项的索引
  while (i-- > 0) {
    result[i] = last; // 用最后一项的索引来追溯
    last = p[last]; // 用p中的索引来进行追溯
  }
  return result;
}


