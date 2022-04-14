// control.js

/**
 * Audio recorder object. Handles setting up the audio context,
 * accessing the mike, and creating the Recorder object.
 */
lexaudio.audioRecorder = function() {
  /**
   * Creates an audio context and calls getUserMedia to request the mic (audio).
   * If the user denies access to the microphone, the returned Promise rejected
   * with a PermissionDeniedError
   * @returns {Promise}
   */
  var requestDevice = function() {

    if (typeof audio_context === 'undefined') {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      audio_context = new AudioContext();
    }

    return navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function(stream) {
        audio_stream = stream;
      });
  };

  var createRecorder = function() {
    return recorder(audio_context.createMediaStreamSource(audio_stream));
  };

  return {
    requestDevice: requestDevice,
    createRecorder: createRecorder
  };

};


   /**
    * On audio supported callback: `onAudioSupported`.
    *
    * @callback onAudioSupported
    * @param {boolean}
    */

   /**
    * Checks that getUserMedia is supported and the user has given us access to the mic.
    * @param {onAudioSupported} callback - Called with the result.
    */
   var supportsAudio = function(callback) {
     if (navigator.mediaDevices.getUserMedia) {
       audioRecorder = lexaudio.audioRecorder();
       audioRecorder.requestDevice()
         .then(function(stream) { callback(true); })
         .catch(function(error) { callback(false); });
     } else {
       callback(false);
     }
   };

   // recorder.js

   // Create a ScriptProcessorNode with a bufferSize of 4096 and a single input and output channel
   var recording, node = source.context.createScriptProcessor(4096, 1, 1);

   /**
    * The onaudioprocess event handler of the ScriptProcessorNode interface. It is the EventHandler to be
    * called for the audioprocess event that is dispatched to ScriptProcessorNode node types.
    * @param {AudioProcessingEvent} audioProcessingEvent - The audio processing event.
    */
   node.onaudioprocess = function(audioProcessingEvent) {
     if (!recording) {
       return;
     }

     worker.postMessage({
       command: 'record',
       buffer: [
         audioProcessingEvent.inputBuffer.getChannelData(0),
       ]
     });
   };

   /**
    * Sets recording to true.
    */
   var record = function() {
     recording = true;
   };

   /**
    * Sets recording to false.
    */
   var stop = function() {
     recording = false;
   };

   // worker.js

  var recLength = 0,
      recBuffer = [];

  function record(inputBuffer) {
    recBuffer.push(inputBuffer[0]);
    recLength += inputBuffer[0].length;
  }

  // worker.js

     function exportBuffer() {
       // Merge
       var mergedBuffers = mergeBuffers(recBuffer, recLength);
       // Downsample
       var downsampledBuffer = downsampleBuffer(mergedBuffers, 16000);
       // Encode as a WAV
       var encodedWav = encodeWAV(downsampledBuffer);
       // Create Blob
       var audioBlob = new Blob([encodedWav], { type: 'application/octet-stream' });
       postMessage(audioBlob);
     }

     function mergeBuffers(bufferArray, recLength) {
     var result = new Float32Array(recLength);
     var offset = 0;
     for (var i = 0; i < bufferArray.length; i++) {
       result.set(bufferArray[i], offset);
       offset += bufferArray[i].length;
     }
     return result;
   }

   // worker.js

      function downsampleBuffer(buffer) {
            if (16000 === sampleRate) {
              return buffer;
            }
        var sampleRateRatio = sampleRate / 16000;
        var newLength = Math.round(buffer.length / sampleRateRatio);
        var result = new Float32Array(newLength);
        var offsetResult = 0;
        var offsetBuffer = 0;
        while (offsetResult < result.length) {
          var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
          var accum = 0,
            count = 0;
          for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
            accum += buffer[i];
            count++;
          }
          result[offsetResult] = accum / count;
          offsetResult++;
          offsetBuffer = nextOffsetBuffer;
        }
        return result;
      }

      // worker.js

         function encodeWAV(samples) {
           var buffer = new ArrayBuffer(44 + samples.length * 2);
           var view = new DataView(buffer);

           writeString(view, 0, 'RIFF');
           view.setUint32(4, 32 + samples.length * 2, true);
           writeString(view, 8, 'WAVE');
           writeString(view, 12, 'fmt ');
           view.setUint32(16, 16, true);
           view.setUint16(20, 1, true);
           view.setUint16(22, 1, true);
           view.setUint32(24, sampleRate, true);
           view.setUint32(28, sampleRate * 2, true);
           view.setUint16(32, 2, true);
           view.setUint16(34, 16, true);
           writeString(view, 36, 'data');
           view.setUint32(40, samples.length * 2, true);
           floatTo16BitPCM(view, 44, samples);

           return view;
         }

         // index.html

            var lexruntime = new AWS.LexRuntime({
                region: 'us-east-1',
                credentials: new AWS.Credentials('...', '...', null)
            });

            var params = {
                botAlias: '$LATEST',
                botName: 'OrderFlowers',
                contentType: 'audio/x-l16; sample-rate=16000',
                userId: 'BlogPostTesting',
                accept: 'audio/mpeg'
            };

            params.inputStream = ...;
            lexruntime.postContent(params, function(err, data) {
                if (err) {
                    // an error occured
                } else {
                    // success, now let's play the response
                }
            });
            // control
             /**
              * On playback complete callback: `onPlaybackComplete`.
              *
              * @callback onPlaybackComplete
              */

             /**
              * Plays the audio buffer with an HTML5 audio tag.
              * @param {Uint8Array} buffer - The audio buffer to play.
              * @param {?onPlaybackComplete} callback - Called when audio playback is complete.
              */
             var play = function(buffer, callback) {
               var myBlob = new Blob([buffer], { type: 'audio/mpeg' });
               var audio = document.createElement('audio');
               var objectUrl = window.URL.createObjectURL(myBlob);
               audio.src = objectUrl;
               audio.addEventListener('ended', function() {
                 audio.currentTime = 0;
                 if (typeof callback === 'function') {
                   callback();
                 }
               });
               audio.play();
               recorder.clear();
             };
             // recorder.js

                 var analyser = source.context.createAnalyser();
                 analyser.minDecibels = -90;
                 analyser.maxDecibels = -10;
                 analyser.smoothingTimeConstant = 0.85;


                 // recorder.js

                    var startSilenceDetection = function() {
                      analyser.fftSize = 2048;
                      var bufferLength = analyser.fftSize;
                      var dataArray = new Uint8Array(bufferLength);

                      analyser.getByteTimeDomainData(dataArray);

                      var curr_value_time = (dataArray[0] / 128) - 1.0;

                      if (curr_value_time > 0.01 || curr_value_time < -0.01) {
                        start = Date.now();
                      }
                      var newtime = Date.now();
                      var elapsedTime = newtime - start;
                      if (elapsedTime > 1500) {
                        onSilence();
                      }
                    };

                    // renderer.js

                       /**
                        * Clears the canvas and draws the dataArray.
                        * @param {Uint8Array} dataArray - The time domain audio data to visualize.
                        * @param {number} bufferLength - The FFT length.
                        */
                       var visualizeAudioBuffer = function(dataArray, bufferLength) {
                         var WIDTH = canvas.width;
                         var HEIGHT = canvas.height;
                         var animationId;
                         canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

                         /**
                          * Will be called at about 60 times per second. If listening, draw the dataArray.
                          */
                         function draw() {
                           if (!listening) {
                             return;
                           }

                           canvasCtx.fillStyle = 'rgb(249,250,252)';
                           canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
                           canvasCtx.lineWidth = 1;
                           canvasCtx.strokeStyle = 'rgb(0,125,188)';
                           canvasCtx.beginPath();

                           var sliceWidth = WIDTH * 1.0 / bufferLength;
                           var x = 0;

                           for (var i = 0; i < bufferLength; i++) {
                             var v = dataArray[i] / 128.0;
                             var y = v * HEIGHT / 2;
                             if (i === 0) {
                               canvasCtx.moveTo(x, y);
                             } else {
                               canvasCtx.lineTo(x, y);
                             }
                             x += sliceWidth;
                           }

                           canvasCtx.lineTo(canvas.width, canvas.height / 2);
                           canvasCtx.stroke();
                         }

                         // Register our draw function with requestAnimationFrame.
                         if (typeof animationId === 'undefined') {
                           animationId = requestAnimationFrame(draw);
                         }
                       };
                     };
