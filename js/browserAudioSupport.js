var browserSupportsAudio = window.AudioContext || window.webkitAudioContext || false;
if (!browserSupportsAudio) {
	alert("Sorry, the Web Audio API is not supported by your browser, " +
	"so you won't be able to hear the spikes. Please consider upgrading " +
	"to the latest version or downloading Google Chrome or Mozilla Firefox.");
}
