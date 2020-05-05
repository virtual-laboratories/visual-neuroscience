// Global variables
var maxTime = 1000, // In ms
spontaneousRate = 5,
currRadians = 0, currAngle = 0, currContrast = 100,
radius = 200,
angleScale, firingScale,
directions = [0,30,60,90,120,150,180,210,240,270,300,330],
contrast = [0,20,40,60,80,100], //[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
colors = ['#ffffcc','#c7e9b4','#7fcdbb','#41b6c4','#2c7fb8','#253494'],
nowBuffering,
available_indexes = [-1,0],
randomSeed,
adaptationExp = 1.5,
mysteryGain = 1.1;

// Variables that are randomized on each refresh (and with each seed)
var prefDirectionAng,	prefDirectionRad, kappa, amplitude, offset, maxRate;

// Make the stimulus screen
makeStimScreen("div#stimulusMonitor");
// Make the oscilloscope screen
visualSpikes = new SpikeVisualization({width: 450, height: 150},maxTime);
visualSpikes.makeOscilloscope("div.oscilloscope");

$(document).ready(function(){

	if (browserSupportsAudio) {audioObj = new AudioSpikes(maxTime,1);}

	$("#contrast").on("change",function(){
		currContrast = Number($("#contrast").val())*10;
		d3.select("#grating").attr("xlink:href", "img/visual/grating"+currContrast+".png");
	});

	$("#startStim").on("click",function(){

		if ($(".spikeData").length === 1){
			if ($(".spikeData").attr("finished")) {
				$(".spikeData").remove();
			}
			else {return;}
		}

		// Temporarily cover knob to disable
		$("#knobDiv").append('<div id="knobCover" style="position:relative;width:144px;height:144px;top:-120px;"></div>');

		var nrSpikesThisTrial = poisson((currContrast/100)*amplitude*vonMises(2*Math.PI-currRadians,prefDirectionRad,kappa)+offset);
		if (currContrast === 0){currAdaptationExp = 1;}
		else {currAdaptationExp = adaptationExp;}
		var timesForSpikes = visualSpikes.generateSpikeTimes(nrSpikesThisTrial,[10,maxTime-5],currAdaptationExp);
		visualSpikes.generateSpikeTrace(timesForSpikes);
		visualSpikes.addTraceToOscilloscope()
		.each("end",function(){
			d3.select(".spikeData").attr("finished",true);

			d3.select("#grating")
			.transition()
			.duration(1)
			.ease('linear')
			.attr({"x":-680, "y":-240});

			d3.select(".userData").append("circle")
			.attr("class","data"+contrast.indexOf(currContrast))
			.attr("cx", tunCurve.angleScale((360-currAngle)%360))
			.attr("cy", tunCurve.firingScale(nrSpikesThisTrial))
			.attr("r",4)
			.attr("fill",colors[currContrast/20])
			.attr("fill-opacity",0.4)
			.attr("stroke", "darkgrey");

			//Reenable knob
			d3.select("#knobCover").remove();
		});

		if (browserSupportsAudio) {
			audioObj.addWhiteNoise();
			audioObj.addSpikesToAudio(timesForSpikes);
			audioObj.playBuffer();
		}

		d3.select("#grating")
		.transition()
		.duration(1000)
		.ease("linear")
		.attr({
			x: -240,
			y: -240
		});

	});
	$("#downloadData").on("click",function(){downloadVisualData(maxTime);});

	$("#clearData").on("click",function(){
		$('<div title="Are you sure?">This will clear all of the data points '+
			'that you have collected so far from the bottom right panel. '+
			'</div>').dialog({
				modal:true,
				buttons: {
					Confirm: function() {
						clearData(maxRate,labels);
						$(this).dialog('destroy').remove();
					},
					Cancel: function() {
						$(this).dialog('destroy').remove();
					}
				},
				closeOnEscape: false,
				open: function () { $(".ui-dialog-titlebar-close").hide(); }
			});
		/*var result = window.confirm('Are you sure you want to clear all the data you ' +
		'have collected so far?');
		if (result){clearData(maxRate,labels);}*/
	});

});
