///<reference path="lib/collections/KeyMap.ts"/>
///<reference path="lib/collections/iterators/KeyMapIterator.ts"/>
var Odor1 = (function () {
    function Odor1(id, name, notes) {
        this.maxSimilarOdorsToAdd = 9;
        this.ver = "0.0.1";
        this.id = id;
        this.name = name;
        this.notes = notes;
        this.similars = new Array();
        console.log("Im odor ver=", this.ver, " ", this, "my similars:", this.similars);
    }
    Odor1.prototype.getId = function () {
        return this.id;
    };
    Odor1.prototype.getName = function () {
        return this.name;
    };
    Odor1.prototype.getNotes = function () {
        return this.notes;
    };
    Odor1.prototype.addSimilarOdor = function (id, percentageOfSimilarity) {
        console.log("addSimilarOdor id=", id, "perc", percentageOfSimilarity);
        this.similars.push({ id: id, perc: percentageOfSimilarity });
        this.similars.sort(function (a, b) { return parseInt(b.perc) - parseInt(a.perc); });
        if (this.similars.length > this.maxSimilarOdorsToAdd) {
            this.similars = this.similars.slice(0, this.maxSimilarOdorsToAdd);
        }
    };
    Odor1.prototype.clearSimilarOdors = function () {
        this.similars = new Array();
    };
    Odor1.prototype.hasSimilarOdors = function () {
        return this.similars.length > 0;
    };
    Odor1.prototype.getSimilarOdors = function () {
        return this.similars;
    };
    return Odor1;
}());
//# sourceMappingURL=Odor1.js.map