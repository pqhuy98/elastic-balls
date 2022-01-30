const EPS = 1e-7;

/**
 * Check if body1 and body will ever collide.
 * @returns earliest time when collision happens, or null if thre will be no collision
 */
export function willCollide(body1, body2) {
    let R = body1.r + body2.r;
    let x = body1.pos.x;
    let y = body1.pos.y;
    let dx = body1.velo.x;
    let dy = body1.velo.y;
    let u = body2.pos.x;
    let v = body2.pos.y;
    let du = body2.velo.x;
    let dv = body2.velo.y;
    let a = (dx - du) * (dx - du) + (dy - dv) * (dy - dv); // a is always non-negative
    let b = 2 * ((dx - du) * (x - u) + (dy - dv) * (y - v));
    let c = (x - u) * (x - u) + (y - v) * (y - v) - R * R;

    if (a < EPS) { // a == 0
        // this is a linear inequality b*t + c <= 0
        if (b > 0) {
            // t <= c/b
            return 0; // two bodies already collide
        } else if (b < 0) {
            // t >= c/b
            return c / b; // they will collide when t = c/b
        } else { // b == 0
            // solve inequality 0*t + c <= 0
            if (c < 0) {
                return 0; // two bodies already collide at t = 0
            } else {
                return null; // they will not collide
            }
        }
    } else {
        // this is a quadratic inequality a*t^2 + b*t + c <= 0
        let discriminant = b * b - 4 * a * c;
        if (Math.abs(discriminant) < EPS) { // discriminant == 0
            let sol = -b / 2 / a;
            if (sol < -EPS) {
                // they collided in the past, and will not in the future
                return null;
            } else {
                // found exactly one solution
                return sol;
            }
        } else if (discriminant > 0) {
            let sqrtD = Math.sqrt(discriminant);
            let sol1 = (-b - sqrtD) / 2 / a;
            let sol2 = (-b + sqrtD) / 2 / a;
            if (sol2 < 0) {
                return null; // no solution
            } else {
                // sol1 < 0 --> 0
                // 0 < sol1 --> sol1
                return Math.max(0, sol1);
            }
        } else { // discriminant < 0
            return null; // no solution
        }
    }
}