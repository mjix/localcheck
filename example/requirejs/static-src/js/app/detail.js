/* global define, require, $ */
define(['exports'], function(exports){
    
    exports.init = function(){
        document.getElementsByTagName('h1')[0].innerHTML = '===========detail3===========';
        document.getElementById('detail-btn').style.display = "none";
    };
});