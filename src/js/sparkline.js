/*!
 * Target and build sparklines
 */

(function() {

    'use strict';


    let types = ['articles', 'notes', 'pens', 'links', 'talks'],
        data;

    if (document.querySelector('#sparkline-articles')
     || document.querySelector('#sparkline-notes')
     || document.querySelector('#sparkline-pens')
     || document.querySelector('#sparkline-links')
     || document.querySelector('#sparkline-talks')) {
        let showEndpoint = true;
        let sparklineColor = '#4f4f4f';
        let endpointColor = 'rgba(235,45,55,0.5)';
        let request = new XMLHttpRequest();
        request.open('GET', '/sparklines.json', true);
        request.onload = function() {
            if (request.status >= 200 && request.status < 400 && request.responseText.length > 0) {
                // Success!
                data = JSON.parse(request.responseText);
                for (let type of types) {
                    if (document.querySelector(`#sparkline-${type}`)) {
                        sparkline(`sparkline-${type}`, data[type], showEndpoint, sparklineColor, 'line', endpointColor);
                    }
                }
            }
            else {
                console.log(`Sparkline request status error: ${request.status}`);
            }
        };
        request.onerror = function() {
            console.log('Sparkline request error');
        };
        request.send();
    }

    let wave = 'sine'; // 'sine', 'square', 'sawtooth', 'triangle'
    let duration = 4000; // milliseconds
    let volume = 0.5;
    let keyStart = 41;
    let keyInterval = 3;
    let keyCount = 13;
    let frequencies = [];
    for (let count = 0; count < keyCount; count++) {
        let frequency =  Math.pow(2, ((count * keyInterval + keyStart - 49) / 12)) * 440;
        frequencies.push(frequency);
    }
    console.log(frequencies);
    ///
    // playSparkline.js
    // Pass in an array of numbers ranging from 0 to 20.
    // by Jeremy Keith <@adactio>
    // https://gist.github.com/adactio/d988edc418aabfa2220456dc548dedc1
    // Licensed under a CC0 1.0 Universal (CC0 1.0) Public Domain Dedication
    // http://creativecommons.org/publicdomain/zero/1.0/
    ///
    function playSparkline(notes) {
        if (!window.AudioContext && !window.webkitAudioContext) {
            return;
        }
        var playing = null;
        var note = 0;
        var output = new (window.AudioContext || window.webkitAudioContext)();
        var instrument = output.createOscillator();
        var amplifier = output.createGain();
        var noteLength = Math.floor(duration / notes.length);
        var playNotes = function() {
            if (note < notes.length) {
                instrument.frequency.value = frequencies[notes[note]];
                note = note + 1;
            } else {
                amplifier.gain.value = 0;
            }
            playing = window.setTimeout(playNotes, noteLength);
        };
        instrument.type = wave;
        instrument.start();
        instrument.connect(amplifier);
        amplifier.gain.value = volume;
        amplifier.connect(output.destination);
        playNotes();
    }

    for (let sparkline of document.querySelectorAll('.sparkline')) {
        sparkline.addEventListener('click', event => {
            let type = sparkline.id.split('-')[1];
            playSparkline(data[type]);
            // Prevent the user from blowing their ears up by stacking sounds
            sparkline.classList.add('non-interactive');
            window.setTimeout(() => {
                sparkline.classList.remove('non-interactive');
            }, duration);
        });
    }

})();
