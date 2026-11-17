//==========================================================================================

function findByAddress(obj, address) {
    if (obj.address === address) return obj;
    if (Array.isArray(obj)) {
        for (const el of obj) {
            const found = findByAddress(el, address);
            if (found) return found;
        }
    } else if (obj && typeof obj === 'object') {
        for (const key in obj) {
            const found = findByAddress(obj[key], address);
            if (found) return found;
        }
    }
    return null;
}

//==========================================================================================

function getParamMinMax(param) {
    const minValue = param?.min;
    const maxValue = param?.max;
    return [minValue, maxValue]
}

//==========================================================================================

async function setMotionListeners() {
  const permissionRequests = [];

  if (
    typeof DeviceMotionEvent !== "undefined" &&
    typeof DeviceMotionEvent.requestPermission === "function"
  ) {
    permissionRequests.push(DeviceMotionEvent.requestPermission());
  }

  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    permissionRequests.push(DeviceOrientationEvent.requestPermission());
  }

  const permissionStates = await Promise.all(permissionRequests);
  if (permissionStates.some((state) => state !== "granted")) {
    throw new Error("Permission to access motion or orientation sensors was denied.");
  }

  console.log("Permission granted to motion and orientation sensors");
}

//==========================================================================================

const audioContext = new AudioContext();