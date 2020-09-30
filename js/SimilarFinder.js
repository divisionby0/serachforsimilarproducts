///<reference path="Odor.ts"/>
///<reference path="lib/collections/KeyMap.ts"/>
///<reference path="lib/collections/iterators/MapIterator.ts"/>
///<reference path="lib/events/EventBus.ts"/>
var SimilarFinder = (function () {
    function SimilarFinder(collection) {
        this.currentOdorNum = 0;
        this.totalOdors = 0;
        this.collection = collection;
        this.totalOdors = this.collection.size();
    }
    SimilarFinder.prototype.find = function () {
        var odorsIterator = this.collection.getIterator();
        while (odorsIterator.hasNext()) {
            var currentOdor = odorsIterator.next();
            EventBus.dispatchEvent("LOG", { logText: "Finding similar for ", name: currentOdor.getName(), currentNum: this.currentOdorNum, total: this.totalOdors });
            console.log("current odor: ", currentOdor);
            this.findSimilarByType(currentOdor);
            this.currentOdorNum++;
        }
    };
    SimilarFinder.prototype.findSimilarByType = function (currentOdor) {
    };
    return SimilarFinder;
}());
//# sourceMappingURL=SimilarFinder.js.map