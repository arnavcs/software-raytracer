console.log("loaded raycaster")

function clamp (val, bottom, top) {
  return Math.max(Math.min(val, top), bottom);
}

/*********************/
/* vector operations */
/*********************/

function svtimes (scalar, vector) {
  return vector.map(a => scalar * a);
}

function vnegate (vector) {
  return svtimes(-1, vector);
}

function vvplus (vector1, vector2) {
  return vector1.map((a, i) => (a + vector2[i]));
}

function vvminus (vector1, vector2) {
  return vvplus(vector1, vnegate(vector2));
}

function vvdot (vector1, vector2) {
  return vector1.map((a, i) => (a * vector2[i])).reduce((acc, val) => (acc + val), 0);
}

function vmagnitude (vector) {
  return Math.sqrt(vvdot(vector, vector))
}

function vnormalize (vector) {
  return svtimes(1/vmagnitude(vector), vector);
}

/*********************/
/* colour operations */
/*********************/

function resetAlpha (colour) {
  return [colour[0], colour[1], colour[2], 255];
}

function colourToString (colour, options) {
  let alpha = clamp(colour[3] / 255, 0, 1);
  colour = vvplus(svtimes(1 - alpha, [0, 0, 0]), svtimes(alpha, colour))
  return "rgb(" + clamp(colour[0], 0, 255) + ", " + clamp(colour[1], 0, 255) + ", " + clamp(colour[2], 0, 255) + ")";
}

function ditherAlpha (xr, yr, alpha) {
  let thresholdMat = [[ 0,  8,  2, 10],
                      [12,  4, 14,  6],
                      [ 3, 11,  1,  9],
                      [15,  7, 13,  5]].map(a => a.map(b => (b - 15 / 2) / 16));
  return (thresholdMat[yr][xr] + alpha / 255 > 0.5) ? 1 : 0;
}

function darkenBy (scale, colour) {
  colour[3] *= scale;
  return colour;
}

/******************/
/* canvas drawing */
/******************/

function putPixel (ctx, x, y, colour, options) {
  // if (options.dithering) 
  //   colour = ditherAlpha(x % 4, y % 4, colour[3]) ? resetAlpha(colour) : resetAlpha(options.zeroColour);
  ctx.fillStyle = colourToString(colour, options);
  ctx.fillRect(x, y, 1, 1);
}

/**************/
/* raytracing */
/**************/

function correspondingRay (camera, x, y, screen) {
  let xRel = x * 2 / (screen.width - 1) - 1;
  let yRel = -y * 2 / (screen.height - 1) + 1;

  return {
    initial: camera.pos,
    dir: vvplus(vvplus(camera.dir, svtimes(xRel, camera.plane[0])), 
                svtimes(yRel, camera.plane[1]))
  }
}

// returns a list of intersections with their value t
function intersections (ray, obj) {
  switch (obj.type) {
    case "sphere":
      let co = vvminus(ray.initial, obj.center);
      let a = vvdot(ray.dir, ray.dir);
      let b = 2 * vvdot(ray.dir, co);
      let c = vvdot(co, co) - (obj.radius * obj.radius);
      let discrim = b * b - 4 * a * c;
      if (discrim < 0) return [];
      if (discrim == 0) return [(-b) / (2 * a)];
      let d = Math.sqrt(discrim);
      return [(-b + d) / (2 * a), (-b - d) / (2 * a)];
    default:
      return [];
  }
}

function traceRay (ray, scene, options) {
  return scene.flatMap((obj, i) => intersections(ray, obj).map(t => [t, i]))
              .reduce((acc, curr) => (1 <= acc[0] && acc[0] < curr[0] ? acc : curr), [Infinity, -1]);
}

function renderPixel (ray, scene, options) {
  let result = traceRay(ray, scene, options);
  if (result[1] < 0) return resetAlpha(options.backgroundColour);
  return resetAlpha(scene[result[1]].colour);
}

// camera has pos: vector, dir: vector, plane: [vector, vector]
function render (scene, camera, screen, options) {
  const ctx = screen.getContext("2d");

  for (let y = 0; y < screen.height; y++) {
    for (let x = 0; x < screen.width; x++) {
      let ray = correspondingRay(camera, x, y, screen);
      let tracedColour = renderPixel(ray, scene, options);
      putPixel(ctx, x, y, tracedColour, options);
    }
  }
}

