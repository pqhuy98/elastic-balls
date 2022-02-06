import ColorTransition from "./color_transition.js";
import GridCollisionDetector from "./grid_collision.js";
import {
    add, magn, mod, mul, randomFloat, magn2,
    randomVec2, sub, randomColor, vec2, norm,
    tangent, dot, zero, reflect, scale, distance,
    clipVec, randomExp, clip, randomNiceColor,
    pickRandom, randomInt
} from "./math/index.js";
import { calculateNewVelo, gravity } from "./math/physics.js";

const MAX_FPS = 99;
const config = {}

function generateConfig() {
    config.CIRCLE_COUNT = randomExp(100, 3000);
    config.CoeffRestitution = randomExp(0.8, 1);
    config.MAX_INITIAL_VELO = randomExp(100, 1000);
    config.mouseRadius = 10;
    config.density = randomFloat(0.8, 1.2);
    config.maxRadius = config.density * Math.sqrt(window.innerWidth * window.innerHeight / config.CIRCLE_COUNT);
    config.maxMouseRadius = 3 * config.maxRadius;
    config.colorCount = randomInt(2, 5);
    config.hasWall = {
        x: pickRandom([true, false]),
        y: pickRandom([true, false]),
    }
}
generateConfig();


class Game {
    constructor({ nCircle }) {
        this.circles = [];
        this.size = vec2(window.innerWidth, window.innerHeight);
        this.fps = 0;
        this.mouse = mul(this.size, 0.5);
        this.mouseTime = performance.now();
        this.debug = {};
        this.lastTime = performance.now();

        const canvas = document.getElementById("main");
        canvas.onmousemove = (e) => {
            this.mouse = vec2(e.clientX, e.clientY);
            this.mouseTime = performance.now();
        };
        canvas.onmousewheel = (e) => {
            config.mouseRadius = clip(config.mouseRadius + 0.1 * e.deltaY, 1, config.maxMouseRadius);
        };

        this.ctx = canvas.getContext("2d");

        let startTime = performance.now();
        for (let i = 0; i < nCircle; i++) {
            this.circles.push({
                id: i,
                pos: vec2(randomFloat(0, this.size.x), randomFloat(0, this.size.y)),
                velo: vec2(randomFloat(-config.MAX_INITIAL_VELO, config.MAX_INITIAL_VELO), randomFloat(-config.MAX_INITIAL_VELO, config.MAX_INITIAL_VELO)),
                r: randomExp(1, config.maxRadius),
                accel: gravity(),
                mass: 0,
            });
        }

        this.colorTransitions = []
        for (let i = 0; i < config.colorCount; i++) {
            this.colorTransitions.push(new ColorTransition({ stepCount: 300 }));
        }

        this.circles.forEach(c => {
            c.colorTransition = pickRandom(this.colorTransitions);
            c.mass = c.r;
        })
    }

    multiUpdate(dt, iterCount = 1) {
        this.fps = 0.7 * this.fps + 0.3 / dt;
        for (let i = 0; i < iterCount; i++) {
            this.update(dt / iterCount)
        }
    }

    update(dt) {
        this.colorTransitions.forEach(ct => ct.update());

        this.circles.forEach((c) => {
            if (!this.colorTransitions.includes(c.colorTransition)) {
                c.colorTransition.update();
            }
        });
        const posImpulse = {}, collisionCount = {}, curT = {};

        // update position
        this.circles.forEach((c, i) => {
            let threshold = config.mouseRadius + c.r;
            if (magn2(sub(this.mouse, c.pos)) <= threshold * threshold) {
                c.velo = add(c.velo, scale(sub(c.pos, this.mouse), 10 * dt * threshold));
            }
            c.velo = add(c.velo, mul(c.accel, dt))
            posImpulse[i] = zero()
            collisionCount[i] = 0
            curT[i] = 0;
        });

        // collision detection
        const grid = new GridCollisionDetector({
            width: this.size.x, height: this.size.y,
            cellWidth: Math.round(2 * config.maxRadius), cellHeight: Math.round(2 * config.maxRadius),
        })
        this.circles.forEach((c, i) => {
            grid.insert(c);
        });

        const pcol = grid.getPotentialCollisions(dt);
        this.debug.collisionCount = pcol.length;
        this.debug.pairChecked = grid.pairChecked;


        pcol.forEach(({ c1, c2, t }) => {
            c1 = this.circles[c1.id];
            c2 = this.circles[c2.id];

            calculateNewVelo(c1, c2, config.CoeffRestitution);

            let overlapDistance = c1.r + c2.r - distance(c1.pos, c2.pos);
            let dis = scale(sub(c1.pos, c2.pos), overlapDistance);
            posImpulse[c1.id] = add(posImpulse[c1.id], mul(dis, 1 * c2.r / (c1.r + c2.r)));
            posImpulse[c2.id] = add(posImpulse[c2.id], mul(dis, -1 * c1.r / (c1.r + c2.r)));
        });
        this.circles.forEach(c => {
            if (collisionCount[c.id] > 0) {
                posImpulse[c.id] = mul(posImpulse[c.id], 1 / collisionCount[c.id]);
            }
        });

        // Position update
        this.circles.forEach((c) => {
            c.pos = add(c.pos, posImpulse[c.id]);
            c.pos = add(c.pos, mul(c.velo, dt))//curT[c.id] > 0 ? 0 : dt))
        });

        // Wall collision
        this.circles.forEach((c) => {
            if (c.pos.x + 2 * c.r < 0) {
                c.pos.x = this.size.x + 2 * c.r;
            }
            if (c.pos.x - 2 * c.r > this.size.x) {
                c.pos.x = -2 * c.r;
            }
            if (c.pos.y + 2 * c.r < 0) {
                c.pos.y = this.size.y + 2 * c.r;
            }
            if (c.pos.y - 2 * c.r > this.size.y) {
                c.pos.y = -2 * c.r;
            }

            if (config.hasWall.x) {
                if (c.pos.x - c.r < 0) {
                    c.pos.x = c.r;
                    c.velo.x *= -config.CoeffRestitution;
                }
                if (c.pos.x + c.r > this.size.x) {
                    c.pos.x = this.size.x - c.r;
                    c.velo.x *= -config.CoeffRestitution;
                }
            }
            if (config.hasWall.y) {
                if (c.pos.y - c.r < 0) {
                    c.pos.y = c.r;
                    c.velo.y *= -config.CoeffRestitution;
                }
                if (c.pos.y + c.r > this.size.y) {
                    c.pos.y = this.size.y - c.r;
                    c.velo.y *= -config.CoeffRestitution;
                }
            }
        });
    }

    render(dt) {
        const ctx = this.ctx;
        ctx.canvas.width = this.size.x;
        ctx.canvas.height = this.size.y;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // draw outer
        this.circles.forEach((c) => {
            ctx.beginPath();
            ctx.strokeStyle = c.colorTransition.getColor();
            ctx.moveTo(c.pos.x + c.r, c.pos.y);
            ctx.arc(c.pos.x, c.pos.y, c.r, 0, 2 * Math.PI);
            ctx.stroke();
        });

        // draw FPS
        ctx.font = '16px Verdana';
        ctx.fillStyle = 'white';

        ctx.textAlign = "left"
        ctx.fillText('HOVER - WHEEL - [R]', 12, 30);
        // ctx.fillText("OBJECTS: " + this.circles.length, 12, this.size.y - 12);

        ctx.textAlign = "right"
        ctx.fillText('FPS: ' + this.fps.toFixed(1), this.size.x - 12, 12 + 16);
        // ctx.fillText(JSON.stringify(this.debug, 0, 2), this.size.x - 12, this.size.y - 12);
    }
}


let world = new Game({ nCircle: config.CIRCLE_COUNT });
let last = performance.now();

function animate() {
    requestAnimationFrame(animate);
    // Main loop

    if (performance.now() - last < 1000 / MAX_FPS) return;
    let dt = (performance.now() - last) / 1000;
    last = performance.now();

    world.multiUpdate(dt, 1);
    world.render(dt);
}
animate();


document.onkeypress = function (e) {
    e = e || window.event;
    if (e.key.toLowerCase() === "r") {
        console.log("R");
        generateConfig();
        world = new Game({ nCircle: config.CIRCLE_COUNT });
    }
};