# localcheck
load static file to localstorage and update when file changed; browser support:ie7+

> [localcheck.js](http://www.molo.com.cn/localcheck.js/) fork from basket.js; is a script loader for caching and loading scripts using localStorage;

##Introduction

LocalCheck.js loads your site's scripts into a page and saves them in localStorage so they can be reused after the session until they are expired. With grunt-localcheck(no publish), It also checks to see if the scripts are changed(by hash), and if not, loads them. This prevents unneccessary reloading of scripts and can improve load time and website performance and promise current script is latest.

## Getting Started
-   A ``<script>`` tag (creating a ``LocalCheck`` global variable): ~4.3 KB minified;

```javascript
//just for load and cache
LocalCheck.require('./static/js/main.js');
```

more options to use

```javascript
LocalCheck.require({
    url : './static/js/main.js',
    unique : gFileHashConfig['main.js'] //gFileHashConfig global variable created by grunt-localcheck
});

//LocalCheck.require([]) or LocalCheck.require({}, {})
```

### options
    #### url
    load script/style/othertext relative url.

    #### expire
    How long (in hours) before the cached item expires.
    
    #### unique
    detect cache data changed
    
    #### type
    data mime type; decide how to execute data

    #### key
    set localstorage key. default is url.

### customize

```javascript
    LocalCheck.set(key, value, {expire:1}); // cache one hour;

    LocalCheck.get(key); //{content:'1', ext:{expire:timestamp, stamp:set timestamp, type:data mimetype}}

    LocalCheck.remove(key); //delete cache by key

    LocalCheck.clear(expired); //expired is true expired item will be removed. Otherwise removed all.
```

## grunt-localcheck
copy node_modules/localcheck to upath/node_modules; then config like
```javascript
localcheck : {
    options : { //ltrip absolute path
        substrstart : '../static/js/'.length
    },
    all : {
        expand: true,
        cwd: '../static/js/',
        src: ['**/*.js'],
        dest: '../static/js',
        hashConfigTo : '../index.html' //create gFileHashConfig 
    }
}
```

or u can set template block in file; like
```html
<script type="text/javascript">
    /*<localcheck>*/ //here put localcheck config /*</localcheck>*/
    //var gFileHashConfig={"app/index.js":"b2bfe44f2e870e08b4723fe5de484cd6","main.js":"982468f508e7053603eb2a5d355c57aa"};
</script>
```

## License

MIT © LocalCheck.js team
