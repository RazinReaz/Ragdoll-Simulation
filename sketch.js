




let ragdolls = [];
let grid;
let g = GRAVITY;
let ragdoll_collision = false;

function keyPressed() {
  if (key == 'g' || key == 'G') {
    if (g != 0) {
      g = 0;
    } else {
      g = GRAVITY;
    };
  }

  if (key == 'c' || key == 'C') {
    ragdoll_collision = !ragdoll_collision;
  }
}

function setup() {
  createCanvas(SCREENWIDTH, SCREENHEIGHT);
  for (let i = 0; i < NUM_RAGDOLLS; i++) {
    ragdolls.push(new Ragdoll(width/2 + random(-200, 200), height/2 + random(-200, 200)));
  }
  grid = new Grid(GRID_SIZE, width, height, NUM_RAGDOLLS); 
}

function instructions() {
  push();
  {
    textSize(15);
    fill(0);
    text(`Press G to toggle gravity: currently ${g ? 'on' : 'off'}`, 10, 20);
    text(`Press C to toggle ragdoll collision with each other: currently ${ragdoll_collision ? 'on' : 'off'}`, 10, 40);
  }
  pop();
}


function draw() {
  background(204);
  instructions();
  ellipse(mouseX, mouseY, MOUSE_BALL_RADIUS * 2);
  for (let ragdoll of ragdolls) {
    
    ragdoll.render();
    for (var i = 0; i < SOLVER_ITERATIONS; i++) {
      // update the grid for collision lookup
      // for (let joint of ragdoll.joints) {
      //   grid.remove(joint);
      //   grid.add(joint);
      // }
      //! the order might matter here
      ragdoll.update_pos();
      if (ragdoll_collision)
        ragdoll.collision_with_others(ragdolls, grid);

      ragdoll.boundary_check();
      ragdoll.solve_constraints();
      ragdoll.interact_with_mouse(mouseX, mouseY);
    }
  }
}
