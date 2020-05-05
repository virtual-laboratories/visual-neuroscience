function makeHeatmap(uniqueDivId,tunCurve){
	var frequencies = [100,200,400,800,1600,3200,6400,12800],
	  intensities = [10,20,30,40,50,60,70,80],
	  margin = {top: 20, right: 20, bottom: 60, left: 60},
	  width = 400 - margin.right,
	  height = 400 - margin.top - margin.bottom,
	  gridWidth = Math.floor(width / frequencies.length),
	  gridHeight = Math.floor(height / intensities.length);

	var data = [];
	for (var int = 0; int < intensities.length; int++)
	{
		for (var freq = 0; freq < frequencies.length; freq++)
		{
			data.push({
				freq: frequencies[freq],
				int: intensities[int],
				row: intensities.length - int,
				col: freq,
				response:tunCurve[int][freq]
			});
		}
	}

	var svg = d3.select(uniqueDivId).append("svg")
		.attr("viewBox","0,0,"+(width+ margin.left + margin.right)+","+(height+ margin.top + margin.bottom) )
  		.attr("preserveAspectRatio","xMidYMid meet")
	  .append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// x axes and legends
	var freqLabel = svg.selectAll(".freqLabel")
			  .data(frequencies)
			  .enter().append("text")
				.text(function(d) { return d; })
				.attr("x", function(d,i) { return (i+0.5) * gridWidth; })
				.attr("y", height+margin.top)
				.style("text-anchor", "middle");
	svg.append("text")
		.attr("text-anchor", "middle")
		.attr("x", width/2)
		.attr("y", height+margin.top+30)
		.text("Frequency(Hz)");

	// y axes and legends
	var y = d3.scale.linear()
	  .range([height-gridHeight,0])
	  .domain([d3.min(intensities), d3.max(intensities)]);
	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.tickValues(intensities);
	svg.append("g")
	  .attr("class", "y axis")
	  .attr("transform", "translate(0,"+gridHeight/2+")")
	  .call(yAxis)
	.append("text")
	  .attr("transform", "rotate(-90),translate("+-(height-gridHeight)/2+","+(-0.5*width-20)+")")
	  .attr("y", (height+margin.top)/2)
	  .style("text-anchor", "middle")
	  .text("SPL");

	svg.selectAll("rect")
		  .data(data)
		  .enter()
		.append("rect")
		  .attr("x", function(d) { return d.col * gridWidth; })
		  .attr("y", function(d) { return (d.row-1) * gridHeight; })
		  .attr("freq",function(d) { return d.freq; })
		  .attr("int",function(d) { return d.int; })
		  .attr("response",function(d) { return d.response; })
		  .attr("rx", 4)
		  .attr("ry", 4)
		  .attr("class", "sound bordered")
		  .attr("width", gridWidth)
		  .attr("height", gridHeight)
		  .attr("fill","#FFFFFF");
}
