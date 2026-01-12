import { describe, it, expect } from 'vitest';
import compare from './compare';

describe('compare utility', () => {
    describe('primitive values', () => {
        it('compares equal numbers', () => {
            expect(compare(1, 1)).toBe(true);
            expect(compare(0, 0)).toBe(true);
            expect(compare(-1, -1)).toBe(true);
        });

        it('compares unequal numbers', () => {
            expect(compare(1, 2)).toBe(false);
            expect(compare(0, 1)).toBe(false);
        });

        it('compares equal strings', () => {
            expect(compare('hello', 'hello')).toBe(true);
            expect(compare('', '')).toBe(true);
        });

        it('compares unequal strings', () => {
            expect(compare('hello', 'world')).toBe(false);
            expect(compare('a', 'b')).toBe(false);
        });

        it('compares booleans', () => {
            expect(compare(true, true)).toBe(true);
            expect(compare(false, false)).toBe(true);
            expect(compare(true, false)).toBe(false);
        });

        it('compares null and undefined', () => {
            expect(compare(null, null)).toBe(true);
            expect(compare(undefined, undefined)).toBe(true);
            // Note: compare uses == not ===, so null == undefined is true
            expect(compare(null, undefined)).toBe(true);
        });
    });

    describe('objects', () => {
        it('compares equal empty objects', () => {
            expect(compare({}, {})).toBe(true);
        });

        it('compares equal objects with same properties', () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = { a: 1, b: 2 };
            expect(compare(obj1, obj2)).toBe(true);
        });

        it('compares unequal objects with different values', () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = { a: 1, b: 3 };
            expect(compare(obj1, obj2)).toBe(false);
        });

        it('compares unequal objects with different properties', () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = { a: 1, c: 2 };
            expect(compare(obj1, obj2)).toBe(false);
        });

        it('compares nested objects', () => {
            const obj1 = { a: { b: { c: 1 } } };
            const obj2 = { a: { b: { c: 1 } } };
            expect(compare(obj1, obj2)).toBe(true);
        });

        it('compares unequal nested objects', () => {
            const obj1 = { a: { b: { c: 1 } } };
            const obj2 = { a: { b: { c: 2 } } };
            expect(compare(obj1, obj2)).toBe(false);
        });

        it('compares same object reference', () => {
            const obj = { a: 1 };
            expect(compare(obj, obj)).toBe(true);
        });
    });

    describe('arrays', () => {
        it('compares equal empty arrays', () => {
            expect(compare([], [])).toBe(true);
        });

        it('compares equal arrays with same elements', () => {
            expect(compare([1, 2, 3], [1, 2, 3])).toBe(true);
        });

        it('compares unequal arrays with different elements', () => {
            expect(compare([1, 2, 3], [1, 2, 4])).toBe(false);
        });

        it('compares unequal arrays with different lengths', () => {
            expect(compare([1, 2], [1, 2, 3])).toBe(false);
        });

        it('compares nested arrays', () => {
            expect(compare([[1, 2], [3, 4]], [[1, 2], [3, 4]])).toBe(true);
        });

        it('compares unequal nested arrays', () => {
            expect(compare([[1, 2], [3, 4]], [[1, 2], [3, 5]])).toBe(false);
        });

        it('compares arrays of objects', () => {
            const arr1 = [{ a: 1 }, { b: 2 }];
            const arr2 = [{ a: 1 }, { b: 2 }];
            expect(compare(arr1, arr2)).toBe(true);
        });
    });

    describe('functions', () => {
        it('compares same function reference', () => {
            const fn = () => { };
            expect(compare(fn, fn)).toBe(true);
        });

        it('compares different functions', () => {
            const fn1 = () => { };
            const fn2 = () => { };
            expect(compare(fn1, fn2)).toBe(false);
        });
    });

    describe('mixed types', () => {
        it('compares object vs array', () => {
            expect(compare({}, [])).toBe(false);
        });

        it('compares object vs primitive', () => {
            expect(compare({}, 1)).toBe(false);
            expect(compare({ a: 1 }, 'string')).toBe(false);
        });

        it('compares array vs primitive', () => {
            // Note: In JavaScript, [1] == 1 is true due to type coercion
            // The array is converted to string "1" which equals 1
            expect(compare([], 1)).toBe(false);
            expect(compare([1], 1)).toBe(true); // [1] == 1 is true in JS!
            expect(compare([1, 2], 1)).toBe(false);
        });

        it('compares null vs object', () => {
            expect(compare(null, {})).toBe(false);
            expect(compare({}, null)).toBe(false);
        });

        it('compares undefined vs object', () => {
            expect(compare(undefined, {})).toBe(false);
            expect(compare({}, undefined)).toBe(false);
        });
    });

    describe('complex scenarios', () => {
        it('compares complex nested structures', () => {
            const obj1 = {
                user: {
                    name: 'Alice',
                    age: 30,
                    hobbies: ['reading', 'coding'],
                    address: {
                        city: 'New York',
                        zip: '10001',
                    },
                },
            };
            const obj2 = {
                user: {
                    name: 'Alice',
                    age: 30,
                    hobbies: ['reading', 'coding'],
                    address: {
                        city: 'New York',
                        zip: '10001',
                    },
                },
            };
            expect(compare(obj1, obj2)).toBe(true);
        });

        it('detects differences in complex structures', () => {
            const obj1 = {
                user: {
                    name: 'Alice',
                    hobbies: ['reading', 'coding'],
                },
            };
            const obj2 = {
                user: {
                    name: 'Alice',
                    hobbies: ['reading', 'swimming'],
                },
            };
            expect(compare(obj1, obj2)).toBe(false);
        });
    });
});
