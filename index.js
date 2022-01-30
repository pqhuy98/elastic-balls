import ColorTransition from "./color_transition.js";
import GridCollisionDetector from "./grid_collision.js";
import {
    add, magn, mod, mul, randomFloat, magn2,
    randomVec2, sub, randomColor, vec2, norm,
    tangent, dot, zero, reflect, scale, distance,
    clipVec, randomExp, clip
} from "./math/index.js";

const MAX_FPS = 99;
const config = {}

function generateConfig() {
    config.CIRCLE_COUNT = randomExp(100, 3000);
    config.CoeffRestitution = randomExp(0.8, 1);
    config.MAX_INITIAL_VELO = 100;
    config.mouseRadius = 10;
    config.density = randomFloat(0.7, 1.2);
    config.maxRadius = config.density * Math.sqrt(window.innerWidth * window.innerHeight / config.CIRCLE_COUNT);
    config.maxMouseRadius = 10 * config.maxRadius;
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
        this.colorTransition = new ColorTransition({ stepCount: 300 });
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
                accel: vec2(0, 0),
                mass: 0,
                color: "yellow",
            });
        }
        this.circles.forEach(c => {
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
        this.colorTransition.update();

        const posImpulse = {}, collisionCount = {}, curT = {};

        // update position
        this.circles.forEach((c, i) => {
            let threshold = config.mouseRadius + c.r;
            if (magn2(sub(this.mouse, c.pos)) <= threshold * threshold) {
                c.velo = add(c.velo, scale(sub(c.pos, this.mouse), 0.1 * threshold));
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

            let sumVM12 = add(mul(c1.velo, c1.mass), mul(c2.velo, c2.mass));
            let inverseTotalMass = 1 / (c1.mass + c2.mass)
            let newVelo1 = mul(
                add(
                    mul(sub(c2.velo, c1.velo), config.CoeffRestitution * c2.mass),
                    sumVM12,
                ),
                inverseTotalMass
            );
            let newVelo2 = mul(
                add(
                    mul(sub(c1.velo, c2.velo), config.CoeffRestitution * c1.mass),
                    sumVM12,
                ),
                inverseTotalMass
            );
            c1.velo = newVelo1;
            c2.velo = newVelo2;

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
            if (c.pos.x - c.r < 0) {
                c.pos.x = c.r;
                c.velo.x *= -config.CoeffRestitution;
            }
            if (c.pos.x + c.r > this.size.x) {
                c.pos.x = this.size.x - c.r;
                c.velo.x *= -config.CoeffRestitution;
            }
            if (c.pos.y - c.r < 0) {
                c.pos.y = c.r;
                c.velo.y *= -config.CoeffRestitution;
            }
            if (c.pos.y + c.r > this.size.y) {
                c.pos.y = this.size.y - c.r;
                c.velo.y *= -config.CoeffRestitution;
            }
        });
    }

    render(dt) {
        const ctx = this.ctx;
        ctx.canvas.width = this.size.x;
        ctx.canvas.height = this.size.y;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // draw outer
        ctx.beginPath();
        ctx.strokeStyle = this.colorTransition.getColor();
        this.circles.forEach((c) => {
            ctx.moveTo(c.pos.x + c.r, c.pos.y);
            ctx.arc(c.pos.x, c.pos.y, c.r, 0, 2 * Math.PI);
        });
        ctx.stroke();

        // draw FPS
        ctx.font = '16px Verdana';
        ctx.fillStyle = 'white';

        ctx.textAlign = "left"
        ctx.fillText('HOVER - WHEEL - [R]', 12, 30);
        ctx.fillText("OBJECTS: " + this.circles.length, 12, this.size.y - 12);

        ctx.textAlign = "right"
        ctx.fillText('FPS: ' + this.fps.toFixed(1), this.size.x - 12, 12 + 16);
        ctx.fillText(JSON.stringify(this.debug, 0, 2), this.size.x - 12, this.size.y - 12);
        // ctx.fillText("OBJECTS: " + this.circles.length, 10, this.size.y - 10);
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