// get all points in a square
export function square(x, y, sz, width, height, callback) {
    for (let i = x; i < x + sz; i++) {
        if (i < 0 || i >= width) continue
        for (let j = y; j < y + sz; j++) {
            if (j < 0 || j >= height) continue
            callback(~~i, ~~j)
        }
    }
}

// get all points in a circle
export function circle(x, y, sz, width, height, callback) {
    for (let i = x - sz + 1; i < x + sz; i++) {
        if (i < 0 || i >= width) continue
        let yspan = sz * Math.sin(Math.acos((x - i) / sz))
        for (let j = y - yspan + 1; j < y + yspan; j++) {
            if (j < 0 || j >= height) continue
            callback(~~(i), ~~(j))
        }
    }
}
