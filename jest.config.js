/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-10-26 15:58:53
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-10-26 16:17:14
 * @FilePath: /vue3-study/jest.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
module.exports = {
    testMatch: ['<rootDir>packages/**/tests/**/*spec.ts'],
    testEnvironment: 'jsdom',
    rootDir: __dirname,
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    moduleNameMapper: {
        '@vue/share': '<rootDir>/packages/shared/src',
    },
}