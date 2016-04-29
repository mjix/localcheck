/*global document, XMLHttpRequest, ActiveXObject, localStorage, localcheck*/
(function(window, document) {
    'use strict';

    var emptyFn = function(){};

    var _escape = window.escape,
        _unescape = window.unescape,
        extlenLength = 6,
        stag = '/*',
        etag = '*/';
    
    var storagePrefix = 'localcheck-',
        defaultExpiration = 5000;

    var lStore = window.localStorage || {
        setItem : emptyFn,
        getItem : emptyFn,
        removeItem : emptyFn,
        clear : emptyFn,
        length : 0
    };

    var Deferred = function(){
        var _tempData = {};

        var promiseObject = {
            isOver : false,

            done : function(fn){
                promiseObject.isOver = true;
                _tempData.success = fn;

                if(promiseObject.data){
                    fn && fn.call(this, promiseObject.data);
                }
            },

            fail : function(fn){
                promiseObject.isOver = true;
                _tempData.fail = fn;

                if(_tempData.failargs){
                    fn && fn.call(this, _tempData.failargs);
                }
            }
        };

        var _export = {
            resolve : function(data){
                if(_tempData.success){
                    _tempData.success.call(this, data);
                }else{
                    promiseObject.isOver = true;
                    promiseObject.data = data;
                }
                promiseObject.callback && promiseObject.callback();
            },

            reject : function(info){
                if(_tempData.fail){
                    _tempData.fail.call(this, info);
                }else{
                    promiseObject.isOver = true;
                    promiseObject.error = info;
                }
                promiseObject.callback && promiseObject.callback();
            },

            promise : function(){
                return promiseObject;
            }
        };

        return _export;
    };

    Deferred.all = function(allPromise){
        var deferred = Deferred(),
            tempP,
            result = [];
        var callback = function(){
            for(var l=allPromise.length-1; l>-1; l--){
                tempP = allPromise[l];
                if(tempP.isOver){
                    allPromise.splice(l, 1);
                    result.push(tempP.data);
                }

                if(allPromise.length<1){
                    deferred.resolve(result);
                }
            }
        };

        for(var l=allPromise.length-1; l>-1; l--){
            allPromise[l].callback = callback;
            if(allPromise[l].isOver){
                callback();
            }
        }
        return deferred.promise();
    };

    var getTypeof = function(obj){
        var class2type = getTypeof.class2type || {},
            core_toString = class2type.toString,
            types = 'Boolean Number String Function Array Date RegExp Object Error'.split(' '),
            type = '';

        if(!getTypeof.class2type){
            for(var i=0,l=types.length; i<l; i++){
                class2type['[object '+types[i]+']'] = types[i].toLowerCase();
            }
            getTypeof.class2type = class2type;
        }
        return class2type[core_toString.call(obj)];
    };
    /*************ajax module*************/

    var _ajax = {};
    _ajax.getXHR = function() {
        if(window.XMLHttpRequest) {
            return new XMLHttpRequest();
        }
        return new ActiveXObject('Microsoft.XMLHTTP');
    };


    _ajax.send = function(url, config){
        config = config || {};
        var xhr = this.getXHR(),
            ret = {},
            sucback = config.success || emptyFn,
            errorback = config.error || emptyFn,
            timeout = config.timeout || 0,
            timeoutHandle = 0;

        var _done = function(status, msg){
            if(timeoutHandle){
                clearTimeout(timeoutHandle);
            }
            if(status>=200 && status<300 || status===304){
                sucback({
                    content:xhr.responseText,
                    type:xhr.getResponseHeader('content-type')
                }, xhr);
            }else{
                errorback({code:status, msg:msg}, xhr);
            }
        };
        xhr.open('GET', url, true);
        
        xhr.onreadystatechange = function() {
            if(xhr.readyState==4){
                _done(xhr.status, 'status error');
            }
        };

        if(timeout>0){
            timeoutHandle = setTimeout(function(){
                xhr.abort("timeout");
                _done(-100, 'timeout');
            }, timeout);
        }
        xhr.send();
        return xhr;
    };

    /*************encode/decode module*************/

    var encodeContent = function(content, ext){
        if(!content){
            return '';
        }
        var tempArr = [], key, tempStr, slen;
        for(key in ext){
            if(!ext.hasOwnProperty(key)){
                continue;
            }
            tempArr.push(_escape(key) + '=' + _escape(ext[key]));
        }
        tempStr = tempArr.join('&');
        slen = tempStr.length;

        //content000032
        return content += stag + tempStr + '#' + (new Array(extlenLength-(''+slen).length+1)).join('0') + slen + etag;
    };

    var decodeContent = function(content){
        if(!content){
            return false;
        }
        var elen = -etag.length-extlenLength, //# length
            tempLen = content.substr(elen, extlenLength),
            tempStr, tempArr, tempItem, ext = {};
        tempLen = parseInt(tempLen, 10);
        tempStr = content.substr(elen-tempLen-1, tempLen);
        tempArr = tempStr.split('&');
        
        for(var l=tempArr.length-1; l>-1; l--){
            tempItem = tempArr[l].split('=');
            ext[_unescape(tempItem[0])] = _unescape(tempItem[1]);
        }

        return {
            content : content.substr(0, content.length-tempLen-stag.length+elen-1),
            ext : ext
        };
    };

    /*************add/clear cache module*************/

    var getDayStr = function(stamp){
        var mDate = stamp ? new Date(stamp) : new Date(),
            month = (mDate.getMonth() + 1),
            day = mDate.getDate(),
            year = mDate.getFullYear();
        return year+'-'+(month<10?'0'+month:month)+'-'+(day<10?'0'+day:day);
    };

    var clearLocalStorage = function(freeStore){
        if(lStore.length<1){
            return ;
        }

        var key, info,
            allcache = [],
            now = +new Date();

        for (key in localStorage) {
            if(key.indexOf(storagePrefix) !== 0){
                continue;
            }

            info = decodeContent(localStorage[key]);
            info.ext._key = key;

            //out time
            if(info.ext.expire<=now){
                lStore.removeItem(key);
                continue;
            }

            allcache.push(info.ext);
        }

        if(!freeStore || allcache.length<1){
            return ;
        }

        allcache.sort(function(a, b){
            return a.stamp - b.stamp;
        });

        //olditem
        var oldinfo = allcache[0],
            nowDay = getDayStr(),
            oldDay = getDayStr(oldinfo.stamp);
        if(oldDay == nowDay){ //if the same day, clear old one
            return lStore.removeItem(oldinfo._key);
        }

        //clear the same day of oldinfo
        for(var l=allcache.length; l>-1; l--){
            oldinfo = allcache[l];
            if(oldDay == getDayStr(oldinfo.stamp)){
                return lStore.removeItem(oldinfo._key);
            }
        }
    };

    var addLocalStorage = function(key, content, extInfo){
        content = content || '';
        key = storagePrefix + key;
        extInfo = extInfo||{};

        try{
            localStorage.setItem(key, encodeContent(content, extInfo));
            return true;
        }catch(e){
            if(e.name.toUpperCase().indexOf('QUOTA') >= 0){
                clearLocalStorage(true);
                return addLocalStorage(key, content, extInfo);
            }
            // some other error
            return false;
        }
    };

    var injectScript = function(obj) {
        if(obj.content){
            (window.execScript || function(data){
                window["eval"].call(window, data);
            })(obj.content);
        }
    };

    var handlers = {
        'default': injectScript
    };

    var execute = function(obj) {
        if(obj.ext.type && handlers[obj.ext.type]) {
            return handlers[obj.type](obj);
        }

        return handlers['default'](obj); // 'default' is a reserved word
    };


    var _export = {};
    _export.isValidItem = null;

    _export.get = function(key){
        key = storagePrefix + key;
        return decodeContent(lStore.getItem(key));
    };

    _export.set = function(key, content, ext){
        if(key){
            var storeObj = wrapStoreData(ext||{});
            return addLocalStorage(key, content, storeObj);
        }
        return false;
    };

    _export.remove = function(key) {
        key = storagePrefix + key;
        lStore.removeItem(key);
        return this;
    };

    _export.clear = function(expired){
        if(expired){
            clearLocalStorage();
        }else{
            lStore.clear();
        }
        
        return this;
    };

    var isCacheValid = function(source, obj) {
        return !source ||
            source.ext.expire - +new Date() < 0  ||
            obj.unique !== source.ext.unique ||
            (_export.isValidItem && !_export.isValidItem(source, obj));
    };

    var wrapStoreData = function(ext, data) {
        data = data || {};
        var now = +new Date();
        ext.originalType = data.type||'';
        ext.type = ext.type || ext.originalType;
        ext.stamp = now;
        ext.expire = now + ((ext.expire || defaultExpiration)*60*60*1000);
        return ext;
    };

    var saveUrl = function(obj) {
        var deferred = Deferred(),
            url = obj._url;
        delete obj._url;

        _ajax.send(url, {
            success : function(data, xhr){
                var storeObj = wrapStoreData(obj, data);

                if(!obj.skipCache){
                    addLocalStorage(obj.key, data.content, storeObj);
                }

                deferred.resolve({
                    ext : obj,
                    content : data.content
                });
            },
            error : function(info){
                deferred.reject(info);
            }
        });

        return deferred.promise();
    };

    var handleStackObject = function(obj) {
        if(!obj.url) return;

        var source, promise, shouldFetch;

        obj.key =  obj.key || obj.url;
        source = _export.get(obj.key);
        obj.execute = obj.execute !== false;
        shouldFetch = isCacheValid(source, obj);

        obj._url = obj.url;
        if(obj.live || shouldFetch){
            if(obj.unique){
                obj._url += ((obj.url.indexOf('?') > 0 ) ? '&' : '?' ) + 'localcheck-unique=' + obj.unique;
            }

            promise = saveUrl(obj);
        } else {
            source.ext.type = obj.type || source.ext.originalType;
            source.ext.execute = obj.execute;

            var deferred = Deferred();
            deferred.resolve(source);
            promise = deferred.promise();
        }

        return promise;
    };

    var _formatArg = function(item, outConf){
        var tempType = getTypeof(item);
        if(tempType=='string'){
            outConf[item] = {url:item};

        }else if(tempType=='array'){
            for(var i=0,l=item.length; i<l; i++){
                _formatArg(item[i], outConf);
            }

        }else if(tempType=='object' && item.url){
            outConf[item.url] = item;
        }
    };

    _export.require = function(){
        if(arguments.length<1){
            return ;
        }

        var deferred = Deferred();
        var tempItem, allList = {};
        for(var i=0, l = arguments.length; i<l; i++){
            tempItem = arguments[i];
            _formatArg(tempItem, allList);
        }

        var promises = [];
        for(var url in allList){
            if(allList.hasOwnProperty(url)){
                promises.push(handleStackObject(allList[url]));
            }
        }

        Deferred.all(promises).done(function(results){
            for(var i=0,l=results.length; i<l; i++){
                execute(results[i]);
            }
            deferred.resolve(results);
        });

        return deferred.promise();
    };

    //clear expired cache
    _export.clear(true);

    window.LocalCheck = _export;
    return _export;

})( this, document );