var peripheral_indexes = [-1,0,1];
peripheralAccordion(peripheral_indexes);
// Global variables
var maxTime = 500; // In ms
var currentTrialNumber = 0;
var timesForSpikes = {};
var neuronTypes = ['large','medium','small'];
//var colours = ['purple','red','green'];
var colours = ['#66c2a5','#fc8d62','#8da0cb'];//['#1b9e77','#d95f02','#7570b3'];//,'#e7298a','#66a61e','#e6ab02']
//var colours = ['#377eb8','#4daf4a','#984ea3'];//['#7fc97f','#beaed4','#fdc086'];//[green,purple,orange];
var rfRadius = {
	large:50*(Math.random() * 0.4  + 0.8),
	medium:20*(Math.random() * 0.4  + 0.8),
	small:10*(Math.random() * 0.4  + 0.8)
};
var peripheralClicks = 0;
var rfsMapped = {peripheral:0,sensitivity:false,cortical:0};
// Set the colour of everything related to each neuron (hints, table entries, etc)
colours.forEach(function(element,index){
	$(".neuron"+index).css("color",element);
	$("td.neuron"+index).next().css("background-color",element);
});
if (browserSupportsAudio) {audioObj = new AudioSpikes(maxTime,1,0.2);}
shuffle(neuronTypes);
var neurons = neuronTypes.map(function(type,index){
	var thisRadiusPx = +rfRadius[type].toFixed(1);
	thisObj = {
		tab: 'periphery',
		type: type,
		colour: colours[index],
		panel: index,
		vis: new SpikeVisualization({width: 450, height: 100},maxTime),
		properties: new TactileNerve(type,thisRadiusPx),
		rfRadiusPx: thisRadiusPx,
		rfDiamCm: +(((thisRadiusPx*2+2)*5)/155).toFixed(1),
		recording: true,
	};
	thisObj.vis.makeOscilloscope("div.oscilloscope.neuron"+index);
	thisObj.properties.setRFCenter();
	return thisObj;
});
var rfLoc = {
	image : "img/somatosensory/hand.png",
	width: 420,
	height: 650,
	ruler: {image:"img/somatosensory/ruler.svg",x:2,y:590,width:154,height:55,minwidth:35},
	electrodes: true,
};

makeRFs(".hand",rfLoc,neurons);
var largeIx = neuronTypes.indexOf("large");
var rfThird = +(neurons[largeIx].rfDiamCm/6).toFixed(1);
var sensitivityLabels = {
	categories: [2*rfThird,rfThird,0],
	colors: ['#e7298a','#66a61e','#e6ab02'],//['#ffff33','#ff7f00','#377eb8'],
	labelTitle: "y-value (cm)",
	unit: "",
	visible: true
};
var sensitivityCenter;
sensitivityRF(".zoomedHand",neurons[largeIx]);

d3.select('.hand').on("click",function(e){
	if (d3.event.defaultPrevented) return;

	if(neurons.every(function(x){return x.vis.finished;})){
			d3.selectAll(".peripheral .spikeData").remove();
			neurons.forEach(function(neurObj){
				neurObj.vis.finished = false;
			});
	}
	else{return;}

	// Get real click coordinates (since svg is in viewport)
	svg = document.querySelector('.hand svg');
	var pt = svg.createSVGPoint();
	pt.x = d3.event.clientX;
	pt.y = d3.event.clientY;
	var clickCoords = pt.matrixTransform(svg.getScreenCTM().inverse());

	getRFResponses(neurons,clickCoords);

	var whichAudio = $('input[name=audioSource]:checked').val();
	var timesForSpikes = neurons[whichAudio].timesForSpikes;

	if (browserSupportsAudio) {
		audioObj.addWhiteNoise();
		audioObj.addSpikesToAudio(timesForSpikes);
		audioObj.playBuffer();
	}
	if(peripheralClicks===20){enableHints("peripheral");peripheralClicks+=1;}

});

$(".peripheral .table-entry").change(function() {
	// For some reason Chrome started triggering change when val is set programatically 10/02/2017
	if($(this).val()===""){return;}

	var inputBox = $(this);
	var neuronIx = +$(this).parents('td').attr('neuron')-1;
	var correctResponse = neurons[neuronIx].rfDiamCm;

	checkRFsize(neurons[neuronIx].type,correctResponse,inputBox);
});

$(".peripheral button.hint").click(function(){
	var neuronIx = +this.getAttribute("neuron");
	var neuronSize = neurons[neuronIx].type;
	d3.select(".hints ."+neuronSize)
	.transition()
	.duration(10)
	.attr("fill",colours[neuronIx])
	.each("end",function(){
		d3.select(".hints ."+neuronSize)
		.transition()
		.duration(10)
		.delay(500)
		.attr("fill","none");
	});
});

// Sensitivity
var amplitude = Math.random()*150 + 50,
		sigma = 0.9*neurons[largeIx].rfRadiusPx;
var thisRF = twoDGaussian(amplitude,0,0,sigma);
sensVis = new SpikeVisualization({width: 450, height: 100},maxTime);
sensVis.makeOscilloscope("div.oscilloscope.sensitivity");
var rfRadius = 2*neurons[largeIx].rfRadiusPx,
		tolerance = 0.1*rfRadius;
var clickXcoords = {data0:[-rfRadius,rfRadius],data1:[-rfRadius,rfRadius],
	data2:[-rfRadius,rfRadius]},
		isMapped = [false,false,false],exploreMoreInterval={};
var tunCurveDomain = [-2, 2];
var maxRate = 1.16*amplitude;
var tunCurve = new TuningCurve({width: 540, height: 400},tunCurveDomain,maxRate);
var margins = {top: 10, right: 70, bottom: 50, left: 60};
$("div.sensitivityTuning").html('');
tunCurve.makeTuningCurveGraph("div.sensitivityTuning","x-value (cm)",margins);
tunCurve.addLegends(sensitivityLabels);

d3.select('.crossSectionGroup').on("click",function(){
	if ($(".sensitivity .spikeData").length > 0){
		if ($(".sensitivity .spikeData").attr("finished")) {
			d3.selectAll(".sensitivity .spikeData").remove();
		}
		else {return;}
	}

	// Get real click coordinates (since svg is in viewport)
	svg = document.querySelector('.zoomedHand svg');
	var pt = svg.createSVGPoint();
	pt.x = d3.event.clientX;
	pt.y = d3.event.clientY;
	var clickCoords = pt.matrixTransform(svg.getScreenCTM().inverse());
	getSensitivityResponses(clickCoords);

});
