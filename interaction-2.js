//==========================================================================================
// AUDIO SETUP
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit just where you're asked to!
//------------------------------------------------------------------------------------------
//
//==========================================================================================
let dspNode = null;

const dspName = "smash";
const instance = new FaustWasm2ScriptProcessor(dspName);
const maxSpeedAddress = "/smash/maxSpeed";
const motorGateAddress = "/smash/gate";
const tubeResAddress = "/smash/tubeRes";
const SLAP_THRESHOLD = 15;
let prevMag = 0;
let lastSlap = 0;

// output to window or npm package module
if (typeof module === "undefined") {
  window[dspName] = instance;
} else {
  const exp = {};
  exp[dspName] = instance;
  module.exports = exp;
}

smash
  .createDSP(audioContext, 1024)
  .then((node) => {
    dspNode = node;
    dspNode.connect(audioContext.destination);
    console.log("params: ", dspNode.getParams());
    dspNode.setParamValue(motorGateAddress, 1);
  })
  .catch((error) => {
    console.error("Failed to load the smash DSP:", error);
  });

//==========================================================================================
// INTERACTIONS
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Map Z-axis rotation to maximum speed and X-axis rotation to tube resonance.
//------------------------------------------------------------------------------------------
//
//==========================================================================================

function accelerationChange(accx, accy, accz) {
  if (!dspNode || audioContext.state !== "running") return;

  const mag = Math.hypot(accx, accy, accz);
  const jump = Math.abs(mag - prevMag); // sudden change = impact
  prevMag = mag;

  if (jump > SLAP_THRESHOLD && millis() - lastSlap > 200) {
    lastSlap = millis();
    dspNode.setParamValue(maxSpeedAddress, mapRange(jump, SLAP_THRESHOLD, 40));
    dspNode.setParamValue(motorGateAddress, 1);
    setTimeout(() => dspNode.setParamValue(motorGateAddress, 0), 100);
  }
}

function rotationChange(rotx, roty, rotz) {
  if (!dspNode || audioContext.state !== "running" || !Number.isFinite(rotx))
    return;
  // slight increase only: output limited to 0 - 0.3
  dspNode.setParamValue(tubeResAddress, mapRange(rotx, 3, 85, 0, 0.3));  
}

function mousePressed() {
  // playAudio()
  // Use this for debugging from the desktop!
}

function deviceMoved() {
  movetimer = millis();
  statusLabels[2].style("color", "pink");
}

function deviceTurned() {
  threshVals[1] = turnAxis;
}
function deviceShaken() {
  shaketimer = millis();
  statusLabels[0].style("color", "pink");
}

//==========================================================================================
// AUDIO INTERACTION
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Z rotation maps 35..200 degrees to maxSpeed 0..1.
// X rotation maps 3..85 degrees to tubeRes 0..1.
//------------------------------------------------------------------------------------------
//
//==========================================================================================

//==========================================================================================
// END
//==========================================================================================
