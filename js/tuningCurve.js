function TuningCurve(divSizes,xDomain,maxY){
	this.visSizes = divSizes;
	this.xDomain = xDomain;
	this.maxY = maxY;

	this.makeTuningCurveGraph = function(uniqueDivId,xLabel,margin){
		if(!margin){margin = {top: 10, right: 50, bottom: 50, left: 60};}
		this.width = this.visSizes.width - margin.left - margin.right; // 540
		this.height = this.visSizes.height - margin.top - margin.bottom; // 400

		this.angleScale = d3.scale.linear()
		.range([0, this.width])
		.domain(this.xDomain);
		this.firingScale = d3.scale.linear()
		.range([this.height, 0])
		.domain([0, this.maxY]);

		var xAxis;
		if (typeof directions !== 'undefined'){
			xAxis = d3.svg.axis().scale(this.angleScale).orient("bottom").tickValues(directions);
		}
		else {
			xAxis = d3.svg.axis().scale(this.angleScale).orient("bottom");
		}
		var yAxis = d3.svg.axis().scale(this.firingScale).orient("left").ticks(8);

		this.svg = d3.select(uniqueDivId).append("svg")
		.attr("viewBox","0,0,"+(this.width+ margin.left + margin.right)+","+(this.height+ margin.top + margin.bottom))
		.attr("preserveAspectRatio","xMidYMid meet")
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		// Append the created axes to the svg element
		this.svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + this.height + ")")
		.call(xAxis)
		.append("text")
		.attr("transform", "translate("+this.width/2+",40)")
		.attr("text-anchor", "middle")
		.text(xLabel);

		this.svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("transform","translate(-40,"+this.height/2+") rotate(-90)")
		.style("text-anchor", "middle")
		.text("Number of spikes");

		// Add group for user generated data
		this.svg.append("g")
		.attr("class", "userData");
	};
	this.addLegends = function(legendObj){
		// LEGEND

		var legendData = legendObj.categories.map(function(currValue,index){
			return {
				name: currValue,
				color: legendObj.colors[index],
				visible: typeof(legendObj.visible) === "boolean" ?
								legendObj.visible : legendObj.visible[index],
				index: index
			};
		});

		var legend = this.svg.append("g")
		.attr("transform", "translate(" + (this.width) + ",20)")
		.attr('class', 'legend');

		legend.append('text')
		.attr('x', 16)
		.attr('y', 0)
		.attr("text-anchor","middle")
		.attr('font-weight','bold')
		.text(legendObj.labelTitle);

		var legendEntry = legend.selectAll('.legendEntry')
		.data(legendData)
		.enter()
		.append("g")
		.attr('class', 'legendEntry');

		legendEntry.append('text')
		.attr('x', 48)
		.attr('y', function(d, i){ return legendData.length*35 - (i *  35) + 5;})
		.attr("text-anchor","end")
		.text(function(d){ return d.name+legendObj.unit;});

		legendEntry.append('circle')
		.attr('cx', 0)
		.attr('cy', function(d, i){ return legendData.length*35 - (i *  35);})
		.attr("r",8)
		.attr("fill",function(d){ return d.color;})
		.attr("fill-opacity",0.6)
		.attr("stroke", "darkgrey");

		legendEntry.attr("opacity",function(d){return d.visible ? 1 : 0.1;});

		legendEntry.on("click", function(d){
			d.visible = !d.visible; // If array key for this data selection is "visible" = true then make it false, if false then make it true

			d3.selectAll(".data"+d.index)
			.transition()
			.attr("opacity",d.visible ? 1 : 0);

			d3.select(this)
			.transition()
			.attr("opacity",d.visible ? 1 : 0.1);
		});
	};

	this.addTrialToGraph = function(uniqueDivId,trialObj){
		d3.select(uniqueDivId + " .userData").append("circle")
		.attr("class","data"+trialObj.legendIx)
		.attr("cx", this.angleScale(trialObj.x))
		.attr("cy", this.firingScale(trialObj.y))
		.attr("r",4)
		.attr("fill",trialObj.color)
		.attr("fill-opacity",0.4)
		.attr("stroke", "darkgrey");
	};

	this.addTrials = function(uniqueDivId,neuron,nrTrialsPerAngle){
		var angles = [-90,-75,-60,-45,-30,-15,0,15,30,45,60,75,90];
		for (j=0;j<angles.length;j++) {
			for (i=0;i<nrTrialsPerAngle;i++){
				nrSpikesThisTrial = poisson(neuron.tuningFunction(angles[j]));
				thisTrial = {
					x: angles[j],
					y: nrSpikesThisTrial,
					color: 'hsl(180, 100%, 25%)',
					legendIx: NaN,
				};
				this.addTrialToGraph(uniqueDivId,thisTrial);
			}
		}
	};

this.fitTunCurve = function(uniqueDivId,neuron){
		var fit = [];
		for (angle = -90;angle<90;angle++){
			fit.push({angle: angle, rate: neuron.tuningFunction(angle)});
		}

		// Define the line
		x = this.angleScale;
		y = this.firingScale;
		var valueline = d3.svg.line()
		    .x(function(d) { return x(d.angle); })
		    .y(function(d) { return y(d.rate); });

		d3.select(uniqueDivId + " .userData")
		.append("path")
        .attr("class", "line")
        .attr("d", valueline(fit))
		.attr("stroke", "hsl(180, 100%, 25%)")
		.attr("fill", "none")
    .attr("stroke-width", "4")
    .attr("shape-rendering","crispEdges");
	};

	this.addDashedLine = function(uniqueDivId,neuron){
		d3.select(uniqueDivId+ " .userData").append("line")
		.attr("stroke", "hsl(180, 100%, 25%)")
		.style("stroke-dasharray", ("3, 3"))
		.attr("stroke-width", "2")
		.attr({
			x1: this.angleScale(neuron.log),
			y1: this.firingScale(0),
			x2: this.angleScale(neuron.log),
			y2: this.firingScale(neuron.tuningFunction(neuron.log))
		});
		d3.select(uniqueDivId+ " .userData").append("line")
		.attr("stroke", "hsl(180, 100%, 25%)")
		.style("stroke-dasharray", ("3, 3"))
		.attr("stroke-width", "2")
		.attr({
			x1: this.angleScale(neuron.log),
			y1: this.firingScale(neuron.tuningFunction(neuron.log)),
			x2: this.angleScale(this.xDomain[0]),
			y2: this.firingScale(neuron.tuningFunction(neuron.log))
		});
	};
}
