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
const motorGateAddress = "/smash/gate";
const tubeResAddress = "/smash/tubeRes";
const ROTATION_THRESHOLD = 1.5;
const NEUTRAL_ROTATION_LIMIT = 20;
const SLAP_COOLDOWN = 200;
const SLAP_DURATION = 100;
let previousRotationX = null;
let previousRotationZ = null;
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
    dspNode.setParamValue(motorGateAddress, 0);
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
// Trigger a slap with X or Z rotation near the neutral position.
//------------------------------------------------------------------------------------------
//
//==========================================================================================

function accelerationChange(accx, accy, accz) {
}

function rotationChange(rotx, roty, rotz) {
  if (!Number.isFinite(rotx) || !Number.isFinite(rotz)) return;

  if (previousRotationX === null || previousRotationZ === null) {
    previousRotationX = rotx;
    previousRotationZ = rotz;
    return;
  }

  const changeX = Math.abs(rotx - previousRotationX);
  const changeZ = Math.abs(rotz - previousRotationZ);
  previousRotationX = rotx;
  previousRotationZ = rotz;

  if (
    !dspNode ||
    audioContext.state !== "running" ||
    millis() - lastSlap < SLAP_COOLDOWN
  ) {
    return;
  }

  const xCanTrigger =
    changeX >= ROTATION_THRESHOLD &&
    Math.abs(rotx) < NEUTRAL_ROTATION_LIMIT;
  const zCanTrigger =
    changeZ >= ROTATION_THRESHOLD &&
    Math.abs(rotz) < NEUTRAL_ROTATION_LIMIT;

  if (!xCanTrigger && !zCanTrigger) return;

  const triggerAngle =
    xCanTrigger && (!zCanTrigger || changeX >= changeZ) ? rotx : rotz;
  lastSlap = millis();
  dspNode.setParamValue(tubeResAddress, Math.abs(triggerAngle) / NEUTRAL_ROTATION_LIMIT);
  dspNode.setParamValue(motorGateAddress, 1);

  setTimeout(() => {
    dspNode.setParamValue(motorGateAddress, 0);
    dspNode.setParamValue(tubeResAddress, 0);
  }, SLAP_DURATION);
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
// X or Z rotation changes trigger a slap only within 20 degrees of neutral.
// tubeRes follows the triggering axis angle during the slap and resets to zero.
//------------------------------------------------------------------------------------------
//
//==========================================================================================

//==========================================================================================
// END
//==========================================================================================
