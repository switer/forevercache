'use strict';

var DEFAULT_MAX_AGE = 5 * 1000 // 3s
var DEFAULT_STALE_PERCENt = 
function Cache() {
    this._caches = {}
    this._settings = {
        max: 1000, // Number
        maxAge: DEFAULT_MAX_AGE, // Number/ms
        stalePercent: 0.4 // how many the percentage of caches nead to remove in batch 
    }
}

var proto = Cache.prototype
proto.setting = function(st) {
    _merge(this._settings, st)
    return this
}
proto.set = function(key, value, maxAge) {
    if (Object.keys(this._caches).length >= this._settings.max) {
        this.removeExpired()
    }
    this._caches[key] = {
        data: value
        expire: maxAge == 0 ? 0 : ((maxAge || DEFAULT_MAX_AGE) + new Date)
    }
}
proto.get = function(key) {
    var data = this._caches[key]
    if (!data) return undefined
    var expire = data.expire
    return {
        data: _immutable(data.data, this._settings.imutable),
        //Boolean
        expired: expire == 0 ? false: (new Date >= expire) 
    }
}

proto.removeExpired = function () {
    var keys = Object.keys(this._caches)
    // var removeTotal = Math.ceil(this.)
}

function _immutable (data, bool) {
    // imutable data
    if (typeof data == 'object' && bool !== false) return JSON.parse(JSON.stringify(data))
    return data
}

function _merge(src, tar) {
    if (tar) {
        var keys = Object.keys(tar)
        keys.forEach(function(k) {
            src[k] = tar[k]
        })
    }
    return src
}

module.exports = Cache
