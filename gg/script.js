///<reference path="../avaDec.ts" />
// ==UserScript==
// @name           Ava Tools
// @description    Ava Tools - script for fun and good times
// @namespace      Ava
// @include        http://prodgame*.lordofultima.com/*/index.aspx*
// @version        1024.0.0.4
// ==/UserScript==
//
function avaInit() {
    paDebug("hello world!");
}

/* startup script to launch the tweak */
var startup = function () {
    if (typeof window.qx == 'undefined') {
        console.warn('qx not found, retry again in a couple of seconds.');
        window.setTimeout(startup, 2000);
        return;
    }

    // checkDependances
    console.warn('check dependencies');
    var dependencies = [webfrontend.config.Config.getInstance().getChat(), qx.core.Init.getApplication().chat], i = dependencies.length;

    while (i--) {
        if (dependencies[i])
            continue;
        console.debug('dependency missing [' + i + ']');
        console.warn('dependencies missing, retry again in a couple seconds');
        window.setTimeout(startup, 2000);
        return;
    }
    console.debug('dependencies found.  initialize tools');
    window.setTimeout(avaInit, 2000);
};

window.setTimeout(startup, 2000);
