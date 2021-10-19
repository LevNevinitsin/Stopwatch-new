
const sendCurrentDate = () => postMessage(Date.now());

onmessage = function (evt) {
  if (evt.data.message === 'start') {
    stopwatchInterval = setInterval(sendCurrentDate, 63);
  } else {
    clearInterval(stopwatchInterval);
  }
}
