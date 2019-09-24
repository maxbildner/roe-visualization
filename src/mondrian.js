// SOURCE: https://www.christopherlovell.co.uk/blog/2017/09/03/mondrian-generator.html
// https://www.christopherlovell.co.uk/blog/2017/09/03/mondrian-generator.html


let colors = ['red', 'blue', 'white', 'grey', 'yellow'];

// data == object
export function renderMondrian(data) {
  // Configure Settings
  const w = 500;
  const h = 360;
  const padding = 30;
  // const colour_prob = [0.15, 0.20, 0.15, 0.5];  			      // Probability of each color being chosen

  // Cumulative colour probabilities
  // let colour_cum_prob = [];
  // colour_prob.reduce(function (a, b, i) { return colour_cum_prob[i] = a + b; }, 0);

  const tol = 100;  		                                      // height/width tolerance on which to split

  // FOR TESTING*************************
  // const fractions = [0.22, 0.10, 0.60, 0.08, 0.15];		    // HARD CODED FOR TESTING (general electric)
  // FOR TESTING*************************

  // let newData = sortData(data);
  
  let fractions = Object.values(data);                        // get values of data object as an array
  fractions.pop();                                            // remove ROE from array
  // labels below are in original order from data input
  let labels = [ "leverage", "asset turnover", "operating margin", "interest burden", "tax burden" ];
  
  // Sort labels according to descending corresponding fractions
  labels = sortLabels(labels, fractions);

  // Sort fractions descending
  fractions = fractions.sort( (a, b) => b - a);
  	    
  let svg = d3.select("#mondrian")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("style", "outline: thick solid black;")
    .attr("id", "svg-container");

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
    rectangles.splice(to_remove[i], 1);
  }

  // remove Old Tooltips (if there are any)
  removeToolTips();
  
  // Sort rectangle array by area descending
  rectangles = sortRectangles(rectangles);

  colors = sortColors(labels, fractions, rectangles);

  // FOR SETTING UNIQUE ID ATTRIBUTES
  // colors = sortColors(labels, fractions, rectangles);
  // let cssLabels = labels.map( (string) => {    
  //   return string.split(" ").join("-");
  // });

  // capture fractions
  let fractionsCopy = fractions;

  // Render Rectangles
  for (let i = 0; i < rectangles.length; i++) {

    // For Random Colors:
    // let condition = Math.random()
    // let colourIndex = colour_cum_prob.findIndex(function (elem) { return elem > condition });
    

    // FROM http://bl.ocks.org/biovisualize/1016860
    // Append div element (tooltip) to body
    let tooltip = d3.select(`body`)
      .append("div")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .text(labels[i])
      .attr("class", "tooltip")
    
    // capture the label at the current iteration
    let labelText = labels[i];
    
    // Append rectangle element to svg element
    svg.append("rect")
      .attr("x", rectangles[i]['x'])
      .attr("y", rectangles[i]['y'])
      .attr("width", rectangles[i]['width'])
      .attr("height", rectangles[i]['height'])
      .attr("fill", colors[i])
      .attr("stroke-width", 6)
      .attr("stroke", "black")
      // .attr("id", cssLabels[i])
      .attr("class", "rectangle")
      // .on("mouseover", function () { return tooltip.style("visibility", "visible"); })   // OLD
      .on("mouseover", function () { 
        // Render Dynamic Title (fixed tooltip component)
        renderTitle(labelText, fractions[i]);
        return tooltip.style("visibility", "visible");
      })
      .on("mousemove", function () { return tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px"); })
      .on("mouseout", function () { 
        removeTitle();
        return tooltip.style("visibility", "hidden"); 
      });
  }

  // Render legend
  renderLegend(fractions, labels);
}




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


// Remove Tool Tips and Legend
function removeToolTips() {
  // grab all div elements with class "tooltip"
  let divs = document.getElementsByClassName("tooltip");
  // let legend = document.getElementById("legend");
  
  // if the divs exist, remove all of them
  if (divs.length > 0) {
    // legend.parentNode.removeChild(legend);

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

  // Only display two decimal points for ratios
  ratios = ratios.map( (num => {
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

  // let legendContainer = document.createElement('div');
  // legendContainer.setAttribute('id', 'legend-container');


  // https://www.w3schools.com/jsref/met_table_insertrow.asp
  // create div legend
  let table = document.createElement("TABLE");
  table.setAttribute("id", "legend");

  let row1 = table.insertRow(0);
  let row2 = table.insertRow(1);
  let row3 = table.insertRow(2);
  let row4 = table.insertRow(3);
  let row5 = table.insertRow(4);
  let row6 = table.insertRow(5);

  // labels = ["operating margin", "leverage", "tax burden", "asset turnover", "interest burden"]
  // mapped colors = ['blue', 'red', 'white', 'grey', 'yellow'];

  // Dynamically create id names that correspond to colors
  let newColors = sortColors(labels);

  // Header Row
  let row1Cell1 = row1.insertCell(0);
  let row1Cell2 = row1.insertCell(1);
  let row1Cell3 = row1.insertCell(2);
  row1Cell1.setAttribute("class", "ratio");
  row1Cell2.setAttribute("class", "percent");
  row1Cell3.setAttribute("class", "color");
  row1Cell1.innerHTML = "Ratio";
  row1Cell2.innerHTML = "%";
  row1Cell3.innerHTML = "Color";

  // Data Rows
  let row2Cell1 = row2.insertCell(0);
  let row2Cell2 = row2.insertCell(1);
  let row2Cell3 = row2.insertCell(2);
  row2Cell1.innerHTML = labels[0];
  row2Cell2.innerHTML = ratios[0] * 100;
  row2Cell3.innerHTML = `<div id="${newColors[0]}"></div>`;

  let row3Cell1 = row3.insertCell(0);
  let row3Cell2 = row3.insertCell(1);
  let row3Cell3 = row3.insertCell(2);
  row3Cell1.innerHTML = labels[1];
  row3Cell2.innerHTML = ratios[1] * 100;
  row3Cell3.innerHTML = `<div id="${newColors[1]}"></div>`;

  let row4Cell1 = row4.insertCell(0);
  let row4Cell2 = row4.insertCell(1);
  let row4Cell3 = row4.insertCell(2);
  row4Cell1.innerHTML = labels[2];
  row4Cell2.innerHTML = ratios[2] * 100;
  row4Cell3.innerHTML = `<div id="${newColors[2]}"></div>`;

  let row5Cell1 = row5.insertCell(0);
  let row5Cell2 = row5.insertCell(1);
  let row5Cell3 = row5.insertCell(2);
  row5Cell1.innerHTML = labels[3];
  row5Cell2.innerHTML = ratios[3] * 100;
  row5Cell3.innerHTML = `<div id="${newColors[3]}"></div>`;

  let row6Cell1 = row6.insertCell(0);
  let row6Cell2 = row6.insertCell(1);
  let row6Cell3 = row6.insertCell(2);
  row6Cell1.innerHTML = labels[4];
  row6Cell2.innerHTML = ratios[4] * 100;
  row6Cell3.innerHTML = `<div id="${newColors[4]}"></div>`;
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



// PERMANENTLY MAPS A COLOR TO A RESPECTIVE RATIO
function sortColors(labels) {
  // labels = ["operating margin", "leverage", "tax burden", "asset turnover", "interest burden"]
  // fractions = [0.6020601519276022, 0.22935164326030988, 0.15226223293382074, 0.10071151510740874, 0.08438554322914166]
  // original colors = ['red', 'blue', 'white', 'grey', 'yellow'];
  // mapped colors = ['blue', 'red', 'white', 'grey', 'yellow'];
  
  let colors = [];
  for (let i = 0; i < labels.length; i++) {
    let label = labels[i];
    switch (label) {
      case "operating margin":
        colors.push("blue");
        break;
      case "leverage":
        colors.push("red");
        break;
      case "tax burden":
        colors.push("white");
        break;
      case "asset turnover":
        colors.push("grey");
        break;
      case "interest burden":
        colors.push("yellow");
    }
  }

  return colors;
}





function renderTitle(label, fraction) {
  // convert label to uppercase first characters
  label = label.split(' ').map( (word) => {
    return word[0].toUpperCase() + word.slice(1);
  }).join(' ');

  // grab section 3 div (mondrian)
  // let parent = document.getElementById('mondrian');
  let parent = document.getElementById('legend');

  // round fraction to 2 dec. and format as %
  fraction = fraction.toFixed(2) * 100;
  // add % to fraction
  fraction = fraction + "%";

  let container = document.getElementById('title-container');

  // if title-container div already exists then delete it
  if (container) {
    // delete it
    parent.removeChild(container);
    createTitleContainer();
  } else {
    createTitleContainer();
  }

  function createTitleContainer() {
    // create div to append to parent
    let titleContainer = document.createElement('div');
    titleContainer.setAttribute('id', 'title-container');

    // create p element to append to title container
    let title = document.createElement('p');
    title.setAttribute('id', 'title')

    // create percentage to go underneath title (append to title container)
    let percentage = document.createElement('p');
    percentage.setAttribute('id', 'percentage');

    // give title some text
    title.innerHTML = label;

    // give percentage some text
    percentage.innerHTML = fraction;

    // append title and percentage p elements to parent (in order)
    titleContainer.appendChild(title);
    titleContainer.appendChild(percentage);

    // append div to parent
    // parent.appendChild(titleContainer);
    parent.insertBefore(titleContainer, parent.firstChild);
    
  }
}


function removeTitle(){
  // grab container div to delete
  let container = document.getElementById('title-container');

  // delete
  if (container) {
    container.parentNode.removeChild(container);
  }
}