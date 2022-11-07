/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-06 20:54:48
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-06 21:09:23
 * @FilePath: /vue3-study/packages/runtime-core/src/scheduler.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const queue = []; //维护一个队列函数内部
let isFlushing = false; //一个开关

const resolvePromise = Promise.resolve(); // nextTick 保存了下 promise 的 resolve 方法

export const queueJob = (job:any) => {
    //job 参数就是instance.update方法，这个方法就是  effect.run 方法
    //将这个方法收集到一个数组中，过滤掉重复的
  if (!queue.includes(job)) {
    queue.push(job);
  }

  // 最终我要清空队列
  //同步执行完后，才会执行微任务，多次同步的时候已经将更新方法维护到数组，如果开发是关闭状态，就开启去执行微任务
  if (!isFlushing) {
    isFlushing = true;

    // 等待数据全部修改后 做一次操作 //这里面说的数据全部修改就是多次改变数据触发了 effect的 scheduler,多次在外部维护到了 queue 队列
    resolvePromise.then(() => {
      isFlushing = false; //等到微任务成功的时候再打开开关，清空 queue数组前，复制一份，去执行队列里面的 instance.update方法
      let copy = queue.slice(0);
      queue.length = 0;

      for (let i = 0; i < copy.length; i++) {
        const job = copy[i];
        job();
      }
    });
  }
};

// 批处理  开了一个promiose    queue =》 【job,job,job]
