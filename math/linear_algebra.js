export function vec2(x, y) {
    return { x, y }
}
export function add(a, b) {
    return vec2(a.x + b.x, a.y + b.y)
}
export function sub(a, b) {
    return vec2(a.x - b.x, a.y - b.y)
}
export function mul(vec, k) {
    return vec2(vec.x * k, vec.y * k)
}
export function mod(a, b) {
    return vec2(a.x % b.x, a.y % b.y)
}
export function zero() {
    return vec2(0, 0);
}
export function dot(a, b) {
    return a.x * b.x + a.y * b.y;
}
export function magn2(vec) {
    return dot(vec, vec)
}
export function magn(vec) {
    return Math.sqrt(magn2(vec))
}
export function distance(a, b) {
    return magn(sub(b, a))
}
export function norm(vec) {
    let angle = Math.atan2(vec.y, vec.x)
    return vec2(Math.cos(angle), Math.sin(angle))
}
export function clip(x, l, r) {
    return Math.max(l, Math.min(r, x))
}
export function clipVec(vec, maxMag) {
    let mag = magn(vec);
    if (mag > maxMag) {
        return scale(vec, maxMag);
    }
    return vec
}

export function tangent(vec) {
    return vec2(vec.y, -vec.x);
}
export function reflect(vec, normal) {
    return sub(vec, mul(normal, 2 * dot(vec, normal)));
}
export function scale(vec, len) {
    return mul(norm(vec), len);
}