export interface ObjType {
    [key: string]: any;
}

/** 对象深度合并
 * @param target 被覆盖的对象
 * @param source 对象的新属性
 */
function mergeObj(target: ObjType, source: ObjType): any {
    if (!source) {
        return target;
    } else if (!target) {
        return source;
    }

    for (let i in source) {
        // if its an object
        if (source[i] != null && source[i].constructor === Object) {
            if (!target[i]) {
                target[i] = {};
            }
            target[i] = mergeObj(target[i], source[i]);
        }
        // if its an array, simple values need to be joined.  Object values need to be remerged.
        else if (source[i] != null && (source[i] instanceof Array) && source[i].length > 0) {
            // test to see if the first element is an object or not so we know the type of array we're dealing with.
            if (source[i][0].constructor === Object) {
                let newobjs: Array<any> = [];
                // create an index of all the existing object IDs for quick access.  There is no way to know how many items will be in the arrays.
                let objids: any = {};
                if (target[i]) {
                    for (let x = 0, l = target[i].length; x < l; x++) {
                        if (target[i][x].id) {
                            objids[target[i][x].id] = x;
                        }
                    }
                } else {
                    target[i] = [];
                }

                // now walk through the objects in the new array
                // if the ID exists, then merge the objects.
                // if the ID does not exist, push to the end of the target array
                for (let x = 0, l = source[i].length; x < l; x++) {
                    let newobj = source[i][x];
                    if (newobj.id && objids[newobj.id] !== undefined) {
                        target[i][x] = mergeObj(target[i][x], newobj);
                    }
                    else {
                        newobjs.push(newobj);
                    }
                }

                for (let x = 0, l = newobjs.length; x < l; x++) {
                    target[i].push(newobjs[x]);
                }
            }
            else {
                if (!target[i]) target[i] = [];
                for (let x = 0; x < source[i].length; x++) {
                    let idxObj = source[i][x];
                    if (target[i].indexOf(idxObj) === -1) {
                        target[i].push(idxObj);
                    }
                }
            }
        }
        else {
            target[i] = source[i];
        }
    }
    return target;
}

export default mergeObj;
