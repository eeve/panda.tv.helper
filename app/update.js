// ==UserScript==
// @name         Panda.tv弹幕助手
// @namespace
// @website      https://eeve.me
// @version      0.1
// @description  Auto send message helper script for panda.tv
// @author       eeve
// @include      /^http://(www.)?panda.tv/\d+$/
// @include      /^http://stars.panda.tv(/(election|conference|xroom))?/?$/
// @include      /^http://stars.panda.tv/ceremony/room\?roomid=\d+$/
// @include      /^http://(www\.)?panda.tv/roomframe/\d+(.*)?$/
// @grant        unsafeWindow
// @run-at       document-end
// @require      https://greasyfork.org/scripts/23822-panda-tv-hack-core/code/pandatvhackcore.js
// ==/UserScript==

(function() {
    'use strict';
    $FUCKPDTV.default.initialize(unsafeWindow.$);
})();
