class Joint {
  constructor(radius, x, y, oldx = null, oldy = null) {
    this.x = x;
    this.y = y;
    this.oldx = oldx !== null ? oldx : x + random(-RAN_VELOCITY, RAN_VELOCITY);
    this.oldy = oldy !== null ? oldy : y + random(-RAN_VELOCITY, RAN_VELOCITY);
    this.radius = radius;
    this.mass = radius;

    this.gridIndex = -1;
    this.color = 'black'
  }

  getVelocity() {
    return {
      x: this.x - this.oldx,
      y: this.y - this.oldy
    };
  }

  distsq_from_other_joint(other) {
    var dx = other.x - this.x;
    var dy = other.y - this.y;
    return dx * dx + dy * dy;
  }



  collides_with_joint(other) {
    const dsq = this.distsq_from_other_joint(other);
    const sum_radius = this.radius + other.radius;

    return dsq < sum_radius ** 2
  }
  
  render() {
    push();
    fill(this.color);
    ellipse(this.x, this.y, this.radius * 2);
    pop();
  }
}


function distance(p1, p2) {
  var dx = p1.x - p2.x,
    dy = p1.y - p2.y;

  return Math.sqrt(dx * dx + dy * dy);
}

