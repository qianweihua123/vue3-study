import { ShapeFlags } from "@vue/shared";
import { getCurrentInstance } from "./component";
import { onMounted, onUpdated } from "./apiLifecycle";
import { isVNode } from "./vnode";

export const KeepAliveImpl = {
  __isKeepAlive: true, //标识这是 keep-alive组件
  props: { //接收的属性值
    include: {}, // ['缓存名字','缓存字']  ’my1,my2‘ 正则
    exclude: {},
    max: {},
  },
  setup(props, { slots }) { //使用 keep-alive包裹的组件会被解析到插槽上，可以在 slots 上拿到
    // 缓存的组件有哪些，方便查找 key 来描述
    // key 对应的组件的定义
    const keys = new Set(); //key 名
    const cache = new Map(); // key -> 组件 这是缓存列表

    const instance = getCurrentInstance(); //因为这是在 setup 方法里面，所以可以拿到组件实例 instance
    let { createElement, move, unmount } = instance.ctx.renderer;//操作渲染的一些方法
    let storageContainer = createElement("div"); //当 keep-alive里面的内部被切换的时候，不是真的移除了，只是被移动到这个 div 容器里面

    instance.ctx.activate = function (vnode, container) { //实例上的 ctx 属性只有 keep-alive能用，我们在上面存储 activate 方法
      // 稍后my1 组件激活的时候 需要从缓存中拿出来就可以了

      move(vnode, container); // 将刚才缓存的dom，拿到容器中
    };

    instance.ctx.deactivate = function (vnode) {//deactivate钩子，组件被切换时候的时候，将内容移动到一个容器存储
      // 给这个虚拟节点对应的dom  移动到隐藏的盒子中就可以了
      move(vnode, storageContainer);
    };

    let pendingCacheKey = null;

    const cacheSubTree = () => {
      if (pendingCacheKey) {
        cache.set(pendingCacheKey, instance.subTree);
      }
    };
    const _unmount = (vnode) => {
      let shapeFlag = vnode.shapeFlag;
      if (shapeFlag & ShapeFlags.COMPONENT_KEPT_ALIVE) {
        shapeFlag -= ShapeFlags.COMPONENT_KEPT_ALIVE;
      }
      if (shapeFlag & ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE) {
        shapeFlag -= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE;
      }
      vnode.shapeFlag = shapeFlag;
      unmount(vnode, null);
      // 这里要移除
    };
    const pruneCaheEntry = (key) => {
      // 这里只是拿出第一个  [1,2,3,4] . -> 2 . [1,3,2]

      let cached = cache.get(key);
      cache.delete(key);
      keys.delete(key);

      _unmount(cached);
    };

    onMounted(cacheSubTree); //在 keep-alive里面使用了生命周期，这个生命周期不是在这立即执行的，会先收集起来，等到组件挂载完毕后去执行，就等于将缓存的组件的 key 和组件实例身上的 subtree（虚拟节点树）缓存下来
    onUpdated(cacheSubTree);//当更新的时候，重新去存一遍，更新
    return () => { //返回的 render 函数
      let vnode = slots.default(); //取出 keep-alive 包裹的内容
      let name = vnode.type.name; //组件的 name 名字

      const { include, exclude, max } = props; //取出定义的属性，包含，排除，最大数量

      //如果不是虚拟节点或者不是组件，直接返回，因为 keep-alive只能配合组件使用
      if (
        !isVNode(vnode) ||
        !(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT)
      ) {
        return vnode;
      }
      //vnode的 type上其实就是被包含的组件对象 这个 comp 就是组件
      const comp = vnode.type;
      //定义一个 key 是在存储到映射表的时候用的，有 key 的情况 用 key，没有的话，用组件对象
      const key = vnode.props?.key == null ? comp : vnode.props.key;

      let cacheVNode = cache.get(key);//先尝试去缓存中取出
      pendingCacheKey = key; // 在组件加载完毕后缓存的key的名字  将 key 的值给到 pendingCacheKey变量上

      //组件名没有包含在 includes 里面或者在 exclude 排除里面，直接返回虚拟节点
      if (
        (name && include && !include.split(",").includes(name)) ||
        (exclude && exclude.split(",").includes(name))
      ) {
        return vnode;
      }
      if (cacheVNode) {//如果不是第一次缓存的话（之前已经存储过）
        // 复用组件的实例，告诉这个组件不要在渲染了
        vnode.component = cacheVNode.component; //去缓存中拿到 component里面的内容给到现在的虚拟节点的component属性上
        vnode.shapeFlag |= ShapeFlags.COMPONENT_KEPT_ALIVE; //位运算加上 keep-alive类型，稍后会用到去判断不用真正的创建
      } else {
        //没有缓存的情况下
        keys.delete(key); // 将原有的移除到尾部， 让其保持最新
        keys.add(key);//将当前的组件加入缓存
        // 超过缓存限制了， 删除第一个
        if (max && keys.size > max) {//超过缓存了，进入删除第一个
          // it.next()
          pruneCaheEntry(keys.values().next().value);
        }
      }
      // 稍后组件卸载的时候 不要卸载。 后续可以复用这个组件的dom元素
      vnode.shapeFlag |= ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE;
      return vnode;
    };
  },
};

export const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
