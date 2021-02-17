// Apparently we need this...
import regeneratorRuntime from 'regenerator-runtime';

// Shell access for links in the application
const shell = require('electron').shell;

// Cookie package
require('electron-cookies');

// Movie class
import { Movie } from './class/Movie';

// App styling
import 'bootstrap-css';
import 'perfect-scrollbar/css/perfect-scrollbar.css';
import 'pretty-checkbox/src/pretty-checkbox.scss'
import './assets/app.scss';

// Utility:
// - Scrollbar
// - Markdown -> HTML
import PerfectScrollbar from 'perfect-scrollbar';
import showdown from 'showdown';
import { readFileSync } from 'fs';
import path from 'path';
const converter = new showdown.Converter();
const remote = require('electron').remote;

// Remote because we have a frameless window
// and need to create the close/min button ourself
const win = remote.getCurrentWindow();

// When DOM is loaded, run the app
document.addEventListener("DOMContentLoaded", function() {

    // Set settings to what is saved in cookie
    if (document.cookie) {
        var cookie = document.cookie;
        for (var setting of document.querySelectorAll('.setting input')) {
            if (cookie.split(';').some((item) => item.includes(setting.name + '=true'))) {
                setting.checked = true;
            } else {
                setting.checked = false;
            }
        }
    }

    // Droparea element
    var droparea = document.querySelector('#droparea');

    // Create scrollbars
    new PerfectScrollbar('#logoutput > .body');
    new PerfectScrollbar('#readme .body');

    // Grab readme file and convert it to HTML
    // Then push it onto readme area of the application
    const readme = readFileSync(path.join(__dirname, 'assets/readme.md')).toString();
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

        // Get settings
        var settings = {};
        for (var setting of document.querySelectorAll('.setting input')) {
            settings[setting.name] = (setting.checked) ? true : false;
        }

        // Do the processing for each movie
        for (var [i, file] of Object.entries(e.dataTransfer.files)) {
            var x = new Movie(file.path, settings);
            await x.process();
        }

        return false;
    };

    // Minimize button
    document.getElementById('min-button').addEventListener("click", event => {
        win.minimize();
    });

    // Close button
    document.getElementById('close-button').addEventListener("click", event => {
        win.close();
    });

    // Open external URLS
    addEvent(document, 'click', 'a[href]', function(e) {
        shell.openExternal(e.target.href);
    });

    // Save settings to cookie
    addEvent(document, 'change', '.setting', function(e) {
        for (var setting of document.querySelectorAll('.setting input')) {
            document.cookie = setting.name + '=' + setting.checked + ';';
        }
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