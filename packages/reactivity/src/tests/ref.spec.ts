
/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-09-07 22:26:07
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-10-30 17:16:49
 * @FilePath: /my-mini-vue/src/reactivity/tests/ref.spec.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { effect } from "../effect";
import { reactive } from "../reactive";
import { ref, toRef } from "../ref";
describe("ref", () => {
    it("happy path", () => {
        const a = ref(1);
        expect(a.value).toBe(1);
    });

    it("should be reactive", () => {
        const a = ref(1);
        let dummy;
        let calls = 0;
        effect(() => {
            calls++;
            dummy = a.value;
        });
        expect(calls).toBe(1);
        expect(dummy).toBe(1);
        a.value = 2;
        expect(calls).toBe(2);
        expect(dummy).toBe(2);
        // same value should not trigger
        a.value = 2;
        expect(calls).toBe(2);
        expect(dummy).toBe(2);
    });

    it("should make nested properties reactive", () => {
        const a = ref({
            count: 1,
        });
        let dummy;
        effect(() => {
            dummy = a.value.count;
        });
        expect(dummy).toBe(1);
        a.value.count = 2;
        expect(dummy).toBe(2);
    });

    it("toRef", () => {
        let person = reactive({ name: 'zf', age: 13 });
        let name = toRef(person, 'name')
        let age = toRef(person, 'age')
        name.value = 'qwh'
        expect(name.value).toBe(person.name);
    })

    //   it("isRef", () => {
    //     const a = ref(1);
    //     const user = reactive({
    //       age: 1,
    //     });
    //     expect(isRef(a)).toBe(true);
    //     expect(isRef(1)).toBe(false);
    //     expect(isRef(user)).toBe(false);
    //   });

    //   it("unRef", () => {
    //     const a = ref(1);
    //     expect(unRef(a)).toBe(1);
    //     expect(unRef(1)).toBe(1);
    //   });

    //   it("proxyRefs", () => {
    //     const user = {
    //       age: ref(10),
    //       name: "xiaohong",
    //     };

    //     const proxyUser = proxyRefs(user);
    //     expect(user.age.value).toBe(10);
    //     expect(proxyUser.age).toBe(10);
    //     expect(proxyUser.name).toBe("xiaohong");

    //     proxyUser.age = 20;

    //     expect(proxyUser.age).toBe(20);
    //     expect(user.age.value).toBe(20);

    //     proxyUser.age = ref(10);
    //     expect(proxyUser.age).toBe(10);
    //     expect(user.age.value).toBe(10);
    //   });
});