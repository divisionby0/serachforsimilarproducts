///<reference path="lib/collections/KeyMap.ts"/>
///<reference path="lib/collections/iterators/KeyMapIterator.ts"/>
var Odor = (function () {
    function Odor(id, name, types, notes) {
        this.id = id;
        this.name = name;
        this.types = types;
        this.notes = notes;
        this.similarOdors = new KeyMap("similarOdors");
    }
    Odor.prototype.getId = function () {
        return this.id;
    };
    Odor.prototype.getName = function () {
        return this.name;
    };
    Odor.prototype.getTypes = function () {
        return this.types;
    };
    Odor.prototype.getNotes = function () {
        return this.notes;
    };
    Odor.prototype.removeSimilarOdor = function (id) {
        if (this.similarOdors.has(id)) {
            this.similarOdors.remove(id);
        }
    };
    Odor.prototype.addSimilarOdor = function (id, percentageOfSimilarity, types, notes) {
        if (!this.similarOdors.has(id)) {
            this.similarOdors.add(id, { id: id, percentageOfSimilarity: percentageOfSimilarity, types: types, notes: notes });
        }
        else {
            console.error("similar with id " + id + "already exists with perc:" + this.similarOdors.get(id).percentageOfSimilarity);
        }
    };
    Odor.prototype.hasSimilarOdors = function () {
        return this.similarOdors.size() > 0;
    };
    Odor.prototype.increaseSimilarOdorPercentage = function (id, percentage) {
        var similarOdor = this.similarOdors.get(id);
        similarOdor.percentageOfSimilarity += percentage;
    };
    Odor.prototype.getSimilarOdorsIterator = function () {
        return this.similarOdors.getIterator();
    };
    Odor.prototype.getSimilarKeys = function () {
        return this.similarOdors.getKeys();
    };
    return Odor;
}());
//# sourceMappingURL=Odor.js.map