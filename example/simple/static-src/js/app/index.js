/* global LocalCheck, gFileHashConfig */

document.getElementsByTagName('h1')[0].innerHTML = '===========index===========';

document.getElementById('detail-btn').onclick = function(){
    LocalCheck.require({
        url : './static/js/app/detail.js',
        unique : gFileHashConfig['app/detail.js']
    });
};
