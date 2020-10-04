///<reference path="lib/collections/KeyMap.ts"/>
///<reference path="lib/collections/iterators/KeyMapIterator.ts"/>
var Odor = (function () {
    function Odor(id, name, notes) {
        this.maxSimilarOdorsToAdd = 9;
        this.currentMaxPercentage = 0;
        this.currentMaxPercentageId = "-1";
        this.id = id;
        this.name = name;
        this.notes = notes;
        this.similarOdors = new Array();
    }
    Odor.prototype.getId = function () {
        return this.id;
    };
    Odor.prototype.getName = function () {
        return this.name;
    };
    Odor.prototype.getNotes = function () {
        return this.notes;
    };
    Odor.prototype.addSimilarOdor = function (id, percentageOfSimilarity) {
        this.similarOdors.push({ id: id, perc: percentageOfSimilarity });
        this.similarOdors.sort(function (a, b) { return parseInt(b.perc) - parseInt(a.perc); });
        if (this.similarOdors.length > this.maxSimilarOdorsToAdd) {
            this.similarOdors = this.similarOdors.slice(0, this.maxSimilarOdorsToAdd);
        }
    };
    Odor.prototype.hasSimilarOdors = function () {
        return this.similarOdors.length > 0;
    };
    Odor.prototype.getSimilarOdors = function () {
        return this.similarOdors;
    };
    return Odor;
}());
//# sourceMappingURL=Odor.js.map