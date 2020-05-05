var cxNeuronTypes = ['wrist','forearm','shoulder'];
var cxNeuronColours = ['#e7298a','#66a61e','#e6ab02'];//['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f']
shuffle(cxNeuronTypes);
var cxRfRadius = {
  shoulder:70*(Math.random() * 0.4  + 0.8),
  forearm:40*(Math.random() * 0.4  + 0.8),
  wrist:20*(Math.random() * 0.4  + 0.8)
};
var corticalClicks = 0;
armVis = new SpikeVisualization({width: 450, height: 150},maxTime);
armVis.makeOscilloscope("div.oscilloscope.brain");

var cxNeurons = cxNeuronTypes.map(function(type,index){
  var thisRadiusPx = +cxRfRadius[type].toFixed(1);
  thisObj = {
    tab: 'cortex',
    type: type,
    colour: cxNeuronColours[index],
    panel: index,
    vis: armVis,
    properties: new TactileNeuron(type,thisRadiusPx),
    rfRadiusPx: thisRadiusPx,
    rfDiamCm: +((thisRadiusPx*2+2)/14).toFixed(1),
    recording: false,
  };
  thisObj.properties.setRFCenter();
  return thisObj;
});
var cxNeuronTypes = cxNeurons.map(function(x){return x.type;});
// Set the colour of everything related to each neuron (hints, table entries, etc)
cxNeurons.forEach(function(obj,index){
	$(".cortical."+obj.type).css("color",obj.colour);
  $(".cortical."+obj.type).next().css("background-color",obj.colour);
});

//Arm and brain
addBrain(".brain",cxNeurons);
var rfLoc = {
  image : "img/somatosensory/arm.png",
  width: 1200,
  height: 390,
  ruler: {image:"img/somatosensory/largeRulerTest.svg",x:10,y:330,width:224,height:60,minwidth:150},
  electrodes: false,
};
makeRFs(".arm",rfLoc,cxNeurons);

d3.select('.arm').on("click",function(e){
  if (d3.event.defaultPrevented) return;

  //If no electrode was selected, prompt for selection
  if(cxNeurons.every(function(x){return !x.recording;})){
    $("<div title='Please select an electrode'>Select which electrode you would "+
    "like to record from by clicking on it.</div>")
    .dialog({
      modal: true,
      close: function(){$(this).dialog('destroy').remove();}
    });
    return false;
  }
  else {
    var currNeuronIx = findWithAttr(cxNeurons,"recording", true);

    if(cxNeurons.every(function(x) {return x.vis.finished;})){
  			d3.selectAll(".cortex .spikeData").remove();
  			cxNeurons.forEach(function(neurObj){
  				neurObj.vis.finished = false;
  			});
  	}
  	else{return;}

    // Get real click coordinates (since svg is in viewport)
    svg = document.querySelector('.arm svg');
    var pt = svg.createSVGPoint();
    pt.x = d3.event.clientX;
    pt.y = d3.event.clientY;
    var clickCoords = pt.matrixTransform(svg.getScreenCTM().inverse());

    getRFResponses(cxNeurons,clickCoords);

    var timesForSpikes = cxNeurons[currNeuronIx].timesForSpikes;

    if (browserSupportsAudio) {
      audioObj.addWhiteNoise();
      audioObj.addSpikesToAudio(timesForSpikes);
      audioObj.playBuffer();
    }
    if(corticalClicks===20){enableHints("cortex");corticalClicks+=1;}
  }

});

$(".cortex .table-entry").change(function() {
	// For some reason Chrome started triggering change when val is set programatically 10/02/2017
	if($(this).val()===""){return;}

	var inputBox = $(this);
	var neuronType = $(this).parents('td').attr('neuron');
  var thisNeuronIx = cxNeuronTypes.indexOf(neuronType);
	var correctResponse = cxNeurons[thisNeuronIx].rfDiamCm;

	checkRFsize(neuronType,correctResponse,inputBox);
});

$("button.hint.cortical").click(function(){
	var neuronType = this.getAttribute("neuron");
	var neuronIx = cxNeuronTypes.indexOf(neuronType);
	d3.select(".hints ."+neuronType)
	.transition()
	.duration(0)
	.attr("fill",cxNeurons[neuronIx].colour)
	.each("end",function(){
		d3.select(".hints ."+neuronType)
		.transition()
		.duration(10)
		.delay(500)
		.attr("fill","none");
	});
});
