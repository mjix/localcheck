/*global LocalCheck, Date*/
;(function () {
    var emptyFn = function(){};
    var _gTimeConfig = [['start', +(new Date)]];

    var _stylesheet = {};
    _stylesheet.ignoreKB262161 = false;
    function insertEmptyStyleBefore(node, callback) {
        var style = document.createElement('style');
        style.setAttribute('type', 'text/css');
        var head = document.getElementsByTagName('head')[0];
        if (node) {
            head.insertBefore(style, node);
        } else {
            head.appendChild(style);
        }
        if (style.styleSheet && style.styleSheet.disabled) {
            head.removeChild(style);
            return callback('Unable to add any more stylesheets because you have exceeded the maximum allowable stylesheets. See KB262161 for more information.');
        }
        callback(null, style);
    }

    function setStyleCss(style, css, callback) {
        try {
            // Favor cssText over textContent as it appears to be slightly faster for IE browsers.
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else if ('textContent' in style) {
                style.textContent = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
            return callback(null);
        } catch (e) {
            // Ideally this should never happen but there are still obscure cases with IE where attempting to set cssText can fail.
            callback(e);
        }
    }

    function removeStyleSheet(node) {
        if (node.tagName === 'STYLE' && node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }

    function createStyleSheet(options, callback) {
        if (!_stylesheet.ignoreKB262161 && document.styleSheets.length >= 31) {
            callback('Unable to add any more stylesheets because you have exceeded the maximum allowable stylesheets. See KB262161 for more information.');
        }
        insertEmptyStyleBefore(options.replace ? options.replace.nextSibling : options.insertBefore, function (err, style) {
            if (err) {
                callback(err);
            } else {
                setStyleCss(style, options.css || "", function (err) {
                    if (err) {
                        removeStyleSheet(style);
                        callback(err);
                    } else {
                        if (options.replace) {
                            removeStyleSheet(options.replace);
                        }
                        callback(null, style);
                    }
                });
            }
        });
    }

    _stylesheet = {
        appendStyleSheet: function (css, callback) {
            callback = callback || emptyFn;
            createStyleSheet({
                css: css
            }, callback);
        },
        insertStyleSheetBefore: function (node, css, callback) {
            callback = callback || emptyFn;
            createStyleSheet({
                insertBefore: node,
                css: css
            }, callback);
        },
        replaceStyleSheet: function (node, css, callback) {
            callback = callback || emptyFn;
            createStyleSheet({
                replace: node,
                css: css
            }, callback);
        },
        removeStyleSheet: removeStyleSheet
    };

    LocalCheck.addHandler(['text/css', 'css'], function(result){
        _stylesheet.appendStyleSheet(result.content);
    });
}());