/** 对比两个对象是否一致 */
function compare(obj1: any, obj2: any): boolean {
    if (obj1 == obj2) {
        return true;
    } else if (obj1 && !obj2) {
        return false;
    } else if (!obj1 && obj2) {
        return false;
    } else if (!obj1 && !obj2) {
        return true;
    } else if (obj1 instanceof Object && !(obj2 instanceof Object)) {
        return false;
    } else if (obj1 instanceof Function && !(obj2 instanceof Function)) {
        return false;
    } else if (obj1 instanceof Array && !(obj2 instanceof Array)) {
        return false;
    } else if (obj1 instanceof Object && obj2 instanceof Object) {
        // if (obj1.$$typeof && obj2.$$typeof && obj1.$$typeof === 'Symbol(react.element);') {
        //   debugger;
        //   return false;
        // }
        const props1 = Object.getOwnPropertyNames(obj1);
        const props2 = Object.getOwnPropertyNames(obj2);
        if (props1.length !== props2.length) {
            return false;
        } else {
            for (let i = 0; i < props1.length; i++) {
                const propName = props1[i];
                const isCompare = compare(obj1[propName], obj2[propName]);
                if (!isCompare) {
                    return false;
                }
            }
            return true;
        }
    } else if (obj1 instanceof Function && obj2 instanceof Function) {
        return obj1 === obj2;
    } else if (obj1 instanceof Array && obj2 instanceof Array) {
        if (obj1.length !== obj2.length) {
            return false;
        } else {
            for (let i = 0; i < obj1.length; i++) {
                if (!compare(obj1[i], obj2[i])) {
                    return false;
                }
            }
            return true;
        }
    } else {
        return obj1 === obj2;
    }
}
export default compare;
