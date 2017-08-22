/*!
 * Conditional webmentions for article pages
 * @author Chris Burnell <me@chrisburnell.com>
 */


(() => {

    'use strict';


    const CANONICAL_URL = document.querySelector('link[rel="canonical"]').getAttribute('href').replace('http://localhost:4000', 'https://chrisburnell.com');
    const webmentionsSection = document.querySelector('.js-webmentions');
    const webmentionsButton = document.querySelector('.js-show-webmentions');
    const webmentionsInput = document.querySelector('.js-webmentions-input');
    const webmentionsThread = document.querySelector('.js-webmentions-thread');
    // `#webmention` will match both `#webmention` and `#webmentions`
    const webmentionsHash = ['#webmention'];
    const webmentionsTemplate = `<li id="webmention-{{id}}" class="webmentions__link" data-type="{{type}}">
                                     <a href="#webmention-{{id}}" rel="me">#</a>
                                     <time datetime="{{date}}">{{dateClean}}</time>
                                     <a href="{{url}}" rel="external">{{urlTrimmed}}</a>
                                 </li>`;

    // if WebMentions Button exists, enable it and attach Event Listener
    if (webmentionsButton !== null) {
        webmentionsButton.disabled = false;
        webmentionsButton.setAttribute('aria-disabled', 'false');
        webmentionsButton.addEventListener('click', showWebmentions);
    }

    // run `updateFromHash()` on window load
    window.addEventListener('load', updateFromHash);
    // run `updateFromHash()` on window hashchange
    window.addEventListener('hashchange', updateFromHash);
    // if URL contains a hash from `webmentionsHash`, initiate `showWebmentions()`
    function updateFromHash() {
        for (let hash of webmentionsHash) {
            if (window.location.hash.indexOf(hash) === 0) {
                showWebmentions();
            }
        }
    }

    function formatDate(date) {
        let monthNames = [
            'January', 'February', 'March',
            'April', 'May', 'June', 'July',
            'August', 'September', 'October',
            'November', 'December'
        ];

        let day = date.getDate();
        if (day <= 9) {
            day = `0${day}`;
        }
        let monthIndex = date.getMonth();
        let year = date.getFullYear();

        return day + ' ' + monthNames[monthIndex] + ' ' + year;
    }

    if (webmentionsSection !== null) {
        let webmentionsRequest = new XMLHttpRequest();
        webmentionsRequest.open('GET', `https://webmention.io/api/mentions?jsonp&target=${CANONICAL_URL}`, true);
        webmentionsRequest.onload = function() {
            if (webmentionsRequest.status >= 200 && webmentionsRequest.status < 400 && webmentionsRequest.responseText.length > 0) {
                let webmentionsData = JSON.parse(webmentionsRequest.responseText);
                let webmentionsCount = 0;
                for (let link of webmentionsData.links) {
                    if (link.verified === true && link.private === false) {
                        webmentionsCount++;
                        webmentionsThread.innerHTML += populateResultContent(webmentionsTemplate, link);
                    }
                }
                if (webmentionsButton !== null && webmentionsCount > 0) {
                    webmentionsButton.querySelector('.js-webmention-comment-count').innerHTML = `${webmentionsCount} mention${webmentionsCount > 1 ? 's' : ''}`;
                }
            } else {
                console.log(`WebMention request status error: ${webmentionsRequest.status}`);
            }
        };
        webmentionsRequest.onerror = function() {
            console.log('WebMention request error');
        };
        webmentionsRequest.send();
    }

    // Load in WebMentions and remove the WebMentions button
    function showWebmentions(numberOfWebmentions) {
        if (webmentionsSection !== null) {
            // only if the button still exists should we load and hide the button
            if (webmentionsButton !== null && webmentionsButton.getAttribute('aria-hidden') === 'false') {
                webmentionsButton.setAttribute('aria-pressed', 'true');
                webmentionsButton.setAttribute('aria-expanded', 'true');
                webmentionsButton.setAttribute('aria-hidden', 'true');
                webmentionsButton.removeEventListener('click', () => {});
                webmentionsSection.setAttribute('aria-hidden', 'false');
                webmentionsSection.scrollIntoView();
                if (numberOfWebmentions > 1) {
                    webmentionsThread.focus();
                } else {
                    webmentionsInput.focus();
                }
            }
        }
    }

    ////
    /// Add results content to item template
    /// @param {String} html
    /// @param {object} item
    /// @return {String} Populated HTML
    ////
    function populateResultContent(html, item) {
        // ID
        html = helpers.injectContent(html, item.id, '{{id}}');

        // TYPE
        html = helpers.injectContent(html, item.activity.type, '{{type}}');

        // DATE
        html = helpers.injectContent(html, item.verified_date, '{{date}}');

        // DATE, CLEAN
        html = helpers.injectContent(html, formatDate(new Date(item.verified_date)), '{{dateClean}}');

        // URL
        html = helpers.injectContent(html, item.data.url, '{{url}}');

        // URL, TRIMMED
        html = helpers.injectContent(html, item.data.url.split('//')[1], '{{urlTrimmed}}');

        return html;
    }

})();
