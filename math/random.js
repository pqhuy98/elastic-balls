import { vec2 } from "./linear_algebra.js";

export function randomFloat(l, r) {
    return Math.random() * (r - l) + l
}

export function randomVec2(amp) {
    let angle = Math.random() * 2 * Math.PI;
    return vec2(Math.cos(angle) * amp, Math.sin(angle) * amp);
}

export function randomInt(l, r) {
    return ~~(randomFloat(l, r))
}

export function randomExp(l, r) {
    return Math.exp(randomFloat(Math.log(l), Math.log(r)))
}

export function randomColor() {
    var letters = "0123456789ABCDEF"
    var color = "#"
    for (var i = 0; i < 6; i++) {
        color += letters[~~(Math.random() * 16)]
    }
    return color
}

export function pickRandom(arr) {
    return arr[randomInt(0, arr.length)]
}
