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
let dspNodeParams = null;
let jsonParams = null;

// Change here to ("tuono") depending on your wasm file name
const dspName = "door";
const instance = new FaustWasm2ScriptProcessor(dspName);
const doorPositionAddress = "/door/door/position";
const doorVolumeAddress = "/door/volume";
const doorPositionMax = 0.5;
const accelerationXMin = -9.81;
const accelerationXMax = 9.81;
const accelerationXDeadband = 0.15;
const movementReleaseDelay = 250;
const doorSoundVolume = 0.7;
let lastAccelerationX = null;
let doorSilenceTimeout = null;

// output to window or npm package module
if (typeof module === "undefined") {
  window[dspName] = instance;
} else {
  const exp = {};
  exp[dspName] = instance;
  module.exports = exp;
}

// The name should be the same as the WASM file, so change tuono with brass if you use brass.wasm
door
  .createDSP(audioContext, 1024)
  .then((node) => {
    dspNode = node;
    dspNode.connect(audioContext.destination);
    console.log("params: ", dspNode.getParams());
    const jsonString = dspNode.getJSON();
    jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
    dspNodeParams = jsonParams;
    dspNode.setParamValue(doorVolumeAddress, 0);
  })
  .catch((error) => {
    console.error("Failed to load the door DSP:", error);
  });

//==========================================================================================
// INTERACTIONS
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Map horizontal phone acceleration to the door position control.
//------------------------------------------------------------------------------------------
//
//==========================================================================================

function accelerationChange(accx, accy, accz) {
  if (!dspNode || audioContext.state !== "running") {
    return;
  }

  if (lastAccelerationX === null) {
    lastAccelerationX = accx;
    return;
  }

  if (Math.abs(accx - lastAccelerationX) < accelerationXDeadband) {
    return;
  }

  lastAccelerationX = accx;
  const normalized = Math.max(
    0,
    Math.min(
      1,
      (accx - accelerationXMin) / (accelerationXMax - accelerationXMin)
    )
  );
  dspNode.setParamValue(doorPositionAddress, normalized * doorPositionMax);
  dspNode.setParamValue(doorVolumeAddress, doorSoundVolume);

  clearTimeout(doorSilenceTimeout);
  doorSilenceTimeout = setTimeout(() => {
    dspNode.setParamValue(doorVolumeAddress, 0);
    doorSilenceTimeout = null;
  }, movementReleaseDelay);
}

function rotationChange(rotx, roty, rotz) {}

function mousePressed() {
  console.log("Mouse pressed", {
    dspReady: !!dspNode,
    audioState: audioContext.state,
  });
  accelerationChange(accelerationX, accelerationY, accelerationZ);
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

function getMinMaxParam(address) {
  const exampleMinMaxParam = findByAddress(dspNodeParams, address);
  // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
  const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
  console.log("Min value:", exampleMinValue, "Max value:", exampleMaxValue);
  return [exampleMinValue, exampleMaxValue];
}

//==========================================================================================
// DOOR POSITION
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// accelerationX maps from approximately -1g..1g to the door's 0..0.5 range.
//------------------------------------------------------------------------------------------
//
//==========================================================================================

//==========================================================================================
// END
//==========================================================================================
