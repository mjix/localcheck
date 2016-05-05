/*global requirejs, LocalCheck*/
;(function () {
    var original_loader = requirejs.load;

    requirejs.load = function (context, moduleName, url) {
        var config = requirejs.s.contexts._.config;
        if (config.localcheck && config.localcheck.excludes && config.localcheck.excludes[moduleName]) {
            original_loader(context, moduleName, url);

        } else {
            var unique = false;
            if(config.localcheck && config.localcheck.unique && config.localcheck.unique.hasOwnProperty(moduleName) ){
                unique = config.localcheck.unique[moduleName];
            }

            LocalCheck.require({url:url, unique:unique}).done(function(){
                context.completeLoad(moduleName);
            }, function (error) {
                // TODO: Support path fallback.
                context.onError(error);
            });
        }
    };
}());
