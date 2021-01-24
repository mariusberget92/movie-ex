// Shell access for links in the application
const shell = require('electron').shell;

// Apparently we need this...
import regeneratorRuntime from 'regenerator-runtime';

// Movii class
//import { Movii } from './class/Movii'
import { Movie } from './class/Movie';

// App styling
import 'bootstrap-css';
import './assets/app.scss';
import 'perfect-scrollbar/css/perfect-scrollbar.css';
import 'pretty-checkbox/src/pretty-checkbox.scss'
import PerfectScrollbar from 'perfect-scrollbar';
import showdown from 'showdown';
import { readFileSync } from 'fs';
const converter = new showdown.Converter();

// When DOM is loaded, run the app
document.addEventListener("DOMContentLoaded", function() {

    // Droparea element
    var droparea = document.querySelector('#droparea');

    // Create scrollbars
    const ps = new PerfectScrollbar('#logoutput > .body');
    const ps2 = new PerfectScrollbar('#readme .body');

    // Push readme file into readme area in the application
    const readme = readFileSync('dist/readme.md').toString();
    var readmeElement = document.querySelector('#readme .body');
    readmeElement.innerHTML = converter.makeHtml(readme);

    // On dragOver
    droparea.ondragover = function(e) {
        e.preventDefault();
        droparea.classList.add('file-hover');
        e.dataTransfer.dropEffect = 'copy';
        return false;
    };  

    // On dragLeave
    droparea.ondragleave = function(e) {
        droparea.classList.remove('file-hover');
        return false;
    };

    // On drop
    droparea.ondrop = async function(e) {
        e.preventDefault();
        droparea.classList.remove('file-hover');

        // Get settings state
        var extractRar = document.querySelector('.setting input[name="rarExtraction"]');
        var downloadPoster = document.querySelector('.setting input[name="posterDownload"]');

        for (var [i, file] of Object.entries(e.dataTransfer.files)) {
            var x = new Movie(file.path, extractRar.checked, downloadPoster.checked);
            console.log(await x.process());
        }
        return false;
    };
    
    // Open external URLS
    addEvent(document, 'click', 'a[href]', function(e) {
        shell.openExternal(e.target.href);
    });

});

/**
 * Vanilla JS for adding event listeners
 * @param {String} parent 
 * @param {String} evt 
 * @param {String} selector 
 * @param {Function} handler 
 */
function addEvent(parent, evt, selector, handler) {
    parent.addEventListener(evt, function(event) {
        if (event.target.matches(selector + ', ' + selector + ' *')) {
            handler.apply(event.target.closest(selector), arguments);
        }
    }, false);
}