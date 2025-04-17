// ==UserScript==
// @name         Fix Google Meet
// @namespace    https://github.com/AaronMorton/UserScripts
// @downloadURL  https://raw.githubusercontent.com/AaronMorton/UserScripts/main/FixGoogleMeet.user.js
// @updateURL    https://raw.githubusercontent.com/AaronMorton/UserScripts/main/FixGoogleMeet.user.js 
// @version      1.3
// @description  Fix the google meet UI to be less bad. Change raise hand button so it doesn't look like the clapping button.
// @author       Aaron Morton (aaronlmorton@gmail.com)
// @match        https://meet.google.com/*
// @icon         https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v1/web-512dp/logo_meet_2020q4_color_1x_web_512dp.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function logItOut(msg) {
        console.debug(`Fix Google Meet: ${msg}`);
    }

    // given a node known to contain the hand raise svg, get rid of the hand icon and add in new text markup
    function fixDumbHandRaiseButton(node) {
        if (!node) {
            logItOut('No dumb hand raise button found');
            return
        }
        // Removing all svg's even though that is no longer the way the hand is rendered, just to be resilient to 
        // future changes to google meet's markup
        node.querySelectorAll('svg').forEach(match => {
            logItOut('match for dumb svg found!');
            match.remove();
        });
        // as of 4.17.25, the hand raise image is now an icon element, so we destroy all icons
        node.querySelectorAll('i').forEach(match => {
            logItOut('match for dumb icon found');
            match.remove();
        });
        if (!node.querySelector('#aarons-cool-markup')) {
            logItOut('Inserting Aaron\'s cool markup');
            const coolMarkup = document.createElement('div');
            coolMarkup.innerText = "Raise/Lower Hand 🙋";
            coolMarkup.setAttribute('style','text-wrap: auto; font-size: 8.5px');
            coolMarkup.id = "aarons-cool-markup";
            node.appendChild(coolMarkup);
        }
    }

    // Select the node that will be observed for mutations
    const targetNode = document.body;

    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true };

    // Selector for the hand raise button
    const dumbButtonSelector = "button[aria-label*='Raise hand'],button[aria-label*='Lower hand'";

    // Callback function to execute when mutations are observed
    const mutationCallback = (mutationList, observer) => {
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

    // Now that we've done our initial fixing, create an observer instance linked to the callback function
    // don't want to trigger the mutation observer based on the changes hapening above
    const observer = new MutationObserver(mutationCallback);
    observer.observe(targetNode, config);


    /** NEW IN-PROGRESS BELOW **/
    // In future add better indicators when you're muted/unmuted/sharing screen, etc. Possibly provide downloads of meeting chats.


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
