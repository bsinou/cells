(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PydioBootstrap = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * docReady v1.0.4
 * Cross browser DOMContentLoaded event emitter
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true, unused: true*/
/*global define: false, require: false, module: false */

( function( window ) {

'use strict';

var document = window.document;
// collection of functions to be triggered on ready
var queue = [];

function docReady( fn ) {
  // throw out non-functions
  if ( typeof fn !== 'function' ) {
    return;
  }

  if ( docReady.isReady ) {
    // ready now, hit it
    fn();
  } else {
    // queue function when ready
    queue.push( fn );
  }
}

docReady.isReady = false;

// triggered on various doc ready events
function onReady( event ) {
  // bail if already triggered or IE8 document is not ready just yet
  var isIE8NotReady = event.type === 'readystatechange' && document.readyState !== 'complete';
  if ( docReady.isReady || isIE8NotReady ) {
    return;
  }

  trigger();
}

function trigger() {
  docReady.isReady = true;
  // process queue
  for ( var i=0, len = queue.length; i < len; i++ ) {
    var fn = queue[i];
    fn();
  }
}

function defineDocReady( eventie ) {
  // trigger ready if page is ready
  if ( document.readyState === 'complete' ) {
    trigger();
  } else {
    // listen for events
    eventie.bind( document, 'DOMContentLoaded', onReady );
    eventie.bind( document, 'readystatechange', onReady );
    eventie.bind( window, 'load', onReady );
  }

  return docReady;
}

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( [ 'eventie/eventie' ], defineDocReady );
} else if ( typeof exports === 'object' ) {
  module.exports = defineDocReady( require('eventie') );
} else {
  // browser global
  window.docReady = defineDocReady( window.eventie );
}

})( window );

},{"eventie":2}],2:[function(require,module,exports){
/*!
 * eventie v1.0.6
 * event binding helper
 *   eventie.bind( elem, 'click', myFn )
 *   eventie.unbind( elem, 'click', myFn )
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true */
/*global define: false, module: false */

( function( window ) {

'use strict';

var docElem = document.documentElement;

var bind = function() {};

function getIEEvent( obj ) {
  var event = window.event;
  // add event.target
  event.target = event.target || event.srcElement || obj;
  return event;
}

if ( docElem.addEventListener ) {
  bind = function( obj, type, fn ) {
    obj.addEventListener( type, fn, false );
  };
} else if ( docElem.attachEvent ) {
  bind = function( obj, type, fn ) {
    obj[ type + fn ] = fn.handleEvent ?
      function() {
        var event = getIEEvent( obj );
        fn.handleEvent.call( fn, event );
      } :
      function() {
        var event = getIEEvent( obj );
        fn.call( obj, event );
      };
    obj.attachEvent( "on" + type, obj[ type + fn ] );
  };
}

var unbind = function() {};

if ( docElem.removeEventListener ) {
  unbind = function( obj, type, fn ) {
    obj.removeEventListener( type, fn, false );
  };
} else if ( docElem.detachEvent ) {
  unbind = function( obj, type, fn ) {
    obj.detachEvent( "on" + type, obj[ type + fn ] );
    try {
      delete obj[ type + fn ];
    } catch ( err ) {
      // can't delete window object properties
      obj[ type + fn ] = undefined;
    }
  };
}

var eventie = {
  bind: bind,
  unbind: unbind
};

// ----- module definition ----- //

if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( eventie );
} else if ( typeof exports === 'object' ) {
  // CommonJS
  module.exports = eventie;
} else {
  // browser global
  window.eventie = eventie;
}

})( window );

},{}],3:[function(require,module,exports){
(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  var support = {
    searchParams: 'URLSearchParams' in self,
    iterable: 'Symbol' in self && 'iterator' in Symbol,
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob()
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  if (support.arrayBuffer) {
    var viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ]

    var isDataView = function(obj) {
      return obj && DataView.prototype.isPrototypeOf(obj)
    }

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
    }
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  // Build a destructive iterator for the value list
  function iteratorFor(items) {
    var iterator = {
      next: function() {
        var value = items.shift()
        return {done: value === undefined, value: value}
      }
    }

    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator
      }
    }

    return iterator
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)
    } else if (Array.isArray(headers)) {
      headers.forEach(function(header) {
        this.append(header[0], header[1])
      }, this)
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var oldValue = this.map[name]
    this.map[name] = oldValue ? oldValue+','+value : value
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    name = normalizeName(name)
    return this.has(name) ? this.map[name] : null
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value)
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this)
      }
    }
  }

  Headers.prototype.keys = function() {
    var items = []
    this.forEach(function(value, name) { items.push(name) })
    return iteratorFor(items)
  }

  Headers.prototype.values = function() {
    var items = []
    this.forEach(function(value) { items.push(value) })
    return iteratorFor(items)
  }

  Headers.prototype.entries = function() {
    var items = []
    this.forEach(function(value, name) { items.push([name, value]) })
    return iteratorFor(items)
  }

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsArrayBuffer(blob)
    return promise
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    var promise = fileReaderReady(reader)
    reader.readAsText(blob)
    return promise
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf)
    var chars = new Array(view.length)

    for (var i = 0; i < view.length; i++) {
      chars[i] = String.fromCharCode(view[i])
    }
    return chars.join('')
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0)
    } else {
      var view = new Uint8Array(buf.byteLength)
      view.set(new Uint8Array(buf))
      return view.buffer
    }
  }

  function Body() {
    this.bodyUsed = false

    this._initBody = function(body) {
      this._bodyInit = body
      if (!body) {
        this._bodyText = ''
      } else if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString()
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer)
        // IE 10-11 can't handle a DataView body.
        this._bodyInit = new Blob([this._bodyArrayBuffer])
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body)
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]))
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
        } else {
          return this.blob().then(readBlobAsArrayBuffer)
        }
      }
    }

    this.text = function() {
      var rejected = consumed(this)
      if (rejected) {
        return rejected
      }

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob)
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text')
      } else {
        return Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body && input._bodyInit != null) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = String(input)
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this, { body: this._bodyInit })
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers()
    // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
    // https://tools.ietf.org/html/rfc7230#section-3.2
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ')
    preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
      var parts = line.split(':')
      var key = parts.shift().trim()
      if (key) {
        var value = parts.join(':').trim()
        headers.append(key, value)
      }
    })
    return headers
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = options.status === undefined ? 200 : options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = 'statusText' in options ? options.statusText : 'OK'
    this.headers = new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers
  self.Request = Request
  self.Response = Response

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init)
      var xhr = new XMLHttpRequest()

      xhr.onload = function() {
        var options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
        var body = 'response' in xhr ? xhr.response : xhr.responseText
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.ontimeout = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

},{}],4:[function(require,module,exports){
(function (global){
(function(){'use strict';var k=this;
function aa(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";else if("function"==
b&&"undefined"==typeof a.call)return"object";return b}function l(a){return"string"==typeof a}function ba(a,b,c){return a.call.apply(a.bind,arguments)}function ca(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}
function da(a,b,c){da=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ba:ca;return da.apply(null,arguments)}function ea(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var b=c.slice();b.push.apply(b,arguments);return a.apply(this,b)}}
function m(a){var b=n;function c(){}c.prototype=b.prototype;a.G=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.F=function(a,c,f){for(var g=Array(arguments.length-2),h=2;h<arguments.length;h++)g[h-2]=arguments[h];return b.prototype[c].apply(a,g)}};/*

 The MIT License

 Copyright (c) 2007 Cybozu Labs, Inc.
 Copyright (c) 2012 Google Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to
 deal in the Software without restriction, including without limitation the
 rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 IN THE SOFTWARE.
*/
var fa=String.prototype.trim?function(a){return a.trim()}:function(a){return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")};function q(a,b){return-1!=a.indexOf(b)}function ga(a,b){return a<b?-1:a>b?1:0};var ha=Array.prototype.indexOf?function(a,b,c){return Array.prototype.indexOf.call(a,b,c)}:function(a,b,c){c=null==c?0:0>c?Math.max(0,a.length+c):c;if(l(a))return l(b)&&1==b.length?a.indexOf(b,c):-1;for(;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},r=Array.prototype.forEach?function(a,b,c){Array.prototype.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=l(a)?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a)},ia=Array.prototype.filter?function(a,b,c){return Array.prototype.filter.call(a,
b,c)}:function(a,b,c){for(var d=a.length,e=[],f=0,g=l(a)?a.split(""):a,h=0;h<d;h++)if(h in g){var p=g[h];b.call(c,p,h,a)&&(e[f++]=p)}return e},t=Array.prototype.reduce?function(a,b,c,d){d&&(b=da(b,d));return Array.prototype.reduce.call(a,b,c)}:function(a,b,c,d){var e=c;r(a,function(c,g){e=b.call(d,e,c,g,a)});return e},ja=Array.prototype.some?function(a,b,c){return Array.prototype.some.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=l(a)?a.split(""):a,f=0;f<d;f++)if(f in e&&b.call(c,e[f],f,a))return!0;
return!1};function ka(a,b){var c;a:{c=a.length;for(var d=l(a)?a.split(""):a,e=0;e<c;e++)if(e in d&&b.call(void 0,d[e],e,a)){c=e;break a}c=-1}return 0>c?null:l(a)?a.charAt(c):a[c]}function la(a){return Array.prototype.concat.apply(Array.prototype,arguments)}function ma(a,b,c){return 2>=arguments.length?Array.prototype.slice.call(a,b):Array.prototype.slice.call(a,b,c)};var u;a:{var na=k.navigator;if(na){var oa=na.userAgent;if(oa){u=oa;break a}}u=""};var pa=q(u,"Opera")||q(u,"OPR"),v=q(u,"Trident")||q(u,"MSIE"),qa=q(u,"Edge"),ra=q(u,"Gecko")&&!(q(u.toLowerCase(),"webkit")&&!q(u,"Edge"))&&!(q(u,"Trident")||q(u,"MSIE"))&&!q(u,"Edge"),sa=q(u.toLowerCase(),"webkit")&&!q(u,"Edge");function ta(){var a=k.document;return a?a.documentMode:void 0}var ua;
a:{var va="",wa=function(){var a=u;if(ra)return/rv\:([^\);]+)(\)|;)/.exec(a);if(qa)return/Edge\/([\d\.]+)/.exec(a);if(v)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(sa)return/WebKit\/(\S+)/.exec(a);if(pa)return/(?:Version)[ \/]?(\S+)/.exec(a)}();wa&&(va=wa?wa[1]:"");if(v){var xa=ta();if(null!=xa&&xa>parseFloat(va)){ua=String(xa);break a}}ua=va}var ya={};
function za(a){if(!ya[a]){for(var b=0,c=fa(String(ua)).split("."),d=fa(String(a)).split("."),e=Math.max(c.length,d.length),f=0;0==b&&f<e;f++){var g=c[f]||"",h=d[f]||"",p=/(\d*)(\D*)/g,y=/(\d*)(\D*)/g;do{var D=p.exec(g)||["","",""],X=y.exec(h)||["","",""];if(0==D[0].length&&0==X[0].length)break;b=ga(0==D[1].length?0:parseInt(D[1],10),0==X[1].length?0:parseInt(X[1],10))||ga(0==D[2].length,0==X[2].length)||ga(D[2],X[2])}while(0==b)}ya[a]=0<=b}}
var Aa=k.document,Ba=Aa&&v?ta()||("CSS1Compat"==Aa.compatMode?parseInt(ua,10):5):void 0;var w=v&&!(9<=Number(Ba)),Ca=v&&!(8<=Number(Ba));function x(a,b,c,d){this.a=a;this.nodeName=c;this.nodeValue=d;this.nodeType=2;this.parentNode=this.ownerElement=b}function Da(a,b){var c=Ca&&"href"==b.nodeName?a.getAttribute(b.nodeName,2):b.nodeValue;return new x(b,a,b.nodeName,c)};function z(a){var b=null,c=a.nodeType;1==c&&(b=a.textContent,b=void 0==b||null==b?a.innerText:b,b=void 0==b||null==b?"":b);if("string"!=typeof b)if(w&&"title"==a.nodeName.toLowerCase()&&1==c)b=a.text;else if(9==c||1==c){a=9==c?a.documentElement:a.firstChild;for(var c=0,d=[],b="";a;){do 1!=a.nodeType&&(b+=a.nodeValue),w&&"title"==a.nodeName.toLowerCase()&&(b+=a.text),d[c++]=a;while(a=a.firstChild);for(;c&&!(a=d[--c].nextSibling););}}else b=a.nodeValue;return""+b}
function A(a,b,c){if(null===b)return!0;try{if(!a.getAttribute)return!1}catch(d){return!1}Ca&&"class"==b&&(b="className");return null==c?!!a.getAttribute(b):a.getAttribute(b,2)==c}function B(a,b,c,d,e){return(w?Ea:Fa).call(null,a,b,l(c)?c:null,l(d)?d:null,e||new C)}
function Ea(a,b,c,d,e){if(a instanceof E||8==a.b||c&&null===a.b){var f=b.all;if(!f)return e;a=Ga(a);if("*"!=a&&(f=b.getElementsByTagName(a),!f))return e;if(c){for(var g=[],h=0;b=f[h++];)A(b,c,d)&&g.push(b);f=g}for(h=0;b=f[h++];)"*"==a&&"!"==b.tagName||F(e,b);return e}Ha(a,b,c,d,e);return e}
function Fa(a,b,c,d,e){b.getElementsByName&&d&&"name"==c&&!v?(b=b.getElementsByName(d),r(b,function(b){a.a(b)&&F(e,b)})):b.getElementsByClassName&&d&&"class"==c?(b=b.getElementsByClassName(d),r(b,function(b){b.className==d&&a.a(b)&&F(e,b)})):a instanceof G?Ha(a,b,c,d,e):b.getElementsByTagName&&(b=b.getElementsByTagName(a.f()),r(b,function(a){A(a,c,d)&&F(e,a)}));return e}
function Ia(a,b,c,d,e){var f;if((a instanceof E||8==a.b||c&&null===a.b)&&(f=b.childNodes)){var g=Ga(a);if("*"!=g&&(f=ia(f,function(a){return a.tagName&&a.tagName.toLowerCase()==g}),!f))return e;c&&(f=ia(f,function(a){return A(a,c,d)}));r(f,function(a){"*"==g&&("!"==a.tagName||"*"==g&&1!=a.nodeType)||F(e,a)});return e}return Ja(a,b,c,d,e)}function Ja(a,b,c,d,e){for(b=b.firstChild;b;b=b.nextSibling)A(b,c,d)&&a.a(b)&&F(e,b);return e}
function Ha(a,b,c,d,e){for(b=b.firstChild;b;b=b.nextSibling)A(b,c,d)&&a.a(b)&&F(e,b),Ha(a,b,c,d,e)}function Ga(a){if(a instanceof G){if(8==a.b)return"!";if(null===a.b)return"*"}return a.f()};!ra&&!v||v&&9<=Number(Ba)||ra&&za("1.9.1");v&&za("9");function Ka(a,b){if(!a||!b)return!1;if(a.contains&&1==b.nodeType)return a==b||a.contains(b);if("undefined"!=typeof a.compareDocumentPosition)return a==b||!!(a.compareDocumentPosition(b)&16);for(;b&&a!=b;)b=b.parentNode;return b==a}
function La(a,b){if(a==b)return 0;if(a.compareDocumentPosition)return a.compareDocumentPosition(b)&2?1:-1;if(v&&!(9<=Number(Ba))){if(9==a.nodeType)return-1;if(9==b.nodeType)return 1}if("sourceIndex"in a||a.parentNode&&"sourceIndex"in a.parentNode){var c=1==a.nodeType,d=1==b.nodeType;if(c&&d)return a.sourceIndex-b.sourceIndex;var e=a.parentNode,f=b.parentNode;return e==f?Ma(a,b):!c&&Ka(e,b)?-1*Na(a,b):!d&&Ka(f,a)?Na(b,a):(c?a.sourceIndex:e.sourceIndex)-(d?b.sourceIndex:f.sourceIndex)}d=9==a.nodeType?
a:a.ownerDocument||a.document;c=d.createRange();c.selectNode(a);c.collapse(!0);d=d.createRange();d.selectNode(b);d.collapse(!0);return c.compareBoundaryPoints(k.Range.START_TO_END,d)}function Na(a,b){var c=a.parentNode;if(c==b)return-1;for(var d=b;d.parentNode!=c;)d=d.parentNode;return Ma(d,a)}function Ma(a,b){for(var c=b;c=c.previousSibling;)if(c==a)return-1;return 1};function C(){this.b=this.a=null;this.l=0}function Oa(a){this.node=a;this.a=this.b=null}function Pa(a,b){if(!a.a)return b;if(!b.a)return a;for(var c=a.a,d=b.a,e=null,f=null,g=0;c&&d;){var f=c.node,h=d.node;f==h||f instanceof x&&h instanceof x&&f.a==h.a?(f=c,c=c.a,d=d.a):0<La(c.node,d.node)?(f=d,d=d.a):(f=c,c=c.a);(f.b=e)?e.a=f:a.a=f;e=f;g++}for(f=c||d;f;)f.b=e,e=e.a=f,g++,f=f.a;a.b=e;a.l=g;return a}function Qa(a,b){var c=new Oa(b);c.a=a.a;a.b?a.a.b=c:a.a=a.b=c;a.a=c;a.l++}
function F(a,b){var c=new Oa(b);c.b=a.b;a.a?a.b.a=c:a.a=a.b=c;a.b=c;a.l++}function Ra(a){return(a=a.a)?a.node:null}function Sa(a){return(a=Ra(a))?z(a):""}function H(a,b){return new Ta(a,!!b)}function Ta(a,b){this.f=a;this.b=(this.c=b)?a.b:a.a;this.a=null}function I(a){var b=a.b;if(null==b)return null;var c=a.a=b;a.b=a.c?b.b:b.a;return c.node};function n(a){this.i=a;this.b=this.g=!1;this.f=null}function J(a){return"\n  "+a.toString().split("\n").join("\n  ")}function Ua(a,b){a.g=b}function Va(a,b){a.b=b}function K(a,b){var c=a.a(b);return c instanceof C?+Sa(c):+c}function L(a,b){var c=a.a(b);return c instanceof C?Sa(c):""+c}function M(a,b){var c=a.a(b);return c instanceof C?!!c.l:!!c};function N(a,b,c){n.call(this,a.i);this.c=a;this.h=b;this.o=c;this.g=b.g||c.g;this.b=b.b||c.b;this.c==Wa&&(c.b||c.g||4==c.i||0==c.i||!b.f?b.b||b.g||4==b.i||0==b.i||!c.f||(this.f={name:c.f.name,s:b}):this.f={name:b.f.name,s:c})}m(N);
function O(a,b,c,d,e){b=b.a(d);c=c.a(d);var f;if(b instanceof C&&c instanceof C){b=H(b);for(d=I(b);d;d=I(b))for(e=H(c),f=I(e);f;f=I(e))if(a(z(d),z(f)))return!0;return!1}if(b instanceof C||c instanceof C){b instanceof C?(e=b,d=c):(e=c,d=b);f=H(e);for(var g=typeof d,h=I(f);h;h=I(f)){switch(g){case "number":h=+z(h);break;case "boolean":h=!!z(h);break;case "string":h=z(h);break;default:throw Error("Illegal primitive type for comparison.");}if(e==b&&a(h,d)||e==c&&a(d,h))return!0}return!1}return e?"boolean"==
typeof b||"boolean"==typeof c?a(!!b,!!c):"number"==typeof b||"number"==typeof c?a(+b,+c):a(b,c):a(+b,+c)}N.prototype.a=function(a){return this.c.m(this.h,this.o,a)};N.prototype.toString=function(){var a="Binary Expression: "+this.c,a=a+J(this.h);return a+=J(this.o)};function Xa(a,b,c,d){this.a=a;this.w=b;this.i=c;this.m=d}Xa.prototype.toString=function(){return this.a};var Ya={};
function P(a,b,c,d){if(Ya.hasOwnProperty(a))throw Error("Binary operator already created: "+a);a=new Xa(a,b,c,d);return Ya[a.toString()]=a}P("div",6,1,function(a,b,c){return K(a,c)/K(b,c)});P("mod",6,1,function(a,b,c){return K(a,c)%K(b,c)});P("*",6,1,function(a,b,c){return K(a,c)*K(b,c)});P("+",5,1,function(a,b,c){return K(a,c)+K(b,c)});P("-",5,1,function(a,b,c){return K(a,c)-K(b,c)});P("<",4,2,function(a,b,c){return O(function(a,b){return a<b},a,b,c)});
P(">",4,2,function(a,b,c){return O(function(a,b){return a>b},a,b,c)});P("<=",4,2,function(a,b,c){return O(function(a,b){return a<=b},a,b,c)});P(">=",4,2,function(a,b,c){return O(function(a,b){return a>=b},a,b,c)});var Wa=P("=",3,2,function(a,b,c){return O(function(a,b){return a==b},a,b,c,!0)});P("!=",3,2,function(a,b,c){return O(function(a,b){return a!=b},a,b,c,!0)});P("and",2,2,function(a,b,c){return M(a,c)&&M(b,c)});P("or",1,2,function(a,b,c){return M(a,c)||M(b,c)});function Q(a,b,c){this.a=a;this.b=b||1;this.f=c||1};function Za(a,b){if(b.a.length&&4!=a.i)throw Error("Primary expression must evaluate to nodeset if filter has predicate(s).");n.call(this,a.i);this.c=a;this.h=b;this.g=a.g;this.b=a.b}m(Za);Za.prototype.a=function(a){a=this.c.a(a);return $a(this.h,a)};Za.prototype.toString=function(){var a;a="Filter:"+J(this.c);return a+=J(this.h)};function ab(a,b){if(b.length<a.A)throw Error("Function "+a.j+" expects at least"+a.A+" arguments, "+b.length+" given");if(null!==a.v&&b.length>a.v)throw Error("Function "+a.j+" expects at most "+a.v+" arguments, "+b.length+" given");a.B&&r(b,function(b,d){if(4!=b.i)throw Error("Argument "+d+" to function "+a.j+" is not of type Nodeset: "+b);});n.call(this,a.i);this.h=a;this.c=b;Ua(this,a.g||ja(b,function(a){return a.g}));Va(this,a.D&&!b.length||a.C&&!!b.length||ja(b,function(a){return a.b}))}m(ab);
ab.prototype.a=function(a){return this.h.m.apply(null,la(a,this.c))};ab.prototype.toString=function(){var a="Function: "+this.h;if(this.c.length)var b=t(this.c,function(a,b){return a+J(b)},"Arguments:"),a=a+J(b);return a};function bb(a,b,c,d,e,f,g,h,p){this.j=a;this.i=b;this.g=c;this.D=d;this.C=e;this.m=f;this.A=g;this.v=void 0!==h?h:g;this.B=!!p}bb.prototype.toString=function(){return this.j};var cb={};
function R(a,b,c,d,e,f,g,h){if(cb.hasOwnProperty(a))throw Error("Function already created: "+a+".");cb[a]=new bb(a,b,c,d,!1,e,f,g,h)}R("boolean",2,!1,!1,function(a,b){return M(b,a)},1);R("ceiling",1,!1,!1,function(a,b){return Math.ceil(K(b,a))},1);R("concat",3,!1,!1,function(a,b){return t(ma(arguments,1),function(b,d){return b+L(d,a)},"")},2,null);R("contains",2,!1,!1,function(a,b,c){return q(L(b,a),L(c,a))},2);R("count",1,!1,!1,function(a,b){return b.a(a).l},1,1,!0);
R("false",2,!1,!1,function(){return!1},0);R("floor",1,!1,!1,function(a,b){return Math.floor(K(b,a))},1);R("id",4,!1,!1,function(a,b){function c(a){if(w){var b=e.all[a];if(b){if(b.nodeType&&a==b.id)return b;if(b.length)return ka(b,function(b){return a==b.id})}return null}return e.getElementById(a)}var d=a.a,e=9==d.nodeType?d:d.ownerDocument,d=L(b,a).split(/\s+/),f=[];r(d,function(a){a=c(a);!a||0<=ha(f,a)||f.push(a)});f.sort(La);var g=new C;r(f,function(a){F(g,a)});return g},1);
R("lang",2,!1,!1,function(){return!1},1);R("last",1,!0,!1,function(a){if(1!=arguments.length)throw Error("Function last expects ()");return a.f},0);R("local-name",3,!1,!0,function(a,b){var c=b?Ra(b.a(a)):a.a;return c?c.localName||c.nodeName.toLowerCase():""},0,1,!0);R("name",3,!1,!0,function(a,b){var c=b?Ra(b.a(a)):a.a;return c?c.nodeName.toLowerCase():""},0,1,!0);R("namespace-uri",3,!0,!1,function(){return""},0,1,!0);
R("normalize-space",3,!1,!0,function(a,b){return(b?L(b,a):z(a.a)).replace(/[\s\xa0]+/g," ").replace(/^\s+|\s+$/g,"")},0,1);R("not",2,!1,!1,function(a,b){return!M(b,a)},1);R("number",1,!1,!0,function(a,b){return b?K(b,a):+z(a.a)},0,1);R("position",1,!0,!1,function(a){return a.b},0);R("round",1,!1,!1,function(a,b){return Math.round(K(b,a))},1);R("starts-with",2,!1,!1,function(a,b,c){b=L(b,a);a=L(c,a);return 0==b.lastIndexOf(a,0)},2);R("string",3,!1,!0,function(a,b){return b?L(b,a):z(a.a)},0,1);
R("string-length",1,!1,!0,function(a,b){return(b?L(b,a):z(a.a)).length},0,1);R("substring",3,!1,!1,function(a,b,c,d){c=K(c,a);if(isNaN(c)||Infinity==c||-Infinity==c)return"";d=d?K(d,a):Infinity;if(isNaN(d)||-Infinity===d)return"";c=Math.round(c)-1;var e=Math.max(c,0);a=L(b,a);return Infinity==d?a.substring(e):a.substring(e,c+Math.round(d))},2,3);R("substring-after",3,!1,!1,function(a,b,c){b=L(b,a);a=L(c,a);c=b.indexOf(a);return-1==c?"":b.substring(c+a.length)},2);
R("substring-before",3,!1,!1,function(a,b,c){b=L(b,a);a=L(c,a);a=b.indexOf(a);return-1==a?"":b.substring(0,a)},2);R("sum",1,!1,!1,function(a,b){for(var c=H(b.a(a)),d=0,e=I(c);e;e=I(c))d+=+z(e);return d},1,1,!0);R("translate",3,!1,!1,function(a,b,c,d){b=L(b,a);c=L(c,a);var e=L(d,a);a={};for(d=0;d<c.length;d++){var f=c.charAt(d);f in a||(a[f]=e.charAt(d))}c="";for(d=0;d<b.length;d++)f=b.charAt(d),c+=f in a?a[f]:f;return c},3);R("true",2,!1,!1,function(){return!0},0);function G(a,b){this.h=a;this.c=void 0!==b?b:null;this.b=null;switch(a){case "comment":this.b=8;break;case "text":this.b=3;break;case "processing-instruction":this.b=7;break;case "node":break;default:throw Error("Unexpected argument");}}function db(a){return"comment"==a||"text"==a||"processing-instruction"==a||"node"==a}G.prototype.a=function(a){return null===this.b||this.b==a.nodeType};G.prototype.f=function(){return this.h};
G.prototype.toString=function(){var a="Kind Test: "+this.h;null===this.c||(a+=J(this.c));return a};function eb(a){this.b=a;this.a=0}function fb(a){a=a.match(gb);for(var b=0;b<a.length;b++)hb.test(a[b])&&a.splice(b,1);return new eb(a)}var gb=/\$?(?:(?![0-9-\.])(?:\*|[\w-\.]+):)?(?![0-9-\.])(?:\*|[\w-\.]+)|\/\/|\.\.|::|\d+(?:\.\d*)?|\.\d+|"[^"]*"|'[^']*'|[!<>]=|\s+|./g,hb=/^\s/;function S(a,b){return a.b[a.a+(b||0)]}function T(a){return a.b[a.a++]}function ib(a){return a.b.length<=a.a};function jb(a){n.call(this,3);this.c=a.substring(1,a.length-1)}m(jb);jb.prototype.a=function(){return this.c};jb.prototype.toString=function(){return"Literal: "+this.c};function E(a,b){this.j=a.toLowerCase();var c;c="*"==this.j?"*":"http://www.w3.org/1999/xhtml";this.c=b?b.toLowerCase():c}E.prototype.a=function(a){var b=a.nodeType;if(1!=b&&2!=b)return!1;b=void 0!==a.localName?a.localName:a.nodeName;return"*"!=this.j&&this.j!=b.toLowerCase()?!1:"*"==this.c?!0:this.c==(a.namespaceURI?a.namespaceURI.toLowerCase():"http://www.w3.org/1999/xhtml")};E.prototype.f=function(){return this.j};
E.prototype.toString=function(){return"Name Test: "+("http://www.w3.org/1999/xhtml"==this.c?"":this.c+":")+this.j};function kb(a,b){n.call(this,a.i);this.h=a;this.c=b;this.g=a.g;this.b=a.b;if(1==this.c.length){var c=this.c[0];c.u||c.c!=lb||(c=c.o,"*"!=c.f()&&(this.f={name:c.f(),s:null}))}}m(kb);function mb(){n.call(this,4)}m(mb);mb.prototype.a=function(a){var b=new C;a=a.a;9==a.nodeType?F(b,a):F(b,a.ownerDocument);return b};mb.prototype.toString=function(){return"Root Helper Expression"};function nb(){n.call(this,4)}m(nb);nb.prototype.a=function(a){var b=new C;F(b,a.a);return b};nb.prototype.toString=function(){return"Context Helper Expression"};
function ob(a){return"/"==a||"//"==a}kb.prototype.a=function(a){var b=this.h.a(a);if(!(b instanceof C))throw Error("Filter expression must evaluate to nodeset.");a=this.c;for(var c=0,d=a.length;c<d&&b.l;c++){var e=a[c],f=H(b,e.c.a),g;if(e.g||e.c!=pb)if(e.g||e.c!=qb)for(g=I(f),b=e.a(new Q(g));null!=(g=I(f));)g=e.a(new Q(g)),b=Pa(b,g);else g=I(f),b=e.a(new Q(g));else{for(g=I(f);(b=I(f))&&(!g.contains||g.contains(b))&&b.compareDocumentPosition(g)&8;g=b);b=e.a(new Q(g))}}return b};
kb.prototype.toString=function(){var a;a="Path Expression:"+J(this.h);if(this.c.length){var b=t(this.c,function(a,b){return a+J(b)},"Steps:");a+=J(b)}return a};function rb(a){n.call(this,4);this.c=a;Ua(this,ja(this.c,function(a){return a.g}));Va(this,ja(this.c,function(a){return a.b}))}m(rb);rb.prototype.a=function(a){var b=new C;r(this.c,function(c){c=c.a(a);if(!(c instanceof C))throw Error("Path expression must evaluate to NodeSet.");b=Pa(b,c)});return b};rb.prototype.toString=function(){return t(this.c,function(a,b){return a+J(b)},"Union Expression:")};function sb(a,b){this.a=a;this.b=!!b}
function $a(a,b,c){for(c=c||0;c<a.a.length;c++)for(var d=a.a[c],e=H(b),f=b.l,g,h=0;g=I(e);h++){var p=a.b?f-h:h+1;g=d.a(new Q(g,p,f));if("number"==typeof g)p=p==g;else if("string"==typeof g||"boolean"==typeof g)p=!!g;else if(g instanceof C)p=0<g.l;else throw Error("Predicate.evaluate returned an unexpected type.");if(!p){p=e;g=p.f;var y=p.a;if(!y)throw Error("Next must be called at least once before remove.");var D=y.b,y=y.a;D?D.a=y:g.a=y;y?y.b=D:g.b=D;g.l--;p.a=null}}return b}
sb.prototype.toString=function(){return t(this.a,function(a,b){return a+J(b)},"Predicates:")};function U(a,b,c,d){n.call(this,4);this.c=a;this.o=b;this.h=c||new sb([]);this.u=!!d;b=this.h;b=0<b.a.length?b.a[0].f:null;a.b&&b&&(a=b.name,a=w?a.toLowerCase():a,this.f={name:a,s:b.s});a:{a=this.h;for(b=0;b<a.a.length;b++)if(c=a.a[b],c.g||1==c.i||0==c.i){a=!0;break a}a=!1}this.g=a}m(U);
U.prototype.a=function(a){var b=a.a,c=null,c=this.f,d=null,e=null,f=0;c&&(d=c.name,e=c.s?L(c.s,a):null,f=1);if(this.u)if(this.g||this.c!=tb)if(a=H((new U(ub,new G("node"))).a(a)),b=I(a))for(c=this.m(b,d,e,f);null!=(b=I(a));)c=Pa(c,this.m(b,d,e,f));else c=new C;else c=B(this.o,b,d,e),c=$a(this.h,c,f);else c=this.m(a.a,d,e,f);return c};U.prototype.m=function(a,b,c,d){a=this.c.f(this.o,a,b,c);return a=$a(this.h,a,d)};
U.prototype.toString=function(){var a;a="Step:"+J("Operator: "+(this.u?"//":"/"));this.c.j&&(a+=J("Axis: "+this.c));a+=J(this.o);if(this.h.a.length){var b=t(this.h.a,function(a,b){return a+J(b)},"Predicates:");a+=J(b)}return a};function vb(a,b,c,d){this.j=a;this.f=b;this.a=c;this.b=d}vb.prototype.toString=function(){return this.j};var wb={};function V(a,b,c,d){if(wb.hasOwnProperty(a))throw Error("Axis already created: "+a);b=new vb(a,b,c,!!d);return wb[a]=b}
V("ancestor",function(a,b){for(var c=new C,d=b;d=d.parentNode;)a.a(d)&&Qa(c,d);return c},!0);V("ancestor-or-self",function(a,b){var c=new C,d=b;do a.a(d)&&Qa(c,d);while(d=d.parentNode);return c},!0);
var lb=V("attribute",function(a,b){var c=new C,d=a.f();if("style"==d&&w&&b.style)return F(c,new x(b.style,b,"style",b.style.cssText)),c;var e=b.attributes;if(e)if(a instanceof G&&null===a.b||"*"==d)for(var d=0,f;f=e[d];d++)w?f.nodeValue&&F(c,Da(b,f)):F(c,f);else(f=e.getNamedItem(d))&&(w?f.nodeValue&&F(c,Da(b,f)):F(c,f));return c},!1),tb=V("child",function(a,b,c,d,e){return(w?Ia:Ja).call(null,a,b,l(c)?c:null,l(d)?d:null,e||new C)},!1,!0);V("descendant",B,!1,!0);
var ub=V("descendant-or-self",function(a,b,c,d){var e=new C;A(b,c,d)&&a.a(b)&&F(e,b);return B(a,b,c,d,e)},!1,!0),pb=V("following",function(a,b,c,d){var e=new C;do for(var f=b;f=f.nextSibling;)A(f,c,d)&&a.a(f)&&F(e,f),e=B(a,f,c,d,e);while(b=b.parentNode);return e},!1,!0);V("following-sibling",function(a,b){for(var c=new C,d=b;d=d.nextSibling;)a.a(d)&&F(c,d);return c},!1);V("namespace",function(){return new C},!1);
var xb=V("parent",function(a,b){var c=new C;if(9==b.nodeType)return c;if(2==b.nodeType)return F(c,b.ownerElement),c;var d=b.parentNode;a.a(d)&&F(c,d);return c},!1),qb=V("preceding",function(a,b,c,d){var e=new C,f=[];do f.unshift(b);while(b=b.parentNode);for(var g=1,h=f.length;g<h;g++){var p=[];for(b=f[g];b=b.previousSibling;)p.unshift(b);for(var y=0,D=p.length;y<D;y++)b=p[y],A(b,c,d)&&a.a(b)&&F(e,b),e=B(a,b,c,d,e)}return e},!0,!0);
V("preceding-sibling",function(a,b){for(var c=new C,d=b;d=d.previousSibling;)a.a(d)&&Qa(c,d);return c},!0);var yb=V("self",function(a,b){var c=new C;a.a(b)&&F(c,b);return c},!1);function zb(a){n.call(this,1);this.c=a;this.g=a.g;this.b=a.b}m(zb);zb.prototype.a=function(a){return-K(this.c,a)};zb.prototype.toString=function(){return"Unary Expression: -"+J(this.c)};function Ab(a){n.call(this,1);this.c=a}m(Ab);Ab.prototype.a=function(){return this.c};Ab.prototype.toString=function(){return"Number: "+this.c};function Bb(a,b){this.a=a;this.b=b}function Cb(a){for(var b,c=[];;){W(a,"Missing right hand side of binary expression.");b=Db(a);var d=T(a.a);if(!d)break;var e=(d=Ya[d]||null)&&d.w;if(!e){a.a.a--;break}for(;c.length&&e<=c[c.length-1].w;)b=new N(c.pop(),c.pop(),b);c.push(b,d)}for(;c.length;)b=new N(c.pop(),c.pop(),b);return b}function W(a,b){if(ib(a.a))throw Error(b);}function Eb(a,b){var c=T(a.a);if(c!=b)throw Error("Bad token, expected: "+b+" got: "+c);}
function Fb(a){a=T(a.a);if(")"!=a)throw Error("Bad token: "+a);}function Gb(a){a=T(a.a);if(2>a.length)throw Error("Unclosed literal string");return new jb(a)}
function Hb(a){var b,c=[],d;if(ob(S(a.a))){b=T(a.a);d=S(a.a);if("/"==b&&(ib(a.a)||"."!=d&&".."!=d&&"@"!=d&&"*"!=d&&!/(?![0-9])[\w]/.test(d)))return new mb;d=new mb;W(a,"Missing next location step.");b=Ib(a,b);c.push(b)}else{a:{b=S(a.a);d=b.charAt(0);switch(d){case "$":throw Error("Variable reference not allowed in HTML XPath");case "(":T(a.a);b=Cb(a);W(a,'unclosed "("');Eb(a,")");break;case '"':case "'":b=Gb(a);break;default:if(isNaN(+b))if(!db(b)&&/(?![0-9])[\w]/.test(d)&&"("==S(a.a,1)){b=T(a.a);
b=cb[b]||null;T(a.a);for(d=[];")"!=S(a.a);){W(a,"Missing function argument list.");d.push(Cb(a));if(","!=S(a.a))break;T(a.a)}W(a,"Unclosed function argument list.");Fb(a);b=new ab(b,d)}else{b=null;break a}else b=new Ab(+T(a.a))}"["==S(a.a)&&(d=new sb(Jb(a)),b=new Za(b,d))}if(b)if(ob(S(a.a)))d=b;else return b;else b=Ib(a,"/"),d=new nb,c.push(b)}for(;ob(S(a.a));)b=T(a.a),W(a,"Missing next location step."),b=Ib(a,b),c.push(b);return new kb(d,c)}
function Ib(a,b){var c,d,e;if("/"!=b&&"//"!=b)throw Error('Step op should be "/" or "//"');if("."==S(a.a))return d=new U(yb,new G("node")),T(a.a),d;if(".."==S(a.a))return d=new U(xb,new G("node")),T(a.a),d;var f;if("@"==S(a.a))f=lb,T(a.a),W(a,"Missing attribute name");else if("::"==S(a.a,1)){if(!/(?![0-9])[\w]/.test(S(a.a).charAt(0)))throw Error("Bad token: "+T(a.a));c=T(a.a);f=wb[c]||null;if(!f)throw Error("No axis with name: "+c);T(a.a);W(a,"Missing node name")}else f=tb;c=S(a.a);if(/(?![0-9])[\w\*]/.test(c.charAt(0)))if("("==
S(a.a,1)){if(!db(c))throw Error("Invalid node type: "+c);c=T(a.a);if(!db(c))throw Error("Invalid type name: "+c);Eb(a,"(");W(a,"Bad nodetype");e=S(a.a).charAt(0);var g=null;if('"'==e||"'"==e)g=Gb(a);W(a,"Bad nodetype");Fb(a);c=new G(c,g)}else if(c=T(a.a),e=c.indexOf(":"),-1==e)c=new E(c);else{var g=c.substring(0,e),h;if("*"==g)h="*";else if(h=a.b(g),!h)throw Error("Namespace prefix not declared: "+g);c=c.substr(e+1);c=new E(c,h)}else throw Error("Bad token: "+T(a.a));e=new sb(Jb(a),f.a);return d||
new U(f,c,e,"//"==b)}function Jb(a){for(var b=[];"["==S(a.a);){T(a.a);W(a,"Missing predicate expression.");var c=Cb(a);b.push(c);W(a,"Unclosed predicate expression.");Eb(a,"]")}return b}function Db(a){if("-"==S(a.a))return T(a.a),new zb(Db(a));var b=Hb(a);if("|"!=S(a.a))a=b;else{for(b=[b];"|"==T(a.a);)W(a,"Missing next union location path."),b.push(Hb(a));a.a.a--;a=new rb(b)}return a};function Kb(a){switch(a.nodeType){case 1:return ea(Lb,a);case 9:return Kb(a.documentElement);case 11:case 10:case 6:case 12:return Mb;default:return a.parentNode?Kb(a.parentNode):Mb}}function Mb(){return null}function Lb(a,b){if(a.prefix==b)return a.namespaceURI||"http://www.w3.org/1999/xhtml";var c=a.getAttributeNode("xmlns:"+b);return c&&c.specified?c.value||null:a.parentNode&&9!=a.parentNode.nodeType?Lb(a.parentNode,b):null};function Nb(a,b){if(!a.length)throw Error("Empty XPath expression.");var c=fb(a);if(ib(c))throw Error("Invalid XPath expression.");b?"function"==aa(b)||(b=da(b.lookupNamespaceURI,b)):b=function(){return null};var d=Cb(new Bb(c,b));if(!ib(c))throw Error("Bad token: "+T(c));this.evaluate=function(a,b){var c=d.a(new Q(a));return new Y(c,b)}}
function Y(a,b){if(0==b)if(a instanceof C)b=4;else if("string"==typeof a)b=2;else if("number"==typeof a)b=1;else if("boolean"==typeof a)b=3;else throw Error("Unexpected evaluation result.");if(2!=b&&1!=b&&3!=b&&!(a instanceof C))throw Error("value could not be converted to the specified type");this.resultType=b;var c;switch(b){case 2:this.stringValue=a instanceof C?Sa(a):""+a;break;case 1:this.numberValue=a instanceof C?+Sa(a):+a;break;case 3:this.booleanValue=a instanceof C?0<a.l:!!a;break;case 4:case 5:case 6:case 7:var d=
H(a);c=[];for(var e=I(d);e;e=I(d))c.push(e instanceof x?e.a:e);this.snapshotLength=a.l;this.invalidIteratorState=!1;break;case 8:case 9:d=Ra(a);this.singleNodeValue=d instanceof x?d.a:d;break;default:throw Error("Unknown XPathResult type.");}var f=0;this.iterateNext=function(){if(4!=b&&5!=b)throw Error("iterateNext called with wrong result type");return f>=c.length?null:c[f++]};this.snapshotItem=function(a){if(6!=b&&7!=b)throw Error("snapshotItem called with wrong result type");return a>=c.length||
0>a?null:c[a]}}Y.ANY_TYPE=0;Y.NUMBER_TYPE=1;Y.STRING_TYPE=2;Y.BOOLEAN_TYPE=3;Y.UNORDERED_NODE_ITERATOR_TYPE=4;Y.ORDERED_NODE_ITERATOR_TYPE=5;Y.UNORDERED_NODE_SNAPSHOT_TYPE=6;Y.ORDERED_NODE_SNAPSHOT_TYPE=7;Y.ANY_UNORDERED_NODE_TYPE=8;Y.FIRST_ORDERED_NODE_TYPE=9;function Ob(a){this.lookupNamespaceURI=Kb(a)}
function Pb(a,b){var c=a||k,d=c.Document&&c.Document.prototype||c.document;if(!d.evaluate||b)c.XPathResult=Y,d.evaluate=function(a,b,c,d){return(new Nb(a,c)).evaluate(b,d)},d.createExpression=function(a,b){return new Nb(a,b)},d.createNSResolver=function(a){return new Ob(a)}}var Qb=["wgxpath","install"],Z=k;Qb[0]in Z||!Z.execScript||Z.execScript("var "+Qb[0]);for(var Rb;Qb.length&&(Rb=Qb.shift());)Qb.length||void 0===Pb?Z[Rb]?Z=Z[Rb]:Z=Z[Rb]={}:Z[Rb]=Pb;module.exports.install=Pb;module.exports.XPathResultType={ANY_TYPE:0,NUMBER_TYPE:1,STRING_TYPE:2,BOOLEAN_TYPE:3,UNORDERED_NODE_ITERATOR_TYPE:4,ORDERED_NODE_ITERATOR_TYPE:5,UNORDERED_NODE_SNAPSHOT_TYPE:6,ORDERED_NODE_SNAPSHOT_TYPE:7,ANY_UNORDERED_NODE_TYPE:8,FIRST_ORDERED_NODE_TYPE:9};}).call(global)

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],5:[function(require,module,exports){
/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var docReady = require('doc-ready');
var Connexion = require('./http/Connexion');
/**
 * Main BootLoader.
 * Defaults params for constructor should be {} and content.php?get_action=get_boot_conf
 */

var PydioBootstrap = (function () {

    /**
     * Constructor
     * @param startParameters Object The options
     */

    function PydioBootstrap(startParameters) {
        var _this = this;

        _classCallCheck(this, PydioBootstrap);

        this.parameters = new Map();
        for (var i in startParameters) {
            if (startParameters.hasOwnProperty(i)) {
                this.parameters.set(i, startParameters[i]);
            }
        }
        this.detectBaseParameters();

        if (this.parameters.get("ALERT")) {
            window.setTimeout(function () {
                window.alert(_this.parameters.get("ALERT"));
            }, 0);
        }

        docReady((function () {

            var startedFromOpener = false;
            try {
                if (window.opener && window.opener.pydioBootstrap && this.parameters.get('serverAccessPath') === window.opener.pydioBootstrap.parameters.get('serverAccessPath')) {
                    this.parameters = window.opener.pydioBootstrap.parameters;
                    // Handle queryString case, as it's not passed via get_boot_conf
                    var qParams = document.location.href.toQueryParams();
                    if (qParams['external_selector_type']) {
                        this.parameters.set('SELECTOR_DATA', { type: qParams['external_selector_type'], data: qParams });
                    } else {
                        if (this.parameters.get('SELECTOR_DATA')) {
                            this.parameters.unset('SELECTOR_DATA');
                        }
                    }
                    this.refreshContextVariablesAndInit(new Connexion());
                    startedFromOpener = true;
                }
            } catch (e) {
                if (window.console && console.log) console.log(e);
            }
            if (!startedFromOpener) {
                this.loadBootConfig();
            }
        }).bind(this));

        window.Connexion = Connexion;
        window.pydioBootstrap = this;
    }

    /**
     * Real loading action
     */

    PydioBootstrap.prototype.loadBootConfig = function loadBootConfig() {
        if (this.parameters.get('PRELOADED_BOOT_CONF')) {
            var preloaded = this.parameters.get('PRELOADED_BOOT_CONF');
            for (var k in preloaded) {
                if (preloaded.hasOwnProperty(k)) {
                    this.parameters.set(k, preloaded[k]);
                }
            }
            this.refreshContextVariablesAndInit(new Connexion());
            return;
        }

        var url = this.parameters.get('BOOTER_URL') + (this.parameters.get("debugMode") ? '&debug=true' : '');
        if (this.parameters.get('SERVER_PREFIX_URI')) {
            url += '&server_prefix_uri=' + this.parameters.get('SERVER_PREFIX_URI').replace(/\.\.\//g, "_UP_/");
        }
        var connexion = new Connexion(url);
        connexion.onComplete = (function (transport) {
            if (transport.responseXML && transport.responseXML.documentElement && transport.responseXML.documentElement.nodeName == "tree") {
                var alert = XMLUtils.XPathSelectSingleNode(transport.responseXML.documentElement, "message");
                window.alert('Exception caught by application : ' + alert.firstChild.nodeValue);
                return;
            }
            var phpError;
            var data = undefined;
            if (transport.responseJSON) {
                data = transport.responseJSON;
            }
            if (! typeof data === "object") {
                phpError = 'Exception uncaught by application : ' + transport.responseText;
            }
            if (phpError) {
                document.write(phpError);
                if (phpError.indexOf('<b>Notice</b>') > -1 || phpError.indexOf('<b>Strict Standards</b>') > -1) {
                    window.alert('Php errors detected, it seems that Notice or Strict are detected, you may consider changing the PHP Error Reporting level!');
                }
                return;
            }
            for (var key in data) {
                if (data.hasOwnProperty(key)) this.parameters.set(key, data[key]);
            }

            this.refreshContextVariablesAndInit(connexion);
        }).bind(this);
        connexion.sendAsync();
    };

    PydioBootstrap.prototype.refreshContextVariablesAndInit = function refreshContextVariablesAndInit(connexion) {

        Connexion.updateServerAccess(this.parameters);

        var cssRes = this.parameters.get("cssResources");
        if (cssRes) {
            cssRes.map(this.loadCSSResource.bind(this));
        }

        if (this.parameters.get('ajxpResourcesFolder')) {
            connexion._libUrl = this.parameters.get('ajxpResourcesFolder') + "/build";
            window.ajxpResourcesFolder = this.parameters.get('ajxpResourcesFolder') + "/themes/" + this.parameters.get("theme");
        }

        if (this.parameters.get('additional_js_resource')) {
            connexion.loadLibrary(this.parameters.get('additional_js_resource?v=' + this.parameters.get("ajxpVersion")), null, true);
        }

        //this.insertLoaderProgress();
        window.MessageHash = this.parameters.get("i18nMessages");
        if (!Object.keys(MessageHash).length) {
            alert('Ooups, this should not happen, your message file is empty!');
        }
        for (var key in MessageHash) {
            MessageHash[key] = MessageHash[key].replace("\\n", "\n");
        }
        window.zipEnabled = this.parameters.get("zipEnabled");
        window.multipleFilesDownloadEnabled = this.parameters.get("multipleFilesDownloadEnabled");

        var masterClassLoaded = (function () {

            var pydio = new Pydio(this.parameters);
            window.pydio = pydio;

            pydio.observe("actions_loaded", (function () {
                if (!this.parameters.get("SELECTOR_DATA") && pydio.getController().actions.get("ext_select")) {
                    if (pydio.getController().actions._object) {
                        pydio.getController().actions.unset("ext_select");
                    } else {
                        pydio.getController().actions['delete']("ext_select");
                    }
                    pydio.getController().fireContextChange();
                    pydio.getController().fireSelectionChange();
                } else if (this.parameters.get("SELECTOR_DATA")) {
                    pydio.getController().defaultActions.set("file", "ext_select");
                }
            }).bind(this));

            pydio.observe("loaded", (function (e) {
                if (this.parameters.get("SELECTOR_DATA")) {
                    pydio.getController().defaultActions.set("file", "ext_select");
                    pydio.getController().selectorData = this.parameters.get("SELECTOR_DATA");
                }
            }).bind(this));

            if (this.parameters.get("currentLanguage")) {
                pydio.currentLanguage = this.parameters.get("currentLanguage");
            }

            pydio.init();
        }).bind(this);

        if (this.parameters.get("debugMode")) {
            masterClassLoaded();
        } else {
            connexion.loadLibrary("pydio.min.js?v=" + this.parameters.get("ajxpVersion"), masterClassLoaded, true);
        }

        /*
        let div = document.createElement('div');
        div.setAttribute('style', 'position:absolute; bottom: 0; right: 0; z-index: 2000; color:rgba(0,0,0,0.6); font-size: 12px; padding: 0 10px;');
        div.innerHTML = 'Pydio Community Edition - Copyright Abstrium 2017 - Learn more on <a href="https://pydio.com" target="_blank">pydio.com</a>';
        document.body.appendChild(div);
        */
    };

    /**
     * Detect the base path of the javascripts based on the script tags
     */

    PydioBootstrap.prototype.detectBaseParameters = function detectBaseParameters() {

        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
            var scriptTag = scripts[i];
            if (scriptTag.src.match("/build/pydio.boot.min.js") || scriptTag.src.match("/build/boot.prod.js")) {
                if (scriptTag.src.match("/build/pydio.boot.min.js")) {
                    this.parameters.set("debugMode", false);
                } else {
                    this.parameters.set("debugMode", true);
                }
                var src = scriptTag.src.replace('/build/boot.prod.js', '').replace('/build/pydio.boot.min.js', '');
                if (src.indexOf("?") != -1) src = src.split("?")[0];
                this.parameters.set("ajxpResourcesFolder", src);
            }
        }
        if (this.parameters.get("ajxpResourcesFolder")) {
            window.ajxpResourcesFolder = this.parameters.get("ajxpResourcesFolder");
        } else {
            alert("Cannot find resource folder");
        }
        var booterUrl = this.parameters.get("BOOTER_URL");
        if (booterUrl.indexOf("?") > -1) {
            booterUrl = booterUrl.substring(0, booterUrl.indexOf("?"));
        }
        this.parameters.set('ajxpServerAccessPath', booterUrl);
        this.parameters.set('serverAccessPath', booterUrl);
        window.ajxpServerAccessPath = booterUrl;
    };

    /**
     * Loads a CSS file
     * @param fileName String
     */

    PydioBootstrap.prototype.loadCSSResource = function loadCSSResource(fileName) {
        var head = document.getElementsByTagName('head')[0];
        var cssNode = document.createElement('link');
        cssNode.type = 'text/css';
        cssNode.rel = 'stylesheet';
        cssNode.href = this.parameters.get("ajxpResourcesFolder") + '/' + fileName;
        cssNode.media = 'screen';
        head.appendChild(cssNode);
    };

    /**
     * Try to load something under data/cache/
     * @param onError Function
     */

    PydioBootstrap.testDataFolderAccess = function testDataFolderAccess(onError) {
        var c = new Connexion('data/cache/index.html');
        c.setMethod('get');
        c.onComplete = function (response) {
            if (200 === response.status) {
                onError();
            }
        };
        c.sendAsync();
    };

    return PydioBootstrap;
})();

exports['default'] = PydioBootstrap;
module.exports = exports['default'];

},{"./http/Connexion":6,"doc-ready":1}],6:[function(require,module,exports){
/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilXMLUtils = require('../util/XMLUtils');

var _utilXMLUtils2 = _interopRequireDefault(_utilXMLUtils);

/**
 * Pydio encapsulation of XHR / Fetch
 */
require('whatwg-fetch');

var Connexion = (function () {

    /**
     * Constructor
     * @param baseUrl String The base url for services
     */

    function Connexion(baseUrl) {
        _classCallCheck(this, Connexion);

        this._pydio = window.pydio;
        this._baseUrl = baseUrl || window.ajxpServerAccessPath;
        this._libUrl = window.ajxpResourcesFolder + '/build';
        this._parameters = new Map();
        this._method = 'post';
        this.discrete = false;
    }

    Connexion.updateServerAccess = function updateServerAccess(parameters) {

        if (parameters.get('SECURE_TOKEN')) {
            Connexion.SECURE_TOKEN = parameters.get('SECURE_TOKEN');
        }
        var serverAccessPath = parameters.get('ajxpServerAccess').split('?').shift();
        if (parameters.get('SERVER_PREFIX_URI')) {
            parameters.set('ajxpResourcesFolder', parameters.get('SERVER_PREFIX_URI') + parameters.get('ajxpResourcesFolder'));
            serverAccessPath = parameters.get('SERVER_PREFIX_URI') + serverAccessPath + '?' + (Connexion.SECURE_TOKEN ? 'secure_token=' + Connexion.SECURE_TOKEN : '');
        } else {
            serverAccessPath = serverAccessPath + '?' + (Connexion.SECURE_TOKEN ? 'secure_token=' + Connexion.SECURE_TOKEN : '');
        }
        if (parameters.get('SERVER_PERMANENT_PARAMS')) {
            var permParams = parameters.get('SERVER_PERMANENT_PARAMS');
            var permStrings = [];
            for (var permanent in permParams) {
                if (permParams.hasOwnProperty(permanent)) {
                    permStrings.push(permanent + '=' + permParams[permanent]);
                }
            }
            permStrings = permStrings.join('&');
            if (permStrings) {
                serverAccessPath += '&' + permStrings;
            }
        }

        parameters.set('ajxpServerAccess', serverAccessPath);
        // BACKWARD COMPAT
        window.ajxpServerAccessPath = serverAccessPath;
        if (window.pydioBootstrap && window.pydioBootstrap.parameters) {
            pydioBootstrap.parameters.set("ajxpServerAccess", serverAccessPath);
            pydioBootstrap.parameters.set("SECURE_TOKEN", Connexion.SECURE_TOKEN);
        }
    };

    Connexion.log = function log(action, syncStatus) {
        if (!Connexion.PydioLogs) {
            Connexion.PydioLogs = [];
        }
        Connexion.PydioLogs.push({ action: action, sync: syncStatus });
    };

    /**
     * Add a parameter to the query
     * @param paramName String
     * @param paramValue String
     */

    Connexion.prototype.addParameter = function addParameter(paramName, paramValue) {
        if (this._parameters.get(paramName) && paramName.endsWith('[]')) {
            var existing = this._parameters.get(paramName);
            if (!existing instanceof Array) {
                existing = [existing];
            }
            existing.push(paramValue);
            this._parameters.set(paramName, existing);
        } else {
            this._parameters.set(paramName, paramValue);
        }
    };

    /**
     * Sets the whole parameter as a bunch
     * @param hParameters Map
     */

    Connexion.prototype.setParameters = function setParameters(hParameters) {
        if (hParameters instanceof Map) {
            this._parameters = hParameters;
        } else {
            if (hParameters._object) {
                console.error('Passed a legacy Hash object to Connexion.setParameters');
                hParameters = hParameters._object;
            }
            for (var key in hParameters) {
                if (hParameters.hasOwnProperty(key)) {
                    this._parameters.set(key, hParameters[key]);
                }
            }
        }
    };

    /**
     * Set the query method (get post)
     * @param method String
     */

    Connexion.prototype.setMethod = function setMethod(method) {
        this._method = method;
    };

    /**
     * Add the secure token parameter
     */

    Connexion.prototype.addSecureToken = function addSecureToken() {

        if (Connexion.SECURE_TOKEN && this._baseUrl.indexOf('secure_token') == -1 && !this._parameters.get('secure_token')) {

            this.addParameter('secure_token', Connexion.SECURE_TOKEN);
        } else if (this._baseUrl.indexOf('secure_token=') !== -1) {

            // Remove from baseUrl and set inside params
            var parts = this._baseUrl.split('secure_token=');
            var toks = parts[1].split('&');
            var token = toks.shift();
            var rest = toks.join('&');
            this._baseUrl = parts[0] + (rest ? '&' + rest : '');
            this._parameters.set('secure_token', token);
        }
    };

    Connexion.prototype.addServerPermanentParams = function addServerPermanentParams() {
        if (!this._pydio || !this._pydio.Parameters.has('SERVER_PERMANENT_PARAMS')) {
            return;
        }
        var permParams = this._pydio.Parameters.get('SERVER_PERMANENT_PARAMS');
        for (var permanent in permParams) {
            if (permParams.hasOwnProperty(permanent)) {
                this.addParameter(permanent, permParams[permanent]);
            }
        }
    };

    /**
     * Show a small loader
     */

    Connexion.prototype.showLoader = function showLoader() {
        if (this.discrete || !this._pydio) return;
        this._pydio.notify("connection-start");
    };

    /**
     * Hide a small loader
     */

    Connexion.prototype.hideLoader = function hideLoader() {
        if (this.discrete || !this._pydio) return;
        this._pydio.notify("connection-end");
    };

    Connexion.prototype._send = function _send() {
        var _this = this;

        var aSync = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

        Connexion.log(this._parameters.get("get_action"), aSync ? 'async' : 'sync');
        this.addSecureToken();
        this.addServerPermanentParams();
        this.showLoader();
        var oThis = this;
        var options = {
            method: this._method,
            credentials: 'same-origin'
        };
        var url = this._baseUrl;
        if (!aSync) {
            options.synchronous = true;
        }
        var bodyParts = [];
        this._parameters.forEach(function (value, key) {
            if (value instanceof Array) {
                value.map(function (oneV) {
                    bodyParts.push(key + '=' + encodeURIComponent(oneV));
                });
            } else {
                bodyParts.push(key + '=' + encodeURIComponent(value));
            }
        });
        var queryString = bodyParts.join('&');
        if (this._method === 'post') {
            options.headers = { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8" };
            options.body = queryString;
        } else {
            url += (url.indexOf('?') > -1 ? '&' : '?') + queryString;
        }
        window.fetch(url, options).then(function (response) {

            var h = response.headers.get('Content-type');
            if (h.indexOf('/json') !== -1) {
                response.json().then(function (json) {
                    oThis.applyComplete({ responseJSON: json }, response);
                });
            } else if (h.indexOf('/xml') !== -1) {
                response.text().then(function (text) {
                    oThis.applyComplete({ responseXML: _utilXMLUtils2['default'].parseXml(text) }, response);
                });
            } else {
                response.text().then(function (text) {
                    oThis.applyComplete({ responseText: text }, response);
                });
            }
            return response;
        })['catch'](function (error) {
            if (_this._pydio) {
                _this._pydio.displayMessage('ERROR', 'Network error ' + error.message);
            }
        });
    };

    /**
     * Send Asynchronously
     */

    Connexion.prototype.sendAsync = function sendAsync() {
        this._send(true);
    };

    /**
     * Send synchronously
     */

    Connexion.prototype.sendSync = function sendSync() {
        this._send(false);
    };

    /**
     * Apply the complete callback, try to grab maximum of errors
     * @param parsedBody Transpot
     */

    Connexion.prototype.applyComplete = function applyComplete(parsedBody, response) {
        this.hideLoader();
        var pydio = this._pydio;
        var message = undefined,
            tokenMessage = undefined;
        var tok1 = "Ooops, it seems that your security token has expired! Please %s by hitting refresh or F5 in your browser!";
        var tok2 = "reload the page";
        if (window.MessageHash && window.MessageHash[437]) {
            tok1 = window.MessageHash[437];
            tok2 = window.MessageHash[438];
        }
        tokenMessage = tok1.replace("%s", "<a href='javascript:document.location.reload()' style='text-decoration: underline;'>" + tok2 + "</a>");

        var ctype = response.headers.get('Content-type');
        if (parsedBody.responseXML && parsedBody.responseXML.documentElement && parsedBody.responseXML.documentElement.nodeName == "parsererror") {

            message = "Parsing error : \n" + parsedBody.responseXML.documentElement.firstChild.textContent;
        } else if (parsedBody.responseXML && parsedBody.responseXML.parseError && parsedBody.responseXML.parseError.errorCode != 0) {

            message = "Parsing Error : \n" + parsedBody.responseXML.parseError.reason;
        } else if (ctype.indexOf("text/xml") > -1 && parsedBody.responseXML == null) {

            message = "Expected XML but got empty response!";
        } else if (ctype.indexOf("text/xml") == -1 && ctype.indexOf("application/json") == -1 && parsedBody.responseText.indexOf("<b>Fatal error</b>") > -1) {

            message = parsedBody.responseText.replace("<br />", "");
        } else if (response.status == 500) {

            message = "Internal Server Error: you should check your web server logs to find what's going wrong!";
        }
        if (message) {

            if (message.startsWith("You are not allowed to access this resource.")) {
                message = tokenMessage;
            }
            if (pydio) {
                pydio.displayMessage("ERROR", message);
            } else {
                alert(message);
            }
        }
        if (parsedBody.responseXML && parsedBody.responseXML.documentElement) {

            var authNode = _utilXMLUtils2['default'].XPathSelectSingleNode(parsedBody.responseXML.documentElement, "require_auth");
            if (authNode && pydio) {
                var root = pydio.getContextHolder().getRootNode();
                if (root) {
                    pydio.getContextHolder().setContextNode(root);
                    root.clear();
                }
                pydio.getController().fireAction('logout');
                pydio.getController().fireAction('login');
            }

            var messageNode = _utilXMLUtils2['default'].XPathSelectSingleNode(parsedBody.responseXML.documentElement, "message");
            if (messageNode) {
                var messageType = messageNode.getAttribute("type").toUpperCase();
                var messageContent = _utilXMLUtils2['default'].getDomNodeText(messageNode);
                if (messageContent.startsWith("You are not allowed to access this resource.")) {
                    messageContent = tokenMessage;
                }
                if (pydio) {
                    pydio.displayMessage(messageType, messageContent);
                } else {
                    if (messageType == "ERROR") {
                        alert(messageType + ":" + messageContent);
                    }
                }
                if (messageType == "SUCCESS") messageNode.parentNode.removeChild(messageNode);
            }
        }
        if (this.onComplete) {

            parsedBody.status = response.status;
            parsedBody.responseObject = response;
            this.onComplete(parsedBody);
        }
        if (pydio) {
            pydio.fire("server_answer", this);
        }
    };

    Connexion.prototype.uploadFile = function uploadFile(file, fileParameterName, uploadUrl, onComplete, onError, onProgress, xhrSettings) {

        if (xhrSettings === undefined) xhrSettings = {};

        if (!onComplete) onComplete = function () {};
        if (!onError) onError = function () {};
        if (!onProgress) onProgress = function () {};
        var xhr = this.initializeXHRForUpload(uploadUrl, onComplete, onError, onProgress, xhrSettings);
        if (xhrSettings && xhrSettings.method === 'PUT') {
            xhr.send(file);
            return xhr;
        }
        if (window.FormData) {
            this.sendFileUsingFormData(xhr, file, fileParameterName);
        } else if (window.FileReader) {
            var fileReader = new FileReader();
            fileReader.onload = (function (e) {
                this.xhrSendAsBinary(xhr, file.name, e.target.result, fileParameterName);
            }).bind(this);
            fileReader.readAsBinaryString(file);
        } else if (file.getAsBinary) {
            this.xhrSendAsBinary(xhr, file.name, file.getAsBinary(), fileParameterName);
        }
        return xhr;
    };

    Connexion.prototype.initializeXHRForUpload = function initializeXHRForUpload(url, onComplete, onError, onProgress, xhrSettings) {

        if (xhrSettings === undefined) xhrSettings = {};

        var xhr = new XMLHttpRequest();
        var upload = xhr.upload;
        if (xhrSettings.withCredentials) {
            xhr.withCredentials = true;
        }
        upload.addEventListener("progress", function (e) {
            if (!e.lengthComputable) return;
            onProgress(e);
        }, false);
        xhr.onreadystatechange = (function () {
            if (xhr.readyState == 4) {
                if (xhr.status === 200) {
                    onComplete(xhr);
                } else {
                    onError(xhr);
                }
            }
        }).bind(this);
        upload.onerror = function () {
            onError(xhr);
        };
        var method = 'POST';
        if (xhrSettings.method) {
            method = xhrSettings.method;
        }
        xhr.open(method, url, true);
        if (xhrSettings.customHeaders) {
            Object.keys(xhrSettings.customHeaders).forEach(function (k) {
                xhr.setRequestHeader(k, xhrSettings.customHeaders[k]);
            });
        }

        return xhr;
    };

    Connexion.prototype.sendFileUsingFormData = function sendFileUsingFormData(xhr, file, fileParameterName) {
        var formData = new FormData();
        formData.append(fileParameterName, file);
        xhr.send(formData);
    };

    Connexion.prototype.xhrSendAsBinary = function xhrSendAsBinary(xhr, fileName, fileData, fileParameterName) {
        var boundary = '----MultiPartFormBoundary' + new Date().getTime();
        xhr.setRequestHeader("Content-Type", "multipart/form-data, boundary=" + boundary);

        var body = "--" + boundary + "\r\n";
        body += "Content-Disposition: form-data; name='" + fileParameterName + "'; filename='" + unescape(encodeURIComponent(fileName)) + "'\r\n";
        body += "Content-Type: application/octet-stream\r\n\r\n";
        body += fileData + "\r\n";
        body += "--" + boundary + "--\r\n";

        xhr.sendAsBinary(body);
    };

    /**
     * Load a javascript library
     * @param fileName String
     * @param onLoadedCode Function Callback
        * @param aSync Boolean load library asynchroneously
     */

    Connexion.prototype.loadLibrary = function loadLibrary(fileName, onLoadedCode, aSync) {
        var _this2 = this;

        if (window.pydioBootstrap && window.pydioBootstrap.parameters.get("ajxpVersion") && fileName.indexOf("?") == -1) {
            fileName += "?v=" + window.pydioBootstrap.parameters.get("ajxpVersion");
        }
        var url = this._libUrl ? this._libUrl + '/' + fileName : fileName;
        var pydio = this._pydio;

        var scriptLoaded = function scriptLoaded(script) {
            try {
                if (window.execScript) {
                    window.execScript(script);
                } else {
                    window.my_code = script;
                    var head = document.getElementsByTagName('head')[0];
                    var script_tag = document.createElement('script');
                    script_tag.type = 'text/javascript';
                    script_tag.innerHTML = 'eval(window.my_code)';
                    head.appendChild(script_tag);
                    delete window.my_code;
                    head.removeChild(script_tag);
                }
                if (onLoadedCode != null) onLoadedCode();
            } catch (e) {
                alert('error loading ' + fileName + ':' + e.message);
                if (console) console.error(e);
            }
            if (pydio) pydio.fire("server_answer");
        };

        if (aSync) {
            window.fetch(url, {
                method: 'GET',
                credentials: 'same-origin'
            }).then(function (response) {
                return response.text();
            }).then(function (script) {
                scriptLoaded(script);
            });
        } else {
            (function () {
                // SHOULD BE REMOVED!!
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = (function () {
                    if (xhr.readyState == 4) {
                        if (xhr.status === 200) {
                            scriptLoaded(xhr.responseText);
                        } else {
                            alert('error loading ' + fileName + ': Status code was ' + xhr.status);
                        }
                    }
                }).bind(_this2);
                xhr.open("GET", url, false);
                xhr.send();
            })();
        }
    };

    return Connexion;
})();

exports['default'] = Connexion;
module.exports = exports['default'];

},{"../util/XMLUtils":7,"whatwg-fetch":3}],7:[function(require,module,exports){
/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com/>.
 *
 */
'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _wickedGoodXpath = require('wicked-good-xpath');

var _wickedGoodXpath2 = _interopRequireDefault(_wickedGoodXpath);

_wickedGoodXpath2['default'].install();
/**
 * Utilitary class for manipulating XML
 */

var XMLUtils = (function () {
    function XMLUtils() {
        _classCallCheck(this, XMLUtils);
    }

    /**
     * Selects the first XmlNode that matches the XPath expression.
     *
     * @param element {Element | Document} root element for the search
     * @param query {String} XPath query
     * @return {Element} first matching element
     * @signature function(element, query)
     */

    XMLUtils.XPathSelectSingleNode = function XPathSelectSingleNode(element, query) {
        try {
            if (element['selectSingleNode'] && typeof element.selectSingleNode === "function") {
                var res = element.selectSingleNode(query);
                if (res) return res;
            }
        } catch (e) {}

        if (!XMLUtils.__xpe && window.XPathEvaluator) {
            try {
                XMLUtils.__xpe = new XPathEvaluator();
            } catch (e) {}
        }

        if (!XMLUtils.__xpe) {
            query = document.createExpression(query, null);
            var result = query.evaluate(element, 7, null);
            return result.snapshotLength ? result.snapshotItem(0) : null;
        }

        var xpe = XMLUtils.__xpe;

        try {
            return xpe.evaluate(query, element, xpe.createNSResolver(element), XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        } catch (err) {
            throw new Error("selectSingleNode: query: " + query + ", element: " + element + ", error: " + err);
        }
    };

    /**
     * Selects a list of nodes matching the XPath expression.
     *
     * @param element {Element | Document} root element for the search
     * @param query {String} XPath query
     * @return {Element[]} List of matching elements
     * @signature function(element, query)
     */

    XMLUtils.XPathSelectNodes = function XPathSelectNodes(element, query) {
        try {
            if (typeof element.selectNodes === "function") {
                try {
                    if (element.ownerDocument && element.ownerDocument.setProperty) {
                        element.ownerDocument.setProperty("SelectionLanguage", "XPath");
                    } else if (element.setProperty) {
                        element.setProperty("SelectionLanguage", "XPath");
                    }
                } catch (e) {}
                var res = Array.from(element.selectNodes(query));
                if (res) return res;
            }
        } catch (e) {}

        var xpe = XMLUtils.__xpe;

        if (!xpe && window.XPathEvaluator) {
            try {
                XMLUtils.__xpe = xpe = new XPathEvaluator();
            } catch (e) {}
        }
        var result,
            nodes = [],
            i;
        if (!XMLUtils.__xpe) {
            query = document.createExpression(query, null);
            result = query.evaluate(element, 7, null);
            nodes = [];
            for (i = 0; i < result.snapshotLength; i++) {
                if (Element.extend) {
                    nodes[i] = Element.extend(result.snapshotItem(i));
                } else {
                    nodes[i] = result.snapshotItem(i);
                }
            }
            return nodes;
        }

        try {
            result = xpe.evaluate(query, element, xpe.createNSResolver(element), XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        } catch (err) {
            throw new Error("selectNodes: query: " + query + ", element: " + element + ", error: " + err);
        }

        for (i = 0; i < result.snapshotLength; i++) {
            nodes[i] = result.snapshotItem(i);
        }

        return nodes;
    };

    /**
     * Selects the first XmlNode that matches the XPath expression and returns the text content of the element
     *
     * @param element {Element|Document} root element for the search
     * @param query {String}  XPath query
     * @return {String} the joined text content of the found element or null if not appropriate.
     * @signature function(element, query)
     */

    XMLUtils.XPathGetSingleNodeText = function XPathGetSingleNodeText(element, query) {
        var node = XMLUtils.XPathSelectSingleNode(element, query);
        return XMLUtils.getDomNodeText(node);
    };

    XMLUtils.getDomNodeText = function getDomNodeText(node) {
        var includeCData = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        if (!node || !node.nodeType) {
            return null;
        }

        switch (node.nodeType) {
            case 1:
                // NODE_ELEMENT
                var i,
                    a = [],
                    nodes = node.childNodes,
                    length = nodes.length;
                for (i = 0; i < length; i++) {
                    a[i] = XMLUtils.getDomNodeText(nodes[i], includeCData);
                }

                return a.join("");

            case 2:
                // NODE_ATTRIBUTE
                return node.value;

            case 3:
                // NODE_TEXT
                return node.nodeValue;

            case 4:
                // CDATA
                if (includeCData) return node.nodeValue;
                break;
        }

        return null;
    };

    /**
     * @param xmlStr
     * @returns {*}
     */

    XMLUtils.parseXml = function parseXml(xmlStr) {

        if (typeof window.DOMParser != "undefined") {
            return new window.DOMParser().parseFromString(xmlStr, "text/xml");
        }
        if (typeof window.ActiveXObject != "undefined" && new window.ActiveXObject("MSXML2.DOMDocument.6.0")) {
            var xmlDoc = new window.ActiveXObject("MSXML2.DOMDocument.6.0");
            xmlDoc.validateOnParse = false;
            xmlDoc.async = false;
            xmlDoc.loadXML(xmlStr);
            xmlDoc.setProperty('SelectionLanguage', 'XPath');
            return xmlDoc;
        }
        throw new Error('Cannot parse XML string');
    };

    return XMLUtils;
})();

exports['default'] = XMLUtils;
module.exports = exports['default'];

},{"wicked-good-xpath":4}]},{},[5])(5)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZG9jLXJlYWR5L2RvYy1yZWFkeS5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudGllL2V2ZW50aWUuanMiLCJub2RlX21vZHVsZXMvd2hhdHdnLWZldGNoL2ZldGNoLmpzIiwibm9kZV9tb2R1bGVzL3dpY2tlZC1nb29kLXhwYXRoL2Rpc3Qvd2d4cGF0aC5pbnN0YWxsLW5vZGUuanMiLCJyZXMvYnVpbGQvY29yZS9QeWRpb0Jvb3RzdHJhcC5qcyIsInJlcy9idWlsZC9jb3JlL2h0dHAvQ29ubmV4aW9uLmpzIiwicmVzL2J1aWxkL2NvcmUvdXRpbC9YTUxVdGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbGRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xnQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIVxuICogZG9jUmVhZHkgdjEuMC40XG4gKiBDcm9zcyBicm93c2VyIERPTUNvbnRlbnRMb2FkZWQgZXZlbnQgZW1pdHRlclxuICogTUlUIGxpY2Vuc2VcbiAqL1xuXG4vKmpzaGludCBicm93c2VyOiB0cnVlLCBzdHJpY3Q6IHRydWUsIHVuZGVmOiB0cnVlLCB1bnVzZWQ6IHRydWUqL1xuLypnbG9iYWwgZGVmaW5lOiBmYWxzZSwgcmVxdWlyZTogZmFsc2UsIG1vZHVsZTogZmFsc2UgKi9cblxuKCBmdW5jdGlvbiggd2luZG93ICkge1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBkb2N1bWVudCA9IHdpbmRvdy5kb2N1bWVudDtcbi8vIGNvbGxlY3Rpb24gb2YgZnVuY3Rpb25zIHRvIGJlIHRyaWdnZXJlZCBvbiByZWFkeVxudmFyIHF1ZXVlID0gW107XG5cbmZ1bmN0aW9uIGRvY1JlYWR5KCBmbiApIHtcbiAgLy8gdGhyb3cgb3V0IG5vbi1mdW5jdGlvbnNcbiAgaWYgKCB0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCBkb2NSZWFkeS5pc1JlYWR5ICkge1xuICAgIC8vIHJlYWR5IG5vdywgaGl0IGl0XG4gICAgZm4oKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBxdWV1ZSBmdW5jdGlvbiB3aGVuIHJlYWR5XG4gICAgcXVldWUucHVzaCggZm4gKTtcbiAgfVxufVxuXG5kb2NSZWFkeS5pc1JlYWR5ID0gZmFsc2U7XG5cbi8vIHRyaWdnZXJlZCBvbiB2YXJpb3VzIGRvYyByZWFkeSBldmVudHNcbmZ1bmN0aW9uIG9uUmVhZHkoIGV2ZW50ICkge1xuICAvLyBiYWlsIGlmIGFscmVhZHkgdHJpZ2dlcmVkIG9yIElFOCBkb2N1bWVudCBpcyBub3QgcmVhZHkganVzdCB5ZXRcbiAgdmFyIGlzSUU4Tm90UmVhZHkgPSBldmVudC50eXBlID09PSAncmVhZHlzdGF0ZWNoYW5nZScgJiYgZG9jdW1lbnQucmVhZHlTdGF0ZSAhPT0gJ2NvbXBsZXRlJztcbiAgaWYgKCBkb2NSZWFkeS5pc1JlYWR5IHx8IGlzSUU4Tm90UmVhZHkgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdHJpZ2dlcigpO1xufVxuXG5mdW5jdGlvbiB0cmlnZ2VyKCkge1xuICBkb2NSZWFkeS5pc1JlYWR5ID0gdHJ1ZTtcbiAgLy8gcHJvY2VzcyBxdWV1ZVxuICBmb3IgKCB2YXIgaT0wLCBsZW4gPSBxdWV1ZS5sZW5ndGg7IGkgPCBsZW47IGkrKyApIHtcbiAgICB2YXIgZm4gPSBxdWV1ZVtpXTtcbiAgICBmbigpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGRlZmluZURvY1JlYWR5KCBldmVudGllICkge1xuICAvLyB0cmlnZ2VyIHJlYWR5IGlmIHBhZ2UgaXMgcmVhZHlcbiAgaWYgKCBkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnICkge1xuICAgIHRyaWdnZXIoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBsaXN0ZW4gZm9yIGV2ZW50c1xuICAgIGV2ZW50aWUuYmluZCggZG9jdW1lbnQsICdET01Db250ZW50TG9hZGVkJywgb25SZWFkeSApO1xuICAgIGV2ZW50aWUuYmluZCggZG9jdW1lbnQsICdyZWFkeXN0YXRlY2hhbmdlJywgb25SZWFkeSApO1xuICAgIGV2ZW50aWUuYmluZCggd2luZG93LCAnbG9hZCcsIG9uUmVhZHkgKTtcbiAgfVxuXG4gIHJldHVybiBkb2NSZWFkeTtcbn1cblxuLy8gdHJhbnNwb3J0XG5pZiAoIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgLy8gQU1EXG4gIGRlZmluZSggWyAnZXZlbnRpZS9ldmVudGllJyBdLCBkZWZpbmVEb2NSZWFkeSApO1xufSBlbHNlIGlmICggdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICkge1xuICBtb2R1bGUuZXhwb3J0cyA9IGRlZmluZURvY1JlYWR5KCByZXF1aXJlKCdldmVudGllJykgKTtcbn0gZWxzZSB7XG4gIC8vIGJyb3dzZXIgZ2xvYmFsXG4gIHdpbmRvdy5kb2NSZWFkeSA9IGRlZmluZURvY1JlYWR5KCB3aW5kb3cuZXZlbnRpZSApO1xufVxuXG59KSggd2luZG93ICk7XG4iLCIvKiFcbiAqIGV2ZW50aWUgdjEuMC42XG4gKiBldmVudCBiaW5kaW5nIGhlbHBlclxuICogICBldmVudGllLmJpbmQoIGVsZW0sICdjbGljaycsIG15Rm4gKVxuICogICBldmVudGllLnVuYmluZCggZWxlbSwgJ2NsaWNrJywgbXlGbiApXG4gKiBNSVQgbGljZW5zZVxuICovXG5cbi8qanNoaW50IGJyb3dzZXI6IHRydWUsIHVuZGVmOiB0cnVlLCB1bnVzZWQ6IHRydWUgKi9cbi8qZ2xvYmFsIGRlZmluZTogZmFsc2UsIG1vZHVsZTogZmFsc2UgKi9cblxuKCBmdW5jdGlvbiggd2luZG93ICkge1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBkb2NFbGVtID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG52YXIgYmluZCA9IGZ1bmN0aW9uKCkge307XG5cbmZ1bmN0aW9uIGdldElFRXZlbnQoIG9iaiApIHtcbiAgdmFyIGV2ZW50ID0gd2luZG93LmV2ZW50O1xuICAvLyBhZGQgZXZlbnQudGFyZ2V0XG4gIGV2ZW50LnRhcmdldCA9IGV2ZW50LnRhcmdldCB8fCBldmVudC5zcmNFbGVtZW50IHx8IG9iajtcbiAgcmV0dXJuIGV2ZW50O1xufVxuXG5pZiAoIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lciApIHtcbiAgYmluZCA9IGZ1bmN0aW9uKCBvYmosIHR5cGUsIGZuICkge1xuICAgIG9iai5hZGRFdmVudExpc3RlbmVyKCB0eXBlLCBmbiwgZmFsc2UgKTtcbiAgfTtcbn0gZWxzZSBpZiAoIGRvY0VsZW0uYXR0YWNoRXZlbnQgKSB7XG4gIGJpbmQgPSBmdW5jdGlvbiggb2JqLCB0eXBlLCBmbiApIHtcbiAgICBvYmpbIHR5cGUgKyBmbiBdID0gZm4uaGFuZGxlRXZlbnQgP1xuICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBldmVudCA9IGdldElFRXZlbnQoIG9iaiApO1xuICAgICAgICBmbi5oYW5kbGVFdmVudC5jYWxsKCBmbiwgZXZlbnQgKTtcbiAgICAgIH0gOlxuICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBldmVudCA9IGdldElFRXZlbnQoIG9iaiApO1xuICAgICAgICBmbi5jYWxsKCBvYmosIGV2ZW50ICk7XG4gICAgICB9O1xuICAgIG9iai5hdHRhY2hFdmVudCggXCJvblwiICsgdHlwZSwgb2JqWyB0eXBlICsgZm4gXSApO1xuICB9O1xufVxuXG52YXIgdW5iaW5kID0gZnVuY3Rpb24oKSB7fTtcblxuaWYgKCBkb2NFbGVtLnJlbW92ZUV2ZW50TGlzdGVuZXIgKSB7XG4gIHVuYmluZCA9IGZ1bmN0aW9uKCBvYmosIHR5cGUsIGZuICkge1xuICAgIG9iai5yZW1vdmVFdmVudExpc3RlbmVyKCB0eXBlLCBmbiwgZmFsc2UgKTtcbiAgfTtcbn0gZWxzZSBpZiAoIGRvY0VsZW0uZGV0YWNoRXZlbnQgKSB7XG4gIHVuYmluZCA9IGZ1bmN0aW9uKCBvYmosIHR5cGUsIGZuICkge1xuICAgIG9iai5kZXRhY2hFdmVudCggXCJvblwiICsgdHlwZSwgb2JqWyB0eXBlICsgZm4gXSApO1xuICAgIHRyeSB7XG4gICAgICBkZWxldGUgb2JqWyB0eXBlICsgZm4gXTtcbiAgICB9IGNhdGNoICggZXJyICkge1xuICAgICAgLy8gY2FuJ3QgZGVsZXRlIHdpbmRvdyBvYmplY3QgcHJvcGVydGllc1xuICAgICAgb2JqWyB0eXBlICsgZm4gXSA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH07XG59XG5cbnZhciBldmVudGllID0ge1xuICBiaW5kOiBiaW5kLFxuICB1bmJpbmQ6IHVuYmluZFxufTtcblxuLy8gLS0tLS0gbW9kdWxlIGRlZmluaXRpb24gLS0tLS0gLy9cblxuaWYgKCB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gIC8vIEFNRFxuICBkZWZpbmUoIGV2ZW50aWUgKTtcbn0gZWxzZSBpZiAoIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyApIHtcbiAgLy8gQ29tbW9uSlNcbiAgbW9kdWxlLmV4cG9ydHMgPSBldmVudGllO1xufSBlbHNlIHtcbiAgLy8gYnJvd3NlciBnbG9iYWxcbiAgd2luZG93LmV2ZW50aWUgPSBldmVudGllO1xufVxuXG59KSggd2luZG93ICk7XG4iLCIoZnVuY3Rpb24oc2VsZikge1xuICAndXNlIHN0cmljdCc7XG5cbiAgaWYgKHNlbGYuZmV0Y2gpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHZhciBzdXBwb3J0ID0ge1xuICAgIHNlYXJjaFBhcmFtczogJ1VSTFNlYXJjaFBhcmFtcycgaW4gc2VsZixcbiAgICBpdGVyYWJsZTogJ1N5bWJvbCcgaW4gc2VsZiAmJiAnaXRlcmF0b3InIGluIFN5bWJvbCxcbiAgICBibG9iOiAnRmlsZVJlYWRlcicgaW4gc2VsZiAmJiAnQmxvYicgaW4gc2VsZiAmJiAoZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBuZXcgQmxvYigpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSkoKSxcbiAgICBmb3JtRGF0YTogJ0Zvcm1EYXRhJyBpbiBzZWxmLFxuICAgIGFycmF5QnVmZmVyOiAnQXJyYXlCdWZmZXInIGluIHNlbGZcbiAgfVxuXG4gIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyKSB7XG4gICAgdmFyIHZpZXdDbGFzc2VzID0gW1xuICAgICAgJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgICAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgSW50MTZBcnJheV0nLFxuICAgICAgJ1tvYmplY3QgVWludDE2QXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IFVpbnQzMkFycmF5XScsXG4gICAgICAnW29iamVjdCBGbG9hdDMyQXJyYXldJyxcbiAgICAgICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nXG4gICAgXVxuXG4gICAgdmFyIGlzRGF0YVZpZXcgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogJiYgRGF0YVZpZXcucHJvdG90eXBlLmlzUHJvdG90eXBlT2Yob2JqKVxuICAgIH1cblxuICAgIHZhciBpc0FycmF5QnVmZmVyVmlldyA9IEFycmF5QnVmZmVyLmlzVmlldyB8fCBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogJiYgdmlld0NsYXNzZXMuaW5kZXhPZihPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSkgPiAtMVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU5hbWUobmFtZSkge1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIG5hbWUgPSBTdHJpbmcobmFtZSlcbiAgICB9XG4gICAgaWYgKC9bXmEtejAtOVxcLSMkJSYnKisuXFxeX2B8fl0vaS50ZXN0KG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGNoYXJhY3RlciBpbiBoZWFkZXIgZmllbGQgbmFtZScpXG4gICAgfVxuICAgIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKClcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlKVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIC8vIEJ1aWxkIGEgZGVzdHJ1Y3RpdmUgaXRlcmF0b3IgZm9yIHRoZSB2YWx1ZSBsaXN0XG4gIGZ1bmN0aW9uIGl0ZXJhdG9yRm9yKGl0ZW1zKSB7XG4gICAgdmFyIGl0ZXJhdG9yID0ge1xuICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGl0ZW1zLnNoaWZ0KClcbiAgICAgICAgcmV0dXJuIHtkb25lOiB2YWx1ZSA9PT0gdW5kZWZpbmVkLCB2YWx1ZTogdmFsdWV9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuaXRlcmFibGUpIHtcbiAgICAgIGl0ZXJhdG9yW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZXJhdG9yXG4gIH1cblxuICBmdW5jdGlvbiBIZWFkZXJzKGhlYWRlcnMpIHtcbiAgICB0aGlzLm1hcCA9IHt9XG5cbiAgICBpZiAoaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcbiAgICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCB2YWx1ZSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGhlYWRlcnMpKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24oaGVhZGVyKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKGhlYWRlclswXSwgaGVhZGVyWzFdKVxuICAgICAgfSwgdGhpcylcbiAgICB9IGVsc2UgaWYgKGhlYWRlcnMpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGhlYWRlcnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCBoZWFkZXJzW25hbWVdKVxuICAgICAgfSwgdGhpcylcbiAgICB9XG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIG5hbWUgPSBub3JtYWxpemVOYW1lKG5hbWUpXG4gICAgdmFsdWUgPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbiAgICB2YXIgb2xkVmFsdWUgPSB0aGlzLm1hcFtuYW1lXVxuICAgIHRoaXMubWFwW25hbWVdID0gb2xkVmFsdWUgPyBvbGRWYWx1ZSsnLCcrdmFsdWUgOiB2YWx1ZVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgIG5hbWUgPSBub3JtYWxpemVOYW1lKG5hbWUpXG4gICAgcmV0dXJuIHRoaXMuaGFzKG5hbWUpID8gdGhpcy5tYXBbbmFtZV0gOiBudWxsXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5vcm1hbGl6ZU5hbWUobmFtZSkpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMubWFwKSB7XG4gICAgICBpZiAodGhpcy5tYXAuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB0aGlzLm1hcFtuYW1lXSwgbmFtZSwgdGhpcylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5rZXlzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGl0ZW1zID0gW11cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHsgaXRlbXMucHVzaChuYW1lKSB9KVxuICAgIHJldHVybiBpdGVyYXRvckZvcihpdGVtcylcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLnZhbHVlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7IGl0ZW1zLnB1c2godmFsdWUpIH0pXG4gICAgcmV0dXJuIGl0ZXJhdG9yRm9yKGl0ZW1zKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZW50cmllcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpdGVtcyA9IFtdXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IGl0ZW1zLnB1c2goW25hbWUsIHZhbHVlXSkgfSlcbiAgICByZXR1cm4gaXRlcmF0b3JGb3IoaXRlbXMpXG4gIH1cblxuICBpZiAoc3VwcG9ydC5pdGVyYWJsZSkge1xuICAgIEhlYWRlcnMucHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl0gPSBIZWFkZXJzLnByb3RvdHlwZS5lbnRyaWVzXG4gIH1cblxuICBmdW5jdGlvbiBjb25zdW1lZChib2R5KSB7XG4gICAgaWYgKGJvZHkuYm9keVVzZWQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKSlcbiAgICB9XG4gICAgYm9keS5ib2R5VXNlZCA9IHRydWVcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc29sdmUocmVhZGVyLnJlc3VsdClcbiAgICAgIH1cbiAgICAgIHJlYWRlci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChyZWFkZXIuZXJyb3IpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNBcnJheUJ1ZmZlcihibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICB2YXIgcHJvbWlzZSA9IGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGJsb2IpXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNUZXh0KGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHZhciBwcm9taXNlID0gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgICByZWFkZXIucmVhZEFzVGV4dChibG9iKVxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQXJyYXlCdWZmZXJBc1RleHQoYnVmKSB7XG4gICAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShidWYpXG4gICAgdmFyIGNoYXJzID0gbmV3IEFycmF5KHZpZXcubGVuZ3RoKVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2aWV3Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBjaGFyc1tpXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUodmlld1tpXSlcbiAgICB9XG4gICAgcmV0dXJuIGNoYXJzLmpvaW4oJycpXG4gIH1cblxuICBmdW5jdGlvbiBidWZmZXJDbG9uZShidWYpIHtcbiAgICBpZiAoYnVmLnNsaWNlKSB7XG4gICAgICByZXR1cm4gYnVmLnNsaWNlKDApXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmLmJ5dGVMZW5ndGgpXG4gICAgICB2aWV3LnNldChuZXcgVWludDhBcnJheShidWYpKVxuICAgICAgcmV0dXJuIHZpZXcuYnVmZmVyXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gQm9keSgpIHtcbiAgICB0aGlzLmJvZHlVc2VkID0gZmFsc2VcblxuICAgIHRoaXMuX2luaXRCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgICAgdGhpcy5fYm9keUluaXQgPSBib2R5XG4gICAgICBpZiAoIWJvZHkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSAnJ1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYmxvYiAmJiBCbG9iLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlCbG9iID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmZvcm1EYXRhICYmIEZvcm1EYXRhLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlGb3JtRGF0YSA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keS50b1N0cmluZygpXG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgc3VwcG9ydC5ibG9iICYmIGlzRGF0YVZpZXcoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUFycmF5QnVmZmVyID0gYnVmZmVyQ2xvbmUoYm9keS5idWZmZXIpXG4gICAgICAgIC8vIElFIDEwLTExIGNhbid0IGhhbmRsZSBhIERhdGFWaWV3IGJvZHkuXG4gICAgICAgIHRoaXMuX2JvZHlJbml0ID0gbmV3IEJsb2IoW3RoaXMuX2JvZHlBcnJheUJ1ZmZlcl0pXG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgKEFycmF5QnVmZmVyLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpIHx8IGlzQXJyYXlCdWZmZXJWaWV3KGJvZHkpKSkge1xuICAgICAgICB0aGlzLl9ib2R5QXJyYXlCdWZmZXIgPSBidWZmZXJDbG9uZShib2R5KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCBCb2R5SW5pdCB0eXBlJylcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSkge1xuICAgICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ3RleHQvcGxhaW47Y2hhcnNldD1VVEYtOCcpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUJsb2IgJiYgdGhpcy5fYm9keUJsb2IudHlwZSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsIHRoaXMuX2JvZHlCbG9iLnR5cGUpXG4gICAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5zZWFyY2hQYXJhbXMgJiYgVVJMU2VhcmNoUGFyYW1zLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDtjaGFyc2V0PVVURi04JylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmJsb2IpIHtcbiAgICAgIHRoaXMuYmxvYiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keUFycmF5QnVmZmVyXSkpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIGJsb2InKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlUZXh0XSkpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hcnJheUJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5fYm9keUFycmF5QnVmZmVyKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnN1bWVkKHRoaXMpIHx8IFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYmxvYigpLnRoZW4ocmVhZEJsb2JBc0FycmF5QnVmZmVyKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgcmV0dXJuIHJlYWRCbG9iQXNUZXh0KHRoaXMuX2JvZHlCbG9iKVxuICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QXJyYXlCdWZmZXIpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZWFkQXJyYXlCdWZmZXJBc1RleHQodGhpcy5fYm9keUFycmF5QnVmZmVyKSlcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyB0ZXh0JylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuZm9ybURhdGEpIHtcbiAgICAgIHRoaXMuZm9ybURhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oZGVjb2RlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuanNvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oSlNPTi5wYXJzZSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gSFRUUCBtZXRob2RzIHdob3NlIGNhcGl0YWxpemF0aW9uIHNob3VsZCBiZSBub3JtYWxpemVkXG4gIHZhciBtZXRob2RzID0gWydERUxFVEUnLCAnR0VUJywgJ0hFQUQnLCAnT1BUSU9OUycsICdQT1NUJywgJ1BVVCddXG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTWV0aG9kKG1ldGhvZCkge1xuICAgIHZhciB1cGNhc2VkID0gbWV0aG9kLnRvVXBwZXJDYXNlKClcbiAgICByZXR1cm4gKG1ldGhvZHMuaW5kZXhPZih1cGNhc2VkKSA+IC0xKSA/IHVwY2FzZWQgOiBtZXRob2RcbiAgfVxuXG4gIGZ1bmN0aW9uIFJlcXVlc3QoaW5wdXQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIHZhciBib2R5ID0gb3B0aW9ucy5ib2R5XG5cbiAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG4gICAgICBpZiAoaW5wdXQuYm9keVVzZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJylcbiAgICAgIH1cbiAgICAgIHRoaXMudXJsID0gaW5wdXQudXJsXG4gICAgICB0aGlzLmNyZWRlbnRpYWxzID0gaW5wdXQuY3JlZGVudGlhbHNcbiAgICAgIGlmICghb3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKGlucHV0LmhlYWRlcnMpXG4gICAgICB9XG4gICAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZFxuICAgICAgdGhpcy5tb2RlID0gaW5wdXQubW9kZVxuICAgICAgaWYgKCFib2R5ICYmIGlucHV0Ll9ib2R5SW5pdCAhPSBudWxsKSB7XG4gICAgICAgIGJvZHkgPSBpbnB1dC5fYm9keUluaXRcbiAgICAgICAgaW5wdXQuYm9keVVzZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXJsID0gU3RyaW5nKGlucHV0KVxuICAgIH1cblxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBvcHRpb25zLmNyZWRlbnRpYWxzIHx8IHRoaXMuY3JlZGVudGlhbHMgfHwgJ29taXQnXG4gICAgaWYgKG9wdGlvbnMuaGVhZGVycyB8fCAhdGhpcy5oZWFkZXJzKSB7XG4gICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgfVxuICAgIHRoaXMubWV0aG9kID0gbm9ybWFsaXplTWV0aG9kKG9wdGlvbnMubWV0aG9kIHx8IHRoaXMubWV0aG9kIHx8ICdHRVQnKVxuICAgIHRoaXMubW9kZSA9IG9wdGlvbnMubW9kZSB8fCB0aGlzLm1vZGUgfHwgbnVsbFxuICAgIHRoaXMucmVmZXJyZXIgPSBudWxsXG5cbiAgICBpZiAoKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSAmJiBib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCb2R5IG5vdCBhbGxvd2VkIGZvciBHRVQgb3IgSEVBRCByZXF1ZXN0cycpXG4gICAgfVxuICAgIHRoaXMuX2luaXRCb2R5KGJvZHkpXG4gIH1cblxuICBSZXF1ZXN0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCh0aGlzLCB7IGJvZHk6IHRoaXMuX2JvZHlJbml0IH0pXG4gIH1cblxuICBmdW5jdGlvbiBkZWNvZGUoYm9keSkge1xuICAgIHZhciBmb3JtID0gbmV3IEZvcm1EYXRhKClcbiAgICBib2R5LnRyaW0oKS5zcGxpdCgnJicpLmZvckVhY2goZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGlmIChieXRlcykge1xuICAgICAgICB2YXIgc3BsaXQgPSBieXRlcy5zcGxpdCgnPScpXG4gICAgICAgIHZhciBuYW1lID0gc3BsaXQuc2hpZnQoKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc9JykucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgZm9ybS5hcHBlbmQoZGVjb2RlVVJJQ29tcG9uZW50KG5hbWUpLCBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGZvcm1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlSGVhZGVycyhyYXdIZWFkZXJzKSB7XG4gICAgdmFyIGhlYWRlcnMgPSBuZXcgSGVhZGVycygpXG4gICAgLy8gUmVwbGFjZSBpbnN0YW5jZXMgb2YgXFxyXFxuIGFuZCBcXG4gZm9sbG93ZWQgYnkgYXQgbGVhc3Qgb25lIHNwYWNlIG9yIGhvcml6b250YWwgdGFiIHdpdGggYSBzcGFjZVxuICAgIC8vIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmM3MjMwI3NlY3Rpb24tMy4yXG4gICAgdmFyIHByZVByb2Nlc3NlZEhlYWRlcnMgPSByYXdIZWFkZXJzLnJlcGxhY2UoL1xccj9cXG5bXFx0IF0rL2csICcgJylcbiAgICBwcmVQcm9jZXNzZWRIZWFkZXJzLnNwbGl0KC9cXHI/XFxuLykuZm9yRWFjaChmdW5jdGlvbihsaW5lKSB7XG4gICAgICB2YXIgcGFydHMgPSBsaW5lLnNwbGl0KCc6JylcbiAgICAgIHZhciBrZXkgPSBwYXJ0cy5zaGlmdCgpLnRyaW0oKVxuICAgICAgaWYgKGtleSkge1xuICAgICAgICB2YXIgdmFsdWUgPSBwYXJ0cy5qb2luKCc6JykudHJpbSgpXG4gICAgICAgIGhlYWRlcnMuYXBwZW5kKGtleSwgdmFsdWUpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gaGVhZGVyc1xuICB9XG5cbiAgQm9keS5jYWxsKFJlcXVlc3QucHJvdG90eXBlKVxuXG4gIGZ1bmN0aW9uIFJlc3BvbnNlKGJvZHlJbml0LCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0ge31cbiAgICB9XG5cbiAgICB0aGlzLnR5cGUgPSAnZGVmYXVsdCdcbiAgICB0aGlzLnN0YXR1cyA9IG9wdGlvbnMuc3RhdHVzID09PSB1bmRlZmluZWQgPyAyMDAgOiBvcHRpb25zLnN0YXR1c1xuICAgIHRoaXMub2sgPSB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDBcbiAgICB0aGlzLnN0YXR1c1RleHQgPSAnc3RhdHVzVGV4dCcgaW4gb3B0aW9ucyA/IG9wdGlvbnMuc3RhdHVzVGV4dCA6ICdPSydcbiAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgdGhpcy51cmwgPSBvcHRpb25zLnVybCB8fCAnJ1xuICAgIHRoaXMuX2luaXRCb2R5KGJvZHlJbml0KVxuICB9XG5cbiAgQm9keS5jYWxsKFJlc3BvbnNlLnByb3RvdHlwZSlcblxuICBSZXNwb25zZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKHRoaXMuX2JvZHlJbml0LCB7XG4gICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxuICAgICAgc3RhdHVzVGV4dDogdGhpcy5zdGF0dXNUZXh0LFxuICAgICAgaGVhZGVyczogbmV3IEhlYWRlcnModGhpcy5oZWFkZXJzKSxcbiAgICAgIHVybDogdGhpcy51cmxcbiAgICB9KVxuICB9XG5cbiAgUmVzcG9uc2UuZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogMCwgc3RhdHVzVGV4dDogJyd9KVxuICAgIHJlc3BvbnNlLnR5cGUgPSAnZXJyb3InXG4gICAgcmV0dXJuIHJlc3BvbnNlXG4gIH1cblxuICB2YXIgcmVkaXJlY3RTdGF0dXNlcyA9IFszMDEsIDMwMiwgMzAzLCAzMDcsIDMwOF1cblxuICBSZXNwb25zZS5yZWRpcmVjdCA9IGZ1bmN0aW9uKHVybCwgc3RhdHVzKSB7XG4gICAgaWYgKHJlZGlyZWN0U3RhdHVzZXMuaW5kZXhPZihzdGF0dXMpID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgc3RhdHVzIGNvZGUnKVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogc3RhdHVzLCBoZWFkZXJzOiB7bG9jYXRpb246IHVybH19KVxuICB9XG5cbiAgc2VsZi5IZWFkZXJzID0gSGVhZGVyc1xuICBzZWxmLlJlcXVlc3QgPSBSZXF1ZXN0XG4gIHNlbGYuUmVzcG9uc2UgPSBSZXNwb25zZVxuXG4gIHNlbGYuZmV0Y2ggPSBmdW5jdGlvbihpbnB1dCwgaW5pdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZXF1ZXN0ID0gbmV3IFJlcXVlc3QoaW5wdXQsIGluaXQpXG4gICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICBzdGF0dXM6IHhoci5zdGF0dXMsXG4gICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHQsXG4gICAgICAgICAgaGVhZGVyczogcGFyc2VIZWFkZXJzKHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSB8fCAnJylcbiAgICAgICAgfVxuICAgICAgICBvcHRpb25zLnVybCA9ICdyZXNwb25zZVVSTCcgaW4geGhyID8geGhyLnJlc3BvbnNlVVJMIDogb3B0aW9ucy5oZWFkZXJzLmdldCgnWC1SZXF1ZXN0LVVSTCcpXG4gICAgICAgIHZhciBib2R5ID0gJ3Jlc3BvbnNlJyBpbiB4aHIgPyB4aHIucmVzcG9uc2UgOiB4aHIucmVzcG9uc2VUZXh0XG4gICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKGJvZHksIG9wdGlvbnMpKVxuICAgICAgfVxuXG4gICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub250aW1lb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vcGVuKHJlcXVlc3QubWV0aG9kLCByZXF1ZXN0LnVybCwgdHJ1ZSlcblxuICAgICAgaWYgKHJlcXVlc3QuY3JlZGVudGlhbHMgPT09ICdpbmNsdWRlJykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZVxuICAgICAgfSBlbHNlIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSAnb21pdCcpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IGZhbHNlXG4gICAgICB9XG5cbiAgICAgIGlmICgncmVzcG9uc2VUeXBlJyBpbiB4aHIgJiYgc3VwcG9ydC5ibG9iKSB7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYmxvYidcbiAgICAgIH1cblxuICAgICAgcmVxdWVzdC5oZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIobmFtZSwgdmFsdWUpXG4gICAgICB9KVxuXG4gICAgICB4aHIuc2VuZCh0eXBlb2YgcmVxdWVzdC5fYm9keUluaXQgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHJlcXVlc3QuX2JvZHlJbml0KVxuICAgIH0pXG4gIH1cbiAgc2VsZi5mZXRjaC5wb2x5ZmlsbCA9IHRydWVcbn0pKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiB0aGlzKTtcbiIsIihmdW5jdGlvbigpeyd1c2Ugc3RyaWN0Jzt2YXIgaz10aGlzO1xuZnVuY3Rpb24gYWEoYSl7dmFyIGI9dHlwZW9mIGE7aWYoXCJvYmplY3RcIj09YilpZihhKXtpZihhIGluc3RhbmNlb2YgQXJyYXkpcmV0dXJuXCJhcnJheVwiO2lmKGEgaW5zdGFuY2VvZiBPYmplY3QpcmV0dXJuIGI7dmFyIGM9T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpO2lmKFwiW29iamVjdCBXaW5kb3ddXCI9PWMpcmV0dXJuXCJvYmplY3RcIjtpZihcIltvYmplY3QgQXJyYXldXCI9PWN8fFwibnVtYmVyXCI9PXR5cGVvZiBhLmxlbmd0aCYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGEuc3BsaWNlJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgYS5wcm9wZXJ0eUlzRW51bWVyYWJsZSYmIWEucHJvcGVydHlJc0VudW1lcmFibGUoXCJzcGxpY2VcIikpcmV0dXJuXCJhcnJheVwiO2lmKFwiW29iamVjdCBGdW5jdGlvbl1cIj09Y3x8XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGEuY2FsbCYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGEucHJvcGVydHlJc0VudW1lcmFibGUmJiFhLnByb3BlcnR5SXNFbnVtZXJhYmxlKFwiY2FsbFwiKSlyZXR1cm5cImZ1bmN0aW9uXCJ9ZWxzZSByZXR1cm5cIm51bGxcIjtlbHNlIGlmKFwiZnVuY3Rpb25cIj09XG5iJiZcInVuZGVmaW5lZFwiPT10eXBlb2YgYS5jYWxsKXJldHVyblwib2JqZWN0XCI7cmV0dXJuIGJ9ZnVuY3Rpb24gbChhKXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgYX1mdW5jdGlvbiBiYShhLGIsYyl7cmV0dXJuIGEuY2FsbC5hcHBseShhLmJpbmQsYXJndW1lbnRzKX1mdW5jdGlvbiBjYShhLGIsYyl7aWYoIWEpdGhyb3cgRXJyb3IoKTtpZigyPGFyZ3VtZW50cy5sZW5ndGgpe3ZhciBkPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywyKTtyZXR1cm4gZnVuY3Rpb24oKXt2YXIgYz1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO0FycmF5LnByb3RvdHlwZS51bnNoaWZ0LmFwcGx5KGMsZCk7cmV0dXJuIGEuYXBwbHkoYixjKX19cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIGEuYXBwbHkoYixhcmd1bWVudHMpfX1cbmZ1bmN0aW9uIGRhKGEsYixjKXtkYT1GdW5jdGlvbi5wcm90b3R5cGUuYmluZCYmLTEhPUZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kLnRvU3RyaW5nKCkuaW5kZXhPZihcIm5hdGl2ZSBjb2RlXCIpP2JhOmNhO3JldHVybiBkYS5hcHBseShudWxsLGFyZ3VtZW50cyl9ZnVuY3Rpb24gZWEoYSxiKXt2YXIgYz1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsMSk7cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGI9Yy5zbGljZSgpO2IucHVzaC5hcHBseShiLGFyZ3VtZW50cyk7cmV0dXJuIGEuYXBwbHkodGhpcyxiKX19XG5mdW5jdGlvbiBtKGEpe3ZhciBiPW47ZnVuY3Rpb24gYygpe31jLnByb3RvdHlwZT1iLnByb3RvdHlwZTthLkc9Yi5wcm90b3R5cGU7YS5wcm90b3R5cGU9bmV3IGM7YS5wcm90b3R5cGUuY29uc3RydWN0b3I9YTthLkY9ZnVuY3Rpb24oYSxjLGYpe2Zvcih2YXIgZz1BcnJheShhcmd1bWVudHMubGVuZ3RoLTIpLGg9MjtoPGFyZ3VtZW50cy5sZW5ndGg7aCsrKWdbaC0yXT1hcmd1bWVudHNbaF07cmV0dXJuIGIucHJvdG90eXBlW2NdLmFwcGx5KGEsZyl9fTsvKlxuXG4gVGhlIE1JVCBMaWNlbnNlXG5cbiBDb3B5cmlnaHQgKGMpIDIwMDcgQ3lib3p1IExhYnMsIEluYy5cbiBDb3B5cmlnaHQgKGMpIDIwMTIgR29vZ2xlIEluYy5cblxuIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0b1xuIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlXG4gcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yXG4gc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkdcbiBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTXG4gSU4gVEhFIFNPRlRXQVJFLlxuKi9cbnZhciBmYT1TdHJpbmcucHJvdG90eXBlLnRyaW0/ZnVuY3Rpb24oYSl7cmV0dXJuIGEudHJpbSgpfTpmdW5jdGlvbihhKXtyZXR1cm4gYS5yZXBsYWNlKC9eW1xcc1xceGEwXSt8W1xcc1xceGEwXSskL2csXCJcIil9O2Z1bmN0aW9uIHEoYSxiKXtyZXR1cm4tMSE9YS5pbmRleE9mKGIpfWZ1bmN0aW9uIGdhKGEsYil7cmV0dXJuIGE8Yj8tMTphPmI/MTowfTt2YXIgaGE9QXJyYXkucHJvdG90eXBlLmluZGV4T2Y/ZnVuY3Rpb24oYSxiLGMpe3JldHVybiBBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGEsYixjKX06ZnVuY3Rpb24oYSxiLGMpe2M9bnVsbD09Yz8wOjA+Yz9NYXRoLm1heCgwLGEubGVuZ3RoK2MpOmM7aWYobChhKSlyZXR1cm4gbChiKSYmMT09Yi5sZW5ndGg/YS5pbmRleE9mKGIsYyk6LTE7Zm9yKDtjPGEubGVuZ3RoO2MrKylpZihjIGluIGEmJmFbY109PT1iKXJldHVybiBjO3JldHVybi0xfSxyPUFycmF5LnByb3RvdHlwZS5mb3JFYWNoP2Z1bmN0aW9uKGEsYixjKXtBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGEsYixjKX06ZnVuY3Rpb24oYSxiLGMpe2Zvcih2YXIgZD1hLmxlbmd0aCxlPWwoYSk/YS5zcGxpdChcIlwiKTphLGY9MDtmPGQ7ZisrKWYgaW4gZSYmYi5jYWxsKGMsZVtmXSxmLGEpfSxpYT1BcnJheS5wcm90b3R5cGUuZmlsdGVyP2Z1bmN0aW9uKGEsYixjKXtyZXR1cm4gQXJyYXkucHJvdG90eXBlLmZpbHRlci5jYWxsKGEsXG5iLGMpfTpmdW5jdGlvbihhLGIsYyl7Zm9yKHZhciBkPWEubGVuZ3RoLGU9W10sZj0wLGc9bChhKT9hLnNwbGl0KFwiXCIpOmEsaD0wO2g8ZDtoKyspaWYoaCBpbiBnKXt2YXIgcD1nW2hdO2IuY2FsbChjLHAsaCxhKSYmKGVbZisrXT1wKX1yZXR1cm4gZX0sdD1BcnJheS5wcm90b3R5cGUucmVkdWNlP2Z1bmN0aW9uKGEsYixjLGQpe2QmJihiPWRhKGIsZCkpO3JldHVybiBBcnJheS5wcm90b3R5cGUucmVkdWNlLmNhbGwoYSxiLGMpfTpmdW5jdGlvbihhLGIsYyxkKXt2YXIgZT1jO3IoYSxmdW5jdGlvbihjLGcpe2U9Yi5jYWxsKGQsZSxjLGcsYSl9KTtyZXR1cm4gZX0samE9QXJyYXkucHJvdG90eXBlLnNvbWU/ZnVuY3Rpb24oYSxiLGMpe3JldHVybiBBcnJheS5wcm90b3R5cGUuc29tZS5jYWxsKGEsYixjKX06ZnVuY3Rpb24oYSxiLGMpe2Zvcih2YXIgZD1hLmxlbmd0aCxlPWwoYSk/YS5zcGxpdChcIlwiKTphLGY9MDtmPGQ7ZisrKWlmKGYgaW4gZSYmYi5jYWxsKGMsZVtmXSxmLGEpKXJldHVybiEwO1xucmV0dXJuITF9O2Z1bmN0aW9uIGthKGEsYil7dmFyIGM7YTp7Yz1hLmxlbmd0aDtmb3IodmFyIGQ9bChhKT9hLnNwbGl0KFwiXCIpOmEsZT0wO2U8YztlKyspaWYoZSBpbiBkJiZiLmNhbGwodm9pZCAwLGRbZV0sZSxhKSl7Yz1lO2JyZWFrIGF9Yz0tMX1yZXR1cm4gMD5jP251bGw6bChhKT9hLmNoYXJBdChjKTphW2NdfWZ1bmN0aW9uIGxhKGEpe3JldHVybiBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KEFycmF5LnByb3RvdHlwZSxhcmd1bWVudHMpfWZ1bmN0aW9uIG1hKGEsYixjKXtyZXR1cm4gMj49YXJndW1lbnRzLmxlbmd0aD9BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhLGIpOkFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGEsYixjKX07dmFyIHU7YTp7dmFyIG5hPWsubmF2aWdhdG9yO2lmKG5hKXt2YXIgb2E9bmEudXNlckFnZW50O2lmKG9hKXt1PW9hO2JyZWFrIGF9fXU9XCJcIn07dmFyIHBhPXEodSxcIk9wZXJhXCIpfHxxKHUsXCJPUFJcIiksdj1xKHUsXCJUcmlkZW50XCIpfHxxKHUsXCJNU0lFXCIpLHFhPXEodSxcIkVkZ2VcIikscmE9cSh1LFwiR2Vja29cIikmJiEocSh1LnRvTG93ZXJDYXNlKCksXCJ3ZWJraXRcIikmJiFxKHUsXCJFZGdlXCIpKSYmIShxKHUsXCJUcmlkZW50XCIpfHxxKHUsXCJNU0lFXCIpKSYmIXEodSxcIkVkZ2VcIiksc2E9cSh1LnRvTG93ZXJDYXNlKCksXCJ3ZWJraXRcIikmJiFxKHUsXCJFZGdlXCIpO2Z1bmN0aW9uIHRhKCl7dmFyIGE9ay5kb2N1bWVudDtyZXR1cm4gYT9hLmRvY3VtZW50TW9kZTp2b2lkIDB9dmFyIHVhO1xuYTp7dmFyIHZhPVwiXCIsd2E9ZnVuY3Rpb24oKXt2YXIgYT11O2lmKHJhKXJldHVybi9ydlxcOihbXlxcKTtdKykoXFwpfDspLy5leGVjKGEpO2lmKHFhKXJldHVybi9FZGdlXFwvKFtcXGRcXC5dKykvLmV4ZWMoYSk7aWYodilyZXR1cm4vXFxiKD86TVNJRXxydilbOiBdKFteXFwpO10rKShcXCl8OykvLmV4ZWMoYSk7aWYoc2EpcmV0dXJuL1dlYktpdFxcLyhcXFMrKS8uZXhlYyhhKTtpZihwYSlyZXR1cm4vKD86VmVyc2lvbilbIFxcL10/KFxcUyspLy5leGVjKGEpfSgpO3dhJiYodmE9d2E/d2FbMV06XCJcIik7aWYodil7dmFyIHhhPXRhKCk7aWYobnVsbCE9eGEmJnhhPnBhcnNlRmxvYXQodmEpKXt1YT1TdHJpbmcoeGEpO2JyZWFrIGF9fXVhPXZhfXZhciB5YT17fTtcbmZ1bmN0aW9uIHphKGEpe2lmKCF5YVthXSl7Zm9yKHZhciBiPTAsYz1mYShTdHJpbmcodWEpKS5zcGxpdChcIi5cIiksZD1mYShTdHJpbmcoYSkpLnNwbGl0KFwiLlwiKSxlPU1hdGgubWF4KGMubGVuZ3RoLGQubGVuZ3RoKSxmPTA7MD09YiYmZjxlO2YrKyl7dmFyIGc9Y1tmXXx8XCJcIixoPWRbZl18fFwiXCIscD0vKFxcZCopKFxcRCopL2cseT0vKFxcZCopKFxcRCopL2c7ZG97dmFyIEQ9cC5leGVjKGcpfHxbXCJcIixcIlwiLFwiXCJdLFg9eS5leGVjKGgpfHxbXCJcIixcIlwiLFwiXCJdO2lmKDA9PURbMF0ubGVuZ3RoJiYwPT1YWzBdLmxlbmd0aClicmVhaztiPWdhKDA9PURbMV0ubGVuZ3RoPzA6cGFyc2VJbnQoRFsxXSwxMCksMD09WFsxXS5sZW5ndGg/MDpwYXJzZUludChYWzFdLDEwKSl8fGdhKDA9PURbMl0ubGVuZ3RoLDA9PVhbMl0ubGVuZ3RoKXx8Z2EoRFsyXSxYWzJdKX13aGlsZSgwPT1iKX15YVthXT0wPD1ifX1cbnZhciBBYT1rLmRvY3VtZW50LEJhPUFhJiZ2P3RhKCl8fChcIkNTUzFDb21wYXRcIj09QWEuY29tcGF0TW9kZT9wYXJzZUludCh1YSwxMCk6NSk6dm9pZCAwO3ZhciB3PXYmJiEoOTw9TnVtYmVyKEJhKSksQ2E9diYmISg4PD1OdW1iZXIoQmEpKTtmdW5jdGlvbiB4KGEsYixjLGQpe3RoaXMuYT1hO3RoaXMubm9kZU5hbWU9Yzt0aGlzLm5vZGVWYWx1ZT1kO3RoaXMubm9kZVR5cGU9Mjt0aGlzLnBhcmVudE5vZGU9dGhpcy5vd25lckVsZW1lbnQ9Yn1mdW5jdGlvbiBEYShhLGIpe3ZhciBjPUNhJiZcImhyZWZcIj09Yi5ub2RlTmFtZT9hLmdldEF0dHJpYnV0ZShiLm5vZGVOYW1lLDIpOmIubm9kZVZhbHVlO3JldHVybiBuZXcgeChiLGEsYi5ub2RlTmFtZSxjKX07ZnVuY3Rpb24geihhKXt2YXIgYj1udWxsLGM9YS5ub2RlVHlwZTsxPT1jJiYoYj1hLnRleHRDb250ZW50LGI9dm9pZCAwPT1ifHxudWxsPT1iP2EuaW5uZXJUZXh0OmIsYj12b2lkIDA9PWJ8fG51bGw9PWI/XCJcIjpiKTtpZihcInN0cmluZ1wiIT10eXBlb2YgYilpZih3JiZcInRpdGxlXCI9PWEubm9kZU5hbWUudG9Mb3dlckNhc2UoKSYmMT09YyliPWEudGV4dDtlbHNlIGlmKDk9PWN8fDE9PWMpe2E9OT09Yz9hLmRvY3VtZW50RWxlbWVudDphLmZpcnN0Q2hpbGQ7Zm9yKHZhciBjPTAsZD1bXSxiPVwiXCI7YTspe2RvIDEhPWEubm9kZVR5cGUmJihiKz1hLm5vZGVWYWx1ZSksdyYmXCJ0aXRsZVwiPT1hLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkmJihiKz1hLnRleHQpLGRbYysrXT1hO3doaWxlKGE9YS5maXJzdENoaWxkKTtmb3IoO2MmJiEoYT1kWy0tY10ubmV4dFNpYmxpbmcpOyk7fX1lbHNlIGI9YS5ub2RlVmFsdWU7cmV0dXJuXCJcIitifVxuZnVuY3Rpb24gQShhLGIsYyl7aWYobnVsbD09PWIpcmV0dXJuITA7dHJ5e2lmKCFhLmdldEF0dHJpYnV0ZSlyZXR1cm4hMX1jYXRjaChkKXtyZXR1cm4hMX1DYSYmXCJjbGFzc1wiPT1iJiYoYj1cImNsYXNzTmFtZVwiKTtyZXR1cm4gbnVsbD09Yz8hIWEuZ2V0QXR0cmlidXRlKGIpOmEuZ2V0QXR0cmlidXRlKGIsMik9PWN9ZnVuY3Rpb24gQihhLGIsYyxkLGUpe3JldHVybih3P0VhOkZhKS5jYWxsKG51bGwsYSxiLGwoYyk/YzpudWxsLGwoZCk/ZDpudWxsLGV8fG5ldyBDKX1cbmZ1bmN0aW9uIEVhKGEsYixjLGQsZSl7aWYoYSBpbnN0YW5jZW9mIEV8fDg9PWEuYnx8YyYmbnVsbD09PWEuYil7dmFyIGY9Yi5hbGw7aWYoIWYpcmV0dXJuIGU7YT1HYShhKTtpZihcIipcIiE9YSYmKGY9Yi5nZXRFbGVtZW50c0J5VGFnTmFtZShhKSwhZikpcmV0dXJuIGU7aWYoYyl7Zm9yKHZhciBnPVtdLGg9MDtiPWZbaCsrXTspQShiLGMsZCkmJmcucHVzaChiKTtmPWd9Zm9yKGg9MDtiPWZbaCsrXTspXCIqXCI9PWEmJlwiIVwiPT1iLnRhZ05hbWV8fEYoZSxiKTtyZXR1cm4gZX1IYShhLGIsYyxkLGUpO3JldHVybiBlfVxuZnVuY3Rpb24gRmEoYSxiLGMsZCxlKXtiLmdldEVsZW1lbnRzQnlOYW1lJiZkJiZcIm5hbWVcIj09YyYmIXY/KGI9Yi5nZXRFbGVtZW50c0J5TmFtZShkKSxyKGIsZnVuY3Rpb24oYil7YS5hKGIpJiZGKGUsYil9KSk6Yi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lJiZkJiZcImNsYXNzXCI9PWM/KGI9Yi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGQpLHIoYixmdW5jdGlvbihiKXtiLmNsYXNzTmFtZT09ZCYmYS5hKGIpJiZGKGUsYil9KSk6YSBpbnN0YW5jZW9mIEc/SGEoYSxiLGMsZCxlKTpiLmdldEVsZW1lbnRzQnlUYWdOYW1lJiYoYj1iLmdldEVsZW1lbnRzQnlUYWdOYW1lKGEuZigpKSxyKGIsZnVuY3Rpb24oYSl7QShhLGMsZCkmJkYoZSxhKX0pKTtyZXR1cm4gZX1cbmZ1bmN0aW9uIElhKGEsYixjLGQsZSl7dmFyIGY7aWYoKGEgaW5zdGFuY2VvZiBFfHw4PT1hLmJ8fGMmJm51bGw9PT1hLmIpJiYoZj1iLmNoaWxkTm9kZXMpKXt2YXIgZz1HYShhKTtpZihcIipcIiE9ZyYmKGY9aWEoZixmdW5jdGlvbihhKXtyZXR1cm4gYS50YWdOYW1lJiZhLnRhZ05hbWUudG9Mb3dlckNhc2UoKT09Z30pLCFmKSlyZXR1cm4gZTtjJiYoZj1pYShmLGZ1bmN0aW9uKGEpe3JldHVybiBBKGEsYyxkKX0pKTtyKGYsZnVuY3Rpb24oYSl7XCIqXCI9PWcmJihcIiFcIj09YS50YWdOYW1lfHxcIipcIj09ZyYmMSE9YS5ub2RlVHlwZSl8fEYoZSxhKX0pO3JldHVybiBlfXJldHVybiBKYShhLGIsYyxkLGUpfWZ1bmN0aW9uIEphKGEsYixjLGQsZSl7Zm9yKGI9Yi5maXJzdENoaWxkO2I7Yj1iLm5leHRTaWJsaW5nKUEoYixjLGQpJiZhLmEoYikmJkYoZSxiKTtyZXR1cm4gZX1cbmZ1bmN0aW9uIEhhKGEsYixjLGQsZSl7Zm9yKGI9Yi5maXJzdENoaWxkO2I7Yj1iLm5leHRTaWJsaW5nKUEoYixjLGQpJiZhLmEoYikmJkYoZSxiKSxIYShhLGIsYyxkLGUpfWZ1bmN0aW9uIEdhKGEpe2lmKGEgaW5zdGFuY2VvZiBHKXtpZig4PT1hLmIpcmV0dXJuXCIhXCI7aWYobnVsbD09PWEuYilyZXR1cm5cIipcIn1yZXR1cm4gYS5mKCl9OyFyYSYmIXZ8fHYmJjk8PU51bWJlcihCYSl8fHJhJiZ6YShcIjEuOS4xXCIpO3YmJnphKFwiOVwiKTtmdW5jdGlvbiBLYShhLGIpe2lmKCFhfHwhYilyZXR1cm4hMTtpZihhLmNvbnRhaW5zJiYxPT1iLm5vZGVUeXBlKXJldHVybiBhPT1ifHxhLmNvbnRhaW5zKGIpO2lmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBhLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKXJldHVybiBhPT1ifHwhIShhLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKGIpJjE2KTtmb3IoO2ImJmEhPWI7KWI9Yi5wYXJlbnROb2RlO3JldHVybiBiPT1hfVxuZnVuY3Rpb24gTGEoYSxiKXtpZihhPT1iKXJldHVybiAwO2lmKGEuY29tcGFyZURvY3VtZW50UG9zaXRpb24pcmV0dXJuIGEuY29tcGFyZURvY3VtZW50UG9zaXRpb24oYikmMj8xOi0xO2lmKHYmJiEoOTw9TnVtYmVyKEJhKSkpe2lmKDk9PWEubm9kZVR5cGUpcmV0dXJuLTE7aWYoOT09Yi5ub2RlVHlwZSlyZXR1cm4gMX1pZihcInNvdXJjZUluZGV4XCJpbiBhfHxhLnBhcmVudE5vZGUmJlwic291cmNlSW5kZXhcImluIGEucGFyZW50Tm9kZSl7dmFyIGM9MT09YS5ub2RlVHlwZSxkPTE9PWIubm9kZVR5cGU7aWYoYyYmZClyZXR1cm4gYS5zb3VyY2VJbmRleC1iLnNvdXJjZUluZGV4O3ZhciBlPWEucGFyZW50Tm9kZSxmPWIucGFyZW50Tm9kZTtyZXR1cm4gZT09Zj9NYShhLGIpOiFjJiZLYShlLGIpPy0xKk5hKGEsYik6IWQmJkthKGYsYSk/TmEoYixhKTooYz9hLnNvdXJjZUluZGV4OmUuc291cmNlSW5kZXgpLShkP2Iuc291cmNlSW5kZXg6Zi5zb3VyY2VJbmRleCl9ZD05PT1hLm5vZGVUeXBlP1xuYTphLm93bmVyRG9jdW1lbnR8fGEuZG9jdW1lbnQ7Yz1kLmNyZWF0ZVJhbmdlKCk7Yy5zZWxlY3ROb2RlKGEpO2MuY29sbGFwc2UoITApO2Q9ZC5jcmVhdGVSYW5nZSgpO2Quc2VsZWN0Tm9kZShiKTtkLmNvbGxhcHNlKCEwKTtyZXR1cm4gYy5jb21wYXJlQm91bmRhcnlQb2ludHMoay5SYW5nZS5TVEFSVF9UT19FTkQsZCl9ZnVuY3Rpb24gTmEoYSxiKXt2YXIgYz1hLnBhcmVudE5vZGU7aWYoYz09YilyZXR1cm4tMTtmb3IodmFyIGQ9YjtkLnBhcmVudE5vZGUhPWM7KWQ9ZC5wYXJlbnROb2RlO3JldHVybiBNYShkLGEpfWZ1bmN0aW9uIE1hKGEsYil7Zm9yKHZhciBjPWI7Yz1jLnByZXZpb3VzU2libGluZzspaWYoYz09YSlyZXR1cm4tMTtyZXR1cm4gMX07ZnVuY3Rpb24gQygpe3RoaXMuYj10aGlzLmE9bnVsbDt0aGlzLmw9MH1mdW5jdGlvbiBPYShhKXt0aGlzLm5vZGU9YTt0aGlzLmE9dGhpcy5iPW51bGx9ZnVuY3Rpb24gUGEoYSxiKXtpZighYS5hKXJldHVybiBiO2lmKCFiLmEpcmV0dXJuIGE7Zm9yKHZhciBjPWEuYSxkPWIuYSxlPW51bGwsZj1udWxsLGc9MDtjJiZkOyl7dmFyIGY9Yy5ub2RlLGg9ZC5ub2RlO2Y9PWh8fGYgaW5zdGFuY2VvZiB4JiZoIGluc3RhbmNlb2YgeCYmZi5hPT1oLmE/KGY9YyxjPWMuYSxkPWQuYSk6MDxMYShjLm5vZGUsZC5ub2RlKT8oZj1kLGQ9ZC5hKTooZj1jLGM9Yy5hKTsoZi5iPWUpP2UuYT1mOmEuYT1mO2U9ZjtnKyt9Zm9yKGY9Y3x8ZDtmOylmLmI9ZSxlPWUuYT1mLGcrKyxmPWYuYTthLmI9ZTthLmw9ZztyZXR1cm4gYX1mdW5jdGlvbiBRYShhLGIpe3ZhciBjPW5ldyBPYShiKTtjLmE9YS5hO2EuYj9hLmEuYj1jOmEuYT1hLmI9YzthLmE9YzthLmwrK31cbmZ1bmN0aW9uIEYoYSxiKXt2YXIgYz1uZXcgT2EoYik7Yy5iPWEuYjthLmE/YS5iLmE9YzphLmE9YS5iPWM7YS5iPWM7YS5sKyt9ZnVuY3Rpb24gUmEoYSl7cmV0dXJuKGE9YS5hKT9hLm5vZGU6bnVsbH1mdW5jdGlvbiBTYShhKXtyZXR1cm4oYT1SYShhKSk/eihhKTpcIlwifWZ1bmN0aW9uIEgoYSxiKXtyZXR1cm4gbmV3IFRhKGEsISFiKX1mdW5jdGlvbiBUYShhLGIpe3RoaXMuZj1hO3RoaXMuYj0odGhpcy5jPWIpP2EuYjphLmE7dGhpcy5hPW51bGx9ZnVuY3Rpb24gSShhKXt2YXIgYj1hLmI7aWYobnVsbD09YilyZXR1cm4gbnVsbDt2YXIgYz1hLmE9YjthLmI9YS5jP2IuYjpiLmE7cmV0dXJuIGMubm9kZX07ZnVuY3Rpb24gbihhKXt0aGlzLmk9YTt0aGlzLmI9dGhpcy5nPSExO3RoaXMuZj1udWxsfWZ1bmN0aW9uIEooYSl7cmV0dXJuXCJcXG4gIFwiK2EudG9TdHJpbmcoKS5zcGxpdChcIlxcblwiKS5qb2luKFwiXFxuICBcIil9ZnVuY3Rpb24gVWEoYSxiKXthLmc9Yn1mdW5jdGlvbiBWYShhLGIpe2EuYj1ifWZ1bmN0aW9uIEsoYSxiKXt2YXIgYz1hLmEoYik7cmV0dXJuIGMgaW5zdGFuY2VvZiBDPytTYShjKTorY31mdW5jdGlvbiBMKGEsYil7dmFyIGM9YS5hKGIpO3JldHVybiBjIGluc3RhbmNlb2YgQz9TYShjKTpcIlwiK2N9ZnVuY3Rpb24gTShhLGIpe3ZhciBjPWEuYShiKTtyZXR1cm4gYyBpbnN0YW5jZW9mIEM/ISFjLmw6ISFjfTtmdW5jdGlvbiBOKGEsYixjKXtuLmNhbGwodGhpcyxhLmkpO3RoaXMuYz1hO3RoaXMuaD1iO3RoaXMubz1jO3RoaXMuZz1iLmd8fGMuZzt0aGlzLmI9Yi5ifHxjLmI7dGhpcy5jPT1XYSYmKGMuYnx8Yy5nfHw0PT1jLml8fDA9PWMuaXx8IWIuZj9iLmJ8fGIuZ3x8ND09Yi5pfHwwPT1iLml8fCFjLmZ8fCh0aGlzLmY9e25hbWU6Yy5mLm5hbWUsczpifSk6dGhpcy5mPXtuYW1lOmIuZi5uYW1lLHM6Y30pfW0oTik7XG5mdW5jdGlvbiBPKGEsYixjLGQsZSl7Yj1iLmEoZCk7Yz1jLmEoZCk7dmFyIGY7aWYoYiBpbnN0YW5jZW9mIEMmJmMgaW5zdGFuY2VvZiBDKXtiPUgoYik7Zm9yKGQ9SShiKTtkO2Q9SShiKSlmb3IoZT1IKGMpLGY9SShlKTtmO2Y9SShlKSlpZihhKHooZCkseihmKSkpcmV0dXJuITA7cmV0dXJuITF9aWYoYiBpbnN0YW5jZW9mIEN8fGMgaW5zdGFuY2VvZiBDKXtiIGluc3RhbmNlb2YgQz8oZT1iLGQ9Yyk6KGU9YyxkPWIpO2Y9SChlKTtmb3IodmFyIGc9dHlwZW9mIGQsaD1JKGYpO2g7aD1JKGYpKXtzd2l0Y2goZyl7Y2FzZSBcIm51bWJlclwiOmg9K3ooaCk7YnJlYWs7Y2FzZSBcImJvb2xlYW5cIjpoPSEheihoKTticmVhaztjYXNlIFwic3RyaW5nXCI6aD16KGgpO2JyZWFrO2RlZmF1bHQ6dGhyb3cgRXJyb3IoXCJJbGxlZ2FsIHByaW1pdGl2ZSB0eXBlIGZvciBjb21wYXJpc29uLlwiKTt9aWYoZT09YiYmYShoLGQpfHxlPT1jJiZhKGQsaCkpcmV0dXJuITB9cmV0dXJuITF9cmV0dXJuIGU/XCJib29sZWFuXCI9PVxudHlwZW9mIGJ8fFwiYm9vbGVhblwiPT10eXBlb2YgYz9hKCEhYiwhIWMpOlwibnVtYmVyXCI9PXR5cGVvZiBifHxcIm51bWJlclwiPT10eXBlb2YgYz9hKCtiLCtjKTphKGIsYyk6YSgrYiwrYyl9Ti5wcm90b3R5cGUuYT1mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5jLm0odGhpcy5oLHRoaXMubyxhKX07Ti5wcm90b3R5cGUudG9TdHJpbmc9ZnVuY3Rpb24oKXt2YXIgYT1cIkJpbmFyeSBFeHByZXNzaW9uOiBcIit0aGlzLmMsYT1hK0oodGhpcy5oKTtyZXR1cm4gYSs9Sih0aGlzLm8pfTtmdW5jdGlvbiBYYShhLGIsYyxkKXt0aGlzLmE9YTt0aGlzLnc9Yjt0aGlzLmk9Yzt0aGlzLm09ZH1YYS5wcm90b3R5cGUudG9TdHJpbmc9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5hfTt2YXIgWWE9e307XG5mdW5jdGlvbiBQKGEsYixjLGQpe2lmKFlhLmhhc093blByb3BlcnR5KGEpKXRocm93IEVycm9yKFwiQmluYXJ5IG9wZXJhdG9yIGFscmVhZHkgY3JlYXRlZDogXCIrYSk7YT1uZXcgWGEoYSxiLGMsZCk7cmV0dXJuIFlhW2EudG9TdHJpbmcoKV09YX1QKFwiZGl2XCIsNiwxLGZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gSyhhLGMpL0soYixjKX0pO1AoXCJtb2RcIiw2LDEsZnVuY3Rpb24oYSxiLGMpe3JldHVybiBLKGEsYyklSyhiLGMpfSk7UChcIipcIiw2LDEsZnVuY3Rpb24oYSxiLGMpe3JldHVybiBLKGEsYykqSyhiLGMpfSk7UChcIitcIiw1LDEsZnVuY3Rpb24oYSxiLGMpe3JldHVybiBLKGEsYykrSyhiLGMpfSk7UChcIi1cIiw1LDEsZnVuY3Rpb24oYSxiLGMpe3JldHVybiBLKGEsYyktSyhiLGMpfSk7UChcIjxcIiw0LDIsZnVuY3Rpb24oYSxiLGMpe3JldHVybiBPKGZ1bmN0aW9uKGEsYil7cmV0dXJuIGE8Yn0sYSxiLGMpfSk7XG5QKFwiPlwiLDQsMixmdW5jdGlvbihhLGIsYyl7cmV0dXJuIE8oZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT5ifSxhLGIsYyl9KTtQKFwiPD1cIiw0LDIsZnVuY3Rpb24oYSxiLGMpe3JldHVybiBPKGZ1bmN0aW9uKGEsYil7cmV0dXJuIGE8PWJ9LGEsYixjKX0pO1AoXCI+PVwiLDQsMixmdW5jdGlvbihhLGIsYyl7cmV0dXJuIE8oZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT49Yn0sYSxiLGMpfSk7dmFyIFdhPVAoXCI9XCIsMywyLGZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gTyhmdW5jdGlvbihhLGIpe3JldHVybiBhPT1ifSxhLGIsYywhMCl9KTtQKFwiIT1cIiwzLDIsZnVuY3Rpb24oYSxiLGMpe3JldHVybiBPKGZ1bmN0aW9uKGEsYil7cmV0dXJuIGEhPWJ9LGEsYixjLCEwKX0pO1AoXCJhbmRcIiwyLDIsZnVuY3Rpb24oYSxiLGMpe3JldHVybiBNKGEsYykmJk0oYixjKX0pO1AoXCJvclwiLDEsMixmdW5jdGlvbihhLGIsYyl7cmV0dXJuIE0oYSxjKXx8TShiLGMpfSk7ZnVuY3Rpb24gUShhLGIsYyl7dGhpcy5hPWE7dGhpcy5iPWJ8fDE7dGhpcy5mPWN8fDF9O2Z1bmN0aW9uIFphKGEsYil7aWYoYi5hLmxlbmd0aCYmNCE9YS5pKXRocm93IEVycm9yKFwiUHJpbWFyeSBleHByZXNzaW9uIG11c3QgZXZhbHVhdGUgdG8gbm9kZXNldCBpZiBmaWx0ZXIgaGFzIHByZWRpY2F0ZShzKS5cIik7bi5jYWxsKHRoaXMsYS5pKTt0aGlzLmM9YTt0aGlzLmg9Yjt0aGlzLmc9YS5nO3RoaXMuYj1hLmJ9bShaYSk7WmEucHJvdG90eXBlLmE9ZnVuY3Rpb24oYSl7YT10aGlzLmMuYShhKTtyZXR1cm4gJGEodGhpcy5oLGEpfTtaYS5wcm90b3R5cGUudG9TdHJpbmc9ZnVuY3Rpb24oKXt2YXIgYTthPVwiRmlsdGVyOlwiK0oodGhpcy5jKTtyZXR1cm4gYSs9Sih0aGlzLmgpfTtmdW5jdGlvbiBhYihhLGIpe2lmKGIubGVuZ3RoPGEuQSl0aHJvdyBFcnJvcihcIkZ1bmN0aW9uIFwiK2EuaitcIiBleHBlY3RzIGF0IGxlYXN0XCIrYS5BK1wiIGFyZ3VtZW50cywgXCIrYi5sZW5ndGgrXCIgZ2l2ZW5cIik7aWYobnVsbCE9PWEudiYmYi5sZW5ndGg+YS52KXRocm93IEVycm9yKFwiRnVuY3Rpb24gXCIrYS5qK1wiIGV4cGVjdHMgYXQgbW9zdCBcIithLnYrXCIgYXJndW1lbnRzLCBcIitiLmxlbmd0aCtcIiBnaXZlblwiKTthLkImJnIoYixmdW5jdGlvbihiLGQpe2lmKDQhPWIuaSl0aHJvdyBFcnJvcihcIkFyZ3VtZW50IFwiK2QrXCIgdG8gZnVuY3Rpb24gXCIrYS5qK1wiIGlzIG5vdCBvZiB0eXBlIE5vZGVzZXQ6IFwiK2IpO30pO24uY2FsbCh0aGlzLGEuaSk7dGhpcy5oPWE7dGhpcy5jPWI7VWEodGhpcyxhLmd8fGphKGIsZnVuY3Rpb24oYSl7cmV0dXJuIGEuZ30pKTtWYSh0aGlzLGEuRCYmIWIubGVuZ3RofHxhLkMmJiEhYi5sZW5ndGh8fGphKGIsZnVuY3Rpb24oYSl7cmV0dXJuIGEuYn0pKX1tKGFiKTtcbmFiLnByb3RvdHlwZS5hPWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLmgubS5hcHBseShudWxsLGxhKGEsdGhpcy5jKSl9O2FiLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3ZhciBhPVwiRnVuY3Rpb246IFwiK3RoaXMuaDtpZih0aGlzLmMubGVuZ3RoKXZhciBiPXQodGhpcy5jLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGErSihiKX0sXCJBcmd1bWVudHM6XCIpLGE9YStKKGIpO3JldHVybiBhfTtmdW5jdGlvbiBiYihhLGIsYyxkLGUsZixnLGgscCl7dGhpcy5qPWE7dGhpcy5pPWI7dGhpcy5nPWM7dGhpcy5EPWQ7dGhpcy5DPWU7dGhpcy5tPWY7dGhpcy5BPWc7dGhpcy52PXZvaWQgMCE9PWg/aDpnO3RoaXMuQj0hIXB9YmIucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuan07dmFyIGNiPXt9O1xuZnVuY3Rpb24gUihhLGIsYyxkLGUsZixnLGgpe2lmKGNiLmhhc093blByb3BlcnR5KGEpKXRocm93IEVycm9yKFwiRnVuY3Rpb24gYWxyZWFkeSBjcmVhdGVkOiBcIithK1wiLlwiKTtjYlthXT1uZXcgYmIoYSxiLGMsZCwhMSxlLGYsZyxoKX1SKFwiYm9vbGVhblwiLDIsITEsITEsZnVuY3Rpb24oYSxiKXtyZXR1cm4gTShiLGEpfSwxKTtSKFwiY2VpbGluZ1wiLDEsITEsITEsZnVuY3Rpb24oYSxiKXtyZXR1cm4gTWF0aC5jZWlsKEsoYixhKSl9LDEpO1IoXCJjb25jYXRcIiwzLCExLCExLGZ1bmN0aW9uKGEsYil7cmV0dXJuIHQobWEoYXJndW1lbnRzLDEpLGZ1bmN0aW9uKGIsZCl7cmV0dXJuIGIrTChkLGEpfSxcIlwiKX0sMixudWxsKTtSKFwiY29udGFpbnNcIiwyLCExLCExLGZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gcShMKGIsYSksTChjLGEpKX0sMik7UihcImNvdW50XCIsMSwhMSwhMSxmdW5jdGlvbihhLGIpe3JldHVybiBiLmEoYSkubH0sMSwxLCEwKTtcblIoXCJmYWxzZVwiLDIsITEsITEsZnVuY3Rpb24oKXtyZXR1cm4hMX0sMCk7UihcImZsb29yXCIsMSwhMSwhMSxmdW5jdGlvbihhLGIpe3JldHVybiBNYXRoLmZsb29yKEsoYixhKSl9LDEpO1IoXCJpZFwiLDQsITEsITEsZnVuY3Rpb24oYSxiKXtmdW5jdGlvbiBjKGEpe2lmKHcpe3ZhciBiPWUuYWxsW2FdO2lmKGIpe2lmKGIubm9kZVR5cGUmJmE9PWIuaWQpcmV0dXJuIGI7aWYoYi5sZW5ndGgpcmV0dXJuIGthKGIsZnVuY3Rpb24oYil7cmV0dXJuIGE9PWIuaWR9KX1yZXR1cm4gbnVsbH1yZXR1cm4gZS5nZXRFbGVtZW50QnlJZChhKX12YXIgZD1hLmEsZT05PT1kLm5vZGVUeXBlP2Q6ZC5vd25lckRvY3VtZW50LGQ9TChiLGEpLnNwbGl0KC9cXHMrLyksZj1bXTtyKGQsZnVuY3Rpb24oYSl7YT1jKGEpOyFhfHwwPD1oYShmLGEpfHxmLnB1c2goYSl9KTtmLnNvcnQoTGEpO3ZhciBnPW5ldyBDO3IoZixmdW5jdGlvbihhKXtGKGcsYSl9KTtyZXR1cm4gZ30sMSk7XG5SKFwibGFuZ1wiLDIsITEsITEsZnVuY3Rpb24oKXtyZXR1cm4hMX0sMSk7UihcImxhc3RcIiwxLCEwLCExLGZ1bmN0aW9uKGEpe2lmKDEhPWFyZ3VtZW50cy5sZW5ndGgpdGhyb3cgRXJyb3IoXCJGdW5jdGlvbiBsYXN0IGV4cGVjdHMgKClcIik7cmV0dXJuIGEuZn0sMCk7UihcImxvY2FsLW5hbWVcIiwzLCExLCEwLGZ1bmN0aW9uKGEsYil7dmFyIGM9Yj9SYShiLmEoYSkpOmEuYTtyZXR1cm4gYz9jLmxvY2FsTmFtZXx8Yy5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpOlwiXCJ9LDAsMSwhMCk7UihcIm5hbWVcIiwzLCExLCEwLGZ1bmN0aW9uKGEsYil7dmFyIGM9Yj9SYShiLmEoYSkpOmEuYTtyZXR1cm4gYz9jLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk6XCJcIn0sMCwxLCEwKTtSKFwibmFtZXNwYWNlLXVyaVwiLDMsITAsITEsZnVuY3Rpb24oKXtyZXR1cm5cIlwifSwwLDEsITApO1xuUihcIm5vcm1hbGl6ZS1zcGFjZVwiLDMsITEsITAsZnVuY3Rpb24oYSxiKXtyZXR1cm4oYj9MKGIsYSk6eihhLmEpKS5yZXBsYWNlKC9bXFxzXFx4YTBdKy9nLFwiIFwiKS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLFwiXCIpfSwwLDEpO1IoXCJub3RcIiwyLCExLCExLGZ1bmN0aW9uKGEsYil7cmV0dXJuIU0oYixhKX0sMSk7UihcIm51bWJlclwiLDEsITEsITAsZnVuY3Rpb24oYSxiKXtyZXR1cm4gYj9LKGIsYSk6K3ooYS5hKX0sMCwxKTtSKFwicG9zaXRpb25cIiwxLCEwLCExLGZ1bmN0aW9uKGEpe3JldHVybiBhLmJ9LDApO1IoXCJyb3VuZFwiLDEsITEsITEsZnVuY3Rpb24oYSxiKXtyZXR1cm4gTWF0aC5yb3VuZChLKGIsYSkpfSwxKTtSKFwic3RhcnRzLXdpdGhcIiwyLCExLCExLGZ1bmN0aW9uKGEsYixjKXtiPUwoYixhKTthPUwoYyxhKTtyZXR1cm4gMD09Yi5sYXN0SW5kZXhPZihhLDApfSwyKTtSKFwic3RyaW5nXCIsMywhMSwhMCxmdW5jdGlvbihhLGIpe3JldHVybiBiP0woYixhKTp6KGEuYSl9LDAsMSk7XG5SKFwic3RyaW5nLWxlbmd0aFwiLDEsITEsITAsZnVuY3Rpb24oYSxiKXtyZXR1cm4oYj9MKGIsYSk6eihhLmEpKS5sZW5ndGh9LDAsMSk7UihcInN1YnN0cmluZ1wiLDMsITEsITEsZnVuY3Rpb24oYSxiLGMsZCl7Yz1LKGMsYSk7aWYoaXNOYU4oYyl8fEluZmluaXR5PT1jfHwtSW5maW5pdHk9PWMpcmV0dXJuXCJcIjtkPWQ/SyhkLGEpOkluZmluaXR5O2lmKGlzTmFOKGQpfHwtSW5maW5pdHk9PT1kKXJldHVyblwiXCI7Yz1NYXRoLnJvdW5kKGMpLTE7dmFyIGU9TWF0aC5tYXgoYywwKTthPUwoYixhKTtyZXR1cm4gSW5maW5pdHk9PWQ/YS5zdWJzdHJpbmcoZSk6YS5zdWJzdHJpbmcoZSxjK01hdGgucm91bmQoZCkpfSwyLDMpO1IoXCJzdWJzdHJpbmctYWZ0ZXJcIiwzLCExLCExLGZ1bmN0aW9uKGEsYixjKXtiPUwoYixhKTthPUwoYyxhKTtjPWIuaW5kZXhPZihhKTtyZXR1cm4tMT09Yz9cIlwiOmIuc3Vic3RyaW5nKGMrYS5sZW5ndGgpfSwyKTtcblIoXCJzdWJzdHJpbmctYmVmb3JlXCIsMywhMSwhMSxmdW5jdGlvbihhLGIsYyl7Yj1MKGIsYSk7YT1MKGMsYSk7YT1iLmluZGV4T2YoYSk7cmV0dXJuLTE9PWE/XCJcIjpiLnN1YnN0cmluZygwLGEpfSwyKTtSKFwic3VtXCIsMSwhMSwhMSxmdW5jdGlvbihhLGIpe2Zvcih2YXIgYz1IKGIuYShhKSksZD0wLGU9SShjKTtlO2U9SShjKSlkKz0reihlKTtyZXR1cm4gZH0sMSwxLCEwKTtSKFwidHJhbnNsYXRlXCIsMywhMSwhMSxmdW5jdGlvbihhLGIsYyxkKXtiPUwoYixhKTtjPUwoYyxhKTt2YXIgZT1MKGQsYSk7YT17fTtmb3IoZD0wO2Q8Yy5sZW5ndGg7ZCsrKXt2YXIgZj1jLmNoYXJBdChkKTtmIGluIGF8fChhW2ZdPWUuY2hhckF0KGQpKX1jPVwiXCI7Zm9yKGQ9MDtkPGIubGVuZ3RoO2QrKylmPWIuY2hhckF0KGQpLGMrPWYgaW4gYT9hW2ZdOmY7cmV0dXJuIGN9LDMpO1IoXCJ0cnVlXCIsMiwhMSwhMSxmdW5jdGlvbigpe3JldHVybiEwfSwwKTtmdW5jdGlvbiBHKGEsYil7dGhpcy5oPWE7dGhpcy5jPXZvaWQgMCE9PWI/YjpudWxsO3RoaXMuYj1udWxsO3N3aXRjaChhKXtjYXNlIFwiY29tbWVudFwiOnRoaXMuYj04O2JyZWFrO2Nhc2UgXCJ0ZXh0XCI6dGhpcy5iPTM7YnJlYWs7Y2FzZSBcInByb2Nlc3NpbmctaW5zdHJ1Y3Rpb25cIjp0aGlzLmI9NzticmVhaztjYXNlIFwibm9kZVwiOmJyZWFrO2RlZmF1bHQ6dGhyb3cgRXJyb3IoXCJVbmV4cGVjdGVkIGFyZ3VtZW50XCIpO319ZnVuY3Rpb24gZGIoYSl7cmV0dXJuXCJjb21tZW50XCI9PWF8fFwidGV4dFwiPT1hfHxcInByb2Nlc3NpbmctaW5zdHJ1Y3Rpb25cIj09YXx8XCJub2RlXCI9PWF9Ry5wcm90b3R5cGUuYT1mdW5jdGlvbihhKXtyZXR1cm4gbnVsbD09PXRoaXMuYnx8dGhpcy5iPT1hLm5vZGVUeXBlfTtHLnByb3RvdHlwZS5mPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuaH07XG5HLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3ZhciBhPVwiS2luZCBUZXN0OiBcIit0aGlzLmg7bnVsbD09PXRoaXMuY3x8KGErPUoodGhpcy5jKSk7cmV0dXJuIGF9O2Z1bmN0aW9uIGViKGEpe3RoaXMuYj1hO3RoaXMuYT0wfWZ1bmN0aW9uIGZiKGEpe2E9YS5tYXRjaChnYik7Zm9yKHZhciBiPTA7YjxhLmxlbmd0aDtiKyspaGIudGVzdChhW2JdKSYmYS5zcGxpY2UoYiwxKTtyZXR1cm4gbmV3IGViKGEpfXZhciBnYj0vXFwkPyg/Oig/IVswLTktXFwuXSkoPzpcXCp8W1xcdy1cXC5dKyk6KT8oPyFbMC05LVxcLl0pKD86XFwqfFtcXHctXFwuXSspfFxcL1xcL3xcXC5cXC58Ojp8XFxkKyg/OlxcLlxcZCopP3xcXC5cXGQrfFwiW15cIl0qXCJ8J1teJ10qJ3xbITw+XT18XFxzK3wuL2csaGI9L15cXHMvO2Z1bmN0aW9uIFMoYSxiKXtyZXR1cm4gYS5iW2EuYSsoYnx8MCldfWZ1bmN0aW9uIFQoYSl7cmV0dXJuIGEuYlthLmErK119ZnVuY3Rpb24gaWIoYSl7cmV0dXJuIGEuYi5sZW5ndGg8PWEuYX07ZnVuY3Rpb24gamIoYSl7bi5jYWxsKHRoaXMsMyk7dGhpcy5jPWEuc3Vic3RyaW5nKDEsYS5sZW5ndGgtMSl9bShqYik7amIucHJvdG90eXBlLmE9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jfTtqYi5wcm90b3R5cGUudG9TdHJpbmc9ZnVuY3Rpb24oKXtyZXR1cm5cIkxpdGVyYWw6IFwiK3RoaXMuY307ZnVuY3Rpb24gRShhLGIpe3RoaXMuaj1hLnRvTG93ZXJDYXNlKCk7dmFyIGM7Yz1cIipcIj09dGhpcy5qP1wiKlwiOlwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiO3RoaXMuYz1iP2IudG9Mb3dlckNhc2UoKTpjfUUucHJvdG90eXBlLmE9ZnVuY3Rpb24oYSl7dmFyIGI9YS5ub2RlVHlwZTtpZigxIT1iJiYyIT1iKXJldHVybiExO2I9dm9pZCAwIT09YS5sb2NhbE5hbWU/YS5sb2NhbE5hbWU6YS5ub2RlTmFtZTtyZXR1cm5cIipcIiE9dGhpcy5qJiZ0aGlzLmohPWIudG9Mb3dlckNhc2UoKT8hMTpcIipcIj09dGhpcy5jPyEwOnRoaXMuYz09KGEubmFtZXNwYWNlVVJJP2EubmFtZXNwYWNlVVJJLnRvTG93ZXJDYXNlKCk6XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIpfTtFLnByb3RvdHlwZS5mPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuan07XG5FLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVyblwiTmFtZSBUZXN0OiBcIisoXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCI9PXRoaXMuYz9cIlwiOnRoaXMuYytcIjpcIikrdGhpcy5qfTtmdW5jdGlvbiBrYihhLGIpe24uY2FsbCh0aGlzLGEuaSk7dGhpcy5oPWE7dGhpcy5jPWI7dGhpcy5nPWEuZzt0aGlzLmI9YS5iO2lmKDE9PXRoaXMuYy5sZW5ndGgpe3ZhciBjPXRoaXMuY1swXTtjLnV8fGMuYyE9bGJ8fChjPWMubyxcIipcIiE9Yy5mKCkmJih0aGlzLmY9e25hbWU6Yy5mKCksczpudWxsfSkpfX1tKGtiKTtmdW5jdGlvbiBtYigpe24uY2FsbCh0aGlzLDQpfW0obWIpO21iLnByb3RvdHlwZS5hPWZ1bmN0aW9uKGEpe3ZhciBiPW5ldyBDO2E9YS5hOzk9PWEubm9kZVR5cGU/RihiLGEpOkYoYixhLm93bmVyRG9jdW1lbnQpO3JldHVybiBifTttYi5wcm90b3R5cGUudG9TdHJpbmc9ZnVuY3Rpb24oKXtyZXR1cm5cIlJvb3QgSGVscGVyIEV4cHJlc3Npb25cIn07ZnVuY3Rpb24gbmIoKXtuLmNhbGwodGhpcyw0KX1tKG5iKTtuYi5wcm90b3R5cGUuYT1mdW5jdGlvbihhKXt2YXIgYj1uZXcgQztGKGIsYS5hKTtyZXR1cm4gYn07bmIucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7cmV0dXJuXCJDb250ZXh0IEhlbHBlciBFeHByZXNzaW9uXCJ9O1xuZnVuY3Rpb24gb2IoYSl7cmV0dXJuXCIvXCI9PWF8fFwiLy9cIj09YX1rYi5wcm90b3R5cGUuYT1mdW5jdGlvbihhKXt2YXIgYj10aGlzLmguYShhKTtpZighKGIgaW5zdGFuY2VvZiBDKSl0aHJvdyBFcnJvcihcIkZpbHRlciBleHByZXNzaW9uIG11c3QgZXZhbHVhdGUgdG8gbm9kZXNldC5cIik7YT10aGlzLmM7Zm9yKHZhciBjPTAsZD1hLmxlbmd0aDtjPGQmJmIubDtjKyspe3ZhciBlPWFbY10sZj1IKGIsZS5jLmEpLGc7aWYoZS5nfHxlLmMhPXBiKWlmKGUuZ3x8ZS5jIT1xYilmb3IoZz1JKGYpLGI9ZS5hKG5ldyBRKGcpKTtudWxsIT0oZz1JKGYpKTspZz1lLmEobmV3IFEoZykpLGI9UGEoYixnKTtlbHNlIGc9SShmKSxiPWUuYShuZXcgUShnKSk7ZWxzZXtmb3IoZz1JKGYpOyhiPUkoZikpJiYoIWcuY29udGFpbnN8fGcuY29udGFpbnMoYikpJiZiLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKGcpJjg7Zz1iKTtiPWUuYShuZXcgUShnKSl9fXJldHVybiBifTtcbmtiLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3ZhciBhO2E9XCJQYXRoIEV4cHJlc3Npb246XCIrSih0aGlzLmgpO2lmKHRoaXMuYy5sZW5ndGgpe3ZhciBiPXQodGhpcy5jLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGErSihiKX0sXCJTdGVwczpcIik7YSs9SihiKX1yZXR1cm4gYX07ZnVuY3Rpb24gcmIoYSl7bi5jYWxsKHRoaXMsNCk7dGhpcy5jPWE7VWEodGhpcyxqYSh0aGlzLmMsZnVuY3Rpb24oYSl7cmV0dXJuIGEuZ30pKTtWYSh0aGlzLGphKHRoaXMuYyxmdW5jdGlvbihhKXtyZXR1cm4gYS5ifSkpfW0ocmIpO3JiLnByb3RvdHlwZS5hPWZ1bmN0aW9uKGEpe3ZhciBiPW5ldyBDO3IodGhpcy5jLGZ1bmN0aW9uKGMpe2M9Yy5hKGEpO2lmKCEoYyBpbnN0YW5jZW9mIEMpKXRocm93IEVycm9yKFwiUGF0aCBleHByZXNzaW9uIG11c3QgZXZhbHVhdGUgdG8gTm9kZVNldC5cIik7Yj1QYShiLGMpfSk7cmV0dXJuIGJ9O3JiLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVybiB0KHRoaXMuYyxmdW5jdGlvbihhLGIpe3JldHVybiBhK0ooYil9LFwiVW5pb24gRXhwcmVzc2lvbjpcIil9O2Z1bmN0aW9uIHNiKGEsYil7dGhpcy5hPWE7dGhpcy5iPSEhYn1cbmZ1bmN0aW9uICRhKGEsYixjKXtmb3IoYz1jfHwwO2M8YS5hLmxlbmd0aDtjKyspZm9yKHZhciBkPWEuYVtjXSxlPUgoYiksZj1iLmwsZyxoPTA7Zz1JKGUpO2grKyl7dmFyIHA9YS5iP2YtaDpoKzE7Zz1kLmEobmV3IFEoZyxwLGYpKTtpZihcIm51bWJlclwiPT10eXBlb2YgZylwPXA9PWc7ZWxzZSBpZihcInN0cmluZ1wiPT10eXBlb2YgZ3x8XCJib29sZWFuXCI9PXR5cGVvZiBnKXA9ISFnO2Vsc2UgaWYoZyBpbnN0YW5jZW9mIEMpcD0wPGcubDtlbHNlIHRocm93IEVycm9yKFwiUHJlZGljYXRlLmV2YWx1YXRlIHJldHVybmVkIGFuIHVuZXhwZWN0ZWQgdHlwZS5cIik7aWYoIXApe3A9ZTtnPXAuZjt2YXIgeT1wLmE7aWYoIXkpdGhyb3cgRXJyb3IoXCJOZXh0IG11c3QgYmUgY2FsbGVkIGF0IGxlYXN0IG9uY2UgYmVmb3JlIHJlbW92ZS5cIik7dmFyIEQ9eS5iLHk9eS5hO0Q/RC5hPXk6Zy5hPXk7eT95LmI9RDpnLmI9RDtnLmwtLTtwLmE9bnVsbH19cmV0dXJuIGJ9XG5zYi5wcm90b3R5cGUudG9TdHJpbmc9ZnVuY3Rpb24oKXtyZXR1cm4gdCh0aGlzLmEsZnVuY3Rpb24oYSxiKXtyZXR1cm4gYStKKGIpfSxcIlByZWRpY2F0ZXM6XCIpfTtmdW5jdGlvbiBVKGEsYixjLGQpe24uY2FsbCh0aGlzLDQpO3RoaXMuYz1hO3RoaXMubz1iO3RoaXMuaD1jfHxuZXcgc2IoW10pO3RoaXMudT0hIWQ7Yj10aGlzLmg7Yj0wPGIuYS5sZW5ndGg/Yi5hWzBdLmY6bnVsbDthLmImJmImJihhPWIubmFtZSxhPXc/YS50b0xvd2VyQ2FzZSgpOmEsdGhpcy5mPXtuYW1lOmEsczpiLnN9KTthOnthPXRoaXMuaDtmb3IoYj0wO2I8YS5hLmxlbmd0aDtiKyspaWYoYz1hLmFbYl0sYy5nfHwxPT1jLml8fDA9PWMuaSl7YT0hMDticmVhayBhfWE9ITF9dGhpcy5nPWF9bShVKTtcblUucHJvdG90eXBlLmE9ZnVuY3Rpb24oYSl7dmFyIGI9YS5hLGM9bnVsbCxjPXRoaXMuZixkPW51bGwsZT1udWxsLGY9MDtjJiYoZD1jLm5hbWUsZT1jLnM/TChjLnMsYSk6bnVsbCxmPTEpO2lmKHRoaXMudSlpZih0aGlzLmd8fHRoaXMuYyE9dGIpaWYoYT1IKChuZXcgVSh1YixuZXcgRyhcIm5vZGVcIikpKS5hKGEpKSxiPUkoYSkpZm9yKGM9dGhpcy5tKGIsZCxlLGYpO251bGwhPShiPUkoYSkpOyljPVBhKGMsdGhpcy5tKGIsZCxlLGYpKTtlbHNlIGM9bmV3IEM7ZWxzZSBjPUIodGhpcy5vLGIsZCxlKSxjPSRhKHRoaXMuaCxjLGYpO2Vsc2UgYz10aGlzLm0oYS5hLGQsZSxmKTtyZXR1cm4gY307VS5wcm90b3R5cGUubT1mdW5jdGlvbihhLGIsYyxkKXthPXRoaXMuYy5mKHRoaXMubyxhLGIsYyk7cmV0dXJuIGE9JGEodGhpcy5oLGEsZCl9O1xuVS5wcm90b3R5cGUudG9TdHJpbmc9ZnVuY3Rpb24oKXt2YXIgYTthPVwiU3RlcDpcIitKKFwiT3BlcmF0b3I6IFwiKyh0aGlzLnU/XCIvL1wiOlwiL1wiKSk7dGhpcy5jLmomJihhKz1KKFwiQXhpczogXCIrdGhpcy5jKSk7YSs9Sih0aGlzLm8pO2lmKHRoaXMuaC5hLmxlbmd0aCl7dmFyIGI9dCh0aGlzLmguYSxmdW5jdGlvbihhLGIpe3JldHVybiBhK0ooYil9LFwiUHJlZGljYXRlczpcIik7YSs9SihiKX1yZXR1cm4gYX07ZnVuY3Rpb24gdmIoYSxiLGMsZCl7dGhpcy5qPWE7dGhpcy5mPWI7dGhpcy5hPWM7dGhpcy5iPWR9dmIucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuan07dmFyIHdiPXt9O2Z1bmN0aW9uIFYoYSxiLGMsZCl7aWYod2IuaGFzT3duUHJvcGVydHkoYSkpdGhyb3cgRXJyb3IoXCJBeGlzIGFscmVhZHkgY3JlYXRlZDogXCIrYSk7Yj1uZXcgdmIoYSxiLGMsISFkKTtyZXR1cm4gd2JbYV09Yn1cblYoXCJhbmNlc3RvclwiLGZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjPW5ldyBDLGQ9YjtkPWQucGFyZW50Tm9kZTspYS5hKGQpJiZRYShjLGQpO3JldHVybiBjfSwhMCk7VihcImFuY2VzdG9yLW9yLXNlbGZcIixmdW5jdGlvbihhLGIpe3ZhciBjPW5ldyBDLGQ9YjtkbyBhLmEoZCkmJlFhKGMsZCk7d2hpbGUoZD1kLnBhcmVudE5vZGUpO3JldHVybiBjfSwhMCk7XG52YXIgbGI9VihcImF0dHJpYnV0ZVwiLGZ1bmN0aW9uKGEsYil7dmFyIGM9bmV3IEMsZD1hLmYoKTtpZihcInN0eWxlXCI9PWQmJncmJmIuc3R5bGUpcmV0dXJuIEYoYyxuZXcgeChiLnN0eWxlLGIsXCJzdHlsZVwiLGIuc3R5bGUuY3NzVGV4dCkpLGM7dmFyIGU9Yi5hdHRyaWJ1dGVzO2lmKGUpaWYoYSBpbnN0YW5jZW9mIEcmJm51bGw9PT1hLmJ8fFwiKlwiPT1kKWZvcih2YXIgZD0wLGY7Zj1lW2RdO2QrKyl3P2Yubm9kZVZhbHVlJiZGKGMsRGEoYixmKSk6RihjLGYpO2Vsc2UoZj1lLmdldE5hbWVkSXRlbShkKSkmJih3P2Yubm9kZVZhbHVlJiZGKGMsRGEoYixmKSk6RihjLGYpKTtyZXR1cm4gY30sITEpLHRiPVYoXCJjaGlsZFwiLGZ1bmN0aW9uKGEsYixjLGQsZSl7cmV0dXJuKHc/SWE6SmEpLmNhbGwobnVsbCxhLGIsbChjKT9jOm51bGwsbChkKT9kOm51bGwsZXx8bmV3IEMpfSwhMSwhMCk7VihcImRlc2NlbmRhbnRcIixCLCExLCEwKTtcbnZhciB1Yj1WKFwiZGVzY2VuZGFudC1vci1zZWxmXCIsZnVuY3Rpb24oYSxiLGMsZCl7dmFyIGU9bmV3IEM7QShiLGMsZCkmJmEuYShiKSYmRihlLGIpO3JldHVybiBCKGEsYixjLGQsZSl9LCExLCEwKSxwYj1WKFwiZm9sbG93aW5nXCIsZnVuY3Rpb24oYSxiLGMsZCl7dmFyIGU9bmV3IEM7ZG8gZm9yKHZhciBmPWI7Zj1mLm5leHRTaWJsaW5nOylBKGYsYyxkKSYmYS5hKGYpJiZGKGUsZiksZT1CKGEsZixjLGQsZSk7d2hpbGUoYj1iLnBhcmVudE5vZGUpO3JldHVybiBlfSwhMSwhMCk7VihcImZvbGxvd2luZy1zaWJsaW5nXCIsZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9bmV3IEMsZD1iO2Q9ZC5uZXh0U2libGluZzspYS5hKGQpJiZGKGMsZCk7cmV0dXJuIGN9LCExKTtWKFwibmFtZXNwYWNlXCIsZnVuY3Rpb24oKXtyZXR1cm4gbmV3IEN9LCExKTtcbnZhciB4Yj1WKFwicGFyZW50XCIsZnVuY3Rpb24oYSxiKXt2YXIgYz1uZXcgQztpZig5PT1iLm5vZGVUeXBlKXJldHVybiBjO2lmKDI9PWIubm9kZVR5cGUpcmV0dXJuIEYoYyxiLm93bmVyRWxlbWVudCksYzt2YXIgZD1iLnBhcmVudE5vZGU7YS5hKGQpJiZGKGMsZCk7cmV0dXJuIGN9LCExKSxxYj1WKFwicHJlY2VkaW5nXCIsZnVuY3Rpb24oYSxiLGMsZCl7dmFyIGU9bmV3IEMsZj1bXTtkbyBmLnVuc2hpZnQoYik7d2hpbGUoYj1iLnBhcmVudE5vZGUpO2Zvcih2YXIgZz0xLGg9Zi5sZW5ndGg7ZzxoO2crKyl7dmFyIHA9W107Zm9yKGI9ZltnXTtiPWIucHJldmlvdXNTaWJsaW5nOylwLnVuc2hpZnQoYik7Zm9yKHZhciB5PTAsRD1wLmxlbmd0aDt5PEQ7eSsrKWI9cFt5XSxBKGIsYyxkKSYmYS5hKGIpJiZGKGUsYiksZT1CKGEsYixjLGQsZSl9cmV0dXJuIGV9LCEwLCEwKTtcblYoXCJwcmVjZWRpbmctc2libGluZ1wiLGZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjPW5ldyBDLGQ9YjtkPWQucHJldmlvdXNTaWJsaW5nOylhLmEoZCkmJlFhKGMsZCk7cmV0dXJuIGN9LCEwKTt2YXIgeWI9VihcInNlbGZcIixmdW5jdGlvbihhLGIpe3ZhciBjPW5ldyBDO2EuYShiKSYmRihjLGIpO3JldHVybiBjfSwhMSk7ZnVuY3Rpb24gemIoYSl7bi5jYWxsKHRoaXMsMSk7dGhpcy5jPWE7dGhpcy5nPWEuZzt0aGlzLmI9YS5ifW0oemIpO3piLnByb3RvdHlwZS5hPWZ1bmN0aW9uKGEpe3JldHVybi1LKHRoaXMuYyxhKX07emIucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7cmV0dXJuXCJVbmFyeSBFeHByZXNzaW9uOiAtXCIrSih0aGlzLmMpfTtmdW5jdGlvbiBBYihhKXtuLmNhbGwodGhpcywxKTt0aGlzLmM9YX1tKEFiKTtBYi5wcm90b3R5cGUuYT1mdW5jdGlvbigpe3JldHVybiB0aGlzLmN9O0FiLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVyblwiTnVtYmVyOiBcIit0aGlzLmN9O2Z1bmN0aW9uIEJiKGEsYil7dGhpcy5hPWE7dGhpcy5iPWJ9ZnVuY3Rpb24gQ2IoYSl7Zm9yKHZhciBiLGM9W107Oyl7VyhhLFwiTWlzc2luZyByaWdodCBoYW5kIHNpZGUgb2YgYmluYXJ5IGV4cHJlc3Npb24uXCIpO2I9RGIoYSk7dmFyIGQ9VChhLmEpO2lmKCFkKWJyZWFrO3ZhciBlPShkPVlhW2RdfHxudWxsKSYmZC53O2lmKCFlKXthLmEuYS0tO2JyZWFrfWZvcig7Yy5sZW5ndGgmJmU8PWNbYy5sZW5ndGgtMV0udzspYj1uZXcgTihjLnBvcCgpLGMucG9wKCksYik7Yy5wdXNoKGIsZCl9Zm9yKDtjLmxlbmd0aDspYj1uZXcgTihjLnBvcCgpLGMucG9wKCksYik7cmV0dXJuIGJ9ZnVuY3Rpb24gVyhhLGIpe2lmKGliKGEuYSkpdGhyb3cgRXJyb3IoYik7fWZ1bmN0aW9uIEViKGEsYil7dmFyIGM9VChhLmEpO2lmKGMhPWIpdGhyb3cgRXJyb3IoXCJCYWQgdG9rZW4sIGV4cGVjdGVkOiBcIitiK1wiIGdvdDogXCIrYyk7fVxuZnVuY3Rpb24gRmIoYSl7YT1UKGEuYSk7aWYoXCIpXCIhPWEpdGhyb3cgRXJyb3IoXCJCYWQgdG9rZW46IFwiK2EpO31mdW5jdGlvbiBHYihhKXthPVQoYS5hKTtpZigyPmEubGVuZ3RoKXRocm93IEVycm9yKFwiVW5jbG9zZWQgbGl0ZXJhbCBzdHJpbmdcIik7cmV0dXJuIG5ldyBqYihhKX1cbmZ1bmN0aW9uIEhiKGEpe3ZhciBiLGM9W10sZDtpZihvYihTKGEuYSkpKXtiPVQoYS5hKTtkPVMoYS5hKTtpZihcIi9cIj09YiYmKGliKGEuYSl8fFwiLlwiIT1kJiZcIi4uXCIhPWQmJlwiQFwiIT1kJiZcIipcIiE9ZCYmIS8oPyFbMC05XSlbXFx3XS8udGVzdChkKSkpcmV0dXJuIG5ldyBtYjtkPW5ldyBtYjtXKGEsXCJNaXNzaW5nIG5leHQgbG9jYXRpb24gc3RlcC5cIik7Yj1JYihhLGIpO2MucHVzaChiKX1lbHNle2E6e2I9UyhhLmEpO2Q9Yi5jaGFyQXQoMCk7c3dpdGNoKGQpe2Nhc2UgXCIkXCI6dGhyb3cgRXJyb3IoXCJWYXJpYWJsZSByZWZlcmVuY2Ugbm90IGFsbG93ZWQgaW4gSFRNTCBYUGF0aFwiKTtjYXNlIFwiKFwiOlQoYS5hKTtiPUNiKGEpO1coYSwndW5jbG9zZWQgXCIoXCInKTtFYihhLFwiKVwiKTticmVhaztjYXNlICdcIic6Y2FzZSBcIidcIjpiPUdiKGEpO2JyZWFrO2RlZmF1bHQ6aWYoaXNOYU4oK2IpKWlmKCFkYihiKSYmLyg/IVswLTldKVtcXHddLy50ZXN0KGQpJiZcIihcIj09UyhhLmEsMSkpe2I9VChhLmEpO1xuYj1jYltiXXx8bnVsbDtUKGEuYSk7Zm9yKGQ9W107XCIpXCIhPVMoYS5hKTspe1coYSxcIk1pc3NpbmcgZnVuY3Rpb24gYXJndW1lbnQgbGlzdC5cIik7ZC5wdXNoKENiKGEpKTtpZihcIixcIiE9UyhhLmEpKWJyZWFrO1QoYS5hKX1XKGEsXCJVbmNsb3NlZCBmdW5jdGlvbiBhcmd1bWVudCBsaXN0LlwiKTtGYihhKTtiPW5ldyBhYihiLGQpfWVsc2V7Yj1udWxsO2JyZWFrIGF9ZWxzZSBiPW5ldyBBYigrVChhLmEpKX1cIltcIj09UyhhLmEpJiYoZD1uZXcgc2IoSmIoYSkpLGI9bmV3IFphKGIsZCkpfWlmKGIpaWYob2IoUyhhLmEpKSlkPWI7ZWxzZSByZXR1cm4gYjtlbHNlIGI9SWIoYSxcIi9cIiksZD1uZXcgbmIsYy5wdXNoKGIpfWZvcig7b2IoUyhhLmEpKTspYj1UKGEuYSksVyhhLFwiTWlzc2luZyBuZXh0IGxvY2F0aW9uIHN0ZXAuXCIpLGI9SWIoYSxiKSxjLnB1c2goYik7cmV0dXJuIG5ldyBrYihkLGMpfVxuZnVuY3Rpb24gSWIoYSxiKXt2YXIgYyxkLGU7aWYoXCIvXCIhPWImJlwiLy9cIiE9Yil0aHJvdyBFcnJvcignU3RlcCBvcCBzaG91bGQgYmUgXCIvXCIgb3IgXCIvL1wiJyk7aWYoXCIuXCI9PVMoYS5hKSlyZXR1cm4gZD1uZXcgVSh5YixuZXcgRyhcIm5vZGVcIikpLFQoYS5hKSxkO2lmKFwiLi5cIj09UyhhLmEpKXJldHVybiBkPW5ldyBVKHhiLG5ldyBHKFwibm9kZVwiKSksVChhLmEpLGQ7dmFyIGY7aWYoXCJAXCI9PVMoYS5hKSlmPWxiLFQoYS5hKSxXKGEsXCJNaXNzaW5nIGF0dHJpYnV0ZSBuYW1lXCIpO2Vsc2UgaWYoXCI6OlwiPT1TKGEuYSwxKSl7aWYoIS8oPyFbMC05XSlbXFx3XS8udGVzdChTKGEuYSkuY2hhckF0KDApKSl0aHJvdyBFcnJvcihcIkJhZCB0b2tlbjogXCIrVChhLmEpKTtjPVQoYS5hKTtmPXdiW2NdfHxudWxsO2lmKCFmKXRocm93IEVycm9yKFwiTm8gYXhpcyB3aXRoIG5hbWU6IFwiK2MpO1QoYS5hKTtXKGEsXCJNaXNzaW5nIG5vZGUgbmFtZVwiKX1lbHNlIGY9dGI7Yz1TKGEuYSk7aWYoLyg/IVswLTldKVtcXHdcXCpdLy50ZXN0KGMuY2hhckF0KDApKSlpZihcIihcIj09XG5TKGEuYSwxKSl7aWYoIWRiKGMpKXRocm93IEVycm9yKFwiSW52YWxpZCBub2RlIHR5cGU6IFwiK2MpO2M9VChhLmEpO2lmKCFkYihjKSl0aHJvdyBFcnJvcihcIkludmFsaWQgdHlwZSBuYW1lOiBcIitjKTtFYihhLFwiKFwiKTtXKGEsXCJCYWQgbm9kZXR5cGVcIik7ZT1TKGEuYSkuY2hhckF0KDApO3ZhciBnPW51bGw7aWYoJ1wiJz09ZXx8XCInXCI9PWUpZz1HYihhKTtXKGEsXCJCYWQgbm9kZXR5cGVcIik7RmIoYSk7Yz1uZXcgRyhjLGcpfWVsc2UgaWYoYz1UKGEuYSksZT1jLmluZGV4T2YoXCI6XCIpLC0xPT1lKWM9bmV3IEUoYyk7ZWxzZXt2YXIgZz1jLnN1YnN0cmluZygwLGUpLGg7aWYoXCIqXCI9PWcpaD1cIipcIjtlbHNlIGlmKGg9YS5iKGcpLCFoKXRocm93IEVycm9yKFwiTmFtZXNwYWNlIHByZWZpeCBub3QgZGVjbGFyZWQ6IFwiK2cpO2M9Yy5zdWJzdHIoZSsxKTtjPW5ldyBFKGMsaCl9ZWxzZSB0aHJvdyBFcnJvcihcIkJhZCB0b2tlbjogXCIrVChhLmEpKTtlPW5ldyBzYihKYihhKSxmLmEpO3JldHVybiBkfHxcbm5ldyBVKGYsYyxlLFwiLy9cIj09Yil9ZnVuY3Rpb24gSmIoYSl7Zm9yKHZhciBiPVtdO1wiW1wiPT1TKGEuYSk7KXtUKGEuYSk7VyhhLFwiTWlzc2luZyBwcmVkaWNhdGUgZXhwcmVzc2lvbi5cIik7dmFyIGM9Q2IoYSk7Yi5wdXNoKGMpO1coYSxcIlVuY2xvc2VkIHByZWRpY2F0ZSBleHByZXNzaW9uLlwiKTtFYihhLFwiXVwiKX1yZXR1cm4gYn1mdW5jdGlvbiBEYihhKXtpZihcIi1cIj09UyhhLmEpKXJldHVybiBUKGEuYSksbmV3IHpiKERiKGEpKTt2YXIgYj1IYihhKTtpZihcInxcIiE9UyhhLmEpKWE9YjtlbHNle2ZvcihiPVtiXTtcInxcIj09VChhLmEpOylXKGEsXCJNaXNzaW5nIG5leHQgdW5pb24gbG9jYXRpb24gcGF0aC5cIiksYi5wdXNoKEhiKGEpKTthLmEuYS0tO2E9bmV3IHJiKGIpfXJldHVybiBhfTtmdW5jdGlvbiBLYihhKXtzd2l0Y2goYS5ub2RlVHlwZSl7Y2FzZSAxOnJldHVybiBlYShMYixhKTtjYXNlIDk6cmV0dXJuIEtiKGEuZG9jdW1lbnRFbGVtZW50KTtjYXNlIDExOmNhc2UgMTA6Y2FzZSA2OmNhc2UgMTI6cmV0dXJuIE1iO2RlZmF1bHQ6cmV0dXJuIGEucGFyZW50Tm9kZT9LYihhLnBhcmVudE5vZGUpOk1ifX1mdW5jdGlvbiBNYigpe3JldHVybiBudWxsfWZ1bmN0aW9uIExiKGEsYil7aWYoYS5wcmVmaXg9PWIpcmV0dXJuIGEubmFtZXNwYWNlVVJJfHxcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWxcIjt2YXIgYz1hLmdldEF0dHJpYnV0ZU5vZGUoXCJ4bWxuczpcIitiKTtyZXR1cm4gYyYmYy5zcGVjaWZpZWQ/Yy52YWx1ZXx8bnVsbDphLnBhcmVudE5vZGUmJjkhPWEucGFyZW50Tm9kZS5ub2RlVHlwZT9MYihhLnBhcmVudE5vZGUsYik6bnVsbH07ZnVuY3Rpb24gTmIoYSxiKXtpZighYS5sZW5ndGgpdGhyb3cgRXJyb3IoXCJFbXB0eSBYUGF0aCBleHByZXNzaW9uLlwiKTt2YXIgYz1mYihhKTtpZihpYihjKSl0aHJvdyBFcnJvcihcIkludmFsaWQgWFBhdGggZXhwcmVzc2lvbi5cIik7Yj9cImZ1bmN0aW9uXCI9PWFhKGIpfHwoYj1kYShiLmxvb2t1cE5hbWVzcGFjZVVSSSxiKSk6Yj1mdW5jdGlvbigpe3JldHVybiBudWxsfTt2YXIgZD1DYihuZXcgQmIoYyxiKSk7aWYoIWliKGMpKXRocm93IEVycm9yKFwiQmFkIHRva2VuOiBcIitUKGMpKTt0aGlzLmV2YWx1YXRlPWZ1bmN0aW9uKGEsYil7dmFyIGM9ZC5hKG5ldyBRKGEpKTtyZXR1cm4gbmV3IFkoYyxiKX19XG5mdW5jdGlvbiBZKGEsYil7aWYoMD09YilpZihhIGluc3RhbmNlb2YgQyliPTQ7ZWxzZSBpZihcInN0cmluZ1wiPT10eXBlb2YgYSliPTI7ZWxzZSBpZihcIm51bWJlclwiPT10eXBlb2YgYSliPTE7ZWxzZSBpZihcImJvb2xlYW5cIj09dHlwZW9mIGEpYj0zO2Vsc2UgdGhyb3cgRXJyb3IoXCJVbmV4cGVjdGVkIGV2YWx1YXRpb24gcmVzdWx0LlwiKTtpZigyIT1iJiYxIT1iJiYzIT1iJiYhKGEgaW5zdGFuY2VvZiBDKSl0aHJvdyBFcnJvcihcInZhbHVlIGNvdWxkIG5vdCBiZSBjb252ZXJ0ZWQgdG8gdGhlIHNwZWNpZmllZCB0eXBlXCIpO3RoaXMucmVzdWx0VHlwZT1iO3ZhciBjO3N3aXRjaChiKXtjYXNlIDI6dGhpcy5zdHJpbmdWYWx1ZT1hIGluc3RhbmNlb2YgQz9TYShhKTpcIlwiK2E7YnJlYWs7Y2FzZSAxOnRoaXMubnVtYmVyVmFsdWU9YSBpbnN0YW5jZW9mIEM/K1NhKGEpOithO2JyZWFrO2Nhc2UgMzp0aGlzLmJvb2xlYW5WYWx1ZT1hIGluc3RhbmNlb2YgQz8wPGEubDohIWE7YnJlYWs7Y2FzZSA0OmNhc2UgNTpjYXNlIDY6Y2FzZSA3OnZhciBkPVxuSChhKTtjPVtdO2Zvcih2YXIgZT1JKGQpO2U7ZT1JKGQpKWMucHVzaChlIGluc3RhbmNlb2YgeD9lLmE6ZSk7dGhpcy5zbmFwc2hvdExlbmd0aD1hLmw7dGhpcy5pbnZhbGlkSXRlcmF0b3JTdGF0ZT0hMTticmVhaztjYXNlIDg6Y2FzZSA5OmQ9UmEoYSk7dGhpcy5zaW5nbGVOb2RlVmFsdWU9ZCBpbnN0YW5jZW9mIHg/ZC5hOmQ7YnJlYWs7ZGVmYXVsdDp0aHJvdyBFcnJvcihcIlVua25vd24gWFBhdGhSZXN1bHQgdHlwZS5cIik7fXZhciBmPTA7dGhpcy5pdGVyYXRlTmV4dD1mdW5jdGlvbigpe2lmKDQhPWImJjUhPWIpdGhyb3cgRXJyb3IoXCJpdGVyYXRlTmV4dCBjYWxsZWQgd2l0aCB3cm9uZyByZXN1bHQgdHlwZVwiKTtyZXR1cm4gZj49Yy5sZW5ndGg/bnVsbDpjW2YrK119O3RoaXMuc25hcHNob3RJdGVtPWZ1bmN0aW9uKGEpe2lmKDYhPWImJjchPWIpdGhyb3cgRXJyb3IoXCJzbmFwc2hvdEl0ZW0gY2FsbGVkIHdpdGggd3JvbmcgcmVzdWx0IHR5cGVcIik7cmV0dXJuIGE+PWMubGVuZ3RofHxcbjA+YT9udWxsOmNbYV19fVkuQU5ZX1RZUEU9MDtZLk5VTUJFUl9UWVBFPTE7WS5TVFJJTkdfVFlQRT0yO1kuQk9PTEVBTl9UWVBFPTM7WS5VTk9SREVSRURfTk9ERV9JVEVSQVRPUl9UWVBFPTQ7WS5PUkRFUkVEX05PREVfSVRFUkFUT1JfVFlQRT01O1kuVU5PUkRFUkVEX05PREVfU05BUFNIT1RfVFlQRT02O1kuT1JERVJFRF9OT0RFX1NOQVBTSE9UX1RZUEU9NztZLkFOWV9VTk9SREVSRURfTk9ERV9UWVBFPTg7WS5GSVJTVF9PUkRFUkVEX05PREVfVFlQRT05O2Z1bmN0aW9uIE9iKGEpe3RoaXMubG9va3VwTmFtZXNwYWNlVVJJPUtiKGEpfVxuZnVuY3Rpb24gUGIoYSxiKXt2YXIgYz1hfHxrLGQ9Yy5Eb2N1bWVudCYmYy5Eb2N1bWVudC5wcm90b3R5cGV8fGMuZG9jdW1lbnQ7aWYoIWQuZXZhbHVhdGV8fGIpYy5YUGF0aFJlc3VsdD1ZLGQuZXZhbHVhdGU9ZnVuY3Rpb24oYSxiLGMsZCl7cmV0dXJuKG5ldyBOYihhLGMpKS5ldmFsdWF0ZShiLGQpfSxkLmNyZWF0ZUV4cHJlc3Npb249ZnVuY3Rpb24oYSxiKXtyZXR1cm4gbmV3IE5iKGEsYil9LGQuY3JlYXRlTlNSZXNvbHZlcj1mdW5jdGlvbihhKXtyZXR1cm4gbmV3IE9iKGEpfX12YXIgUWI9W1wid2d4cGF0aFwiLFwiaW5zdGFsbFwiXSxaPWs7UWJbMF1pbiBafHwhWi5leGVjU2NyaXB0fHxaLmV4ZWNTY3JpcHQoXCJ2YXIgXCIrUWJbMF0pO2Zvcih2YXIgUmI7UWIubGVuZ3RoJiYoUmI9UWIuc2hpZnQoKSk7KVFiLmxlbmd0aHx8dm9pZCAwPT09UGI/WltSYl0/Wj1aW1JiXTpaPVpbUmJdPXt9OlpbUmJdPVBiO21vZHVsZS5leHBvcnRzLmluc3RhbGw9UGI7bW9kdWxlLmV4cG9ydHMuWFBhdGhSZXN1bHRUeXBlPXtBTllfVFlQRTowLE5VTUJFUl9UWVBFOjEsU1RSSU5HX1RZUEU6MixCT09MRUFOX1RZUEU6MyxVTk9SREVSRURfTk9ERV9JVEVSQVRPUl9UWVBFOjQsT1JERVJFRF9OT0RFX0lURVJBVE9SX1RZUEU6NSxVTk9SREVSRURfTk9ERV9TTkFQU0hPVF9UWVBFOjYsT1JERVJFRF9OT0RFX1NOQVBTSE9UX1RZUEU6NyxBTllfVU5PUkRFUkVEX05PREVfVFlQRTo4LEZJUlNUX09SREVSRURfTk9ERV9UWVBFOjl9O30pLmNhbGwoZ2xvYmFsKVxuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG52YXIgZG9jUmVhZHkgPSByZXF1aXJlKCdkb2MtcmVhZHknKTtcbnZhciBDb25uZXhpb24gPSByZXF1aXJlKCcuL2h0dHAvQ29ubmV4aW9uJyk7XG4vKipcbiAqIE1haW4gQm9vdExvYWRlci5cbiAqIERlZmF1bHRzIHBhcmFtcyBmb3IgY29uc3RydWN0b3Igc2hvdWxkIGJlIHt9IGFuZCBjb250ZW50LnBocD9nZXRfYWN0aW9uPWdldF9ib290X2NvbmZcbiAqL1xuXG52YXIgUHlkaW9Cb290c3RyYXAgPSAoZnVuY3Rpb24gKCkge1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0gc3RhcnRQYXJhbWV0ZXJzIE9iamVjdCBUaGUgb3B0aW9uc1xuICAgICAqL1xuXG4gICAgZnVuY3Rpb24gUHlkaW9Cb290c3RyYXAoc3RhcnRQYXJhbWV0ZXJzKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFB5ZGlvQm9vdHN0cmFwKTtcblxuICAgICAgICB0aGlzLnBhcmFtZXRlcnMgPSBuZXcgTWFwKCk7XG4gICAgICAgIGZvciAodmFyIGkgaW4gc3RhcnRQYXJhbWV0ZXJzKSB7XG4gICAgICAgICAgICBpZiAoc3RhcnRQYXJhbWV0ZXJzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJhbWV0ZXJzLnNldChpLCBzdGFydFBhcmFtZXRlcnNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGV0ZWN0QmFzZVBhcmFtZXRlcnMoKTtcblxuICAgICAgICBpZiAodGhpcy5wYXJhbWV0ZXJzLmdldChcIkFMRVJUXCIpKSB7XG4gICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmFsZXJ0KF90aGlzLnBhcmFtZXRlcnMuZ2V0KFwiQUxFUlRcIikpO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgIH1cblxuICAgICAgICBkb2NSZWFkeSgoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICB2YXIgc3RhcnRlZEZyb21PcGVuZXIgPSBmYWxzZTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5vcGVuZXIgJiYgd2luZG93Lm9wZW5lci5weWRpb0Jvb3RzdHJhcCAmJiB0aGlzLnBhcmFtZXRlcnMuZ2V0KCdzZXJ2ZXJBY2Nlc3NQYXRoJykgPT09IHdpbmRvdy5vcGVuZXIucHlkaW9Cb290c3RyYXAucGFyYW1ldGVycy5nZXQoJ3NlcnZlckFjY2Vzc1BhdGgnKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmFtZXRlcnMgPSB3aW5kb3cub3BlbmVyLnB5ZGlvQm9vdHN0cmFwLnBhcmFtZXRlcnM7XG4gICAgICAgICAgICAgICAgICAgIC8vIEhhbmRsZSBxdWVyeVN0cmluZyBjYXNlLCBhcyBpdCdzIG5vdCBwYXNzZWQgdmlhIGdldF9ib290X2NvbmZcbiAgICAgICAgICAgICAgICAgICAgdmFyIHFQYXJhbXMgPSBkb2N1bWVudC5sb2NhdGlvbi5ocmVmLnRvUXVlcnlQYXJhbXMoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHFQYXJhbXNbJ2V4dGVybmFsX3NlbGVjdG9yX3R5cGUnXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJhbWV0ZXJzLnNldCgnU0VMRUNUT1JfREFUQScsIHsgdHlwZTogcVBhcmFtc1snZXh0ZXJuYWxfc2VsZWN0b3JfdHlwZSddLCBkYXRhOiBxUGFyYW1zIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyYW1ldGVycy5nZXQoJ1NFTEVDVE9SX0RBVEEnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyYW1ldGVycy51bnNldCgnU0VMRUNUT1JfREFUQScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaENvbnRleHRWYXJpYWJsZXNBbmRJbml0KG5ldyBDb25uZXhpb24oKSk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ZWRGcm9tT3BlbmVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5jb25zb2xlICYmIGNvbnNvbGUubG9nKSBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghc3RhcnRlZEZyb21PcGVuZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvYWRCb290Q29uZmlnKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmJpbmQodGhpcykpO1xuXG4gICAgICAgIHdpbmRvdy5Db25uZXhpb24gPSBDb25uZXhpb247XG4gICAgICAgIHdpbmRvdy5weWRpb0Jvb3RzdHJhcCA9IHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhbCBsb2FkaW5nIGFjdGlvblxuICAgICAqL1xuXG4gICAgUHlkaW9Cb290c3RyYXAucHJvdG90eXBlLmxvYWRCb290Q29uZmlnID0gZnVuY3Rpb24gbG9hZEJvb3RDb25maWcoKSB7XG4gICAgICAgIGlmICh0aGlzLnBhcmFtZXRlcnMuZ2V0KCdQUkVMT0FERURfQk9PVF9DT05GJykpIHtcbiAgICAgICAgICAgIHZhciBwcmVsb2FkZWQgPSB0aGlzLnBhcmFtZXRlcnMuZ2V0KCdQUkVMT0FERURfQk9PVF9DT05GJyk7XG4gICAgICAgICAgICBmb3IgKHZhciBrIGluIHByZWxvYWRlZCkge1xuICAgICAgICAgICAgICAgIGlmIChwcmVsb2FkZWQuaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJhbWV0ZXJzLnNldChrLCBwcmVsb2FkZWRba10pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucmVmcmVzaENvbnRleHRWYXJpYWJsZXNBbmRJbml0KG5ldyBDb25uZXhpb24oKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdXJsID0gdGhpcy5wYXJhbWV0ZXJzLmdldCgnQk9PVEVSX1VSTCcpICsgKHRoaXMucGFyYW1ldGVycy5nZXQoXCJkZWJ1Z01vZGVcIikgPyAnJmRlYnVnPXRydWUnIDogJycpO1xuICAgICAgICBpZiAodGhpcy5wYXJhbWV0ZXJzLmdldCgnU0VSVkVSX1BSRUZJWF9VUkknKSkge1xuICAgICAgICAgICAgdXJsICs9ICcmc2VydmVyX3ByZWZpeF91cmk9JyArIHRoaXMucGFyYW1ldGVycy5nZXQoJ1NFUlZFUl9QUkVGSVhfVVJJJykucmVwbGFjZSgvXFwuXFwuXFwvL2csIFwiX1VQXy9cIik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNvbm5leGlvbiA9IG5ldyBDb25uZXhpb24odXJsKTtcbiAgICAgICAgY29ubmV4aW9uLm9uQ29tcGxldGUgPSAoZnVuY3Rpb24gKHRyYW5zcG9ydCkge1xuICAgICAgICAgICAgaWYgKHRyYW5zcG9ydC5yZXNwb25zZVhNTCAmJiB0cmFuc3BvcnQucmVzcG9uc2VYTUwuZG9jdW1lbnRFbGVtZW50ICYmIHRyYW5zcG9ydC5yZXNwb25zZVhNTC5kb2N1bWVudEVsZW1lbnQubm9kZU5hbWUgPT0gXCJ0cmVlXCIpIHtcbiAgICAgICAgICAgICAgICB2YXIgYWxlcnQgPSBYTUxVdGlscy5YUGF0aFNlbGVjdFNpbmdsZU5vZGUodHJhbnNwb3J0LnJlc3BvbnNlWE1MLmRvY3VtZW50RWxlbWVudCwgXCJtZXNzYWdlXCIpO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5hbGVydCgnRXhjZXB0aW9uIGNhdWdodCBieSBhcHBsaWNhdGlvbiA6ICcgKyBhbGVydC5maXJzdENoaWxkLm5vZGVWYWx1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHBocEVycm9yO1xuICAgICAgICAgICAgdmFyIGRhdGEgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAodHJhbnNwb3J0LnJlc3BvbnNlSlNPTikge1xuICAgICAgICAgICAgICAgIGRhdGEgPSB0cmFuc3BvcnQucmVzcG9uc2VKU09OO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCEgdHlwZW9mIGRhdGEgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICBwaHBFcnJvciA9ICdFeGNlcHRpb24gdW5jYXVnaHQgYnkgYXBwbGljYXRpb24gOiAnICsgdHJhbnNwb3J0LnJlc3BvbnNlVGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwaHBFcnJvcikge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LndyaXRlKHBocEVycm9yKTtcbiAgICAgICAgICAgICAgICBpZiAocGhwRXJyb3IuaW5kZXhPZignPGI+Tm90aWNlPC9iPicpID4gLTEgfHwgcGhwRXJyb3IuaW5kZXhPZignPGI+U3RyaWN0IFN0YW5kYXJkczwvYj4nKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5hbGVydCgnUGhwIGVycm9ycyBkZXRlY3RlZCwgaXQgc2VlbXMgdGhhdCBOb3RpY2Ugb3IgU3RyaWN0IGFyZSBkZXRlY3RlZCwgeW91IG1heSBjb25zaWRlciBjaGFuZ2luZyB0aGUgUEhQIEVycm9yIFJlcG9ydGluZyBsZXZlbCEnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIGRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB0aGlzLnBhcmFtZXRlcnMuc2V0KGtleSwgZGF0YVtrZXldKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5yZWZyZXNoQ29udGV4dFZhcmlhYmxlc0FuZEluaXQoY29ubmV4aW9uKTtcbiAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgY29ubmV4aW9uLnNlbmRBc3luYygpO1xuICAgIH07XG5cbiAgICBQeWRpb0Jvb3RzdHJhcC5wcm90b3R5cGUucmVmcmVzaENvbnRleHRWYXJpYWJsZXNBbmRJbml0ID0gZnVuY3Rpb24gcmVmcmVzaENvbnRleHRWYXJpYWJsZXNBbmRJbml0KGNvbm5leGlvbikge1xuXG4gICAgICAgIENvbm5leGlvbi51cGRhdGVTZXJ2ZXJBY2Nlc3ModGhpcy5wYXJhbWV0ZXJzKTtcblxuICAgICAgICB2YXIgY3NzUmVzID0gdGhpcy5wYXJhbWV0ZXJzLmdldChcImNzc1Jlc291cmNlc1wiKTtcbiAgICAgICAgaWYgKGNzc1Jlcykge1xuICAgICAgICAgICAgY3NzUmVzLm1hcCh0aGlzLmxvYWRDU1NSZXNvdXJjZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnBhcmFtZXRlcnMuZ2V0KCdhanhwUmVzb3VyY2VzRm9sZGVyJykpIHtcbiAgICAgICAgICAgIGNvbm5leGlvbi5fbGliVXJsID0gdGhpcy5wYXJhbWV0ZXJzLmdldCgnYWp4cFJlc291cmNlc0ZvbGRlcicpICsgXCIvYnVpbGRcIjtcbiAgICAgICAgICAgIHdpbmRvdy5hanhwUmVzb3VyY2VzRm9sZGVyID0gdGhpcy5wYXJhbWV0ZXJzLmdldCgnYWp4cFJlc291cmNlc0ZvbGRlcicpICsgXCIvdGhlbWVzL1wiICsgdGhpcy5wYXJhbWV0ZXJzLmdldChcInRoZW1lXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1ldGVycy5nZXQoJ2FkZGl0aW9uYWxfanNfcmVzb3VyY2UnKSkge1xuICAgICAgICAgICAgY29ubmV4aW9uLmxvYWRMaWJyYXJ5KHRoaXMucGFyYW1ldGVycy5nZXQoJ2FkZGl0aW9uYWxfanNfcmVzb3VyY2U/dj0nICsgdGhpcy5wYXJhbWV0ZXJzLmdldChcImFqeHBWZXJzaW9uXCIpKSwgbnVsbCwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL3RoaXMuaW5zZXJ0TG9hZGVyUHJvZ3Jlc3MoKTtcbiAgICAgICAgd2luZG93Lk1lc3NhZ2VIYXNoID0gdGhpcy5wYXJhbWV0ZXJzLmdldChcImkxOG5NZXNzYWdlc1wiKTtcbiAgICAgICAgaWYgKCFPYmplY3Qua2V5cyhNZXNzYWdlSGFzaCkubGVuZ3RoKSB7XG4gICAgICAgICAgICBhbGVydCgnT291cHMsIHRoaXMgc2hvdWxkIG5vdCBoYXBwZW4sIHlvdXIgbWVzc2FnZSBmaWxlIGlzIGVtcHR5IScpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBNZXNzYWdlSGFzaCkge1xuICAgICAgICAgICAgTWVzc2FnZUhhc2hba2V5XSA9IE1lc3NhZ2VIYXNoW2tleV0ucmVwbGFjZShcIlxcXFxuXCIsIFwiXFxuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHdpbmRvdy56aXBFbmFibGVkID0gdGhpcy5wYXJhbWV0ZXJzLmdldChcInppcEVuYWJsZWRcIik7XG4gICAgICAgIHdpbmRvdy5tdWx0aXBsZUZpbGVzRG93bmxvYWRFbmFibGVkID0gdGhpcy5wYXJhbWV0ZXJzLmdldChcIm11bHRpcGxlRmlsZXNEb3dubG9hZEVuYWJsZWRcIik7XG5cbiAgICAgICAgdmFyIG1hc3RlckNsYXNzTG9hZGVkID0gKGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgdmFyIHB5ZGlvID0gbmV3IFB5ZGlvKHRoaXMucGFyYW1ldGVycyk7XG4gICAgICAgICAgICB3aW5kb3cucHlkaW8gPSBweWRpbztcblxuICAgICAgICAgICAgcHlkaW8ub2JzZXJ2ZShcImFjdGlvbnNfbG9hZGVkXCIsIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnBhcmFtZXRlcnMuZ2V0KFwiU0VMRUNUT1JfREFUQVwiKSAmJiBweWRpby5nZXRDb250cm9sbGVyKCkuYWN0aW9ucy5nZXQoXCJleHRfc2VsZWN0XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChweWRpby5nZXRDb250cm9sbGVyKCkuYWN0aW9ucy5fb2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBweWRpby5nZXRDb250cm9sbGVyKCkuYWN0aW9ucy51bnNldChcImV4dF9zZWxlY3RcIik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBweWRpby5nZXRDb250cm9sbGVyKCkuYWN0aW9uc1snZGVsZXRlJ10oXCJleHRfc2VsZWN0XCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvLmdldENvbnRyb2xsZXIoKS5maXJlQ29udGV4dENoYW5nZSgpO1xuICAgICAgICAgICAgICAgICAgICBweWRpby5nZXRDb250cm9sbGVyKCkuZmlyZVNlbGVjdGlvbkNoYW5nZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wYXJhbWV0ZXJzLmdldChcIlNFTEVDVE9SX0RBVEFcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgcHlkaW8uZ2V0Q29udHJvbGxlcigpLmRlZmF1bHRBY3Rpb25zLnNldChcImZpbGVcIiwgXCJleHRfc2VsZWN0XCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgICBweWRpby5vYnNlcnZlKFwibG9hZGVkXCIsIChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnBhcmFtZXRlcnMuZ2V0KFwiU0VMRUNUT1JfREFUQVwiKSkge1xuICAgICAgICAgICAgICAgICAgICBweWRpby5nZXRDb250cm9sbGVyKCkuZGVmYXVsdEFjdGlvbnMuc2V0KFwiZmlsZVwiLCBcImV4dF9zZWxlY3RcIik7XG4gICAgICAgICAgICAgICAgICAgIHB5ZGlvLmdldENvbnRyb2xsZXIoKS5zZWxlY3RvckRhdGEgPSB0aGlzLnBhcmFtZXRlcnMuZ2V0KFwiU0VMRUNUT1JfREFUQVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMucGFyYW1ldGVycy5nZXQoXCJjdXJyZW50TGFuZ3VhZ2VcIikpIHtcbiAgICAgICAgICAgICAgICBweWRpby5jdXJyZW50TGFuZ3VhZ2UgPSB0aGlzLnBhcmFtZXRlcnMuZ2V0KFwiY3VycmVudExhbmd1YWdlXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBweWRpby5pbml0KCk7XG4gICAgICAgIH0pLmJpbmQodGhpcyk7XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1ldGVycy5nZXQoXCJkZWJ1Z01vZGVcIikpIHtcbiAgICAgICAgICAgIG1hc3RlckNsYXNzTG9hZGVkKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25uZXhpb24ubG9hZExpYnJhcnkoXCJweWRpby5taW4uanM/dj1cIiArIHRoaXMucGFyYW1ldGVycy5nZXQoXCJhanhwVmVyc2lvblwiKSwgbWFzdGVyQ2xhc3NMb2FkZWQsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLypcbiAgICAgICAgbGV0IGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBkaXYuc2V0QXR0cmlidXRlKCdzdHlsZScsICdwb3NpdGlvbjphYnNvbHV0ZTsgYm90dG9tOiAwOyByaWdodDogMDsgei1pbmRleDogMjAwMDsgY29sb3I6cmdiYSgwLDAsMCwwLjYpOyBmb250LXNpemU6IDEycHg7IHBhZGRpbmc6IDAgMTBweDsnKTtcbiAgICAgICAgZGl2LmlubmVySFRNTCA9ICdQeWRpbyBDb21tdW5pdHkgRWRpdGlvbiAtIENvcHlyaWdodCBBYnN0cml1bSAyMDE3IC0gTGVhcm4gbW9yZSBvbiA8YSBocmVmPVwiaHR0cHM6Ly9weWRpby5jb21cIiB0YXJnZXQ9XCJfYmxhbmtcIj5weWRpby5jb208L2E+JztcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpO1xuICAgICAgICAqL1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBEZXRlY3QgdGhlIGJhc2UgcGF0aCBvZiB0aGUgamF2YXNjcmlwdHMgYmFzZWQgb24gdGhlIHNjcmlwdCB0YWdzXG4gICAgICovXG5cbiAgICBQeWRpb0Jvb3RzdHJhcC5wcm90b3R5cGUuZGV0ZWN0QmFzZVBhcmFtZXRlcnMgPSBmdW5jdGlvbiBkZXRlY3RCYXNlUGFyYW1ldGVycygpIHtcblxuICAgICAgICB2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzY3JpcHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgc2NyaXB0VGFnID0gc2NyaXB0c1tpXTtcbiAgICAgICAgICAgIGlmIChzY3JpcHRUYWcuc3JjLm1hdGNoKFwiL2J1aWxkL3B5ZGlvLmJvb3QubWluLmpzXCIpIHx8IHNjcmlwdFRhZy5zcmMubWF0Y2goXCIvYnVpbGQvYm9vdC5wcm9kLmpzXCIpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNjcmlwdFRhZy5zcmMubWF0Y2goXCIvYnVpbGQvcHlkaW8uYm9vdC5taW4uanNcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJhbWV0ZXJzLnNldChcImRlYnVnTW9kZVwiLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJhbWV0ZXJzLnNldChcImRlYnVnTW9kZVwiLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHNyYyA9IHNjcmlwdFRhZy5zcmMucmVwbGFjZSgnL2J1aWxkL2Jvb3QucHJvZC5qcycsICcnKS5yZXBsYWNlKCcvYnVpbGQvcHlkaW8uYm9vdC5taW4uanMnLCAnJyk7XG4gICAgICAgICAgICAgICAgaWYgKHNyYy5pbmRleE9mKFwiP1wiKSAhPSAtMSkgc3JjID0gc3JjLnNwbGl0KFwiP1wiKVswXTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmFtZXRlcnMuc2V0KFwiYWp4cFJlc291cmNlc0ZvbGRlclwiLCBzcmMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnBhcmFtZXRlcnMuZ2V0KFwiYWp4cFJlc291cmNlc0ZvbGRlclwiKSkge1xuICAgICAgICAgICAgd2luZG93LmFqeHBSZXNvdXJjZXNGb2xkZXIgPSB0aGlzLnBhcmFtZXRlcnMuZ2V0KFwiYWp4cFJlc291cmNlc0ZvbGRlclwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFsZXJ0KFwiQ2Fubm90IGZpbmQgcmVzb3VyY2UgZm9sZGVyXCIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBib290ZXJVcmwgPSB0aGlzLnBhcmFtZXRlcnMuZ2V0KFwiQk9PVEVSX1VSTFwiKTtcbiAgICAgICAgaWYgKGJvb3RlclVybC5pbmRleE9mKFwiP1wiKSA+IC0xKSB7XG4gICAgICAgICAgICBib290ZXJVcmwgPSBib290ZXJVcmwuc3Vic3RyaW5nKDAsIGJvb3RlclVybC5pbmRleE9mKFwiP1wiKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wYXJhbWV0ZXJzLnNldCgnYWp4cFNlcnZlckFjY2Vzc1BhdGgnLCBib290ZXJVcmwpO1xuICAgICAgICB0aGlzLnBhcmFtZXRlcnMuc2V0KCdzZXJ2ZXJBY2Nlc3NQYXRoJywgYm9vdGVyVXJsKTtcbiAgICAgICAgd2luZG93LmFqeHBTZXJ2ZXJBY2Nlc3NQYXRoID0gYm9vdGVyVXJsO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBMb2FkcyBhIENTUyBmaWxlXG4gICAgICogQHBhcmFtIGZpbGVOYW1lIFN0cmluZ1xuICAgICAqL1xuXG4gICAgUHlkaW9Cb290c3RyYXAucHJvdG90eXBlLmxvYWRDU1NSZXNvdXJjZSA9IGZ1bmN0aW9uIGxvYWRDU1NSZXNvdXJjZShmaWxlTmFtZSkge1xuICAgICAgICB2YXIgaGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF07XG4gICAgICAgIHZhciBjc3NOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xuICAgICAgICBjc3NOb2RlLnR5cGUgPSAndGV4dC9jc3MnO1xuICAgICAgICBjc3NOb2RlLnJlbCA9ICdzdHlsZXNoZWV0JztcbiAgICAgICAgY3NzTm9kZS5ocmVmID0gdGhpcy5wYXJhbWV0ZXJzLmdldChcImFqeHBSZXNvdXJjZXNGb2xkZXJcIikgKyAnLycgKyBmaWxlTmFtZTtcbiAgICAgICAgY3NzTm9kZS5tZWRpYSA9ICdzY3JlZW4nO1xuICAgICAgICBoZWFkLmFwcGVuZENoaWxkKGNzc05vZGUpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUcnkgdG8gbG9hZCBzb21ldGhpbmcgdW5kZXIgZGF0YS9jYWNoZS9cbiAgICAgKiBAcGFyYW0gb25FcnJvciBGdW5jdGlvblxuICAgICAqL1xuXG4gICAgUHlkaW9Cb290c3RyYXAudGVzdERhdGFGb2xkZXJBY2Nlc3MgPSBmdW5jdGlvbiB0ZXN0RGF0YUZvbGRlckFjY2VzcyhvbkVycm9yKSB7XG4gICAgICAgIHZhciBjID0gbmV3IENvbm5leGlvbignZGF0YS9jYWNoZS9pbmRleC5odG1sJyk7XG4gICAgICAgIGMuc2V0TWV0aG9kKCdnZXQnKTtcbiAgICAgICAgYy5vbkNvbXBsZXRlID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZiAoMjAwID09PSByZXNwb25zZS5zdGF0dXMpIHtcbiAgICAgICAgICAgICAgICBvbkVycm9yKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGMuc2VuZEFzeW5jKCk7XG4gICAgfTtcblxuICAgIHJldHVybiBQeWRpb0Jvb3RzdHJhcDtcbn0pKCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IFB5ZGlvQm9vdHN0cmFwO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF91dGlsWE1MVXRpbHMgPSByZXF1aXJlKCcuLi91dGlsL1hNTFV0aWxzJyk7XG5cbnZhciBfdXRpbFhNTFV0aWxzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3V0aWxYTUxVdGlscyk7XG5cbi8qKlxuICogUHlkaW8gZW5jYXBzdWxhdGlvbiBvZiBYSFIgLyBGZXRjaFxuICovXG5yZXF1aXJlKCd3aGF0d2ctZmV0Y2gnKTtcblxudmFyIENvbm5leGlvbiA9IChmdW5jdGlvbiAoKSB7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSBiYXNlVXJsIFN0cmluZyBUaGUgYmFzZSB1cmwgZm9yIHNlcnZpY2VzXG4gICAgICovXG5cbiAgICBmdW5jdGlvbiBDb25uZXhpb24oYmFzZVVybCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ29ubmV4aW9uKTtcblxuICAgICAgICB0aGlzLl9weWRpbyA9IHdpbmRvdy5weWRpbztcbiAgICAgICAgdGhpcy5fYmFzZVVybCA9IGJhc2VVcmwgfHwgd2luZG93LmFqeHBTZXJ2ZXJBY2Nlc3NQYXRoO1xuICAgICAgICB0aGlzLl9saWJVcmwgPSB3aW5kb3cuYWp4cFJlc291cmNlc0ZvbGRlciArICcvYnVpbGQnO1xuICAgICAgICB0aGlzLl9wYXJhbWV0ZXJzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLl9tZXRob2QgPSAncG9zdCc7XG4gICAgICAgIHRoaXMuZGlzY3JldGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBDb25uZXhpb24udXBkYXRlU2VydmVyQWNjZXNzID0gZnVuY3Rpb24gdXBkYXRlU2VydmVyQWNjZXNzKHBhcmFtZXRlcnMpIHtcblxuICAgICAgICBpZiAocGFyYW1ldGVycy5nZXQoJ1NFQ1VSRV9UT0tFTicpKSB7XG4gICAgICAgICAgICBDb25uZXhpb24uU0VDVVJFX1RPS0VOID0gcGFyYW1ldGVycy5nZXQoJ1NFQ1VSRV9UT0tFTicpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzZXJ2ZXJBY2Nlc3NQYXRoID0gcGFyYW1ldGVycy5nZXQoJ2FqeHBTZXJ2ZXJBY2Nlc3MnKS5zcGxpdCgnPycpLnNoaWZ0KCk7XG4gICAgICAgIGlmIChwYXJhbWV0ZXJzLmdldCgnU0VSVkVSX1BSRUZJWF9VUkknKSkge1xuICAgICAgICAgICAgcGFyYW1ldGVycy5zZXQoJ2FqeHBSZXNvdXJjZXNGb2xkZXInLCBwYXJhbWV0ZXJzLmdldCgnU0VSVkVSX1BSRUZJWF9VUkknKSArIHBhcmFtZXRlcnMuZ2V0KCdhanhwUmVzb3VyY2VzRm9sZGVyJykpO1xuICAgICAgICAgICAgc2VydmVyQWNjZXNzUGF0aCA9IHBhcmFtZXRlcnMuZ2V0KCdTRVJWRVJfUFJFRklYX1VSSScpICsgc2VydmVyQWNjZXNzUGF0aCArICc/JyArIChDb25uZXhpb24uU0VDVVJFX1RPS0VOID8gJ3NlY3VyZV90b2tlbj0nICsgQ29ubmV4aW9uLlNFQ1VSRV9UT0tFTiA6ICcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNlcnZlckFjY2Vzc1BhdGggPSBzZXJ2ZXJBY2Nlc3NQYXRoICsgJz8nICsgKENvbm5leGlvbi5TRUNVUkVfVE9LRU4gPyAnc2VjdXJlX3Rva2VuPScgKyBDb25uZXhpb24uU0VDVVJFX1RPS0VOIDogJycpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwYXJhbWV0ZXJzLmdldCgnU0VSVkVSX1BFUk1BTkVOVF9QQVJBTVMnKSkge1xuICAgICAgICAgICAgdmFyIHBlcm1QYXJhbXMgPSBwYXJhbWV0ZXJzLmdldCgnU0VSVkVSX1BFUk1BTkVOVF9QQVJBTVMnKTtcbiAgICAgICAgICAgIHZhciBwZXJtU3RyaW5ncyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgcGVybWFuZW50IGluIHBlcm1QYXJhbXMpIHtcbiAgICAgICAgICAgICAgICBpZiAocGVybVBhcmFtcy5oYXNPd25Qcm9wZXJ0eShwZXJtYW5lbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHBlcm1TdHJpbmdzLnB1c2gocGVybWFuZW50ICsgJz0nICsgcGVybVBhcmFtc1twZXJtYW5lbnRdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwZXJtU3RyaW5ncyA9IHBlcm1TdHJpbmdzLmpvaW4oJyYnKTtcbiAgICAgICAgICAgIGlmIChwZXJtU3RyaW5ncykge1xuICAgICAgICAgICAgICAgIHNlcnZlckFjY2Vzc1BhdGggKz0gJyYnICsgcGVybVN0cmluZ3M7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwYXJhbWV0ZXJzLnNldCgnYWp4cFNlcnZlckFjY2VzcycsIHNlcnZlckFjY2Vzc1BhdGgpO1xuICAgICAgICAvLyBCQUNLV0FSRCBDT01QQVRcbiAgICAgICAgd2luZG93LmFqeHBTZXJ2ZXJBY2Nlc3NQYXRoID0gc2VydmVyQWNjZXNzUGF0aDtcbiAgICAgICAgaWYgKHdpbmRvdy5weWRpb0Jvb3RzdHJhcCAmJiB3aW5kb3cucHlkaW9Cb290c3RyYXAucGFyYW1ldGVycykge1xuICAgICAgICAgICAgcHlkaW9Cb290c3RyYXAucGFyYW1ldGVycy5zZXQoXCJhanhwU2VydmVyQWNjZXNzXCIsIHNlcnZlckFjY2Vzc1BhdGgpO1xuICAgICAgICAgICAgcHlkaW9Cb290c3RyYXAucGFyYW1ldGVycy5zZXQoXCJTRUNVUkVfVE9LRU5cIiwgQ29ubmV4aW9uLlNFQ1VSRV9UT0tFTik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQ29ubmV4aW9uLmxvZyA9IGZ1bmN0aW9uIGxvZyhhY3Rpb24sIHN5bmNTdGF0dXMpIHtcbiAgICAgICAgaWYgKCFDb25uZXhpb24uUHlkaW9Mb2dzKSB7XG4gICAgICAgICAgICBDb25uZXhpb24uUHlkaW9Mb2dzID0gW107XG4gICAgICAgIH1cbiAgICAgICAgQ29ubmV4aW9uLlB5ZGlvTG9ncy5wdXNoKHsgYWN0aW9uOiBhY3Rpb24sIHN5bmM6IHN5bmNTdGF0dXMgfSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFkZCBhIHBhcmFtZXRlciB0byB0aGUgcXVlcnlcbiAgICAgKiBAcGFyYW0gcGFyYW1OYW1lIFN0cmluZ1xuICAgICAqIEBwYXJhbSBwYXJhbVZhbHVlIFN0cmluZ1xuICAgICAqL1xuXG4gICAgQ29ubmV4aW9uLnByb3RvdHlwZS5hZGRQYXJhbWV0ZXIgPSBmdW5jdGlvbiBhZGRQYXJhbWV0ZXIocGFyYW1OYW1lLCBwYXJhbVZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLl9wYXJhbWV0ZXJzLmdldChwYXJhbU5hbWUpICYmIHBhcmFtTmFtZS5lbmRzV2l0aCgnW10nKSkge1xuICAgICAgICAgICAgdmFyIGV4aXN0aW5nID0gdGhpcy5fcGFyYW1ldGVycy5nZXQocGFyYW1OYW1lKTtcbiAgICAgICAgICAgIGlmICghZXhpc3RpbmcgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgICAgIGV4aXN0aW5nID0gW2V4aXN0aW5nXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV4aXN0aW5nLnB1c2gocGFyYW1WYWx1ZSk7XG4gICAgICAgICAgICB0aGlzLl9wYXJhbWV0ZXJzLnNldChwYXJhbU5hbWUsIGV4aXN0aW5nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3BhcmFtZXRlcnMuc2V0KHBhcmFtTmFtZSwgcGFyYW1WYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgd2hvbGUgcGFyYW1ldGVyIGFzIGEgYnVuY2hcbiAgICAgKiBAcGFyYW0gaFBhcmFtZXRlcnMgTWFwXG4gICAgICovXG5cbiAgICBDb25uZXhpb24ucHJvdG90eXBlLnNldFBhcmFtZXRlcnMgPSBmdW5jdGlvbiBzZXRQYXJhbWV0ZXJzKGhQYXJhbWV0ZXJzKSB7XG4gICAgICAgIGlmIChoUGFyYW1ldGVycyBpbnN0YW5jZW9mIE1hcCkge1xuICAgICAgICAgICAgdGhpcy5fcGFyYW1ldGVycyA9IGhQYXJhbWV0ZXJzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGhQYXJhbWV0ZXJzLl9vYmplY3QpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdQYXNzZWQgYSBsZWdhY3kgSGFzaCBvYmplY3QgdG8gQ29ubmV4aW9uLnNldFBhcmFtZXRlcnMnKTtcbiAgICAgICAgICAgICAgICBoUGFyYW1ldGVycyA9IGhQYXJhbWV0ZXJzLl9vYmplY3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gaFBhcmFtZXRlcnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoaFBhcmFtZXRlcnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wYXJhbWV0ZXJzLnNldChrZXksIGhQYXJhbWV0ZXJzW2tleV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIHF1ZXJ5IG1ldGhvZCAoZ2V0IHBvc3QpXG4gICAgICogQHBhcmFtIG1ldGhvZCBTdHJpbmdcbiAgICAgKi9cblxuICAgIENvbm5leGlvbi5wcm90b3R5cGUuc2V0TWV0aG9kID0gZnVuY3Rpb24gc2V0TWV0aG9kKG1ldGhvZCkge1xuICAgICAgICB0aGlzLl9tZXRob2QgPSBtZXRob2Q7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFkZCB0aGUgc2VjdXJlIHRva2VuIHBhcmFtZXRlclxuICAgICAqL1xuXG4gICAgQ29ubmV4aW9uLnByb3RvdHlwZS5hZGRTZWN1cmVUb2tlbiA9IGZ1bmN0aW9uIGFkZFNlY3VyZVRva2VuKCkge1xuXG4gICAgICAgIGlmIChDb25uZXhpb24uU0VDVVJFX1RPS0VOICYmIHRoaXMuX2Jhc2VVcmwuaW5kZXhPZignc2VjdXJlX3Rva2VuJykgPT0gLTEgJiYgIXRoaXMuX3BhcmFtZXRlcnMuZ2V0KCdzZWN1cmVfdG9rZW4nKSkge1xuXG4gICAgICAgICAgICB0aGlzLmFkZFBhcmFtZXRlcignc2VjdXJlX3Rva2VuJywgQ29ubmV4aW9uLlNFQ1VSRV9UT0tFTik7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYmFzZVVybC5pbmRleE9mKCdzZWN1cmVfdG9rZW49JykgIT09IC0xKSB7XG5cbiAgICAgICAgICAgIC8vIFJlbW92ZSBmcm9tIGJhc2VVcmwgYW5kIHNldCBpbnNpZGUgcGFyYW1zXG4gICAgICAgICAgICB2YXIgcGFydHMgPSB0aGlzLl9iYXNlVXJsLnNwbGl0KCdzZWN1cmVfdG9rZW49Jyk7XG4gICAgICAgICAgICB2YXIgdG9rcyA9IHBhcnRzWzFdLnNwbGl0KCcmJyk7XG4gICAgICAgICAgICB2YXIgdG9rZW4gPSB0b2tzLnNoaWZ0KCk7XG4gICAgICAgICAgICB2YXIgcmVzdCA9IHRva3Muam9pbignJicpO1xuICAgICAgICAgICAgdGhpcy5fYmFzZVVybCA9IHBhcnRzWzBdICsgKHJlc3QgPyAnJicgKyByZXN0IDogJycpO1xuICAgICAgICAgICAgdGhpcy5fcGFyYW1ldGVycy5zZXQoJ3NlY3VyZV90b2tlbicsIHRva2VuKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBDb25uZXhpb24ucHJvdG90eXBlLmFkZFNlcnZlclBlcm1hbmVudFBhcmFtcyA9IGZ1bmN0aW9uIGFkZFNlcnZlclBlcm1hbmVudFBhcmFtcygpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9weWRpbyB8fCAhdGhpcy5fcHlkaW8uUGFyYW1ldGVycy5oYXMoJ1NFUlZFUl9QRVJNQU5FTlRfUEFSQU1TJykpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcGVybVBhcmFtcyA9IHRoaXMuX3B5ZGlvLlBhcmFtZXRlcnMuZ2V0KCdTRVJWRVJfUEVSTUFORU5UX1BBUkFNUycpO1xuICAgICAgICBmb3IgKHZhciBwZXJtYW5lbnQgaW4gcGVybVBhcmFtcykge1xuICAgICAgICAgICAgaWYgKHBlcm1QYXJhbXMuaGFzT3duUHJvcGVydHkocGVybWFuZW50KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkUGFyYW1ldGVyKHBlcm1hbmVudCwgcGVybVBhcmFtc1twZXJtYW5lbnRdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTaG93IGEgc21hbGwgbG9hZGVyXG4gICAgICovXG5cbiAgICBDb25uZXhpb24ucHJvdG90eXBlLnNob3dMb2FkZXIgPSBmdW5jdGlvbiBzaG93TG9hZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5kaXNjcmV0ZSB8fCAhdGhpcy5fcHlkaW8pIHJldHVybjtcbiAgICAgICAgdGhpcy5fcHlkaW8ubm90aWZ5KFwiY29ubmVjdGlvbi1zdGFydFwiKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSGlkZSBhIHNtYWxsIGxvYWRlclxuICAgICAqL1xuXG4gICAgQ29ubmV4aW9uLnByb3RvdHlwZS5oaWRlTG9hZGVyID0gZnVuY3Rpb24gaGlkZUxvYWRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuZGlzY3JldGUgfHwgIXRoaXMuX3B5ZGlvKSByZXR1cm47XG4gICAgICAgIHRoaXMuX3B5ZGlvLm5vdGlmeShcImNvbm5lY3Rpb24tZW5kXCIpO1xuICAgIH07XG5cbiAgICBDb25uZXhpb24ucHJvdG90eXBlLl9zZW5kID0gZnVuY3Rpb24gX3NlbmQoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgICAgdmFyIGFTeW5jID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgICBDb25uZXhpb24ubG9nKHRoaXMuX3BhcmFtZXRlcnMuZ2V0KFwiZ2V0X2FjdGlvblwiKSwgYVN5bmMgPyAnYXN5bmMnIDogJ3N5bmMnKTtcbiAgICAgICAgdGhpcy5hZGRTZWN1cmVUb2tlbigpO1xuICAgICAgICB0aGlzLmFkZFNlcnZlclBlcm1hbmVudFBhcmFtcygpO1xuICAgICAgICB0aGlzLnNob3dMb2FkZXIoKTtcbiAgICAgICAgdmFyIG9UaGlzID0gdGhpcztcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IHRoaXMuX21ldGhvZCxcbiAgICAgICAgICAgIGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nXG4gICAgICAgIH07XG4gICAgICAgIHZhciB1cmwgPSB0aGlzLl9iYXNlVXJsO1xuICAgICAgICBpZiAoIWFTeW5jKSB7XG4gICAgICAgICAgICBvcHRpb25zLnN5bmNocm9ub3VzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYm9keVBhcnRzID0gW107XG4gICAgICAgIHRoaXMuX3BhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZS5tYXAoZnVuY3Rpb24gKG9uZVYpIHtcbiAgICAgICAgICAgICAgICAgICAgYm9keVBhcnRzLnB1c2goa2V5ICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KG9uZVYpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYm9keVBhcnRzLnB1c2goa2V5ICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbHVlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgcXVlcnlTdHJpbmcgPSBib2R5UGFydHMuam9pbignJicpO1xuICAgICAgICBpZiAodGhpcy5fbWV0aG9kID09PSAncG9zdCcpIHtcbiAgICAgICAgICAgIG9wdGlvbnMuaGVhZGVycyA9IHsgXCJDb250ZW50LXR5cGVcIjogXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7IGNoYXJzZXQ9VVRGLThcIiB9O1xuICAgICAgICAgICAgb3B0aW9ucy5ib2R5ID0gcXVlcnlTdHJpbmc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1cmwgKz0gKHVybC5pbmRleE9mKCc/JykgPiAtMSA/ICcmJyA6ICc/JykgKyBxdWVyeVN0cmluZztcbiAgICAgICAgfVxuICAgICAgICB3aW5kb3cuZmV0Y2godXJsLCBvcHRpb25zKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXG4gICAgICAgICAgICB2YXIgaCA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdDb250ZW50LXR5cGUnKTtcbiAgICAgICAgICAgIGlmIChoLmluZGV4T2YoJy9qc29uJykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UuanNvbigpLnRoZW4oZnVuY3Rpb24gKGpzb24pIHtcbiAgICAgICAgICAgICAgICAgICAgb1RoaXMuYXBwbHlDb21wbGV0ZSh7IHJlc3BvbnNlSlNPTjoganNvbiB9LCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGguaW5kZXhPZignL3htbCcpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlLnRleHQoKS50aGVuKGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIG9UaGlzLmFwcGx5Q29tcGxldGUoeyByZXNwb25zZVhNTDogX3V0aWxYTUxVdGlsczJbJ2RlZmF1bHQnXS5wYXJzZVhtbCh0ZXh0KSB9LCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlLnRleHQoKS50aGVuKGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIG9UaGlzLmFwcGx5Q29tcGxldGUoeyByZXNwb25zZVRleHQ6IHRleHQgfSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGlmIChfdGhpcy5fcHlkaW8pIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5fcHlkaW8uZGlzcGxheU1lc3NhZ2UoJ0VSUk9SJywgJ05ldHdvcmsgZXJyb3IgJyArIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2VuZCBBc3luY2hyb25vdXNseVxuICAgICAqL1xuXG4gICAgQ29ubmV4aW9uLnByb3RvdHlwZS5zZW5kQXN5bmMgPSBmdW5jdGlvbiBzZW5kQXN5bmMoKSB7XG4gICAgICAgIHRoaXMuX3NlbmQodHJ1ZSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNlbmQgc3luY2hyb25vdXNseVxuICAgICAqL1xuXG4gICAgQ29ubmV4aW9uLnByb3RvdHlwZS5zZW5kU3luYyA9IGZ1bmN0aW9uIHNlbmRTeW5jKCkge1xuICAgICAgICB0aGlzLl9zZW5kKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQXBwbHkgdGhlIGNvbXBsZXRlIGNhbGxiYWNrLCB0cnkgdG8gZ3JhYiBtYXhpbXVtIG9mIGVycm9yc1xuICAgICAqIEBwYXJhbSBwYXJzZWRCb2R5IFRyYW5zcG90XG4gICAgICovXG5cbiAgICBDb25uZXhpb24ucHJvdG90eXBlLmFwcGx5Q29tcGxldGUgPSBmdW5jdGlvbiBhcHBseUNvbXBsZXRlKHBhcnNlZEJvZHksIHJlc3BvbnNlKSB7XG4gICAgICAgIHRoaXMuaGlkZUxvYWRlcigpO1xuICAgICAgICB2YXIgcHlkaW8gPSB0aGlzLl9weWRpbztcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSB1bmRlZmluZWQsXG4gICAgICAgICAgICB0b2tlbk1lc3NhZ2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIHZhciB0b2sxID0gXCJPb29wcywgaXQgc2VlbXMgdGhhdCB5b3VyIHNlY3VyaXR5IHRva2VuIGhhcyBleHBpcmVkISBQbGVhc2UgJXMgYnkgaGl0dGluZyByZWZyZXNoIG9yIEY1IGluIHlvdXIgYnJvd3NlciFcIjtcbiAgICAgICAgdmFyIHRvazIgPSBcInJlbG9hZCB0aGUgcGFnZVwiO1xuICAgICAgICBpZiAod2luZG93Lk1lc3NhZ2VIYXNoICYmIHdpbmRvdy5NZXNzYWdlSGFzaFs0MzddKSB7XG4gICAgICAgICAgICB0b2sxID0gd2luZG93Lk1lc3NhZ2VIYXNoWzQzN107XG4gICAgICAgICAgICB0b2syID0gd2luZG93Lk1lc3NhZ2VIYXNoWzQzOF07XG4gICAgICAgIH1cbiAgICAgICAgdG9rZW5NZXNzYWdlID0gdG9rMS5yZXBsYWNlKFwiJXNcIiwgXCI8YSBocmVmPSdqYXZhc2NyaXB0OmRvY3VtZW50LmxvY2F0aW9uLnJlbG9hZCgpJyBzdHlsZT0ndGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmU7Jz5cIiArIHRvazIgKyBcIjwvYT5cIik7XG5cbiAgICAgICAgdmFyIGN0eXBlID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ0NvbnRlbnQtdHlwZScpO1xuICAgICAgICBpZiAocGFyc2VkQm9keS5yZXNwb25zZVhNTCAmJiBwYXJzZWRCb2R5LnJlc3BvbnNlWE1MLmRvY3VtZW50RWxlbWVudCAmJiBwYXJzZWRCb2R5LnJlc3BvbnNlWE1MLmRvY3VtZW50RWxlbWVudC5ub2RlTmFtZSA9PSBcInBhcnNlcmVycm9yXCIpIHtcblxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiUGFyc2luZyBlcnJvciA6IFxcblwiICsgcGFyc2VkQm9keS5yZXNwb25zZVhNTC5kb2N1bWVudEVsZW1lbnQuZmlyc3RDaGlsZC50ZXh0Q29udGVudDtcbiAgICAgICAgfSBlbHNlIGlmIChwYXJzZWRCb2R5LnJlc3BvbnNlWE1MICYmIHBhcnNlZEJvZHkucmVzcG9uc2VYTUwucGFyc2VFcnJvciAmJiBwYXJzZWRCb2R5LnJlc3BvbnNlWE1MLnBhcnNlRXJyb3IuZXJyb3JDb2RlICE9IDApIHtcblxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiUGFyc2luZyBFcnJvciA6IFxcblwiICsgcGFyc2VkQm9keS5yZXNwb25zZVhNTC5wYXJzZUVycm9yLnJlYXNvbjtcbiAgICAgICAgfSBlbHNlIGlmIChjdHlwZS5pbmRleE9mKFwidGV4dC94bWxcIikgPiAtMSAmJiBwYXJzZWRCb2R5LnJlc3BvbnNlWE1MID09IG51bGwpIHtcblxuICAgICAgICAgICAgbWVzc2FnZSA9IFwiRXhwZWN0ZWQgWE1MIGJ1dCBnb3QgZW1wdHkgcmVzcG9uc2UhXCI7XG4gICAgICAgIH0gZWxzZSBpZiAoY3R5cGUuaW5kZXhPZihcInRleHQveG1sXCIpID09IC0xICYmIGN0eXBlLmluZGV4T2YoXCJhcHBsaWNhdGlvbi9qc29uXCIpID09IC0xICYmIHBhcnNlZEJvZHkucmVzcG9uc2VUZXh0LmluZGV4T2YoXCI8Yj5GYXRhbCBlcnJvcjwvYj5cIikgPiAtMSkge1xuXG4gICAgICAgICAgICBtZXNzYWdlID0gcGFyc2VkQm9keS5yZXNwb25zZVRleHQucmVwbGFjZShcIjxiciAvPlwiLCBcIlwiKTtcbiAgICAgICAgfSBlbHNlIGlmIChyZXNwb25zZS5zdGF0dXMgPT0gNTAwKSB7XG5cbiAgICAgICAgICAgIG1lc3NhZ2UgPSBcIkludGVybmFsIFNlcnZlciBFcnJvcjogeW91IHNob3VsZCBjaGVjayB5b3VyIHdlYiBzZXJ2ZXIgbG9ncyB0byBmaW5kIHdoYXQncyBnb2luZyB3cm9uZyFcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWVzc2FnZSkge1xuXG4gICAgICAgICAgICBpZiAobWVzc2FnZS5zdGFydHNXaXRoKFwiWW91IGFyZSBub3QgYWxsb3dlZCB0byBhY2Nlc3MgdGhpcyByZXNvdXJjZS5cIikpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gdG9rZW5NZXNzYWdlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHB5ZGlvKSB7XG4gICAgICAgICAgICAgICAgcHlkaW8uZGlzcGxheU1lc3NhZ2UoXCJFUlJPUlwiLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYWxlcnQobWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcnNlZEJvZHkucmVzcG9uc2VYTUwgJiYgcGFyc2VkQm9keS5yZXNwb25zZVhNTC5kb2N1bWVudEVsZW1lbnQpIHtcblxuICAgICAgICAgICAgdmFyIGF1dGhOb2RlID0gX3V0aWxYTUxVdGlsczJbJ2RlZmF1bHQnXS5YUGF0aFNlbGVjdFNpbmdsZU5vZGUocGFyc2VkQm9keS5yZXNwb25zZVhNTC5kb2N1bWVudEVsZW1lbnQsIFwicmVxdWlyZV9hdXRoXCIpO1xuICAgICAgICAgICAgaWYgKGF1dGhOb2RlICYmIHB5ZGlvKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJvb3QgPSBweWRpby5nZXRDb250ZXh0SG9sZGVyKCkuZ2V0Um9vdE5vZGUoKTtcbiAgICAgICAgICAgICAgICBpZiAocm9vdCkge1xuICAgICAgICAgICAgICAgICAgICBweWRpby5nZXRDb250ZXh0SG9sZGVyKCkuc2V0Q29udGV4dE5vZGUocm9vdCk7XG4gICAgICAgICAgICAgICAgICAgIHJvb3QuY2xlYXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcHlkaW8uZ2V0Q29udHJvbGxlcigpLmZpcmVBY3Rpb24oJ2xvZ291dCcpO1xuICAgICAgICAgICAgICAgIHB5ZGlvLmdldENvbnRyb2xsZXIoKS5maXJlQWN0aW9uKCdsb2dpbicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbWVzc2FnZU5vZGUgPSBfdXRpbFhNTFV0aWxzMlsnZGVmYXVsdCddLlhQYXRoU2VsZWN0U2luZ2xlTm9kZShwYXJzZWRCb2R5LnJlc3BvbnNlWE1MLmRvY3VtZW50RWxlbWVudCwgXCJtZXNzYWdlXCIpO1xuICAgICAgICAgICAgaWYgKG1lc3NhZ2VOb2RlKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2VUeXBlID0gbWVzc2FnZU5vZGUuZ2V0QXR0cmlidXRlKFwidHlwZVwiKS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlQ29udGVudCA9IF91dGlsWE1MVXRpbHMyWydkZWZhdWx0J10uZ2V0RG9tTm9kZVRleHQobWVzc2FnZU5vZGUpO1xuICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlQ29udGVudC5zdGFydHNXaXRoKFwiWW91IGFyZSBub3QgYWxsb3dlZCB0byBhY2Nlc3MgdGhpcyByZXNvdXJjZS5cIikpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZUNvbnRlbnQgPSB0b2tlbk1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChweWRpbykge1xuICAgICAgICAgICAgICAgICAgICBweWRpby5kaXNwbGF5TWVzc2FnZShtZXNzYWdlVHlwZSwgbWVzc2FnZUNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlVHlwZSA9PSBcIkVSUk9SXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KG1lc3NhZ2VUeXBlICsgXCI6XCIgKyBtZXNzYWdlQ29udGVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2VUeXBlID09IFwiU1VDQ0VTU1wiKSBtZXNzYWdlTm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG1lc3NhZ2VOb2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vbkNvbXBsZXRlKSB7XG5cbiAgICAgICAgICAgIHBhcnNlZEJvZHkuc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzO1xuICAgICAgICAgICAgcGFyc2VkQm9keS5yZXNwb25zZU9iamVjdCA9IHJlc3BvbnNlO1xuICAgICAgICAgICAgdGhpcy5vbkNvbXBsZXRlKHBhcnNlZEJvZHkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChweWRpbykge1xuICAgICAgICAgICAgcHlkaW8uZmlyZShcInNlcnZlcl9hbnN3ZXJcIiwgdGhpcyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQ29ubmV4aW9uLnByb3RvdHlwZS51cGxvYWRGaWxlID0gZnVuY3Rpb24gdXBsb2FkRmlsZShmaWxlLCBmaWxlUGFyYW1ldGVyTmFtZSwgdXBsb2FkVXJsLCBvbkNvbXBsZXRlLCBvbkVycm9yLCBvblByb2dyZXNzLCB4aHJTZXR0aW5ncykge1xuXG4gICAgICAgIGlmICh4aHJTZXR0aW5ncyA9PT0gdW5kZWZpbmVkKSB4aHJTZXR0aW5ncyA9IHt9O1xuXG4gICAgICAgIGlmICghb25Db21wbGV0ZSkgb25Db21wbGV0ZSA9IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICBpZiAoIW9uRXJyb3IpIG9uRXJyb3IgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICAgICAgaWYgKCFvblByb2dyZXNzKSBvblByb2dyZXNzID0gZnVuY3Rpb24gKCkge307XG4gICAgICAgIHZhciB4aHIgPSB0aGlzLmluaXRpYWxpemVYSFJGb3JVcGxvYWQodXBsb2FkVXJsLCBvbkNvbXBsZXRlLCBvbkVycm9yLCBvblByb2dyZXNzLCB4aHJTZXR0aW5ncyk7XG4gICAgICAgIGlmICh4aHJTZXR0aW5ncyAmJiB4aHJTZXR0aW5ncy5tZXRob2QgPT09ICdQVVQnKSB7XG4gICAgICAgICAgICB4aHIuc2VuZChmaWxlKTtcbiAgICAgICAgICAgIHJldHVybiB4aHI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHdpbmRvdy5Gb3JtRGF0YSkge1xuICAgICAgICAgICAgdGhpcy5zZW5kRmlsZVVzaW5nRm9ybURhdGEoeGhyLCBmaWxlLCBmaWxlUGFyYW1ldGVyTmFtZSk7XG4gICAgICAgIH0gZWxzZSBpZiAod2luZG93LkZpbGVSZWFkZXIpIHtcbiAgICAgICAgICAgIHZhciBmaWxlUmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgICAgIGZpbGVSZWFkZXIub25sb2FkID0gKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy54aHJTZW5kQXNCaW5hcnkoeGhyLCBmaWxlLm5hbWUsIGUudGFyZ2V0LnJlc3VsdCwgZmlsZVBhcmFtZXRlck5hbWUpO1xuICAgICAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgICAgIGZpbGVSZWFkZXIucmVhZEFzQmluYXJ5U3RyaW5nKGZpbGUpO1xuICAgICAgICB9IGVsc2UgaWYgKGZpbGUuZ2V0QXNCaW5hcnkpIHtcbiAgICAgICAgICAgIHRoaXMueGhyU2VuZEFzQmluYXJ5KHhociwgZmlsZS5uYW1lLCBmaWxlLmdldEFzQmluYXJ5KCksIGZpbGVQYXJhbWV0ZXJOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geGhyO1xuICAgIH07XG5cbiAgICBDb25uZXhpb24ucHJvdG90eXBlLmluaXRpYWxpemVYSFJGb3JVcGxvYWQgPSBmdW5jdGlvbiBpbml0aWFsaXplWEhSRm9yVXBsb2FkKHVybCwgb25Db21wbGV0ZSwgb25FcnJvciwgb25Qcm9ncmVzcywgeGhyU2V0dGluZ3MpIHtcblxuICAgICAgICBpZiAoeGhyU2V0dGluZ3MgPT09IHVuZGVmaW5lZCkgeGhyU2V0dGluZ3MgPSB7fTtcblxuICAgICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIHZhciB1cGxvYWQgPSB4aHIudXBsb2FkO1xuICAgICAgICBpZiAoeGhyU2V0dGluZ3Mud2l0aENyZWRlbnRpYWxzKSB7XG4gICAgICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICB1cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcihcInByb2dyZXNzXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBpZiAoIWUubGVuZ3RoQ29tcHV0YWJsZSkgcmV0dXJuO1xuICAgICAgICAgICAgb25Qcm9ncmVzcyhlKTtcbiAgICAgICAgfSwgZmFsc2UpO1xuICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PSA0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICBvbkNvbXBsZXRlKHhocik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcih4aHIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgdXBsb2FkLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBvbkVycm9yKHhocik7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBtZXRob2QgPSAnUE9TVCc7XG4gICAgICAgIGlmICh4aHJTZXR0aW5ncy5tZXRob2QpIHtcbiAgICAgICAgICAgIG1ldGhvZCA9IHhoclNldHRpbmdzLm1ldGhvZDtcbiAgICAgICAgfVxuICAgICAgICB4aHIub3BlbihtZXRob2QsIHVybCwgdHJ1ZSk7XG4gICAgICAgIGlmICh4aHJTZXR0aW5ncy5jdXN0b21IZWFkZXJzKSB7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyh4aHJTZXR0aW5ncy5jdXN0b21IZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uIChrKSB7XG4gICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoaywgeGhyU2V0dGluZ3MuY3VzdG9tSGVhZGVyc1trXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB4aHI7XG4gICAgfTtcblxuICAgIENvbm5leGlvbi5wcm90b3R5cGUuc2VuZEZpbGVVc2luZ0Zvcm1EYXRhID0gZnVuY3Rpb24gc2VuZEZpbGVVc2luZ0Zvcm1EYXRhKHhociwgZmlsZSwgZmlsZVBhcmFtZXRlck5hbWUpIHtcbiAgICAgICAgdmFyIGZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZChmaWxlUGFyYW1ldGVyTmFtZSwgZmlsZSk7XG4gICAgICAgIHhoci5zZW5kKGZvcm1EYXRhKTtcbiAgICB9O1xuXG4gICAgQ29ubmV4aW9uLnByb3RvdHlwZS54aHJTZW5kQXNCaW5hcnkgPSBmdW5jdGlvbiB4aHJTZW5kQXNCaW5hcnkoeGhyLCBmaWxlTmFtZSwgZmlsZURhdGEsIGZpbGVQYXJhbWV0ZXJOYW1lKSB7XG4gICAgICAgIHZhciBib3VuZGFyeSA9ICctLS0tTXVsdGlQYXJ0Rm9ybUJvdW5kYXJ5JyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcIm11bHRpcGFydC9mb3JtLWRhdGEsIGJvdW5kYXJ5PVwiICsgYm91bmRhcnkpO1xuXG4gICAgICAgIHZhciBib2R5ID0gXCItLVwiICsgYm91bmRhcnkgKyBcIlxcclxcblwiO1xuICAgICAgICBib2R5ICs9IFwiQ29udGVudC1EaXNwb3NpdGlvbjogZm9ybS1kYXRhOyBuYW1lPSdcIiArIGZpbGVQYXJhbWV0ZXJOYW1lICsgXCInOyBmaWxlbmFtZT0nXCIgKyB1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoZmlsZU5hbWUpKSArIFwiJ1xcclxcblwiO1xuICAgICAgICBib2R5ICs9IFwiQ29udGVudC1UeXBlOiBhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW1cXHJcXG5cXHJcXG5cIjtcbiAgICAgICAgYm9keSArPSBmaWxlRGF0YSArIFwiXFxyXFxuXCI7XG4gICAgICAgIGJvZHkgKz0gXCItLVwiICsgYm91bmRhcnkgKyBcIi0tXFxyXFxuXCI7XG5cbiAgICAgICAgeGhyLnNlbmRBc0JpbmFyeShib2R5KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTG9hZCBhIGphdmFzY3JpcHQgbGlicmFyeVxuICAgICAqIEBwYXJhbSBmaWxlTmFtZSBTdHJpbmdcbiAgICAgKiBAcGFyYW0gb25Mb2FkZWRDb2RlIEZ1bmN0aW9uIENhbGxiYWNrXG4gICAgICAgICogQHBhcmFtIGFTeW5jIEJvb2xlYW4gbG9hZCBsaWJyYXJ5IGFzeW5jaHJvbmVvdXNseVxuICAgICAqL1xuXG4gICAgQ29ubmV4aW9uLnByb3RvdHlwZS5sb2FkTGlicmFyeSA9IGZ1bmN0aW9uIGxvYWRMaWJyYXJ5KGZpbGVOYW1lLCBvbkxvYWRlZENvZGUsIGFTeW5jKSB7XG4gICAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICAgIGlmICh3aW5kb3cucHlkaW9Cb290c3RyYXAgJiYgd2luZG93LnB5ZGlvQm9vdHN0cmFwLnBhcmFtZXRlcnMuZ2V0KFwiYWp4cFZlcnNpb25cIikgJiYgZmlsZU5hbWUuaW5kZXhPZihcIj9cIikgPT0gLTEpIHtcbiAgICAgICAgICAgIGZpbGVOYW1lICs9IFwiP3Y9XCIgKyB3aW5kb3cucHlkaW9Cb290c3RyYXAucGFyYW1ldGVycy5nZXQoXCJhanhwVmVyc2lvblwiKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdXJsID0gdGhpcy5fbGliVXJsID8gdGhpcy5fbGliVXJsICsgJy8nICsgZmlsZU5hbWUgOiBmaWxlTmFtZTtcbiAgICAgICAgdmFyIHB5ZGlvID0gdGhpcy5fcHlkaW87XG5cbiAgICAgICAgdmFyIHNjcmlwdExvYWRlZCA9IGZ1bmN0aW9uIHNjcmlwdExvYWRlZChzY3JpcHQpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5leGVjU2NyaXB0KSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5leGVjU2NyaXB0KHNjcmlwdCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lm15X2NvZGUgPSBzY3JpcHQ7XG4gICAgICAgICAgICAgICAgICAgIHZhciBoZWFkID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNjcmlwdF90YWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgICAgICAgICAgICAgICAgc2NyaXB0X3RhZy50eXBlID0gJ3RleHQvamF2YXNjcmlwdCc7XG4gICAgICAgICAgICAgICAgICAgIHNjcmlwdF90YWcuaW5uZXJIVE1MID0gJ2V2YWwod2luZG93Lm15X2NvZGUpJztcbiAgICAgICAgICAgICAgICAgICAgaGVhZC5hcHBlbmRDaGlsZChzY3JpcHRfdGFnKTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHdpbmRvdy5teV9jb2RlO1xuICAgICAgICAgICAgICAgICAgICBoZWFkLnJlbW92ZUNoaWxkKHNjcmlwdF90YWcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob25Mb2FkZWRDb2RlICE9IG51bGwpIG9uTG9hZGVkQ29kZSgpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGFsZXJ0KCdlcnJvciBsb2FkaW5nICcgKyBmaWxlTmFtZSArICc6JyArIGUubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbnNvbGUpIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocHlkaW8pIHB5ZGlvLmZpcmUoXCJzZXJ2ZXJfYW5zd2VyXCIpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChhU3luYykge1xuICAgICAgICAgICAgd2luZG93LmZldGNoKHVybCwge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgICAgY3JlZGVudGlhbHM6ICdzYW1lLW9yaWdpbidcbiAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcbiAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHNjcmlwdCkge1xuICAgICAgICAgICAgICAgIHNjcmlwdExvYWRlZChzY3JpcHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIC8vIFNIT1VMRCBCRSBSRU1PVkVEISFcbiAgICAgICAgICAgICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NyaXB0TG9hZGVkKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGVydCgnZXJyb3IgbG9hZGluZyAnICsgZmlsZU5hbWUgKyAnOiBTdGF0dXMgY29kZSB3YXMgJyArIHhoci5zdGF0dXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkuYmluZChfdGhpczIpO1xuICAgICAgICAgICAgICAgIHhoci5vcGVuKFwiR0VUXCIsIHVybCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIHhoci5zZW5kKCk7XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBDb25uZXhpb247XG59KSgpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBDb25uZXhpb247XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbS8+LlxuICpcbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG52YXIgX3dpY2tlZEdvb2RYcGF0aCA9IHJlcXVpcmUoJ3dpY2tlZC1nb29kLXhwYXRoJyk7XG5cbnZhciBfd2lja2VkR29vZFhwYXRoMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3dpY2tlZEdvb2RYcGF0aCk7XG5cbl93aWNrZWRHb29kWHBhdGgyWydkZWZhdWx0J10uaW5zdGFsbCgpO1xuLyoqXG4gKiBVdGlsaXRhcnkgY2xhc3MgZm9yIG1hbmlwdWxhdGluZyBYTUxcbiAqL1xuXG52YXIgWE1MVXRpbHMgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFhNTFV0aWxzKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgWE1MVXRpbHMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbGVjdHMgdGhlIGZpcnN0IFhtbE5vZGUgdGhhdCBtYXRjaGVzIHRoZSBYUGF0aCBleHByZXNzaW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnQge0VsZW1lbnQgfCBEb2N1bWVudH0gcm9vdCBlbGVtZW50IGZvciB0aGUgc2VhcmNoXG4gICAgICogQHBhcmFtIHF1ZXJ5IHtTdHJpbmd9IFhQYXRoIHF1ZXJ5XG4gICAgICogQHJldHVybiB7RWxlbWVudH0gZmlyc3QgbWF0Y2hpbmcgZWxlbWVudFxuICAgICAqIEBzaWduYXR1cmUgZnVuY3Rpb24oZWxlbWVudCwgcXVlcnkpXG4gICAgICovXG5cbiAgICBYTUxVdGlscy5YUGF0aFNlbGVjdFNpbmdsZU5vZGUgPSBmdW5jdGlvbiBYUGF0aFNlbGVjdFNpbmdsZU5vZGUoZWxlbWVudCwgcXVlcnkpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50WydzZWxlY3RTaW5nbGVOb2RlJ10gJiYgdHlwZW9mIGVsZW1lbnQuc2VsZWN0U2luZ2xlTm9kZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlcyA9IGVsZW1lbnQuc2VsZWN0U2luZ2xlTm9kZShxdWVyeSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlcykgcmV0dXJuIHJlcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge31cblxuICAgICAgICBpZiAoIVhNTFV0aWxzLl9feHBlICYmIHdpbmRvdy5YUGF0aEV2YWx1YXRvcikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBYTUxVdGlscy5fX3hwZSA9IG5ldyBYUGF0aEV2YWx1YXRvcigpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghWE1MVXRpbHMuX194cGUpIHtcbiAgICAgICAgICAgIHF1ZXJ5ID0gZG9jdW1lbnQuY3JlYXRlRXhwcmVzc2lvbihxdWVyeSwgbnVsbCk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gcXVlcnkuZXZhbHVhdGUoZWxlbWVudCwgNywgbnVsbCk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnNuYXBzaG90TGVuZ3RoID8gcmVzdWx0LnNuYXBzaG90SXRlbSgwKSA6IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgeHBlID0gWE1MVXRpbHMuX194cGU7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiB4cGUuZXZhbHVhdGUocXVlcnksIGVsZW1lbnQsIHhwZS5jcmVhdGVOU1Jlc29sdmVyKGVsZW1lbnQpLCBYUGF0aFJlc3VsdC5GSVJTVF9PUkRFUkVEX05PREVfVFlQRSwgbnVsbCkuc2luZ2xlTm9kZVZhbHVlO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInNlbGVjdFNpbmdsZU5vZGU6IHF1ZXJ5OiBcIiArIHF1ZXJ5ICsgXCIsIGVsZW1lbnQ6IFwiICsgZWxlbWVudCArIFwiLCBlcnJvcjogXCIgKyBlcnIpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNlbGVjdHMgYSBsaXN0IG9mIG5vZGVzIG1hdGNoaW5nIHRoZSBYUGF0aCBleHByZXNzaW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIGVsZW1lbnQge0VsZW1lbnQgfCBEb2N1bWVudH0gcm9vdCBlbGVtZW50IGZvciB0aGUgc2VhcmNoXG4gICAgICogQHBhcmFtIHF1ZXJ5IHtTdHJpbmd9IFhQYXRoIHF1ZXJ5XG4gICAgICogQHJldHVybiB7RWxlbWVudFtdfSBMaXN0IG9mIG1hdGNoaW5nIGVsZW1lbnRzXG4gICAgICogQHNpZ25hdHVyZSBmdW5jdGlvbihlbGVtZW50LCBxdWVyeSlcbiAgICAgKi9cblxuICAgIFhNTFV0aWxzLlhQYXRoU2VsZWN0Tm9kZXMgPSBmdW5jdGlvbiBYUGF0aFNlbGVjdE5vZGVzKGVsZW1lbnQsIHF1ZXJ5KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGVsZW1lbnQuc2VsZWN0Tm9kZXMgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50Lm93bmVyRG9jdW1lbnQgJiYgZWxlbWVudC5vd25lckRvY3VtZW50LnNldFByb3BlcnR5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lm93bmVyRG9jdW1lbnQuc2V0UHJvcGVydHkoXCJTZWxlY3Rpb25MYW5ndWFnZVwiLCBcIlhQYXRoXCIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVsZW1lbnQuc2V0UHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuc2V0UHJvcGVydHkoXCJTZWxlY3Rpb25MYW5ndWFnZVwiLCBcIlhQYXRoXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgICAgICAgICB2YXIgcmVzID0gQXJyYXkuZnJvbShlbGVtZW50LnNlbGVjdE5vZGVzKHF1ZXJ5KSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlcykgcmV0dXJuIHJlcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge31cblxuICAgICAgICB2YXIgeHBlID0gWE1MVXRpbHMuX194cGU7XG5cbiAgICAgICAgaWYgKCF4cGUgJiYgd2luZG93LlhQYXRoRXZhbHVhdG9yKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIFhNTFV0aWxzLl9feHBlID0geHBlID0gbmV3IFhQYXRoRXZhbHVhdG9yKCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICB9XG4gICAgICAgIHZhciByZXN1bHQsXG4gICAgICAgICAgICBub2RlcyA9IFtdLFxuICAgICAgICAgICAgaTtcbiAgICAgICAgaWYgKCFYTUxVdGlscy5fX3hwZSkge1xuICAgICAgICAgICAgcXVlcnkgPSBkb2N1bWVudC5jcmVhdGVFeHByZXNzaW9uKHF1ZXJ5LCBudWxsKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHF1ZXJ5LmV2YWx1YXRlKGVsZW1lbnQsIDcsIG51bGwpO1xuICAgICAgICAgICAgbm9kZXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCByZXN1bHQuc25hcHNob3RMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChFbGVtZW50LmV4dGVuZCkge1xuICAgICAgICAgICAgICAgICAgICBub2Rlc1tpXSA9IEVsZW1lbnQuZXh0ZW5kKHJlc3VsdC5zbmFwc2hvdEl0ZW0oaSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzW2ldID0gcmVzdWx0LnNuYXBzaG90SXRlbShpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbm9kZXM7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmVzdWx0ID0geHBlLmV2YWx1YXRlKHF1ZXJ5LCBlbGVtZW50LCB4cGUuY3JlYXRlTlNSZXNvbHZlcihlbGVtZW50KSwgWFBhdGhSZXN1bHQuT1JERVJFRF9OT0RFX1NOQVBTSE9UX1RZUEUsIG51bGwpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInNlbGVjdE5vZGVzOiBxdWVyeTogXCIgKyBxdWVyeSArIFwiLCBlbGVtZW50OiBcIiArIGVsZW1lbnQgKyBcIiwgZXJyb3I6IFwiICsgZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCByZXN1bHQuc25hcHNob3RMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbm9kZXNbaV0gPSByZXN1bHQuc25hcHNob3RJdGVtKGkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5vZGVzO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZWxlY3RzIHRoZSBmaXJzdCBYbWxOb2RlIHRoYXQgbWF0Y2hlcyB0aGUgWFBhdGggZXhwcmVzc2lvbiBhbmQgcmV0dXJucyB0aGUgdGV4dCBjb250ZW50IG9mIHRoZSBlbGVtZW50XG4gICAgICpcbiAgICAgKiBAcGFyYW0gZWxlbWVudCB7RWxlbWVudHxEb2N1bWVudH0gcm9vdCBlbGVtZW50IGZvciB0aGUgc2VhcmNoXG4gICAgICogQHBhcmFtIHF1ZXJ5IHtTdHJpbmd9ICBYUGF0aCBxdWVyeVxuICAgICAqIEByZXR1cm4ge1N0cmluZ30gdGhlIGpvaW5lZCB0ZXh0IGNvbnRlbnQgb2YgdGhlIGZvdW5kIGVsZW1lbnQgb3IgbnVsbCBpZiBub3QgYXBwcm9wcmlhdGUuXG4gICAgICogQHNpZ25hdHVyZSBmdW5jdGlvbihlbGVtZW50LCBxdWVyeSlcbiAgICAgKi9cblxuICAgIFhNTFV0aWxzLlhQYXRoR2V0U2luZ2xlTm9kZVRleHQgPSBmdW5jdGlvbiBYUGF0aEdldFNpbmdsZU5vZGVUZXh0KGVsZW1lbnQsIHF1ZXJ5KSB7XG4gICAgICAgIHZhciBub2RlID0gWE1MVXRpbHMuWFBhdGhTZWxlY3RTaW5nbGVOb2RlKGVsZW1lbnQsIHF1ZXJ5KTtcbiAgICAgICAgcmV0dXJuIFhNTFV0aWxzLmdldERvbU5vZGVUZXh0KG5vZGUpO1xuICAgIH07XG5cbiAgICBYTUxVdGlscy5nZXREb21Ob2RlVGV4dCA9IGZ1bmN0aW9uIGdldERvbU5vZGVUZXh0KG5vZGUpIHtcbiAgICAgICAgdmFyIGluY2x1ZGVDRGF0YSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogYXJndW1lbnRzWzFdO1xuXG4gICAgICAgIGlmICghbm9kZSB8fCAhbm9kZS5ub2RlVHlwZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBzd2l0Y2ggKG5vZGUubm9kZVR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAvLyBOT0RFX0VMRU1FTlRcbiAgICAgICAgICAgICAgICB2YXIgaSxcbiAgICAgICAgICAgICAgICAgICAgYSA9IFtdLFxuICAgICAgICAgICAgICAgICAgICBub2RlcyA9IG5vZGUuY2hpbGROb2RlcyxcbiAgICAgICAgICAgICAgICAgICAgbGVuZ3RoID0gbm9kZXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBhW2ldID0gWE1MVXRpbHMuZ2V0RG9tTm9kZVRleHQobm9kZXNbaV0sIGluY2x1ZGVDRGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGEuam9pbihcIlwiKTtcblxuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIC8vIE5PREVfQVRUUklCVVRFXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUudmFsdWU7XG5cbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAvLyBOT0RFX1RFWFRcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZS5ub2RlVmFsdWU7XG5cbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAvLyBDREFUQVxuICAgICAgICAgICAgICAgIGlmIChpbmNsdWRlQ0RhdGEpIHJldHVybiBub2RlLm5vZGVWYWx1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0geG1sU3RyXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG5cbiAgICBYTUxVdGlscy5wYXJzZVhtbCA9IGZ1bmN0aW9uIHBhcnNlWG1sKHhtbFN0cikge1xuXG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93LkRPTVBhcnNlciAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IHdpbmRvdy5ET01QYXJzZXIoKS5wYXJzZUZyb21TdHJpbmcoeG1sU3RyLCBcInRleHQveG1sXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2Ygd2luZG93LkFjdGl2ZVhPYmplY3QgIT0gXCJ1bmRlZmluZWRcIiAmJiBuZXcgd2luZG93LkFjdGl2ZVhPYmplY3QoXCJNU1hNTDIuRE9NRG9jdW1lbnQuNi4wXCIpKSB7XG4gICAgICAgICAgICB2YXIgeG1sRG9jID0gbmV3IHdpbmRvdy5BY3RpdmVYT2JqZWN0KFwiTVNYTUwyLkRPTURvY3VtZW50LjYuMFwiKTtcbiAgICAgICAgICAgIHhtbERvYy52YWxpZGF0ZU9uUGFyc2UgPSBmYWxzZTtcbiAgICAgICAgICAgIHhtbERvYy5hc3luYyA9IGZhbHNlO1xuICAgICAgICAgICAgeG1sRG9jLmxvYWRYTUwoeG1sU3RyKTtcbiAgICAgICAgICAgIHhtbERvYy5zZXRQcm9wZXJ0eSgnU2VsZWN0aW9uTGFuZ3VhZ2UnLCAnWFBhdGgnKTtcbiAgICAgICAgICAgIHJldHVybiB4bWxEb2M7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgcGFyc2UgWE1MIHN0cmluZycpO1xuICAgIH07XG5cbiAgICByZXR1cm4gWE1MVXRpbHM7XG59KSgpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBYTUxVdGlscztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIl19