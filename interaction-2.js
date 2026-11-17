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
const rotationXMin = 30;
const rotationXMax = 80;
const rotationZMin = 60;
const rotationZMax = 100;

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
    dspNode.setParamValue(tubeResAddress, 0);
  })
  .catch((error) => {
    console.error("Failed to load the smash DSP:", error);
  });

//==========================================================================================
// INTERACTIONS
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Map X-axis rotation to the engine's maximum speed.
//------------------------------------------------------------------------------------------
//
//==========================================================================================

function accelerationChange(accx, accy, accz) {}

function rotationChange(rotx, roty, rotz) {
  if (!dspNode || audioContext.state !== "running") {
    return;
  }

  const isInAllowedOrientation =
    Number.isFinite(rotx) &&
    Number.isFinite(roty) &&
    Number.isFinite(rotz) &&
    roty < 0 &&
    rotz >= rotationZMin &&
    rotz <= rotationZMax;
  const maxSpeed = isInAllowedOrientation
    ? Math.max(0, Math.min(1, (rotx - rotationXMin) / (rotationXMax - rotationXMin)))
    : 0;
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
// X rotation controls maxSpeed only when Y rotation is negative and Z rotation is 60..100.
//------------------------------------------------------------------------------------------
//
//==========================================================================================

//==========================================================================================
// END
//==========================================================================================
