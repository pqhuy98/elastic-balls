import { magn2, sub, vec2 } from "./math/linear_algebra.js";
import { willCollide } from "./math/physics.js";
import { at, forEach, newTensor } from "./math/tensor.js";

export default class GridCollisionDetector {
    constructor({ width, height, cellWidth, cellHeight }) {
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.w = (width + cellWidth - 1) / cellWidth;
        this.h = (height + cellHeight - 1) / cellHeight;
        this.grid = newTensor([this.w, this.h], () => []);
        this.candidate = {};
        this.maxId = 0;
        this.pairChecked = 0
    }

    insert({ id, pos, velo, r }) {
        let xl = ~~((pos.x - r) / this.cellWidth);
        let xh = ~~((pos.x + r) / this.cellWidth);
        let yl = ~~((pos.y - r) / this.cellHeight);
        let yh = ~~((pos.y + r) / this.cellHeight);
        for (let i = Math.max(xl, 0); i <= Math.min(xh, this.w - 1); i++) {
            for (let j = Math.max(yl, 0); j <= Math.min(yh, this.h - 1); j++) {
                this.grid[i][j].push({
                    id, pos, velo, r
                })
            }
        }
        this.maxId = Math.max(this.maxId, id + 5);
    }

    isFree({ x, y, r }) {
        let xl = ~~((x - r) / this.cellWidth);
        let xh = ~~((x + r) / this.cellWidth);
        let yl = ~~((y - r) / this.cellHeight);
        let yh = ~~((y + r) / this.cellHeight);
        for (let i = Math.max(xl, 0); i <= Math.min(xh, this.w - 1); i++) {
            for (let j = Math.max(yl, 0); j <= Math.min(yh, this.h - 1); j++) {
                if (this.grid[i][j].length > 0) {
                    return false;
                }
            }
        }
        return true;
    }

    getPotentialCollisions() {
        const ans = [];
        const added = {};
        this.pairChecked = 0

        forEach(this.grid, 2, (coor) => {
            const list = at(this.grid, coor);
            for (let i = 0; i < list.length; i++) {
                for (let j = i + 1; j < list.length; j++) {
                    this.pairChecked++;
                    let c1 = list[i], c2 = list[j];
                    if (c1.id1 > c2.id2) {
                        [c1, c2] = [c2, c1];
                    }
                    let distanceSqrLimit = c1.r + c2.r;
                    // let key = c1.id + " " + c2.id;
                    let key = c1.id * this.maxId + c2.id;
                    if (!added[key] &&
                        magn2(sub(c1.pos, c2.pos)) <= distanceSqrLimit * distanceSqrLimit
                    ) {
                        ans.push({ c1, c2 });
                        added[key] = true;
                    }
                }
            }
        });

        return ans;
    }

    _getPotentialCollisions(dt) {
        const ans = [];
        const added = {};
        this.pairChecked = 0

        forEach(this.grid, 2, (coor) => {
            const list = at(this.grid, coor);
            for (let i = 0; i < list.length; i++) {
                for (let j = i + 1; j < list.length; j++) {
                    this.pairChecked++;
                    let c1 = list[i], c2 = list[j];
                    if (c1.id1 > c2.id2) {
                        [c1, c2] = [c2, c1];
                    }
                    let key = c1.id * this.maxId + c2.id;
                    if (!added[key]) {
                        let t = willCollide(c1, c2)
                        if (t === null || t > dt) continue;

                        ans.push({ c1, c2, t });
                        added[key] = true;
                    }
                }
            }
        });

        return ans;
    }
}