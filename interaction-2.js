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
const rotationZMin = 44;
const rotationZMax = 300;

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
// Map Z-axis rotation to the engine's maximum speed.
//------------------------------------------------------------------------------------------
//
//==========================================================================================

function accelerationChange(accx, accy, accz) {}

function rotationChange(rotx, roty, rotz) {
  if (!dspNode || audioContext.state !== "running" || !Number.isFinite(rotz)) {
    return;
  }

  const maxSpeed = Math.max(
    0,
    Math.min(1, (rotz - rotationZMin) / (rotationZMax - rotationZMin))
  );
  dspNode.setParamValue(maxSpeedAddress, maxSpeed);
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
// Z rotation from 44 to 300 degrees maps maxSpeed from 0 to 1.
//------------------------------------------------------------------------------------------
//
//==========================================================================================

//==========================================================================================
// END
//==========================================================================================
