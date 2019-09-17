// SOURCE: https://www.christopherlovell.co.uk/blog/2017/09/03/mondrian-generator.html
// https://www.christopherlovell.co.uk/blog/2017/09/03/mondrian-generator.html


const COLORS = ['red', 'blue', 'white', 'grey', 'yellow'];

// data == object
export function renderMondrian(data) {
  // Configure Settings
  const w = 500;
  const h = 360;
  const padding = 30;
  // const colour_prob = [0.15, 0.20, 0.15, 0.5];  			        // Probability of each color being chosen

  // Cumulative colour probabilities
  // let colour_cum_prob = [];
  // colour_prob.reduce(function (a, b, i) { return colour_cum_prob[i] = a + b; }, 0);

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

  // Initialize array with 1 rectangle (the outermost/container)
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

  // remove Old Tooltips (if there are any)
  removeToolTips();
  
  // Sort rectangle array by area descending
  rectangles = sortRectangles(rectangles);
  labels = sortLabels(labels, fractions);

  // Render Rectangles
  for (var i = 0; i < rectangles.length; i++) {

    // For Random Colors:
    // let condition = Math.random()
    // let colourIndex = colour_cum_prob.findIndex(function (elem) { return elem > condition });
    // debugger
    

    // FROM http://bl.ocks.org/biovisualize/1016860
    // Append div element (tooltip) to body
    let tooltip = d3.select(`body`)
      .append("div")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .text(labels[i])
      .attr("class", "tooltip")

    // Append rectangle element to svg element
    svg.append("rect")
      .attr("x", rectangles[i]['x'])
      .attr("y", rectangles[i]['y'])
      .attr("width", rectangles[i]['width'])
      .attr("height", rectangles[i]['height'])
      .attr("fill", COLORS[i])
      .attr("stroke-width", 6)
      .attr("stroke", "black")
      // .attr("id", cssLabels[i])
      .on("mouseover", function () { return tooltip.style("visibility", "visible"); })
      .on("mousemove", function () { return tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px"); })
      .on("mouseout", function () { return tooltip.style("visibility", "hidden"); });

      // debugger
  }

  // Render legend
  renderLegend(fractions, labels);
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



// Sorts array of label strings in descending order by data
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



function removeToolTips() {
  // grab all div elements with class "tooltip"
  let divs = document.getElementsByClassName("tooltip");

  // if the divs exist, remove all of them
  if (divs) {
    while (divs.length > 0) {
      divs[0].parentNode.removeChild(divs[0]);
    }
  } 
}



// Render legend div
function renderLegend(ratios, labels) {
  // ex. labels = ["operating margin", "leverage", "tax burden", "asset turnover", "interest burden"]
  // ex. rectangles = [
  //   { x: 153.48240344129945, y: 30.378795562490996, width: 346.5175965587006, height: 329.621204437509, area: 114219.5475364697 },
  //   { x: 0, y: 0, width: 69.04174259307369, height: 360, area: 24855.02733350653 },
  //   { x: 69.04174259307369, y: 0, width: 45.63407903708125, height: 360, area: 16428.26845334925 },
  //   { x: 114.67582163015494, y: 0, width: 38.80658181114451, height: 360, area: 13970.369452012024 },
  //   { x: 153.48240344129945, y: 0, width: 346.5175965587006, height: 30.378795562490996, area: 10526.787224662497 },
  // ]

  // Sort ratios descending, and only display two decimal points
  ratios = ratios.sort( (a, b) => b - a).map( (num => {
    return num.toFixed(2);
  }))

  // grab div in section 3 of body (id=mondrian)
  let container = document.getElementById("mondrian");
  // <div id="section-3">
  //   <div id="mondrian">
  //     <svg></svg>
  //    INSERT HERE
  //   </div>
  // </div>

  // https://www.w3schools.com/jsref/met_table_insertrow.asp
  // create div legend
  let table = document.createElement("TABLE");
  let row1 = table.insertRow(0);
  let row2 = table.insertRow(1);

  let cell1 = row1.insertCell(0);
  let cell2 = row1.insertCell(1);
  cell1.innerHTML = "Ratio";
  cell2.innerHTML = "%";

  let cell3 = row2.insertCell(0);
  let cell4 = row2.insertCell(1);
  cell3.innerHTML = labels[0];
  cell4.innerHTML = ratios[0];

  // <table>
  //   <tr>
  //     <th>Ratio</th>
  //     <th>%</th>
  //     <th>Color</th>
  //   </tr>
  //   <tr>
  //     <td>Operating Margin</td>
  //     <td>.20</td>
  //     <td>Red</td>
  //   </tr>
  //   <tr>
  //     <td>Leverage</td>
  //     <td>.20</td>
  //     <td>Red</td>
  //   </tr>
  //   <tr>
  //     <td>Asset Turnover</td>
  //     <td>.20</td>
  //     <td>Red</td>
  //   </tr>
  //   <tr>
  //     <td>Interest Burden</td>
  //     <td>.20</td>
  //     <td>Red</td>
  //   </tr>
  //   <tr>
  //     <td>Tax Burden</td>
  //     <td>.20</td>
  //     <td>Red</td>
  //   </tr>
  // </table>


  // Append div legend to mondrian div
  container.appendChild(table);
  // debugger
}