//************************************************
// Selective note quantizer
//************************************************

var octaveMap = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
var keyboardMap = {};
var keyboardOctaves = 8
var offsetC0 = 24
keyboardMap['Select'] = -1;
for (var octave = 0; octave < keyboardOctaves; octave++) {
	for (var note = 0; note < 12; note++) {
    		keyboardMap['' + octaveMap[note] + octave] = octave * 12 + note + offsetC0;
    	}
}
var keyboardKeys = Object.keys(keyboardMap);

var PluginParameters = []
var maxRanges = 10;
var startLabel = "Lower key, range ";
var endLabel = "Upper key, range ";
for (range = 0; range < maxRanges; range++) {
	PluginParameters.push({name:startLabel + range, type:"menu", valueStrings:keyboardKeys, defaultValue:0, hidden:false});
	PluginParameters.push({name:endLabel + range, type:"menu", valueStrings:keyboardKeys, defaultValue:0, hidden:false});
}

var quantizeNotes = []
initializeQuantizeNotes();

function initializeQuantizeNotes()
{
	for(note = 0; note < (offsetC0 + keyboardOctaves * 12); note++) {
		quantizeNotes[note] = false;
	}
}

function ParameterChanged(param, value) {
	RecalculateTransformationTable();
}

function RecalculateTransformationTable() {
	initializeQuantizeNotes();
	for (var range = 0; range < maxRanges; range++) {
		var lowerNoteNumber = GetParameter(startLabel + range);
		var upperNoteNumber = GetParameter(endLabel + range);
		if (!lowerNoteNumber || !upperNoteNumber) continue;
		for (var note = lowerNoteNumber - 1; note < upperNoteNumber; note++) {
			quantizeNotes[note + offsetC0] = true;
		}
	}
}

var NeedsTimingInfo = true

function HandleMIDI(event)
{
	var info = GetTimingInfo();

	noteShouldBeQuantized = quantizeNotes[event.pitch];
	currentBeat = Math.trunc(info.blockStartBeat);
	currentBar = Math.trunc(currentBeat / (info.meterNumerator )); // First bar == 0
	currentBeatInBar = (currentBeat - 1) % info.meterNumerator; // First beat == 0 (MS calls it 1)
	if (info.playing && noteShouldBeQuantized) 
	{
		offset = (info.meterNumerator - currentBeatInBar)
		newQuantizedBeat = currentBeat + offset;
		event.sendAtBeat(newQuantizedBeat);
	} else {
		event.send();
	}
}
