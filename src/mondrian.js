// SOURCE: https://www.christopherlovell.co.uk/blog/2017/09/03/mondrian-generator.html
// https://www.christopherlovell.co.uk/blog/2017/09/03/mondrian-generator.html

// Configure Settings
const w = 500;
const h = 360;
const padding = 30;
const colours = ['red', 'blue', 'yellow', 'white'];
const colour_prob = [0.15, 0.20, 0.15, 0.5];  			      // Probability of each color being chosen

// cumulative colour probabilities
let colour_cum_prob = [];
colour_prob.reduce(function (a, b, i) { return colour_cum_prob[i] = a + b; }, 0);

const tol = 100;  		                                    // height/width tolerance on which to split

// FOR TESTING
const fractions = [ 0.60, 0.23, 0.15, 0.10, 0.08 ];		    // HARD CODED FOR TESTING

let svg = d3.select("#mondrian")
  .append("svg")
  .attr("width", w)
  .attr("height", h)
  .attr("style", "outline: thick solid black;");


function renderMondrian() {
  // initialize array with 1 rectangle (the outermost/container)
  let rectangles = [{ "x": 0, "y": 0, "width": w, "height": h }]

  n = fractions.length;  		                              // number of initial rectangles in this loop
  to_remove = [];  					                              // array of indices of rectangles to remove

  // loop over rectangles 
  for (let i = 0; i < n; i++) {

    // test if rectangle already small
    if (rectangles[i]['width'] > tol && rectangles[i]['height'] > tol) {
      to_remove.push(i);                                  // save for removal later

      let frac = fractions[i];
      let x = rectangles[i]['x'];
      let y = rectangles[i]['y'];
      let width, height;

      // decide whether to cut vertically or horizontally
      if (Math.random() > 0.5) {
        width = rectangles[i]['width'] * frac;
        height = rectangles[i]['height'];
        rectangles.push({ "x": x + width, "y": y, "width": rectangles[i]['width'] - width, height });
      }
      else {
        width = rectangles[i]['width'];
        height = rectangles[i]['height'] * frac;
        rectangles.push({ "x": x, "y": y + height, "width": width, "height": rectangles[i]['height'] - height });
      }

      rectangles.push({ "x": x, "y": y, "width": width, "height": height });
    }
  }

  // Remove old rectangles (loop in reverse order to avoid messing up indexing)
  for (i = to_remove.length - 1; i >= 0; i--) {
    // debugger
    rectangles.splice(to_remove[i], 1);
    // debugger
  }

  // Render Rectangles
  for (let i = 0; i < rectangles.length; i++) {

    let condition = Math.random()
    colourIndex = colour_cum_prob.findIndex(function (elem) { return elem > condition });

    svg.append("rect")
      .attr("x", rectangles[i]['x'])
      .attr("y", rectangles[i]['y'])
      .attr("width", rectangles[i]['width'])
      .attr("height", rectangles[i]['height'])
      .attr("fill", colours[colourIndex])
      .attr("stroke-width", 6)
      .attr("stroke", "black");
  }
}

renderMondrian();



