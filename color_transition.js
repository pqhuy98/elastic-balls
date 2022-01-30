import { hexToRgb, randomColor, randomInt, rgbToHex, hslToRgb } from "./math/index.js";

export default class ColorTransition {
    constructor({ startingColor, stepCount }) {
        startingColor = startingColor || randomColor();
        this.currentColor = hexToRgb(startingColor);
        this.targetColor = randomNiceRgb();
        this.stepCount = stepCount;
        this.currentStep = stepCount;
    }

    update() {
        if (this.currentStep === this.stepCount) {
            this.currentColor = this.targetColor;
            this.targetColor = randomNiceRgb();
            this.currentStep = 0
        }
        this.currentStep++;
    }

    getColor() {
        let percent = this.currentStep / this.stepCount;
        return rgbToHex(interpolateColor(this.currentColor, this.targetColor, percent))
    }
}


function interpolateColor(fromColor, toColor, percentage) {
    return {
        r: fromColor.r * (1 - percentage) + toColor.r * percentage,
        g: fromColor.g * (1 - percentage) + toColor.g * percentage,
        b: fromColor.b * (1 - percentage) + toColor.b * percentage,
    }
}

function randomNiceRgb() {
    let h = randomInt(0, 360),
        s = randomInt(42, 98),
        l = randomInt(40, 90);
    let [r, g, b] = hslToRgb(h, s, l);
    return { r, g, b }
}