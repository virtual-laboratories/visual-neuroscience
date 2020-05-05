// create web audio api context
function AudioSpikes(maxTime,channels,bufferScale) {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	// 1 channel for mono, 2 for stereo
	this.audioCtx = new AudioContext();
	// play empty buffer to unmute audio
	var buffer = this.audioCtx.createBuffer(1, 1, 22050);
	var dummy = this.audioCtx.createBufferSource();
	dummy.buffer = buffer;
	dummy.connect(this.audioCtx.destination);
	dummy.start(0);
	dummy.disconnect();

	this.channels = channels;
	this.bufferScale = bufferScale || 0.1;
	// Create an empty two second stereo buffer at the
	// sample rate of the AudioContext
	this.frameCount = this.audioCtx.sampleRate * maxTime/1000;
	this.myArrayBuffer = this.audioCtx.createBuffer(channels, this.frameCount, this.audioCtx.sampleRate);
	// Add white noise to the buffer
	this.addWhiteNoise = function() {
		// Fill the buffer with white noise for each channel;
		for (var channel = 0; channel < this.channels; channel++) {
			this.nowBuffering = this.myArrayBuffer.getChannelData(channel);
			for (var i = 0; i < this.frameCount; i++) {
				this.nowBuffering[i] = this.bufferScale*0.1*(Math.random() * 2 - 1);
			}
		}
	};

	this.addSpikesToAudio = function(spikeTimes){
		for (var i = 0; i<spikeTimes.length;i++){
			currTime = spikeTimes[i];
			currSampleTime = Math.round(currTime*this.audioCtx.sampleRate/1000);
			for (j=0;j<this.audioCtx.sampleRate/2000;j++) {
				this.nowBuffering[currSampleTime+j] = this.bufferScale;
				this.nowBuffering[currSampleTime+this.audioCtx.sampleRate/1000+j] = -this.bufferScale;
			}
		}
	};

	this.playBuffer = function() {
		source = this.audioCtx.createBufferSource();
		source.buffer = this.myArrayBuffer;
		source.connect(this.audioCtx.destination);
		source.start(0);
	};

	this.playPureTone = function(frequency,intensity,toneDuration){
		// create Oscillator and gain node
		var oscillator = this.audioCtx.createOscillator();
		var gainNode = this.audioCtx.createGain();
		// connect oscillator to gain node to speakers
		oscillator.connect(gainNode);
		gainNode.connect(this.audioCtx.destination);
		oscillator.type = 'sine';

		oscillator.frequency.value = frequency; // value in hertz
		oscillator.detune.value = 100; // value in cents
		gainNode.gain.value = intensity*0.00028-0.0024;

		oscillator.start(0);
		// Tone lasts one second
		oscillator.stop(this.audioCtx.currentTime + toneDuration/1000);
	};

	this.playStereo = function(panValue,toneDuration){
		// create Oscillator and gain node
		var oscillator = this.audioCtx.createOscillator();
		oscillator.type = 'sine';
		oscillator.frequency.value = 300; // value in hertz
		oscillator.detune.value = 100; // value in cents

		// Create a stereo panner
		var panNode = this.audioCtx.createStereoPanner();
		panNode.pan.value = panValue;
		oscillator.connect(panNode);
		panNode.connect(this.audioCtx.destination);

		// Tone lasts one second
		oscillator.start(0);
		oscillator.stop(this.audioCtx.currentTime + toneDuration/1000);
	};

	this.triggerSound = function(){

		function playSoundIos(event) {
			document.removeEventListener('touchstart', playSoundIos);
			playBuffer();
		}

		if (/iPad|iPhone/.test(navigator.userAgent)) {
			document.addEventListener('touchstart', playSoundIos);
		}
		else { // Android etc. or Safari, but not on iPhone
			playBuffer();
		}
	};
}
