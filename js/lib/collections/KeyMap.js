/// <reference path="iterators/MapIterator.ts"/>
/// <reference path="json/MapJsonEncoder.ts"/>
///<reference path="iterators/KeyMapIterator.ts"/>
var KeyMap = (function () {
    function KeyMap(id) {
        this.keys = new Array();
        if (id) {
            this.id = id;
        }
        this.items = {};
    }
    KeyMap.prototype.removeKey = function (key) {
        var index = this.keys.indexOf(key);
        this.keys.splice(index, 1);
    };
    KeyMap.prototype.add = function (key, value) {
        this.items[key] = value;
        this.keys.push(key);
    };
    KeyMap.prototype.remove = function (key) {
        delete this.items[key];
        // remove key
        this.removeKey(key);
    };
    KeyMap.prototype.update = function (key, newValue) {
        var value = this.get(key);
        if (value != undefined && value != null) {
            this.items[key] = newValue;
        }
        else {
            console.error('Map error. No such element by key ' + key);
        }
    };
    KeyMap.prototype.clear = function () {
        this.keys = new Array();
        this.items = {};
    };
    KeyMap.prototype.has = function (key) {
        return key in this.items;
    };
    KeyMap.prototype.get = function (key) {
        return this.items[key];
    };
    KeyMap.prototype.getKeys = function () {
        return this.keys;
    };
    KeyMap.prototype.size = function () {
        return this.keys.length;
    };
    KeyMap.prototype.getIterator = function () {
        return new KeyMapIterator(this);
    };
    KeyMap.prototype.setId = function (id) {
        this.id = id;
    };
    KeyMap.prototype.getId = function () {
        return this.id;
    };
    KeyMap.prototype.getEncoder = function () {
        return new MapJsonEncoder(this);
    };
    return KeyMap;
}());
//# sourceMappingURL=KeyMap.js.map