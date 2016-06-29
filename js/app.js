var minutes = 25;
var seconds = 0;
var paused  = false
var ticker; //The "setInterval" object
var countingBreak = false; //Currently counting for a break or a task
var muted = false;

//Getting the "ticking" audio through the web audio API (fix for Safari looping gaps)
var tickBuffer;
var tick;
var audioContext = new (window.AudioContext || window.webkitAudioContext)();
var request = new XMLHttpRequest();
request.open('GET', 'audio/smalltick.wav');
request.responseType = 'arraybuffer';
request.onload = function() {
  audioContext.decodeAudioData(request.response, function(buffer) {
    tickBuffer = buffer;
  }, function(e) {
    console.log('Playback error! ', e);
  });
}
request.send();

var ding = new Audio('audio/ding.wav');

var updateTimer = function() {
  //If the timer is paused, don't update anything
  //That's to prevent restarting the interval at pause otherwise
  if (paused) {
    return;
  }

  //When seconds reach zero, start a new minute
  if (seconds <= 0) {
    seconds = 60;

    //Add leading zeros to single-digit numbers
    document.querySelector("#minutes").textContent = ('0' + --minutes).slice(-2);
  }

  document.querySelector("#seconds").textContent = ('0' + --seconds).slice(-2);

  //Finished counting
  if (minutes <= 0 && seconds <= 0) {
    window.clearInterval(ticker);
    ding.play();
    tick.stop();

    changeButton("play");
    document.querySelector("#btn-set").removeAttribute("disabled");

    if (!countingBreak) {
      setTimer(5);
      countingBreak = true;
      document.querySelector("#timer").style.color = "green";
    } else {
      document.querySelector("#btn-start").setAttribute("disabled", true);
      countingBreak = false;
      document.querySelector("#timer").style.color = "black";
    }

  }
};

//Re-create the source node because it gets destroyed by calling stop() on it
var playTick = function() {
  tick = audioContext.createBufferSource();
  tick.connect(audioContext.destination);
  tick.buffer = tickBuffer;
  tick.loop = true;
  // //Adding a bit of a delay in the loop (because of the length of the audio clip)
  tick.loopEnd = 0.5;
  tick.start(0);
}

var startTicker = function() {
  if (!muted) {
    playTick();
  }
  
  changeButton("pause");

  var disableOnTick = document.querySelectorAll(".disable-on-tick");

  for (var i = 0; i < disableOnTick.length; i++) {
    disableOnTick[i].setAttribute("disabled", true);
  }

  //If pause was clicked, release the flag, don't reset the interval
  if (paused) {
    paused = false;
  } else {
    ticker = window.setInterval(updateTimer, 1000);
  }
};

var setTimer = function(minutesToSet) {
  if (minutesToSet) {
    minutes = ('0' + minutesToSet).slice(-2);
  } else {
    minutes = ('0' + document.querySelector("#txt-minutes").value).slice(-2);
  }
  
  seconds = '00';

  document.querySelector("#minutes").textContent = minutes;
  document.querySelector("#seconds").textContent = seconds;

  document.querySelector("#btn-start").removeAttribute("disabled");
}

var pauseTicker = function() {
  paused = true;
  tick.stop()

  changeButton("play");

  var disableOnTick = document.querySelectorAll(".disable-on-tick");

  for (var i = 0; i < disableOnTick.length; i++) {
    disableOnTick[i].removeAttribute("disabled");
  }
}

//For the mute checkbox
var muteTicking = function() {
  tick.stop()
}

var toggleAudio = function(checkbox) {
  if (checkbox.checked) {
    muteTicking();
    muted = true;
  } else {
    //Only play audio if not in pause mode
    if (!paused) {
      playTick();
    }
    muted = false;
  }
}

var changeButton = function(mode) {
  if (mode === "play") {
    document.querySelector("#btn-start").querySelector("i").setAttribute("class", "fa fa-play");
    document.querySelector("#btn-start").removeEventListener("click", pauseTicker);
    document.querySelector("#btn-start").addEventListener("click", startTicker);
  } else {
    document.querySelector("#btn-start").querySelector("i").setAttribute("class", "fa fa-pause");
    document.querySelector("#btn-start").removeEventListener("click", startTicker);
    document.querySelector("#btn-start").addEventListener("click", pauseTicker);
  }
}

document.querySelector("#btn-start").addEventListener("click", startTicker);
