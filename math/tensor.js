
export function newTensor(shape, value = 0) {
    if (shape.length === 0) {
        throw new Error("`shape` must not be empty.");
    }
    const ans = [];
    if (shape.length > 1) {
        for (let i = 0; i < shape[0]; i++) {
            ans.push(newTensor(shape.slice(1), value));
        }
    } else {
        for (let i = 0; i < shape[0]; i++) {
            ans.push(typeof value === "function" ? value() : value);
        }
    }
    return ans;
}

export function forEach(tensor, depth, callback, coordinate = []) {
    let op;
    if (depth > 1) {
        tensor.forEach((t, i) => {
            forEach(t, depth - 1, callback, [...coordinate, i]);
        });
    } else {
        tensor.forEach((t, i) => {
            callback([...coordinate, i]);
        });
    }
}

export function map(tensor, callback, coordinate = []) {
    let op;
    if (tensor.length > 1) {
        return tensor.map((t, i) => map(t, callback, [...coordinate, i]));
    } else {
        return tensor.map((t, i) => callback([...coordinate, i]));
    }
}

export function at(tensor, coordinate) {
    let ans = tensor;
    coordinate.forEach((i) => {
        ans = ans[i];
    });
    return ans;
}