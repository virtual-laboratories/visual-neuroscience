function SpikeVisualization(divSizes,maxTime){
	this.visSizes = divSizes;
	this.maxTime = maxTime;
	this.finished = true;
	this.rasterScales = {};
	// Make Oscilloscope for visualization
	this.makeOscilloscope = function(uniqueDivId){
		this.div = uniqueDivId;
		var width = this.visSizes.width,
		height = this.visSizes.height;
		x = d3.scale.linear().domain([0, this.maxTime]).range([0, width]);
		y = d3.scale.linear().domain([-10, 10]).range([height, 0]);
		this.scale = {x: x, y: y};
		var widthPerc = 100;
		var svg = d3.select(uniqueDivId)
		.style("display","inline-block")
		.style("background-color","black")
		.style("border-radius","8px")
		.style("border","8px inset #ccc")
		.style("position","relative")
		.style("width",widthPerc+"%")
		.style("padding-bottom",widthPerc*height/width+"%")
		.style("vertical-align","top")
		.style("overflow","hidden")
		//.style("margin","0 "+(100-widthPerc)/2+"%")
		.classed("svg-container", true)
		.append("svg")
		.style("display","inline-block")
		.style("position","absolute")
		.style("top","0px")
		.style("left","0px")
		.attr("viewBox","0,0,"+width+","+height)
		.attr("preserveAspectRatio","xMidYMid meet");

		// GRID LINES every 100 ms
		xTicks = function(){var ticks=[];for(var i=0;i<=maxTime/100;i++){ticks.push(i*100);}return ticks;};
		var xAxis = d3.svg.axis().scale(x).orient("bottom").tickValues(xTicks).tickSize(-height, 0, 0).tickFormat(""),
		yAxis = d3.svg.axis().scale(y).orient("left").tickValues([-8,-4,0,4,8]).tickSize(-width, 0, 0).tickFormat("");
		svg.append("g")
		.attr("class", "grid")
		.attr("transform", "translate(0," + height + ")")
		.attr("opacity", 0.6)
		.call(xAxis);
		svg.append("g")
		.attr("class", "grid")
		.attr("opacity", 0.6)
		.call(yAxis);
		svg.selectAll('.grid path')
		.attr('stroke-width',0);
		svg.selectAll('.grid .tick')
		.attr('stroke','#7f7f7f');
		//return scale;
	};
	this.spatialPlots = function(electrodeLoc){
		var topMargins = 10;
		var width = paperProps.width;
		var height = paperProps.height+topMargins*2;

		var stimulusSVG = d3.select("."+electrodeLoc+" .spatialPlot")
		.style("display","inline-block")
		.style("position","relative")
		.style("width","100%")
		.style("padding-bottom",100*height/width+"%")
		.style("vertical-align","top")
		.style("overflow","hidden")
		.classed("svg-container", true)
		.append("svg")
		.style("display","inline-block")
		.style("position","absolute")
		.style("top","0px")
		.style("left","0px")
		.attr("viewBox","0,0,"+width+","+height)
		.attr("preserveAspectRatio","xMidYMid meet");

		var paper = stimulusSVG.append("g")
		.attr("class","paper")
		.attr("transform", "translate(0,"+topMargins+")");

		paper.append("rect")
		.attr("fill","white")
		.attr("stroke","black")
		.attr("x",0)
		.attr("y",0)
		.attr("width",paperProps.width)
		.attr("height",paperProps.height);

		/*var brailleGrid = paper.selectAll(".brailleDot")
		.data(braillePos)
		.enter().append("ellipse")
		.attr("class", "brailleShadow")
		.attr("cx", function(d){return d[0];})
		.attr("cy", function(d){return d[1];})
		.attr("rx", 15).attr("ry", 15)
		.attr("fill", "#e9e9e9");*/

		var trials = stimulusSVG.append("g")
		.attr("class","trials")
		.attr("transform", "translate(0,"+topMargins+")");

		var x = d3.scale.linear().domain([0, this.maxTime]).range([0, width]),
		y = d3.scale.linear().domain([-1, 1]).range([height-topMargins*2, 0]);
		this.scale = {x: x, y: y};
	};
	this.makeRaster = function(neuronObj,curryPos){
		traceColour = neuronObj.colour;
		var currPaper = d3.select("." + neuronObj.type + " svg .trials");
		var spikeTrace = this.spikeTrace;
		var scale = this.scale;
		scale.y = d3.scale.linear().domain([-1, 1]).range([curryPos+10, curryPos-10]);
		var maxTime = this.maxTime;
		var thisIx = yPos.indexOf(curryPos);

		var currTrial = currPaper.append("g")
		.attr("class","yPos"+curryPos+" trial"+nrTrials[thisIx]);

		currTrial.selectAll(".spike")
		.data(neuronObj.timesForSpikes)
		.enter()
		.append("line")
		.attr("class","spike")
		.attr('x1',function(d){return scale.x(d);}).attr('x2',function(d){return scale.x(d);})
		.attr('y1',scale.y(-1)).attr('y2',scale.y(-1+1.9/(nrTrials[thisIx]+1)-0.005))
		.attr("fill","none")
		.attr("stroke",traceColour)
		.attr("opacity", 0)
		.transition()
		.ease("linear")
		.delay(function(d) {return d;})
		.attr("opacity", 1);

		setTimeout(function(){neuronObj.vis.finished = true;},this.maxTime);
	};
	this.generateSpikeTimes = function(nrSpikes,timeInterval,adaptationExp){
		// Generates spike times (in ms) for nrSpikes spikes to occurr in timeInterval
		if(!adaptationExp){adaptationExp=1;}
		var arr = [];
		while(arr.length < nrSpikes){
			var randomnumber = Math.floor(Math.pow(Math.random(),adaptationExp)*(timeInterval[1]-timeInterval[0])+timeInterval[0]);
			var found=false;
			for(var i=0;i<arr.length;i++){
				if(Math.abs(arr[i]-randomnumber)<2){found=true;break;}
			}
			if(!found)arr[arr.length]=randomnumber;
		}
		return arr.sort();
	};

	this.generateSpikeTrace = function(spikeTimes){
		this.spikeTrace = [];
		for (var t = 0; t < this.maxTime; t++)
		{
			this.spikeTrace.push({
				time: t,
				value: Math.random() * 2 - 1// Random number between -1 (included) and 1 (excluded)
			});
		}

		for (var i = 0; i<spikeTimes.length;i++){
			currTime = spikeTimes[i];
			this.spikeTrace[currTime].value = Math.random() * 3  + 7;
			this.spikeTrace[currTime+1].value = -(Math.random() * 3  + 7);
		}
	};

	this.addTraceToOscilloscope = function(traceColour){
		traceColour = (typeof traceColour !== 'undefined') ?  traceColour : "#42ff4f";
		if(!this.div) return;
		else{
			var uniqueDivId = this.div;

			var spikeTrace = this.spikeTrace;
			var scale = this.scale;
			var maxTime = this.maxTime;

			var line = d3.svg.line()
			.interpolate("basis")
			.x(function(d) { return scale.x(d.time); })
			.y(function(d) { return scale.y(d.value); });

			function getInterpolation() {
				var interpolate = d3.scale.quantile()
				.domain([0,1])
				.range(d3.range(1, spikeTrace.length + 1));

				return function(t) {
					var tempValues = spikeTrace.slice(0, interpolate(t));
					return line(tempValues);
				};
			}

			return d3.select(uniqueDivId+">svg").append("g")
			.attr("class", "spikeData")
			.append('path')
			.attr("class", "line")
			.attr("stroke", traceColour)
			.attr("fill","none")
			.transition()
			.duration(maxTime)
			.attrTween('d', getInterpolation)
			.ease("linear");
		}
	};
}
