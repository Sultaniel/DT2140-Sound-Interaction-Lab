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
const dspName = "door";
const instance = new FaustWasm2ScriptProcessor(dspName);


// output to window or npm package module
if (typeof module === "undefined") {
  window[dspName] = instance;
} else {
  const exp = {};
  exp[dspName] = instance;
  module.exports = exp;
}

door.createDSP(audioContext, 1024)
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
//------------------------------------------------------------------------------------------
//
//==========================================================================================

function accelerationChange(accx, accy, accz) {}

function rotationChange(rotx, roty, rotz) {
  
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

function playAudio(maxSpeed) {
  if (!dspNode) {
    return;
  }
  if (audioContext.state === "suspended") {
    return;
  }
  dspNode.setParamValue("/door/position", 1);
  setTimeout(() => {
    dspNode.setParamValue("/door/position", 1);
  }, 100);
}

//==========================================================================================
// END
//==========================================================================================
