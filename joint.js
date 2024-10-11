class Joint {
  constructor(radius, x, y, oldx = null, oldy = null) {
    this.x = x;
    this.y = y;
    this.oldx = oldx !== null ? oldx : x + random(-RAN_VELOCITY, RAN_VELOCITY);
    this.oldy = oldy !== null ? oldy : y + random(-RAN_VELOCITY, RAN_VELOCITY);
    this.radius = radius;
  }
}


function distance(p1, p2) {
  var dx = p1.x - p2.x,
    dy = p1.y - p2.y;

  return Math.sqrt(dx * dx + dy * dy);
}