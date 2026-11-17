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
const dspName = "djembe";
const instance = new FaustWasm2ScriptProcessor(dspName);

// output to window or npm package module
if (typeof module === "undefined") {
  window[dspName] = instance;
} else {
  const exp = {};
  exp[dspName] = instance;
  module.exports = exp;
}

djembe
  .createDSP(audioContext, 1024)
  .then((node) => {
    dspNode = node;
    dspNode.connect(audioContext.destination);
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

function accelerationChange(accx, accy, accz) {
    if(accy < -5) {
        playAudio();
    }
}

function rotationChange(rotx, roty, rotz) {}

function deviceMoved() {
  movetimer = millis();
  statusLabels[2].style("color", "pink");
  //playAudio();
}
function mousePressed() {
  //playAudio();
  // Use this for debugging from the desktop!
}

function deviceTurned() {
  threshVals[1] = turnAxis;
}
function deviceShaken() {
  shaketimer = millis();
  statusLabels[0].style("color", "pink");
}

function playAudio() {
  if (!dspNode) {
    return;
  }
  if (audioContext.state === "suspended") {
    return;
  }
  dspNode.setParamValue("/djembe/gate", 1);
  setTimeout(() => {
    dspNode.setParamValue("/djembe/gate", 0);
  }, 300);
}

//==========================================================================================
// END
//==========================================================================================
