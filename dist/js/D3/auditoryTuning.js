// Global variables
var toneDuration = 1000; // In ms
var maxTime = 2000; // In ms
var spontaneousRate = 5;
var nowBuffering;

var color = {
	cortical: d3.scale.linear().domain([0, 10, 20, 30, 40, 50]).range(["#ffffb2","#fecc5c","#fd8d3c","#f03b20","#bd0026"]),
	cochlear: d3.scale.linear().domain([0, 20, 40, 60, 80, 100]).range(['#ffffcc','#a1dab4','#41b6c4','#2c7fb8','#253494'])
};
var tunCurve = {
	cortical: [
		[0, 0, 0, 0, 0, 2, 0, 0],
		[0, 0, 0, 0, 2, 5, 0, 0],
		[0, 0, 0, 2, 5,10, 0, 0],
		[0, 0, 2, 5,10,20, 2, 0],
		[0, 2, 5,10,20,30, 5, 0],
		[2, 5,10,20,35,40,10, 0],
		[15,20,30,35,40,45,20, 2],
		[20,30,35,40,45,50,30, 4]
	],
	cochlear: [
		[ 0, 0, 0, 0, 0, 0, 5, 0],
		[ 0, 0, 0, 0, 0, 0,10, 0],
		[ 0, 0, 0, 0, 0, 0,20, 0],
		[ 0, 0, 0, 0, 0, 0,30, 0],
		[ 0, 0, 0, 0, 0, 0,40, 0],
		[ 0, 0, 0, 0, 0, 5,50, 0],
		[ 0, 0, 0, 5,10,20,70, 0],
		[ 0, 0, 5,10,20,50,90, 5]
	]
};
// Make the oscilloscope screen
frequencyVis = new SpikeVisualization({width: 450, height: 150},maxTime);
frequencyVis.makeOscilloscope("div.oscilloscope.cochlear");
frequencyVis.makeOscilloscope("div.oscilloscope.cortical");

// Initialize heatmaps
makeHeatmap("div.heatmap.cochlear",tunCurve.cochlear);
makeHeatmap("div.heatmap.cortical",tunCurve.cortical);

$(document).ready(function(){

	if (browserSupportsAudio) {freqAudioObj = new AudioSpikes(maxTime,1,0.025);}

	// Delegated jquery event, as .sound element will not neccessarily exist on load
	$(document).on('click', '.sound', function() {

		var currCellType = $(this).parents(".heatmap").attr("cellType");

		if ($(".active").length === 1){
			if ($(".active").attr("finished")) {
				d3.select(".active").attr("class", "sound bordered");
				$("div.soundTrace."+currCellType+">svg").remove();
			}
			else {return;}
		}

		var sel = d3.select(this);
		sel.moveToFront() // See below for overwritten prototype
		.attr("class","active");
		$(".spikeData").remove();

		var stimSpikes = frequencyVis.generateSpikeTimes(+$(this).attr("response")+spontaneousRate,[10,toneDuration-5]);
		var spontSpikes = frequencyVis.generateSpikeTimes(spontaneousRate,[toneDuration+10,maxTime-5]);
		var timesForSpikes = stimSpikes.concat(spontSpikes);
		frequencyVis.generateSpikeTrace(timesForSpikes);
		frequencyVis.addTraceToOscilloscope("div.oscilloscope."+currCellType+">svg")
		.each("end",function(){
			d3.select(".active").attr("fill", color[currCellType]($(".active").attr("response")))
			.attr("finished",true);
		});

		if (browserSupportsAudio) {
			var frequency = $(this).attr("freq");
			var intensity = $(this).attr("int");
			freqAudioObj.playPureTone(frequency,intensity,toneDuration);
			freqAudioObj.addWhiteNoise();
			freqAudioObj.addSpikesToAudio(timesForSpikes);
			freqAudioObj.playBuffer();
		}

		d3.select("div.soundTrace."+currCellType).append("svg")
		.attr("viewBox","0,0,450,40")
		.attr("preserveAspectRatio","xMidYMid meet")
		.append("g")
		.append('line')
		.attr("stroke", "black")
		.attr("stroke-width", 30)
		.attr({
			x1: 5,
			y1: 20,
			x2: 5,
			y2: 20
		})
		.transition()
		.duration(1000)
		.ease("linear")
		.attr({
			x2: 230,
			y2: 20
		});

	});
});

d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
		this.parentNode.appendChild(this);
	});
};
