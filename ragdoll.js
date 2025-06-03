function attach(from, to, stiffness, visibliity, constraints) {
    constraints.push({
        p0: from,
        p1: to,
        length: distance(from, to),
        stiffness: stiffness,
        visible: visibliity
    })
}

function boundary_solve(joint) {
    var vx = joint.x - joint.oldx;
    var vy = joint.y - joint.oldy;
    if (joint.x > SCREENWIDTH - joint.radius) {
        joint.x = SCREENWIDTH - joint.radius;
        joint.oldx = joint.x + vx * BOUNCEREDUCTION;
    } else if (joint.x < joint.radius) {
        joint.x = joint.radius;
        joint.oldx = joint.x + vx * BOUNCEREDUCTION;
    }
    if (joint.y > SCREENHEIGHT - joint.radius) {
        joint.y = SCREENHEIGHT - joint.radius;
        joint.oldy = joint.y + vy * BOUNCEREDUCTION;
    } else if (joint.y < joint.radius) {
        joint.y = joint.radius;
        joint.oldy = joint.y + vy * BOUNCEREDUCTION;
    }
}

function velocity_after_collision_along_1_axis(m_a, m_b, v_a1, v_b1) {
    let denom = m_a + m_b;
    let numer_a = (m_a - m_b) * v_a1 + 2 * m_b * v_b1;
    let numer_b = 2 * m_a * v_a1 + (m_b - m_a) * v_b1;

    return {
        v_a2: numer_a / denom,
        v_b2: numer_b / denom
    }
}

function collision_resolve(a, b) {
    // assuming collision has been detected
    const m_a = a.mass;
    const m_b = b.mass;

    const {x: v_ax1, y: v_ay1} = a.getVelocity();
    const {x: v_bx1, y: v_by1} = b.getVelocity();

    const {v_a2: v_ax2, v_b2: v_bx2} = velocity_after_collision_along_1_axis(m_a, m_b, v_ax1, v_bx1);
    const {v_a2: v_ay2, v_b2: v_by2} = velocity_after_collision_along_1_axis(m_a, m_b, v_ay1, v_by1);

    a.oldx = a.x - v_ax2;
    a.oldy = a.y - v_ay2;
    b.oldx = b.x - v_bx2;
    b.oldy = b.y - v_by2;
}

function mouse_ball_interaction(joint, mousex, mousey) {
    var joint_vx = joint.x - joint.oldx;
    var joint_vy = joint.y - joint.oldy;
    
    var dx = joint.x - mousex;
    var dy = joint.y - mousey;

    var distsq = dx * dx + dy * dy;
    if (distsq > (MOUSE_BALL_RADIUS + joint.radius)**2) 
        return;
    
    var dist = Math.sqrt(distsq);
    var joint_mass = joint.radius;
    var mouse_mass = MOUSE_MASS;

    var nx = dx / dist;
    var ny = dy / dist;
    var tx = -ny;
    var ty = nx;

    var dpTan = joint_vx * tx + joint_vy * ty;
    var dpnorm = joint_vx * nx + joint_vy * ny;

    var m = dpnorm * (joint_mass - mouse_mass) / (joint_mass + mouse_mass)

    joint_vx = tx * dpTan + nx * m;
    joint_vy = ty * dpTan + ny * m;

    joint.x = mousex + nx * (joint.radius + MOUSE_BALL_RADIUS);
    joint.y = mousey + ny * (joint.radius + MOUSE_BALL_RADIUS);
    joint.oldx = joint.x - joint_vx;
    joint.oldy = joint.y - joint_vy;
}


class Ragdoll {
    constructor(x, y) {
        this.head = new Joint(RAGDOLL_HEAD_RADIUS, x, y);
        this.neck = new Joint(RAGDOLL_NECK_RADIUS, x, y + 5);
        this.left_elbow = new Joint(RAGDOLL_JOINT_RADIUS, x - 15, y + 10);
        this.left_hand = new Joint(RAGDOLL_JOINT_RADIUS, x - 30, y + 10);
        this.right_elbow = new Joint(RAGDOLL_JOINT_RADIUS, x + 15, y + 10);
        this.right_hand = new Joint(RAGDOLL_JOINT_RADIUS, x + 30, y + 10);
        this.hip = new Joint(RAGDOLL_JOINT_RADIUS, x, y + 30);
        this.left_knee = new Joint(RAGDOLL_JOINT_RADIUS, x - 20, y + 45);
        this.right_knee = new Joint(RAGDOLL_JOINT_RADIUS, x + 20, y + 45);
        this.left_foot = new Joint(RAGDOLL_JOINT_RADIUS, x - 40, y + 55);
        this.right_foot = new Joint(RAGDOLL_JOINT_RADIUS, x + 40, y + 55);

        this.joints = [this.head, this.neck, this.left_elbow, this.left_hand, this.right_elbow, this.right_hand, this.hip, this.left_knee, this.left_foot, this.right_knee, this.right_foot];

        this.constraints = [];
        attach(this.head, this.neck, 1, true, this.constraints);
        attach(this.neck, this.left_elbow, 1, true, this.constraints);
        attach(this.left_elbow, this.left_hand, 1, true, this.constraints);
        attach(this.neck, this.right_elbow, 1, true, this.constraints);
        attach(this.right_elbow, this.right_hand, 1, true, this.constraints);
        attach(this.neck, this.hip, 1, true, this.constraints);
        attach(this.hip, this.left_knee, 1, true, this.constraints);
        attach(this.left_knee, this.left_foot, 1, true, this.constraints);
        attach(this.hip, this.right_knee, 1, true, this.constraints);
        attach(this.right_knee, this.right_foot, 1, true, this.constraints);

        attach(this.neck, this.left_foot, 0.02, false, this.constraints);
        attach(this.neck, this.right_foot, 0.02, false, this.constraints);
        attach(this.head, this.hip, 0.8, false, this.constraints);
    }

    update_joint(joint) {
        var velocity = joint.getVelocity();
        var vx = velocity.x * FRICTION;
        var vy = velocity.y * FRICTION;

        joint.oldx = joint.x;
        joint.oldy = joint.y;
        joint.x += vx;
        joint.y += vy;
        joint.y += g;
    }

    update_constraint(constraint) {
        var dx = constraint.p1.x - constraint.p0.x,
            dy = constraint.p1.y - constraint.p0.y,
            dist = Math.sqrt(dx * dx + dy * dy),
            diff = constraint.length - dist,
            percent = (diff / dist) / 2,
            offx = dx * percent,
            offy = dy * percent;

        constraint.p0.x -= offx * constraint.stiffness;
        constraint.p0.y -= offy * constraint.stiffness;
        constraint.p1.x += offx * constraint.stiffness;
        constraint.p1.y += offy * constraint.stiffness;
    }


    update_pos() {
        for (let joint of this.joints) {
            this.update_joint(joint);
            // mouse_ball_interaction(joint, mousex, mousey);
        }
    }

    boundary_check() {
        for (let joint of this.joints) {
            boundary_solve(joint);
        }
    }
    
    solve_constraints() {
        for (let constraint of this.constraints) {
            this.update_constraint(constraint);
        }
    }

    interact_with_mouse(mousex, mousey) {
        for (let joint of this.joints) {
            mouse_ball_interaction(joint, mousex, mousey);
        }
    }

    collision_with_others(ragdolls, grid) {
        let all_other_joints = [];
        for (const doll of ragdolls) {
            if (doll === this) continue;
            all_other_joints.push(...doll.joints);
        }
        for (let joint1 of this.joints) {
            let neighbours = grid.query(joint1)
            // let neighbours = all_other_joints;
            for (let joint2 of neighbours) {
                let collision = joint1.collides_with_joint(joint2);
                if (collision) {
                    collision_resolve(joint1, joint2);
                    // joint1.color = 'red';
                    // joint2.color = 'red';
                    // push();
                    // joint2.render();
                    // joint1.render();
                    // stroke('blue');
                    // strokeWeight(2);
                    // line(joint1.x, joint1.y, joint2.x, joint2.y)
                    // pop();
                    // noLoop();
                }

            }
        }

    }

    render(){
        push();
        {
            for (let joint of this.joints) {
                joint.render();
            }
            stroke(0);
            for (let constraint of this.constraints) {
                if (constraint.visible) {
                    line(constraint.p0.x, constraint.p0.y, constraint.p1.x, constraint.p1.y);
                }
            }
        }
        pop();
    }
}