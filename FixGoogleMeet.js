// ==UserScript==
// @name         Fix Google Meet
// @namespace    https://meet.google.com/*
// @downloadURL  https://raw.githubusercontent.com/AaronMorton/UserScripts/main/FixGoogleMeet.js
// @version      1.0
// @description  Fix the google meet UI to be less bad. Change raise hand button to look less like clapping button. In future add better indicators when you're muted/unmuted/sharing screen, etc. Possibly provide downloads of meeting chats.
// @author       Aaron Morton (aaronlmorton@gmail.com)
// @match        https://meet.google.com/*
// @icon         https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v1/web-512dp/logo_meet_2020q4_color_1x_web_512dp.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const dumbButtonSelector = "button[aria-label*='Raise hand'],button[aria-label*='Lower hand'";

    function logItOut(msg) {
        console.debug(`Fix Google Meet: ${msg}`);
    }

    function fixDumbHandRaiseButton(node) {
        if (!node) {
            logItOut('No dumb hand raise button found');
            return
        }
        node.querySelectorAll('svg').forEach(match => {
            logItOut('match for dumb svg found!');
            match.remove();
        });
        if (!node.querySelector('#aarons-cool-markup')) {
            logItOut('Inserting Aaron\'s cool markup');
            const coolMarkup = document.createElement('div');
            coolMarkup.innerText = "Raise / Lower Hand";
            coolMarkup.setAttribute('style','display: inline-block; margin-left: -5px; width: 150%; height: 150%; overflow-wrap: anywhere;white-space: normal;font-size: 8px; overflow:hidden');
            coolMarkup.id = "aarons-cool-markup";
            node.appendChild(coolMarkup);
        }
    }

    // Select the node that will be observed for mutations
    const targetNode = document.body;

    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true };

    // Callback function to execute when mutations are observed
    const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type === "childList") {
                mutation.addedNodes.forEach((node) => {
                    if (node.matches(dumbButtonSelector)) {
                        logItOut('Fix Google Meet: added node parent was the dumb button');
                        fixDumbHandRaiseButton(node);
                    }

                    node.querySelectorAll(dumbButtonSelector).forEach((node) => {
                        logItOut('Fix google Meet: child node of added node is the dumb button');
                        fixDumbHandRaiseButton(node);
                    });
                });
            } else if (mutation.type === "attributes") {
                if (mutation.target.matches(dumbButtonSelector)) {
                    logItOut('Fix Google Meet: attribute mutation caused dumb button to be found');
                    fixDumbHandRaiseButton(mutation.target);
                }
            }
        }
    };

    // Do an initial fix of dumb button
    logItOut('Init');
    fixDumbHandRaiseButton(document.querySelector(dumbButtonSelector));

    // Do a fallback fix in case the button isn't around on page load and we miss it somehow, check once a second
    setInterval(() => {fixDumbHandRaiseButton(document.querySelector(dumbButtonSelector));},1000);

    // On resize, take a stab at fixing button
    addEventListener('resize', () => {
        logItOut('Resize happened, looking for dumb button');
        fixDumbHandRaiseButton(document.querySelector(dumbButtonSelector));
    });

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);


    /** NEW IN-PROGRESS BELOW **/


    //turns out this is wrong and a random participant has the data-self-name attr
    //need to revert to old behavior of data-you or whatever on the participants list, it requires the participant list be open, and some dom traversal
    //but that might be our best option
    /*const findNameInterval = setInterval(() => {
        const nameNode = document.querySelector('*[data-self-name]');
        if (!nameNode) {
            return
        } else {
            console.log('YOUR NAME SURELY IS: ' + nameNode.innerText.split('\n')[0]);
            clearInterval(findNameInterval);
        }
    }, 500);*/

})();
