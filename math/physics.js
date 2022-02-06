import { add, dot, magn, mul, norm, scale, sub, vec2 } from "./linear_algebra.js";
import { pickRandom } from "./random.js";

const EPS = 1e-7;

export function gravity() {
    return pickRandom([
        vec2(0, 0),
        // vec2(0, 100),
        // vec2(0, -100),
    ])
}

export function calculateNewVelo(c1, c2, CoeffRestitution) {
    let n = norm(sub(c1.pos, c2.pos));
    let newVelo1 = sub(
        c1.velo,
        mul(n,
            dot(n, sub(c1.velo, c2.velo)) * 2 * c2.mass / (c1.mass + c2.mass)
        )
    );
    let newVelo2 = sub(
        c2.velo,
        mul(n,
            dot(n, sub(c2.velo, c1.velo)) * 2 * c1.mass / (c1.mass + c2.mass)
        )
    );

    newVelo1 = mul(newVelo1, CoeffRestitution);
    newVelo2 = mul(newVelo2, CoeffRestitution);

    c1.velo = newVelo1;
    c2.velo = newVelo2;
}

export function __calculateNewVelo(c1, c2, CoeffRestitution) {
    let sumVM12 = add(mul(c1.velo, c1.mass), mul(c2.velo, c2.mass));
    let inverseTotalMass = 1 / (c1.mass + c2.mass)
    let newVelo1 = mul(
        add(
            mul(sub(c2.velo, c1.velo), c2.mass),
            sumVM12,
        ),
        CoeffRestitution * inverseTotalMass
    );
    let newVelo2 = mul(
        add(
            mul(sub(c1.velo, c2.velo), c1.mass),
            sumVM12,
        ),
        CoeffRestitution * inverseTotalMass
    );

    c1.velo = newVelo1;
    c2.velo = newVelo2;
}

export function _calculateNewVelo(c1, c2, CoeffRestitution) {
    let sumVM12 = add(mul(c1.velo, c1.mass), mul(c2.velo, c2.mass));
    let inverseTotalMass = 1 / (c1.mass + c2.mass)
    let newVelo1M = magn(mul(
        add(
            mul(sub(c2.velo, c1.velo), c2.mass),
            sumVM12,
        ),
        CoeffRestitution * inverseTotalMass
    ));
    let newVelo2M = magn(mul(
        add(
            mul(sub(c1.velo, c2.velo), c1.mass),
            sumVM12,
        ),
        CoeffRestitution * inverseTotalMass
    ));

    let n = norm(sub(c1.pos, c2.pos))
    let newVelo1 = scale(sub(c1.velo, mul(n, 2 * dot(n, c1.velo))), newVelo1M);
    let newVelo2 = scale(sub(c2.velo, mul(n, 2 * dot(n, c2.velo))), newVelo2M);

    c1.velo = newVelo1;
    c2.velo = newVelo2;
}