/**
 * 生成 UUID (v4)
 * 使用 crypto.randomUUID() 如果可用，否则降级到 Math.random()
 */
export const uuid = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    //简易 v4 实现
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * 为了兼容原有代码习惯，导出 v1 别名，实际使用 v4 (随机)
 * 大多数 UI 场景下 v1 和 v4 可以互换
 */
export const v1 = uuid;
