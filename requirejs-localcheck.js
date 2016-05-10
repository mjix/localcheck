/*global requirejs, LocalCheck*/
;(function () {
    var original_loader = requirejs.load;

    requirejs.load = function (context, moduleName, url) {
        var config = requirejs.s.contexts._.config,
            cl = config.localcheck || {};
            cl.unique = cl.unique || {};
            cl.excludes = cl.excludes || {};

        if (cl.excludes[moduleName] || (cl.mustUnique && !cl.unique[moduleName])) {
            original_loader(context, moduleName, url);
            
        } else {
            var unique = cl.unique[moduleName] || false;
            requirejs.nextTick(function(){
                var conf = {url:url, unique:unique};
                LocalCheck.require(conf).done(function(){
                    context.completeLoad(moduleName);
                }).fail(function (error) {
                    // TODO: Support path fallback.
                    context.onError(error);
                });
            });
        }
    };
}());
