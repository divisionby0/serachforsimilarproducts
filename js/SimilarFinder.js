///<reference path="Odor.ts"/>
///<reference path="lib/collections/KeyMap.ts"/>
///<reference path="lib/events/EventBus.ts"/>
///<reference path="lib/collections/json/MapJsonEncoder.ts"/>
var SimilarFinder = (function () {
    function SimilarFinder(collection, maxNoteSimilarityPercentageAllocated, minNoteSimilarityPercentageToAllow) {
        this.currentOdorNum = 0;
        this.totalOdors = 0;
        this.maxNoteSimilarityPercentageAllocated = 90;
        this.minNoteSimilarityPercentageToAllow = 19;
        this.alreadyCheckedIDs = new Array();
        this.collection = collection;
        this.maxNoteSimilarityPercentageAllocated = maxNoteSimilarityPercentageAllocated;
        this.minNoteSimilarityPercentageToAllow = minNoteSimilarityPercentageToAllow;
        this.totalOdors = this.collection.size();
    }
    SimilarFinder.prototype.find = function () {
        this.findNotesSimilarity();
        console.log("Similar finder job complete");
        //EventBus.dispatchEvent("SIMILAR_FINDING_COMPLETE", null);
    };
    SimilarFinder.prototype.findNotesSimilarity = function () {
        console.log("findNotesSimilarity");
        this.currentOdorNum = 0;
        var odorsIterator = this.collection.getIterator();
        while (odorsIterator.hasNext()) {
            var currentOdor = odorsIterator.next();
            var currentOdorId = currentOdor.getId();
            var alreadyChecked = this.alreadyCheckedIDs.indexOf(currentOdorId) != -1;
            if (!alreadyChecked) {
                EventBus.dispatchEvent("LOG", { logText: "Finding similar by notes for ", name: currentOdor.getName(), currentNum: this.currentOdorNum, total: this.totalOdors });
                this.findSimilarByNote(currentOdor);
                this.currentOdorNum++;
            }
        }
    };
    SimilarFinder.prototype.findSimilarByNote = function (currentOdor) {
        var similarOdorsIterator = this.collection.getIterator();
        var currentOdorTotalNotes = currentOdor.getNotes().length;
        var singleNoteSimilarityPercent = Math.round(this.maxNoteSimilarityPercentageAllocated / currentOdorTotalNotes);
        while (similarOdorsIterator.hasNext()) {
            var possibleSimilarOdor = similarOdorsIterator.next();
            var possibleSimilarOdorId = possibleSimilarOdor.getId();
            var alreadyChecked = this.alreadyCheckedIDs.indexOf(possibleSimilarOdorId) != -1;
            if (!alreadyChecked) {
                if (currentOdor.getId() != possibleSimilarOdorId) {
                    var possibleSimilarOdorNotes = possibleSimilarOdor.getNotes();
                    var percent = this.findNotesSimilarityPercentage(possibleSimilarOdorNotes, currentOdor.getNotes(), singleNoteSimilarityPercent);
                    if (!isNaN(percent) && percent != 0 && percent >= this.minNoteSimilarityPercentageToAllow) {
                        // добавляем похожий к эталонному
                        currentOdor.addSimilarOdor(possibleSimilarOdorId, percent, possibleSimilarOdor.getTypes(), possibleSimilarOdor.getNotes());
                        // добавляем эталонный к похожему
                        possibleSimilarOdor.addSimilarOdor(currentOdor.getId(), percent, currentOdor.getTypes(), currentOdor.getNotes());
                        this.alreadyCheckedIDs.push(currentOdor.getId());
                        this.alreadyCheckedIDs.push(possibleSimilarOdorId);
                    }
                }
            }
        }
    };
    SimilarFinder.prototype.findNotesSimilarityPercentage = function (odorToCheckNoteCollection, currentOdorNoteCollection, singleNoteSimilarityPercent) {
        var diff = odorToCheckNoteCollection.diff(currentOdorNoteCollection);
        var total = diff.length;
        return total * singleNoteSimilarityPercent;
    };
    return SimilarFinder;
}());
//# sourceMappingURL=SimilarFinder.js.map