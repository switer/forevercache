'use strict';

var DEFAULT_MAX = 1000
var DEFAULT_MAX_AGE = 5 * 1000 // ms, default 5s
var DEFAULT_STALE_PERCENT = 0.4

function Cache(opts) {
    this._caches = {}
    this._settings = _merge({
        max: DEFAULT_MAX, // Number
        maxAge: DEFAULT_MAX_AGE, // Number/ms
        stalePercent: DEFAULT_STALE_PERCENT, // how many the percentage of caches nead to remove in batch 
        imutable: false // whether using new references for object value
    }, opts)
}

var proto = Cache.prototype
proto.set = function(key, value, maxAge) {
    if (Object.keys(this._caches).length >= this._settings.max) {
        this.free()
    }
    this._caches[key] = {
        data: _immutable(value, this._settings.imutable),
        expire: (maxAge || DEFAULT_MAX_AGE) + new Date
    }
}
proto.get = function(key) {
    var caches = this._caches
    var item = this._caches[key]
    if (!item) return undefined

    var expire = item.expire
    if (new Date >= expire) {
        // delete caches[key]
        return undefined
    }
    return _immutable(item.data, this._settings.imutable)
}
proto.free = function () {
    var keys = Object.keys(this._caches)
    var freeSize = Math.ceil(this._settings.max*this._settings.stalePercent)
    var usedSize = this._settings.max - freeSize
    var caches = this.caches
    var time = +new Date
    var ckeys = []
    // remove expire
    keys.forEach(function (k) {
        var item = caches[k]
        // exist and not expired
        if (item.expire > time) {
            ckeys.push(item)
        }
    })
    if (ckeys.length > usedSize) {
        // clear those near expired
        // From new to old
        ckeys.sort(function (a, b) {
            a = caches[a].expire
            b = caches[b].expire

            if (a > b) return -1
            else if (a < b) return 1
            else return 0
        })
        ckeys = ckeys.slice(0, usedSize)
    }
    var newCaches = {}
    ckeys.forEach(function (k) {
        newCaches[k] = caches[k]
    })
    this._caches = newCaches
    return this
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
