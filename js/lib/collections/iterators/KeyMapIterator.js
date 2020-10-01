///<reference path="../KeyMap.ts"/>
var KeyMapIterator = (function () {
    function KeyMapIterator(_collection) {
        this.counter = -1;
        this.collection = _collection;
        this.keys = this.collection.getKeys();
    }
    KeyMapIterator.prototype.hasNext = function () {
        var nextIndex = this.counter + 1;
        if (nextIndex < this.keys.length) {
            return true;
        }
        else {
            return false;
        }
    };
    KeyMapIterator.prototype.next = function () {
        this.counter += 1;
        var key = this.keys[this.counter];
        return this.collection.get(key);
    };
    KeyMapIterator.prototype.size = function () {
        return this.keys.length;
    };
    return KeyMapIterator;
}());
//# sourceMappingURL=KeyMapIterator.js.map