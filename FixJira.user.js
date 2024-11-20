// ==UserScript==
// @name         Fix Jira
// @namespace    https://github.com/AaronMorton/UserScripts
// @downloadURL  https://raw.githubusercontent.com/AaronMorton/UserScripts/main/FixJira.user.js
// @updateURL    https://raw.githubusercontent.com/AaronMorton/UserScripts/main/FixJira.user.js
// @version      0.1
// @description  Fix the Jira UI to be less bad. Remove sticky styling on "make a comment" suggestion box that takes up half the page on small laptops.
// @author       Aaron Morton (aaronlmorton@gmail.com)
// @match        https://*.atlassian.net/*
// @icon         https://cdn-icons-png.flaticon.com/512/5968/5968875.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function logItOut(msg) {
        console.debug(`Fix Jira: ${msg}`);
    }

    function fixAddComment() {
        logItOut('Executing our fix add comment function');
        const fixAddCommentClass = 'fix-jira-add-comment';
        const fixStylesElementId = 'fix-jira-styles';

        if (!document.querySelector(`#${fixStylesElementId}`)) {
            const fixStylesElem = document.createElement('style');
            fixStylesElem.id = 'fix-jira-styles';
            fixStylesElem.innerText = `.${fixAddCommentClass} { position: inherit !important };`;
            document.body.append(fixStylesElem);
            logItOut('did not have a style elem, adding it');
        }

        const addCommentElemSelector = `div[data-component-selector='jira.issue-view.issue-details.full-size-mode-column'] > span > span > div:not(.${fixAddCommentClass})`;
        const addCommentElem = document.querySelector(addCommentElemSelector);
        if (addCommentElem) {
            addCommentElem.classList.add(fixAddCommentClass);
            logItOut('found an add comment element, adding class');
        }
    }

    // Do an initial pass to add the necessary styles and attempt to add the fix class to the element if it exists
    logItOut('Init');
    fixAddComment();


    // Now that we've done our initial fixing, create an observer instance linked to the callback function
    // don't want to trigger the mutation observer based on the changes hapening above
    const targetNode = document.body;
    const config = { childList: true, subtree: true };
    const mutationCallback = (mutationList, observer) => {
        // could make this more performant by checking if an add comment element was added (or an element containing it as a child)
        // or if the style element we added was removed, or was contained in the tree of elements removed
        // another option is throttling the invocations of this function like: https://dev.to/jeetvora331/throttling-in-javascript-easiest-explanation-1081
        //     early tests of that result in missing some dom updates (like when adding and then not adding a comment) which breaks the fix
        // maybe debouncing? also not perfect hmmm
        fixAddComment();
    };
    const observer = new MutationObserver(mutationCallback);
    observer.observe(targetNode, config);
})();
