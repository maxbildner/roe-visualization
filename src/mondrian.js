// SOURCE: https://www.christopherlovell.co.uk/blog/2017/09/03/mondrian-generator.html
// https://www.christopherlovell.co.uk/blog/2017/09/03/mondrian-generator.html



// let svg = d3.select("#mondrian")
//   .append("svg")
//   .attr("width", w)
//   .attr("height", h)
//   .attr("style", "outline: thick solid black;");

// data == object
export function renderMondrian(data) {
  // Configure Settings
  const w = 500;
  const h = 360;
  const padding = 30;
  const colours = ['red', 'blue', 'white', 'grey', 'yellow'];
  const colour_prob = [0.15, 0.20, 0.15, 0.5];  			        // Probability of each color being chosen

  // cumulative colour probabilities
  let colour_cum_prob = [];
  colour_prob.reduce(function (a, b, i) { return colour_cum_prob[i] = a + b; }, 0);

  const tol = 100;  		                                      // height/width tolerance on which to split

  // FOR TESTING*************************
  // const fractions = [0.22, 0.10, 0.60, 0.08, 0.15];		    // HARD CODED FOR TESTING (general electric)
  // FOR TESTING*************************

  let fractions = Object.values(data);                        // get values of data object as an array
  fractions.pop();                                            // remove ROE from array
  let labels = [ "leverage", "asset turnover", "operating margin", "interest burden", "tax burden" ];
  let cssLabels = [ "leverage", "asset-turnover", "operating-margin", "interest-burden", "tax-burden" ];
  // debugger
  	    
  
  let svg = d3.select("#mondrian")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("style", "outline: thick solid black;");

  // initialize array with 1 rectangle (the outermost/container)
  let rectangles = [{ "x": 0, "y": 0, "width": w, "height": h }]

  // n == 5
  let n = fractions.length;  		                                // number of initial rectangles in this loop
  let to_remove = [];  					                                // array of indices of rectangles to remove

  // loop over rectangles 
  for (let i = 0; i < n; i++) {

    // test if rectangle already small
    if (rectangles[i]['width'] > tol && rectangles[i]['height'] > tol) {
      to_remove.push(i);                                        // save for removal later

      let frac = fractions[i];
      let x = rectangles[i]['x'];
      let y = rectangles[i]['y'];
      let width, height;

      // decide whether to cut vertically or horizontally
      if (Math.random() > 0.5) {                                // if random num > .5   make VERTICAL RECT
        width = rectangles[i]['width'] * frac;
        height = rectangles[i]['height'];
        rectangles.push({
          "x": x + width,
          "y": y,
          "width": rectangles[i]['width'] - width,
          height,
          area: (rectangles[i]['width'] - width) * (height) 
        }) 
      } else {
        width = rectangles[i]['width'];
        height = rectangles[i]['height'] * frac;
        rectangles.push({
          "x": x,
          "y": y + height,
          "width": width,
          "height": rectangles[i]['height'] - height,
          area: (width) * (rectangles[i]['height'] - height)
        });
      }

      rectangles.push({
        "x": x,
        "y": y,
        "width": width,
        "height": height,
        area: width * height
      });    
    }
  }

  // Remove old rectangles (loop in reverse order to avoid messing up indexing)
  for (let i = to_remove.length - 1; i >= 0; i--) {
    // debugger
    rectangles.splice(to_remove[i], 1);
    // debugger
  }

  
  // Sort rectangle array by area descending
  rectangles = sortRectangles(rectangles);
  labels = sortLabels(labels, fractions);

  // Render Rectangles
  for (var i = 0; i < rectangles.length; i++) {

    // For Random Colors:
    // let condition = Math.random()
    // let colourIndex = colour_cum_prob.findIndex(function (elem) { return elem > condition });
    // debugger
    
    // WORKS- but no tooltip on hover
    // svg.append("rect")
    //   .attr("x", rectangles[i]['x'])
    //   .attr("y", rectangles[i]['y'])
    //   .attr("width", rectangles[i]['width'])
    //   .attr("height", rectangles[i]['height'])
    //   .attr("fill", colours[colourIndex])
    //   .attr("stroke-width", 6)
    //   .attr("stroke", "black")
    //   .attr("id", cssLabels[i])

    // FROM http://bl.ocks.org/biovisualize/1016860
    // Append div element (tooltip) to body
    let tooltip = d3.select(`body`)
      .append("div")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .text(labels[i])

    // append rectangle element to svg element
    svg.append("rect")
      .attr("x", rectangles[i]['x'])
      .attr("y", rectangles[i]['y'])
      .attr("width", rectangles[i]['width'])
      .attr("height", rectangles[i]['height'])
      // .attr("fill", colours[colourIndex])
      .attr("fill", colours[i])
      .attr("stroke-width", 6)
      .attr("stroke", "black")
      // .attr("id", cssLabels[i])
      .on("mouseover", function () { return tooltip.style("visibility", "visible"); })
      .on("mousemove", function () { return tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px"); })
      .on("mouseout", function () { return tooltip.style("visibility", "hidden"); });

      // debugger
  }

  
}


// const colours    = ['red', 'blue', 'white', 'grey', 'yellow'];
// const fractions  = [0.22, 0.10, 0.60, 0.08, 0.15];	
// const labels = ["leverage", "asset turnover", "operating margin", "interest burden", "tax burden"];

// sorts rectangle array of objects in descending order by area
function sortRectangles(rectangles) {
  return rectangles.sort(function (a, b) {
    return b.area - a.area;
  });
}



// sorts array of label strings in descending order by data
function sortLabels(labels, data) {
  // data   = [ 0.22, 0.10, 0.60, 0.08, 0.15 ];	
  // labels = [ "leverage", "asset turnover", "operating margin", "interest burden", "tax burden" ];
  
  let newLabelArr = [];

  labels.forEach( (label, i) => {
    newLabelArr.push({ ratio: label, num: data[i]})
  })
  // newLabelArr = [ {ratio: leverage, num: .22}, {ratio: "asset turnover", num: .10}, ... ]

  // Sort descending by num
  newLabelArr = newLabelArr.sort(function (a, b) {
    return b.num - a.num
  });

  // convert to array of just strings
  newLabelArr = newLabelArr.map( (obj, i) => {
    return obj.ratio;
  });

  return newLabelArr;
}

