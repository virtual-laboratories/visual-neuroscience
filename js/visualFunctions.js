$(document).ready(function(){

	// Initialize neuron
	$('#submitSeed').on('click',function () {

		var myrng;
		randomSeed = $('#nameSeed').val().toUpperCase();
		if (randomSeed.length === 0) {
			myrng = new Math.seedrandom();
			$('#initMessage').html('You are now recording from a random neuron.');
		}
		else if (randomSeed[0] === ' ' || randomSeed[randomSeed.length-1] === ' ')
		{
			alert('The neuron ID cannot start or end with a white space. Please rename your neuron.');
			return;
		}
		else {
			myrng = new Math.seedrandom(randomSeed);
			$('#initMessage').html('You are now recording from a neuron with ID: "' + randomSeed + '"');
		}
		available_indexes.push(1);available_indexes.push(4);

		// Variables that are randomized for each seed
		prefDirectionAng = Math.round(myrng()*360);
		prefDirectionRad = Math.PI*prefDirectionAng/180;
		kappa = myrng()*2.5 + 0.5;
		amplitude = myrng()*150 + 50;
		offset = myrng()*20;

		// Estimate max firing rate for scale of tuning curve graph
		var maxFiringRates = [];
		for(var i=0;i<100;i++)
		{ maxFiringRates.push(poisson(amplitude*vonMises(prefDirectionRad,prefDirectionRad,kappa)+offset));}
		maxRate = Math.max.apply(null, maxFiringRates);

		labels = {
			categories: contrast,
			colors: colors,
			labelTitle: "Contrast",
			unit: "%",
			visible: true
		};

		clearData(maxRate,labels);
	});

	$("#directionDial").knob({
		'width': 80,
		'height': 80,
		'cursor': 1,
		'thickness': 0.5,
		'angleOffset': 90,
		'angleArc': 359,
		'bgColor': "hsl(0,0%,10%)",
		'fgColor': "hsl(0,0%,90%)",
		'min': 0,
		'max': 359,
		'displayInput': false,
		'step': 30,
		'draw' : function () {
			this.i.val( (360-this.cv)%360);
		},
		'change': function(v){changeDirection(v);}
	});

	$( "#accordion" ).accordion({
		collapsible: true,
		heightStyle: "content",
		beforeActivate: function(event, ui) {
			var newIndex = $(ui.newHeader).index('h3');
			if (jQuery.inArray(newIndex, available_indexes) == -1) {
				$('<div title="Initialise your neuron first"> Please initialise your '+
				'neuron first in the "Instructions" tab. If you don\'t want to use ' +
				'your name, any string will do; or if you want a random neuron ' +
				'just leave the box blank and press the "Initialise neuron" button.</div>')
				.dialog({
					modal:true,
					close: function(){$(this).dialog('destroy').remove();}
				});
				event.preventDefault();
			}
		}
			/*else {
				var currHeader,currContent;
				// The accordion believes a panel is being opened
				if (ui.newHeader[0]) {
					currHeader  = ui.newHeader;
					currContent = currHeader.next('.ui-accordion-content');
					// The accordion believes a panel is being closed
				} else {
					currHeader  = ui.oldHeader;
					currContent = currHeader.next('.ui-accordion-content');
				}
				// Since we've changed the default behavior, this detects the actual status
				var isPanelSelected = currHeader.attr('aria-selected') == 'true';
				// Toggle the panel's header
				currHeader.toggleClass('ui-corner-all',isPanelSelected).toggleClass('accordion-header-active ui-state-active ui-corner-top',!isPanelSelected).attr('aria-selected',((!isPanelSelected).toString()));
				// Toggle the panel's icon
				currHeader.children('.ui-icon').toggleClass('ui-icon-triangle-1-e',isPanelSelected).toggleClass('ui-icon-triangle-1-s',!isPanelSelected);
				// Toggle the panel's content
				currContent.toggleClass('accordion-content-active',!isPanelSelected);
				if (isPanelSelected) { currContent.slideUp(); }  else { currContent.slideDown(); }
			}
			return false; // Cancels the default action
		}*/
	});
});

function clearData (maxRate,labelsObj) {
	// Make the tuning curve graph
	$("div#tuningCurveGraph").html('');
	$(".spikeData").remove();
	tunCurveDomain = [-15, 345];
	tunCurve = new TuningCurve({width: 540, height: 400},tunCurveDomain,maxRate);
	tunCurve.makeTuningCurveGraph("div#tuningCurveGraph","Direction (°)");
	tunCurve.addLegends(labelsObj);
	//makeTuningCurveGraph("div#tuningCurveGraph");
}

function changeDirection(q) {
	currAngle = 30*Math.round(q/30);
	currRadians = currAngle*Math.PI/180;
	d3.select("#grating").attr("transform", "rotate(" + currAngle + ",0, 0)");
	$(".spikeData").remove();
}

// Gets the value of a von Mises function
function vonMises(x,mu,kappa){
	return (Math.exp(kappa*Math.cos(x-mu)))/(2*Math.PI*besseli(kappa,0));
}

// Returns a random draw from a poisson distribution with mean = "mean"
function poisson(mean){
	var n = 0,
	limit = Math.exp(-mean),
	x = Math.random();
	while(x > limit){
		n++;
		x *= Math.random();
	}
	return n;
}

// Calculates the mean of an array of values
function average(data){
	var sum = data.reduce(function(sum, value){
		return sum + value;
	}, 0);
	var avg = sum / data.length;
	return avg;
}
// Calculates the standard deviation of an array of values
function standardDeviation(values) {
	var avg = average(values);
	var squareDiffs = values.map(function(value){
		var diff = value - avg;
		var sqrDiff = diff * diff;
		return sqrDiff;
	});
	var avgSquareDiff = average(squareDiffs);
	var stdDev = Math.sqrt(avgSquareDiff);
	return stdDev;
}

function makeStimScreen(uniqueDivId){
	var width = 342;
	var height = 342;

	var stimulusGroup = d3.select(uniqueDivId).append("svg")
	.attr("viewBox","0,0,"+width+","+height)
	.attr("preserveAspectRatio","xMidYMid meet")
	.append("g")
	.attr("transform", "translate(" + width/2 + "," + height/2 + ")");

	stimulusGroup.append('clipPath')
	.attr("id","clipCircle")
	.append('circle')
	.attr("r",150)
	.attr("cx",0)
	.attr("cy",0);

	stimulusGroup.append("image")
	.attr("id","grating")
	.attr("xlink:href", "img/visual/grating100.png")
	.attr("clip-path","url(#clipCircle)")
	.attr("x", -680)
	.attr("y", -240)
	.attr("width", 920)
	.attr("height", 480);
}

// Creates a csv file to download from a csv string
function downloadCsv(csvString,filename){
	var blob = new Blob([csvString]);
	if (window.navigator.msSaveOrOpenBlob)
	window.navigator.msSaveBlob(blob, filename+".csv");
	else
	{
		var a = window.document.createElement("a");
		a.href = window.URL.createObjectURL(blob, {type: "text/plain"});
		a.download = filename+".csv";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
}

function downloadVisualData(maxTime){
	var nrTrials = Number($("#nrRepeats").val()),
	dataType = $("#typeData").val(),
	directionsDataIx = $('#directionsData').val(),
	contrastDataIx = $('#contrastData').val(),
	directionsToProbe, contrastsToProbe;

	downloadSpikes = new SpikeVisualization({width: 0, height: 0},maxTime);

	if (directionsDataIx == 12){directionsToProbe = directions;}
	else {directionsToProbe = [directions[directionsDataIx]];}

	if (contrastDataIx == 6){contrastsToProbe = contrast;}
	else {contrastsToProbe = [contrast[contrastDataIx]];}

	if (dataType == "1"){
		//alert("Please select which type of data you would like to download.");
		$('<div title="Counts or times?">Please select which type of ' +
		'data you would like to download: spike counts per trial, or spike times ' +
		'per trial. ' +
		'</div>').dialog({
			modal:true,
			close: function(){$(this).dialog('destroy').remove();}
		});
	}
	else {
		var spikeTimes=[],spikeCounts=[],mean=[],std=[],
		factorial = [],
		directionPerTrial = [], contrastPerTrial = [], mysteryValPerTrial = [];
		spikeCountsTheseParams=[];
		for (var con=0; con < contrastsToProbe.length; con++) {
			var currContrast = contrastsToProbe[con];
			for (var dir=0; dir < directionsToProbe.length; dir++) {
				var currDirection = Math.PI*directionsToProbe[dir]/180;

				factorial.push([directionsToProbe[dir],currContrast]);
				spikeCountsTheseParams = [];
				for (var j=0;j<nrTrials;j++) {
					if (currContrast === 0){thisAdaptationExp = 1;}
					else {thisAdaptationExp = adaptationExp;}

					if (j < nrTrials/2) {mysteryValPerTrial.push(0);thisMysteryGain = 1;}
					else {mysteryValPerTrial.push(1);thisMysteryGain = mysteryGain;}

					directionPerTrial.push(Math.round(directionsToProbe[dir]));
					contrastPerTrial.push(currContrast);
					nrSpikesThisTrial = poisson(thisMysteryGain*(currContrast/100)*amplitude*vonMises(currDirection,prefDirectionRad,kappa)+offset);
					spikeCountsTheseParams.push(nrSpikesThisTrial);
					spikeCounts.push(nrSpikesThisTrial);
					//spikeTimes.push(generateTimesForSpikes(nrSpikesThisTrial,[1,maxTime-1],thisAdaptationExp).sort(function compareNumbers(a, b) {return a - b;}) );
					spikeTimes.push(downloadSpikes.generateSpikeTimes(nrSpikesThisTrial,[1,maxTime-1],thisAdaptationExp).sort(function compareNumbers(a, b) {return a - b;}) );
				}
				mean.push(average(spikeCountsTheseParams));
				std.push(standardDeviation(spikeCountsTheseParams));
			}
		}

		var titles="",data=[],filename,row,condition;
		switch(dataType) {
			case "2":
			condition = "MeanAndSTD";
			titles = "Number of trials,Direction,Contrast,Mean,Standard deviation";
			for (row=0; row < factorial.length; row++)
			{data.push( nrTrials +","+ factorial[row][0] +","+ factorial[row][1] +","+ mean[row] +","+ std[row] );}
			break;
			case "3":
			condition = "SpikeCounts";
			titles = "Trial number,Direction,Contrast,A,Spike counts";
			for (row=0; row<directionPerTrial.length; row++)
			{data.push(directionPerTrial[row] +","+ contrastPerTrial[row] +","+ mysteryValPerTrial[row] +","+ spikeCounts[row]);}
			shuffle(data);
			data.forEach(function(element,index){
				data[index] = (index+1) + "," + element;
			});
			break;
			case "4":
			condition = "SpikeTimes";
			titles = "Trial number,Direction,Contrast,A,Spike times (ms)";
			for (row=0; row<directionPerTrial.length; row++)
			{data.push(directionPerTrial[row] +","+ contrastPerTrial[row] +","+ mysteryValPerTrial[row] +","+ spikeTimes[row]);}
			shuffle(data);
			data.forEach(function(element,index){
				data[index] = (index+1) + "," + element;
			});
			break;
		}
		var csvContent = titles + "\n";
		data.forEach(function(dataString){
			csvContent += dataString + "\n";
		});
		filename = randomSeed + ' - ' + condition;
		downloadCsv(csvContent,filename);
	}
}

// Randomly permutes an array
function shuffle(array) {
  var m = array.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
}
function getRandomBetween(min,max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
