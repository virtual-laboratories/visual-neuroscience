// Global variables
var toneDuration = 1000; // In ms
var maxTime = 1000; // In ms
var spontaneousRate = 5;
var nowBuffering, currPanValue=0, currAzimuth = 0, currIndex=4, minTrialsPerDir = 5;
var directions = [-90,-60,-30,-15,0,15,30,60,90];
var trialsPerDirection = [0,0,0,0,0,0,0,0,0];
var currentTrialNumber = 0;
var categories = ["Contra","Ipsi","Midline","Off-midline","Insensitive"];
var neuronsInPopulation = 1;
var available_indexes = [-1,3,4];
var directionsMissing = [-90,-60,-30,-15,0,15,30,60,90];
var mainTuningCurveMargin = {top: 30, right: 10, bottom: 70, left: 60};
var currNeuronIdentified = false;

if (browserSupportsAudio) {audioObj = new AudioSpikes(maxTime,1,0.2);}

var currNeuron = new AuditoryNeuron();
currNeuron.initializeNeuron(categories);

spatialVis = new SpikeVisualization({width: 450, height: 150},maxTime);
spatialVis.makeOscilloscope("div.oscilloscope.spatial");

$(document).ready(function(){

	$("#spatialDial").knob({
		'width': 300,
		'height': 300,
		'cursor': 0.5,
		'thickness': 0.2,
		'angleOffset': 270,
		'angleArc': 180,
		'bgColor': "hsl(160, 51%, 80%)",
		'fgColor': "hsl(180, 100%, 25%)",
		'min': -90,
		'max': 90,
		'displayInput': false,
		'step': 15,
		'release': function (v) {
			currAzimuth = v;
			currIndex = directions.indexOf(currAzimuth);
			currPanValue = v/90;
		},
		'draw': function () {
			var degInRad = this.cv*Math.PI/180;
			var marginDiv = Number($("#knobDiv").css('margin-left').replace("px", "")) || 0;
			$('#soundSymbol').css({top:this.xy-this.radius*Math.cos(degInRad)+23,
				left: this.xy+this.radius*Math.sin(degInRad)+38});
			}
		});

		tunCurveDomain = [-95, 95];
		tunCurve = new TuningCurve({width: 450, height: 300},tunCurveDomain,currNeuron.maxRate);
		tunCurve.makeTuningCurveGraph("div#spatialTuningCurve", "Azimuth (°)",mainTuningCurveMargin);

		$("#playSound").on('click', function() {

			if ($(".spikeData").length === 1){
				if ($(".spikeData").attr("finished")) {
					$(".spikeData").remove();
				}
				else {return;}
			}

			var nrSpikesThisTrial = poisson(currNeuron.tuningFunction(currAzimuth));
			var timesForSpikes = spatialVis.generateSpikeTimes(nrSpikesThisTrial,[10,maxTime-5]);
			spatialVis.generateSpikeTrace(timesForSpikes);
			currentTrialNumber +=1;
			spatialVis.addTraceToOscilloscope()
			.each("end",function(){
				d3.select(".spikeData").attr("finished",true);

				d3.select("#spatialTuningCurve .userData").append("circle")
				.attr("cx", tunCurve.angleScale(currAzimuth))
				.attr("cy", tunCurve.firingScale(nrSpikesThisTrial))
				.attr("r",4)
				.attr("fill","hsl(180, 100%, 25%)")
				.attr("fill-opacity",0.4)
				.attr("stroke", "darkgrey");

				trialsPerDirection[currIndex]+=1;
				directionsMissing = [];
				trialsPerDirection.forEach(
					function(el,ix){
						if(el<minTrialsPerDir){directionsMissing.push(directions[ix]);}
					}
				);
				// Add this trial to csv file
				currNeuron.csvContent += currentTrialNumber+","+ currAzimuth +","+ nrSpikesThisTrial + "\n";

				// If at least 5 trials have been collected for all azimuths
				var indexCategory = categories.indexOf(currNeuron.category);
				if (directionsMissing.length===0 && !currNeuronIdentified){
					currNeuronIdentified = true;
					mappingFinished(indexCategory);

				}
			});

			if (browserSupportsAudio) {
				audioObj.addWhiteNoise();
				audioObj.addSpikesToAudio(timesForSpikes);
				audioObj.playBuffer();
				audioObj.playStereo(currPanValue,toneDuration);
			}

			/*minSoFar = getMinOfArray(trialsPerDirection);
			if (minSoFar>minTrialsPerDir)
			{}*/

		});
		$("#downloadAuditoryData").on('click', function() {
			downloadCsv(currNeuron.csvContent,"spikeCounts");
		});

		$("#selectNeuron").on('click', function() {
			$('<div title="Are you sure?">If you select a new neuron to record '+
				'from, this will clear all of the data you have collected so far, '+
				'and your count of at least 5 trials per direction to enable the next '+
				'tab will be reset.'+
				'</div>').dialog({
					modal:true,
					buttons: {
						"New neuron": function() {
							trialsPerDirection = [0,0,0,0,0,0,0,0,0];
							directionsMissing = [-90,-60,-30,-15,0,15,30,60,90];
							currNeuron = new AuditoryNeuron();
							currNeuron.initializeNeuron(categories);
							clearData();
							$("#downloadAuditoryData").addClass("hidden");
							currNeuronIdentified = false;
							$(this).dialog('destroy').remove();
						},
						Cancel: function() {
							$(this).dialog('destroy').remove();
						}
					},
					closeOnEscape: false,
					open: function () { $(".ui-dialog-titlebar-close").hide(); }
				});
			/*var result = window.confirm('Are you sure you want to clear all the '+
			'data you have collected so far, and start recording from a new neuron?');
			if (result){
				trialsPerDirection = [0,0,0,0,0,0,0,0,0];
				currNeuron = new AuditoryNeuron();
				currNeuron.initializeNeuron(categories);
				clearData();
				$("#downloadAuditoryData").addClass("hidden");
				currNeuronIdentified = false;
			}*/

		});

		//tunCurve.makeTuningCurveGraph("div#popTuningCurve", "Azimuth (°)");
		currPopNeuron = new AuditoryNeuron();
		currPopNeuron.initializeNeuron(categories);
		popTunCurve = new TuningCurve({width: 400, height: 320},tunCurveDomain,currPopNeuron.maxRate);
		popTunCurve.makeTuningCurveGraph("div#popTuningCurve", "Azimuth (°)",{top: 30, right: 10, bottom: 50, left: 60});
		popTunCurve.addTrials("div#popTuningCurve",currPopNeuron,5);
		popTunCurve.fitTunCurve("div#popTuningCurve",currPopNeuron);
		makeHistogram("div#histogram",categories);

		/*$("#newNeuron").on('click', function() {
		neuronsInPopulation +=1;
		$("div#popTuningCurve").html('');
		currPopNeuron = new AuditoryNeuron();
		currPopNeuron.initializeNeuron(categories);
		popTunCurve = new TuningCurve({width: 450, height: 300},tunCurveDomain,currPopNeuron.maxRate);
		popTunCurve.makeTuningCurveGraph("div#popTuningCurve", "Azimuth (°)");
		popTunCurve.tunCurveAndFit("div#popTuningCurve",currPopNeuron);
	});*/
});

function clearData(){
	$("div#spatialTuningCurve").html('');
	$(".spikeData").remove();
	tunCurveDomain = [-95, 95];
	tunCurve = new TuningCurve({width: 450, height: 300},tunCurveDomain,currNeuron.maxRate);
	tunCurve.makeTuningCurveGraph("div#spatialTuningCurve", "Azimuth (°)",mainTuningCurveMargin);
}
function getMinOfArray(numArray) {
	return Math.min.apply(null, numArray);
}

function mappingFinished(indexCategory){
	$('<div id="neuronTypeDescription" title="Great job!">The neuron '+
	'you have recorded from is ' +
	currNeuron.category + (indexCategory<4 ? " selective":"") + '.' +
	'</div>').dialog({
		modal:true,
		width:320,
		close: function(){$(this).dialog('destroy').remove();}
	});
	if (indexCategory<4){
		$("#neuronTypeDescription").append("<br><br> "+
		"The appropriate defining metric is: "+
		(indexCategory<2 ? "Azimuth at 50% of maximum response":"Azimuth at function's peak"));
	}
	// Add title
	d3.select("#spatialTuningCurve>svg").append("text")
	.attr("x", (450 / 2))
	.attr("y", (mainTuningCurveMargin.top / 2))
	.attr("text-anchor", "middle")
	.attr("font-size", "16px")
	.text("Type: "+currNeuron.category+
	(currNeuron.category!='Insensitive' ? " selective":""));
	// Add appropriate metric
	if (indexCategory<4){
		// Add title
		d3.select("#spatialTuningCurve>svg").append("text")
		.attr("x", (450 / 2))
		.attr("y", 300 - 5)
		.attr("text-anchor", "middle")
		.attr("font-size", "16px")
		.text((indexCategory<2 ? "Azimuth at 50% of maximum response: ":"Azimuth at function's peak: ")+
		currNeuron.log.toFixed(2)+"°");
		tunCurve.addDashedLine("#spatialTuningCurve",currNeuron);
	}
	// Plot tuning curve fit
	tunCurve.fitTunCurve("#spatialTuningCurve",currNeuron);
	// Make population tab available
	available_indexes.push(5);
	// Enable "download data" button
	$("#downloadAuditoryData").removeClass("hidden");
}
