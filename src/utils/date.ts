/**
 * 获取当前时间的时间戳字符串
 * 格式: YYYYMMDDHHmmSSS (例如: 202312262030123)
 */
export const getTimestampStr = (): string => {
    const now = new Date();
    const pad = (num: number, targetLength: number = 2) => String(num).padStart(targetLength, '0');

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hour = pad(now.getHours());
    const minute = pad(now.getMinutes());
    const ms = pad(now.getMilliseconds(), 3);

    return `${year}${month}${day}${hour}${minute}${ms}`;
};
