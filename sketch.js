


function keyPressed() {
  if (key == 'g' || key == 'G') {
    if (g != 0) {
      g = 0;
    } else {
      g = GRAVITY;
    };
  }
}

var ragdoll;

function setup() {
  createCanvas(SCREENWIDTH, SCREENHEIGHT);
  ragdoll =  new Ragdoll(X_CENTER, Y_CENTER);
  textSize(12);
}


function draw() {
  background(204);
  push();
  {
    fill(0);
    text("Press G to turn gravity on or off", 10, 20);
  }
  pop();
  
  ellipse(mouseX, mouseY, MOUSE_BALL_RADIUS * 2);

  for (var i = 0; i < 2; i++) {
    ragdoll.update_once(mouseX, mouseY);
  }
  ragdoll.render();
}
