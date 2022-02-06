import { hexToRgb, randomColor, randomInt, rgbToHex, hslToRgb, randomNiceRgb } from "./math/index.js";

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
