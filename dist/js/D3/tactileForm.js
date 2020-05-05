var formNeuronColours = ['#1b9e77','#7570b3','#e7298a'];
var formNeuronTypes = ['afferent','area3b','area1'];
var formTrialDuration = 2000;
var handMovementDur = 400;
var yPos = [90,150,210,30,270];
var nrTrials = [0,0,0,0,0];
var paperProps = {width:200,height:300};
var xPos = [paperProps.width/2-25,paperProps.width/2+25];
var braillePos = [[xPos[0],yPos[0]],[xPos[1],yPos[0]],
[xPos[0],yPos[1]],[xPos[1],yPos[1]],
[xPos[0],yPos[2]],[xPos[1],yPos[2]]];

var currBrailleDots, currBraillePos;
setupBraille(".braille");
initialiseBraille();

var formNeurons = formNeuronTypes.map(function(type,index){
	thisObj = {
		tab: 'form',
		type: type,
		colour: formNeuronColours[index],
		panel: index,
		vis: new SpikeVisualization({width: 450, height: 100},formTrialDuration),
		properties: new FormNeuron(type)
	};
  thisObj.vis.spatialPlots(type);
	thisObj.properties.firingRates();
	return thisObj;
});
if (browserSupportsAudio) {formAudioObj = new AudioSpikes(formTrialDuration,1,0.2);}

d3.select('.arrows').on("click",function(e){
  if (d3.event.defaultPrevented) return;

  if(formNeurons.every(function(x) {return x.vis.finished;})){
    formNeurons.forEach(function(neurObj){
      neurObj.vis.finished = false;
    });
  }
  else{return;}

  // Get real click coordinates (since svg is in viewport)
	svg = document.querySelector('.braille svg');
	var pt = svg.createSVGPoint();
	pt.x = d3.event.clientX;
	pt.y = d3.event.clientY;
	var clickCoords = pt.matrixTransform(svg.getScreenCTM().inverse());
  var currY = clickCoords.y;

  var closest = yPos.reduce(function (prev, curr) {
    return (Math.abs(curr - currY) < Math.abs(prev - currY) ? curr : prev);
  });

  d3.select("#hand")
  .transition()
  .duration(handMovementDur)
  .attr("x",0)
  .attr("y",closest-25)
  .each("end",function(){

    getBrailleResponses(formNeurons,closest);
    var whichAudio = $('input[name=fiberAudio]:checked').val();
    var timesForSpikes = formNeurons[whichAudio].timesForSpikes;
    if (browserSupportsAudio) {
      formAudioObj.addWhiteNoise();
      formAudioObj.addSpikesToAudio(timesForSpikes);
      formAudioObj.playBuffer();
    }

    d3.select(this)
    .transition()
    .ease("linear")
    .duration(formTrialDuration)
    .attr("x",paperProps.width)
    .attr("y",closest-25)
    .each("end",function(){
      d3.select(this)
      .transition()
      .duration(handMovementDur)
      .attr("x",-80)
      .attr("y",150);
    });
  });

});
