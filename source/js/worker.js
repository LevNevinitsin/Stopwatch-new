
const sendCurrentDate = () => { postMessage(1) };

onmessage = function (evt) {
  const evtData = evt.data;

  if (evtData.message === 'start') {
    stopwatchInterval = setInterval(sendCurrentDate, evtData.refreshInterval);
  } else {
    clearInterval(stopwatchInterval);
  }
}
