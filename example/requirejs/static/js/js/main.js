/* global requirejs, LocalCheck, gFileHashConfig */

//config
requirejs.config({
    baseUrl: "./static/js/",

    alias: {
        "jquery"        : "http://pc1.gtimg.com/js/jquery-1.8.2.min.js",
        "jquery.easing" : "http://pc1.gtimg.com/js/jquery.easing.min.js",
        "hashchange"    : "http://pc1.gtimg.com/softmgr/v3/v3style/js/jquery.ba-hashchange.js",
        "mgrlogin"      : "http://pc2.gtimg.com/pcmgr/soft/js/mgr_soft_login.src.js?t="
    },
    //urlArgs : "_t="+(new Date()).getTime(),

    localcheck : {
        excludes : {},
        unique : gFileHashConfig
    },
    waitSeconds: 6
});

require(['app/index'], function(context){

});
/*/localcheck:882f1ceafcfdc222ee4ce4182b929720/*/