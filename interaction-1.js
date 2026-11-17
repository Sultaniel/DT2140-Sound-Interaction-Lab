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
const dspName = "doorSlide";
const instance = new FaustWasm2ScriptProcessor(dspName);
const doorPositionAddress = "/doorSlide/door/position";
const doorVolumeAddress = "/doorSlide/volume";
const doorPositionMax = 0.5;
const rotationYMin = -90;
const rotationYMax = 90;
const rotationYDeadband = 0.5;
const activeVolume = 0.7;
const stillnessDelay = 300;
let lastRotationY = null;
let stillnessTimeout = null;

// output to window or npm package module
if (typeof module === "undefined") {
  window[dspName] = instance;
} else {
  const exp = {};
  exp[dspName] = instance;
  module.exports = exp;
}

doorSlide.createDSP(audioContext, 1024)
  .then((node) => {
    dspNode = node;
    dspNode.connect(audioContext.destination);
    dspNode.setParamValue(doorVolumeAddress, 0);
    console.log("Door DSP params:", dspNode.getParams());
  })
  .catch((error) => {
    console.error("Failed to load the door DSP:", error);
  });

//==========================================================================================
// INTERACTIONS
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Trigger the door sound only when Y rotation changes.
//------------------------------------------------------------------------------------------
//
//==========================================================================================

function accelerationChange(accx, accy, accz) {}

function rotationChange(rotx, roty, rotz) {
  if (!dspNode || audioContext.state !== "running" || !Number.isFinite(roty)) {
    return;
  }

  if (lastRotationY === null) {
    lastRotationY = roty;
    return;
  }

  if (Math.abs(roty - lastRotationY) < rotationYDeadband) {
    return;
  }

  lastRotationY = roty;
  const normalized = Math.max(
    0,
    Math.min(1, (roty - rotationYMin) / (rotationYMax - rotationYMin))
  );
  dspNode.setParamValue(doorPositionAddress, normalized * doorPositionMax);
  dspNode.setParamValue(doorVolumeAddress, activeVolume);

  clearTimeout(stillnessTimeout);
  stillnessTimeout = setTimeout(() => {
    dspNode.setParamValue(doorVolumeAddress, 0);
    stillnessTimeout = null;
  }, stillnessDelay);
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
// END
//==========================================================================================
