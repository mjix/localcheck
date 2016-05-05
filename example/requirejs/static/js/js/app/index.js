/* global define, LocalCheck, gFileHashConfig */
define(['require'], function(require){
    document.getElementsByTagName('h1')[0].innerHTML = '===========index===========';

    document.getElementById('detail-btn').onclick = function(){
        require(['app/detail'], function(context){
            context.init();
        });
    };
});
/*/localcheck:a9f7e4bb9bf5fdd5cbf91ed2a6ace536/*/