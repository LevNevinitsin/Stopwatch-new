onmessage = function (evt) {
  const evtData = evt.data;

  if (evtData.message === 'start') {
    stopwatchInterval = setInterval(sendMessage, evtData.refreshInterval);
  } else {
    clearInterval(stopwatchInterval);
  }
}

function sendMessage() { postMessage(1) };
