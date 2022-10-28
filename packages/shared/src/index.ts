/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-10-26 14:32:28
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-10-28 20:52:54
 * @FilePath: /vue3-study/packages/shared/src/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export const isObject = (val) => {
	return val !== null && typeof val === 'object';
};

export function isFunction(value) {
	return typeof value === "function";
  }