function attach(from, to, stiffness, visibliity, constraints) {
    constraints.push({
        p0: from,
        p1: to,
        length: distance(from, to),
        stiffness: stiffness,
        visible: visibliity
    })
}

function boundary_solve(p, vx, vy) {
    if (p.x > SCREENWIDTH) {
        p.x = SCREENWIDTH
        p.oldx = p.x + vx * BOUNCEREDUCTION;
    } else if (p.x < 0) {
        p.x = 0;
        p.oldx = p.x + vx * BOUNCEREDUCTION;
    }
    if (p.y > SCREENHEIGHT) {
        p.y = SCREENHEIGHT;
        p.oldy = p.y + vy * BOUNCEREDUCTION;
    } else if (p.y < 0) {
        p.y = 0;
        p.oldy = p.y + vy * BOUNCEREDUCTION;
    }
}

function mouse_ball_interaction(joint, mousex, mousey) {
    
    var joint_vx = joint.x - joint.oldx;
    var joint_vy = joint.y - joint.oldy;
    
    var dx = joint.x - mousex;
    var dy = joint.y - mousey;

    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < MOUSE_BALL_RADIUS + joint.radius) {
        var joint_mass = joint.radius
        var mouse_mass = MOUSE_BALL_RADIUS

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

}


class Ragdoll {
    
    constructor(x, y) {
        this.head = new Joint(20, x, y, );
        this.neck = new Joint(3, x, y + 10);
        this.left_elbow = new Joint(3, x - 20, y + 20);
        this.left_hand = new Joint(3, x - 40, y + 20);
        this.right_elbow = new Joint(3, x + 20, y + 20);
        this.right_hand = new Joint(3, x + 40, y + 20);
        this.hip = new Joint(3, x, y + 60);
        this.left_knee = new Joint(3, x - 40, y + 90);
        this.left_foot = new Joint(3, x - 80, y + 110);
        this.right_knee = new Joint(3, x + 40, y + 90);
        this.right_foot = new Joint(3, x + 80, y + 110);

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
        var vx = (joint.x - joint.oldx) * FRICTION;
        var vy = (joint.y - joint.oldy) * FRICTION;

        joint.oldx = joint.x;
        joint.oldy = joint.y;
        joint.x += vx;
        joint.y += vy;
        joint.y += g;

        boundary_solve(joint, vx, vy);
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


    update_once(mousex, mousey) {
        for (let joint of this.joints) {
            this.update_joint(joint);
            mouse_ball_interaction(joint, mousex, mousey);
        }
        for (let constraint of this.constraints) {
            this.update_constraint(constraint);
        }
    }

    render(){
        stroke(0);
        // limbs
        for (var i = 0; i < this.constraints.length; i++) {
          var c = this.constraints[i];
          if (c.visible == true)
            line(c.p0.x, c.p0.y, c.p1.x, c.p1.y);
        }

        // joints
        fill(0);
        for (var i = 0; i < this.joints.length; i++) {
          var j = this.joints[i];
          ellipse(j.x, j.y, j.radius, j.radius);
        }
    }
}