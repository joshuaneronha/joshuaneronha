// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 50, right: 100, bottom: 40, left: 100};

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (7*MAX_WIDTH / 12) - 10, graph_1_height = 500;
let graph_2_width = (7*MAX_WIDTH / 12) - 10, graph_2_height = 500;
let graph_3_width = (3.5*MAX_WIDTH / 12), graph_3_height = 1000;

// GRAPH 1: LINE CHART

let svg_1 = d3.select("#graph1")
    // creating object for first graph
    .append("svg")
    .attr("width", graph_1_width)
    .attr("height", graph_1_height)
    .append("g")
    .attr("transform", `translate(${margin.left+30},${margin.top})`);

d3.csv("./data/football_clean_q1.csv").then(function(data) {
    let x_ax = d3.scaleBand()
        .domain(data.map(d => d.date))
        // the domain should be the date listed in the cleaned CSV
        .range([0,graph_2_width - margin.left - margin.right])
        .padding(0.1);
    
    let y_ax = d3.scaleLinear()
        .domain([d3.min(data, function(d) {return parseInt(d.tournament)}), d3.max(data, function(d) {return parseInt(d.tournament)})])
        // now the domain should be the minimum and maximum number of games since this is displayed on the y-axis
        .range([graph_2_height - margin.top - margin.bottom,30])

    svg_1.append("linearGradient")
        // here we create a linear gradient to fill in under the line chart. I learned how to do this and used code as a reference from:
        // https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient/ which was a super helpful resource!
        .attr('id', 'line_grad')
        .attr("x1","0%")
        .attr("y1","100%")
        .attr("x2","0%")
        .attr("y2","0%")
        // above specifies the direction of the gradient (bottom to top)
        .selectAll("stop")
            // then we define stops based on each color. I chose colors from the YlGnBu color scale I used in all other graphs
            // to keep the color scheme consistent with 9 steps from https://loading.io/color/feature/YlGnBu-9/, which gave color codes for each step
            .data([
                {loc: "0%", color: "#ffffd9"},
                {loc: "12.5%", color: "#edf8b1"},
                {loc: "25%", color: "#c7e9b4"},
                {loc: "37.5%", color: "#7fcdbb"},
                {loc: "50%", color: "#41b6c4"},
                {loc: "62.5%", color: "#1d91c0"},
                {loc: "75%", color: "#225ea8"},
                {loc: "87.5%", color: "#253494"},
                {loc: "100%", color: "#081d58"}
            ])
        .enter().append("stop")
            // we then append these stops to the gradient. The offset attribute determines how far along the gradient
            // a color should be applied, whereas the stop-color attribute indicates the color at a given spot.
            // we retrieve these functions using a lambda function from the data array we created above!
            .attr("offset", function(d) {return d.loc; })
            .attr("stop-color", function(d) {return d.color; })


    svg_1.append("g")
        // appending a y-axis to the left of our chart!
        .call(d3.axisLeft(y_ax));
    
    svg_1.append("g")
        // creates x-axis and moves it down to the bottom using the years we are interested in, which we specify.
        .attr("transform", `translate(0,${graph_1_height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x_ax).tickValues([1872,1884,1896,1908,1920,1932,1944,1956,1968,1980,1992,2004,2016]));

    svg_1.append("path")
        // now, using our data from the CSV, we draw a path based on the x and the y, where the x-coord comes from
        // d.date and is on the x-axis and d.tournament is the y-coord and references the y-axis. We fill with the
        // pre-determined gradient and apply a stroke. Note was parseInt because our csv has strings.
        // I learned how to make a line graph using https://www.d3-graph-gallery.com/graph/line_basic.html, which
        // I referenced when producing the path tiself in particular!
        .datum(data)
        .style("stroke","black")
        .attr("stroke-width",0.5)
        .attr("fill","url(#line_grad)")
        .attr("d", d3.line()
            .x(function(d) { return x_ax(parseInt(d.date))})
            .y(function(d) { return y_ax(parseInt(d.tournament))}))

    svg_1.append("text")
            .attr("x", (graph_1_width/6.8))
            .attr("y", -10)
            //centering and placing an appropriate title
            .style("text-anchor", "center")
            .style("font-size", 25)
            .text("Number of World Cup Games Per Year")

    svg_1.append("text")
        .attr("transform", `translate(${(graph_2_width - margin.left - margin.right)/2}, ${graph_2_height - 50})`)
        // placing x-axis label at the bottom of the graph
        .style("text-anchor", "middle")
        .text("Year");

    svg_1.append("text")
        .attr("transform", `translate(${-60}, ${(graph_2_height - margin.top - margin.bottom)/2})`)
        .style("text-anchor", "middle")
        .text("Games");
        // and similarly placing a y-axis label at the left of the graph


    }); 

// GRAPH 2: CHLOROPLETH MAP

let svg_2 = d3.select("#graph2")
    // creating SVG_2 object for the second graph
    .append("svg")
    .attr("width", graph_2_width)
    .attr("height", graph_2_height)
    .append("g").
    attr("transform", `translate(${margin.left-100},${margin.top})`);

let tooltip = d3.select("#graph2")
    // creating the tooltip object based on the lab template
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0) // no tooltip originally, so opacity zero
    .style("border", "solid") // we attach a solid border with an 8px radius and 1.5px width
    .style("border-radius", "8px")
    .style("border-width", "1.5px")

let title = svg_2.append("text")
    //creating a blank title object -- blank for now because it shows how many countries are displayed!
    .attr("x", (graph_2_width/3.1))
    .attr("y", -10)
    .style("text-anchor", "center")
    .style("font-size", 25)
    
let legend_upper = svg_2.append("text")
    // this label will be for our legend
    .attr("x", (margin.left + 35))
    .attr("y", 260)
    .style("text-anchor", "center")
    .style("font-size", 15)

let legend_lower = svg_2.append("text")
    // this label will be for our legend
    .attr("x", (margin.left + 35))
    .attr("y", 445)
    .style("text-anchor", "center")
    .style("font-size", 15)

let leg_disc = svg_2.append("text")
    // this label will be for our legend
    .attr("x", (margin.left + 35))
    .attr("y", 340)
    .style("text-anchor", "center")
    .style("font-size", 15)
    .text("Win")

let leg_disc_2 = svg_2.append("text")
    // this label will be for our legend ( really just a follow up to the last one so we can have it on two lines)
    .attr("x", (margin.left + 35))
    .attr("y", 360)
    .style("text-anchor", "center")
    .style("font-size", 15)
    .text("Percentage")

let lower_disc = svg_2.append("text")
    // a final text object serving as a disclaimer
    .attr("x", (margin.left + (graph_1_width/2)-50))
    .attr("y", 448)
    .style("text-anchor", "center")
    .style("font-size", 10)
    .text("Note: some small countries may  not be visible.")
    

function setMap(val) {
    // returns a value based on the number of countries indicated on the slider.

    d3.csv("./data/football_clean_q2.csv").then(function(data) {
        // imports the CSV and uses the resulting data
    
        var map_q2 = d3.map()
        // creates a new map object in D3
    
        var map_proj = d3.geoMercator().scale(110).center([-15,20]).translate([(graph_1_width / 2), graph_1_height / 1.7]);
        // also creates a projection using the Mercator scale, scaled so we can see the whole world and centering / translating it
        // so that it appears in the middle of the screen. I utilized the following website as guidance for building a map:
        // https://www.d3-graph-gallery.com/graph/choropleth_basic.html which I used as a reference for my code

        data = cleanData(data, compare, val);
        // using the cleanData function I wrote in lab, we return only as many rows in the data as we select in val
        // so we can dynamically adjust the number of countries shown on the map

        // creates a new array filled with two objects: a json file containing all of the world's boundaries, and mapping
        // using the d3.map.set function, which is specifically for creating maps. The first value, the country code, is
        // the "id", which will correspond to the country code in the JSON file. The second value in the set function, the
        // win percentage, is the "key", which is the actual value we want to show on the map. This again I learned from
        // d3-graph-gallery in addition to https://www.geeksforgeeks.org/d3-js-d3-map-set-function/
        var dataset = [
            d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
            d3.map(data, function (d) {map_q2.set(d.country_code, +parseFloat(d.win_percent))})
        ]

        var color = d3.scaleSequential(d3.interpolateYlGnBu).domain([d3.min(data, function(d) {return parseInt(d.win_percent)}), d3.max(data, function(d) {return parseInt(d.win_percent)})])
        // we create a sequential YlGnBu color scale (a lovely yellow->green->blue gradient) using the lovely scaleSequential library!
        // which will allow us to create a chloropleth map using this gradient. The domain of this scale is the minimum win_percent to the max win_percent from the CSV.

        Promise.all(dataset).then(execute)
        // this is sort of a weird function that came in in d3.v5 and I as a result had to modify into the d3-graph-gallery example, which was built
        // in d3.v4. It basically ensures that the whole dataset has loaded in before executing the rest of the code in order to ensure we don't
        // attempt to build the map without all the data! I learned this from https://bl.ocks.org/adamjanes/6cf85a4fd79e122695ebde7d41fe327f

        svg_2.append("linearGradient")
        // this is building the exact same linear gradient I did in the first graph
        .attr('id', 'line_grad')
        .attr("x1","0%")
        .attr("y1","100%")
        .attr("x2","0%")
        .attr("y2","0%")
        .selectAll("stop")
            .data([
                {loc: "0%", color: "#ffffd9"},
                {loc: "12.5%", color: "#edf8b1"},
                {loc: "25%", color: "#c7e9b4"},
                {loc: "37.5%", color: "#7fcdbb"},
                {loc: "50%", color: "#41b6c4"},
                {loc: "62.5%", color: "#1d91c0"},
                {loc: "75%", color: "#225ea8"},
                {loc: "87.5%", color: "#253494"},
                {loc: "100%", color: "#081d58"}
            ])
        .enter().append("stop")
            .attr("offset", function(d) {return d.loc; })
            .attr("stop-color", function(d) {return d.color; })

        svg_2.append("rect")
            // this object creates a rectangle that will serve as our legend!
            .attr("width",25)
            .attr("height",200)
            .attr("fill","url(#line_grad)")
            .attr("transform", `translate(${margin.left},${250})`);

        let mouseover = function(d) {
            // defines a function for what happens when we mouse-over a country (the tooltop!)
            let html = `<strong style="color: #cf6700;">${d.id}</strong><br><p style="color: #cf6700;">${d.wins}% wins</p>`;  

            opac = 0
            // sets default opacity of the tooltop to be zero
            
            if (d.wins === undefined) {
                // if we DO NOT have the win percentage for a certain country defined in our dataset, we don't show the tooltip
                opac = 0
            } else {
                // but if it is defined, then we make the tooltop visible!
                opac = 0.9
            }

            tooltip.html(html)
                // using the HTML code we set, we move the tooltip below and left the cursor
                .style("left", `${(d3.event.pageX) - 20}px`)
                .style("top", `${(d3.event.pageY) - 45}px`)
                .transition()
                .duration(1)
                // very brief transition to avoid showing empty tooltips
                .style("opacity", opac)
                // the opacity is determined by whether the tooltip should appear or not
                .style("background", color(d.wins))
                // and the background is determined by whatever color the country is for scale comparison!
        };

        let mouseout = function(d) {
            // this defines what happens when we move away
            tooltip.transition()
                .duration(1)
                // again, extremely quick transition so we don't see undefined tooltip. sets opacity back to zero
                .style("opacity", 0)

        };


        // once the Promise function has been completed and data is loaded, we call the below function using the loaded data
        // which actually draws the map
        function execute([input]) {
            svg_2.append("g")
            .attr("class","countries")
            // sets default country color to be gray
            .selectAll("path")
            // we first draw the actual country paths using the geojson file using the "features" datapoint in the json file
            .data(input.features)
            .enter().append("path") // which we then append as a path (i.e. the borders themselves)
            .attr("d", d3.geoPath().projection(map_proj)) // and draw using the given map projection (for a given border, we can
            // draw it many different ways depending on how we project it)
            .attr("fill", function (d) {
                // we then fill this in by retrieving the value (win percent) for a given id (the country!).
                // we save as a variable to refernece elsewhere
                d.wins = map_q2.get(d.id)

                // then return color for it
                return color(d.wins);
            
                
            })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);
            // and whenever we exectute the function, in additon to showing colors, we alos need to call the tooltip functions for
            // both when the mouse enters and exits a given country
        }

        title.text("Top"+" "+val+" "+"Most Winning Countries")
        legend_lower.text((d3.min(data, function(d) {return parseFloat(d.win_percent)})+"%"))
        legend_upper.text((d3.max(data, function(d) {return parseFloat(d.win_percent)})+"%"))
        // sets text fields with correct parameters
        
    });

}

// GRAPH 3: HEAT MAP

let svg_3 = d3.select("#graph3")
    // again creates SVG object
    .append("svg")
    .attr("width", graph_3_width + 100)
    .attr("height", graph_3_height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

svg_3.append("text")
    // creates title text
    .attr("x", 40)
    .attr("y", -10)
    .style("text-anchor", "center")
    .style("font-size", 25)
    .text("Strongest World Cup Teams")

let tooltip_3 = d3.select("#graph3")
    // creates tooltip object using exact same specifications as graph 2
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("border", "solid")
    .style("border-radius", "8px")
    .style("border-width", "1.5px")

// defines the categories we will show on axis
categories = ['Total Score','Win Percent','Win Margin','Total Games','Opponent Win Pct']

// calls in the CSV then executes function using that data
d3.csv("./data/ques_3_total.csv").then(function(data) {

    let y = d3.scaleBand()
        // we use a band scale given that we have qualitative data, where the domain is each home team!
        .domain(data.map(function(d) {return d.home_team}))
        .range([margin.top, graph_3_height - margin.top - margin.bottom])
        .padding(0); // pretty big space so no padding needed

    let x = d3.scaleBand()
        // more qualitative data so another band scale, where now our data is the five categories we defined before
        // spanning the width
        .domain(categories)
        .range([0, graph_3_width])
        .padding(0)

    // we define five separate color scales, one for each category (hard-coded since so many columns)
    // we do this because we want to compare each category separately. same strategy as before!
    var color_total = d3.scaleSequential(d3.interpolateYlGnBu).domain([0.67,0.77])
    var color_win_percent = d3.scaleSequential(d3.interpolateYlGnBu).domain([0.45,0.8])
    var color_margin = d3.scaleSequential(d3.interpolateYlGnBu).domain([0.63,1])
    var color_total_games = d3.scaleSequential(d3.interpolateYlGnBu).domain([0.48,1])
    var color_opp_str = d3.scaleSequential(d3.interpolateYlGnBu).domain([0.62,0.73])




    svg_3.append("g")
        // now we add left axis with proper padding / transofmr
        .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
        .attr("transform", `translate(0,${-3.5})`);

    svg_3.append("g")
        // and top axis so it appears above everything!
        .call(d3.axisTop(x).tickSize(0).tickPadding(10))
        .attr("transform", `translate(0,${margin.top})`);

    let mouseover_3 = function(d) {
        // basically same mouseover code as before (also adapted from lab)

        // we set HTML for tooltip based on the column cause we want a percent sign in some and not in others
        if ((d.variable == 'Win Percent') || (d.variable == 'Opponent Win Pct')) {
            html = `<strong style="color: #000000;">${d.home_team}</strong><br><p style="color: #000000;">${d.variable}: ${d.raw}%</p>`; 
        } else {
            html = `<strong style="color: #000000;">${d.home_team}</strong><br><p style="color: #000000;">${d.variable}: ${d.raw}</p>`; 
        }

        // then we actually define the tooltip using the object from before
        tooltip_3.html(html)
            // placing it below cursor position
            .style("left", `${(d3.event.pageX) - graph_1_width - 100}px`)
            .style("top", `${(d3.event.pageY) - 75}px`)
            .transition()
            .duration(10)
            // with a rapid transition to ensure quickly seeing each one smoothly as we move around
            .style("opacity", 0.8)
            // moderate opacity with white background
            .style("background", "ffffff")
    };

    let mouseout_3 = function(d) {
        // when we move away, make the opacity zero very quickly
        tooltip_3.transition()
            .duration(10)
            .style("opacity", 0)

    };

    svg_3.selectAll()
        // now we actually plot the rectangles using the axes! I referenced this page for code / strategy
        // https://www.d3-graph-gallery.com/graph/heatmap_basic.html which was extremely helpful!
        .data(data)
        .enter().append("rect")
        // using select all, we append a rectangle for every single data point
        .attr("x", function(d) {return x(d.variable)})
        .attr("y", function(d) {return y(d.home_team)})
        // we place it at the x and y coordinate based on the category and team which is defined in the scaleBand axes
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        // with a width/height defined by the width of the axes using the very helpful function bandwidth
        .style("fill", function(d) {
            // we fill the rectangle with a color based on the color scale for that specific variable!
            // remember we created five before. so we check the variable and return approp. color scale.
            if (d.variable == "Win Percent") {return color_win_percent(d.value)} 
            else if (d.variable == "Total Score") {return color_total(d.value)}
            else if (d.variable == "Win Margin") {return color_margin(d.value)}
            else if (d.variable == "Total Games") {return color_total_games(d.value)}
            else if (d.variable == "Opponent Win Pct") {return color_opp_str(d.value)}

        })
        // and as before we call mouseover/mouseout functions when mouse enters/exits a square
        .on("mouseover", mouseover_3)
        .on("mouseout", mouseout_3);

    svg_3.append("line")
        // we also create a vertical line at one bandwidth (i.e. after the first column) to separate the total column
        .attr("x1",x.bandwidth())
        .attr("y1",margin.top-2)
        .attr("x2",x.bandwidth())
        .attr("y2",920)
        .style("stroke","white")
        .style("stroke-width",8)
        // make it white to blend in with background

})


function compare(a, b) {
    // this is just the compare function to check which values are highest from the lab
    a = parseInt(a.win_percent)
    b = parseInt(b.win_percent)
    return b - a
 }

 function cleanData(data, comparator, numExamples) {
     // using the compare function, only returns a certain number of values (copied from my lab)
    sliced_data = data.sort(comparator).slice(0,numExamples)
    
    return sliced_data   
    }


// we want to show ten countries of data by default! so the function initially calls setMap for 10 countries.
// moving the slider calls setMap with a different number.
setMap(10)


