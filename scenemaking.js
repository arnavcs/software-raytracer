console.log("loaded scenemaking")

/*********************/
/* rendering wrapper */
/*********************/

function readScene () {
  return [
    { type: "sphere", radius: 10, center: [0, -10, 30], colour: [255, 0, 0] },
    { type: "sphere", radius: 10, center: [20, 0, 40], colour: [0, 255, 0] },
    { type: "sphere", radius: 10, center: [-20, 0, 40], colour: [0, 0, 255] }
  ];
}

function readCamera () {
  return {
    pos: [0, 0, 0],
    dir: [0, 0, 1],
    plane: [[0.5, 0, 0], [0, 0.5, 0]],
  };
}

function readCanvas () {
  let screen = document.getElementById("screen");
  screen.width = Number(document.getElementById("render-width").value);
  screen.height = Number(document.getElementById("render-height").value);
  return screen;
}

function readOptions () {
  return {
    backgroundColour: [0, 0, 0]
  };
}

function renderScene () {
  render(readScene(), readCamera(), readCanvas(), readOptions());
}

/**********/
/* onload */
/**********/

window.onload = function () {
  renderScene()
}

