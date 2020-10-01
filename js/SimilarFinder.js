///<reference path="Odor.ts"/>
///<reference path="lib/collections/KeyMap.ts"/>
///<reference path="lib/events/EventBus.ts"/>
var SimilarFinder = (function () {
    function SimilarFinder(collection) {
        this.currentOdorNum = 0;
        this.totalOdors = 0;
        this.maxTypeSimilarityPercentageAllocated = 50;
        this.maxNoteSimilarityPercentageAllocated = 40;
        this.minPercentageTypeSimilarityToAllow = 0;
        this.collection = collection;
        this.totalOdors = this.collection.size();
    }
    SimilarFinder.prototype.find = function () {
        this.findTypesSimilarity();
        this.findNotesSimilarity();
        console.log("Similar finder job complete");
    };
    SimilarFinder.prototype.findTypesSimilarity = function () {
        var odorsIterator = this.collection.getIterator();
        while (odorsIterator.hasNext()) {
            var currentOdor = odorsIterator.next();
            EventBus.dispatchEvent("LOG", { logText: "Finding similar by types for ", name: currentOdor.getName(), currentNum: this.currentOdorNum, total: this.totalOdors });
            this.findSimilarByType(currentOdor);
            this.currentOdorNum++;
        }
    };
    SimilarFinder.prototype.findNotesSimilarity = function () {
        console.log("findNotesSimilarity");
        this.currentOdorNum = 0;
        var odorsIterator = this.collection.getIterator();
        while (odorsIterator.hasNext()) {
            var currentOdor = odorsIterator.next();
            if (currentOdor.hasSimilarOdors()) {
                EventBus.dispatchEvent("LOG", { logText: "Finding similar by notes for ", name: currentOdor.getName(), currentNum: this.currentOdorNum, total: this.totalOdors });
                this.findSimilarByNote(currentOdor);
                this.currentOdorNum++;
            }
        }
    };
    SimilarFinder.prototype.findSimilarByType = function (currentOdor) {
        //console.log("findSimilarByType currentOdor=",currentOdor);
        var odorsToCheckIterator = this.collection.getIterator();
        var currentOdorTypeCollection = currentOdor.getTypes();
        var currentOdorTotalTypes = currentOdorTypeCollection.length;
        var singleTypeSimilarityPercent = Math.round(this.maxTypeSimilarityPercentageAllocated / currentOdorTotalTypes);
        // проходимся заново по всей коллекции
        while (odorsToCheckIterator.hasNext()) {
            // получаем запах из коллекции
            var odorToCheck = odorsToCheckIterator.next();
            var odorToCheckSimilarityPercentage = 0;
            var odorToCheckTypeCollection = odorToCheck.getTypes();
            if (odorToCheck.getId() != currentOdor.getId()) {
                odorToCheckSimilarityPercentage = this.findTypeSimilarityPercentage(odorToCheckTypeCollection, currentOdorTypeCollection, singleTypeSimilarityPercent);
            }
            if (odorToCheckSimilarityPercentage > this.minPercentageTypeSimilarityToAllow) {
                currentOdor.addSimilarOdor(odorToCheck.getId(), odorToCheckSimilarityPercentage, odorToCheck.getTypes(), odorToCheck.getNotes());
            }
        }
    };
    SimilarFinder.prototype.findSimilarByNote = function (currentOdor) {
        console.log("\nfindSimilarByNote currentOdor=" + currentOdor.getName());
        console.log(currentOdor);
        var similarKeys = currentOdor.getSimilarKeys();
        var currentOdorTotalNotes = currentOdor.getNotes().length;
        var singleNoteSimilarityPercent = Math.round(this.maxNoteSimilarityPercentageAllocated / currentOdorTotalNotes);
        for (var k = 0; k < similarKeys.length; k++) {
            console.log(similarKeys[k]);
        }
        var similarOdorsIterator = currentOdor.getSimilarOdorsIterator();
        while (similarOdorsIterator.hasNext()) {
            var similarOdorData = similarOdorsIterator.next();
            console.log("similarOdorData = ", similarOdorData);
            var similarOdorId = similarOdorData.id;
            var similarOdor = this.collection.get(similarOdorId);
            var similarOdorName = similarOdor.getName();
            console.log("possible similar odor " + similarOdorId + " : " + similarOdorName);
            var similarOdorPercentageOfSimilarity = similarOdorData.percentageOfSimilarity;
            var similarOdorNotes = similarOdorData.notes;
            //console.log("similar odor ",similarOdorName," init PercentageOfSimilarity=",similarOdorPercentageOfSimilarity," notes:",similarOdorNotes, "current odor notes:",currentOdor.getNotes());
            var correctionPercent = this.findNotesSimilarityPercentage(similarOdorNotes, currentOdor.getNotes(), singleNoteSimilarityPercent);
            if (!isNaN(correctionPercent) && correctionPercent != 0) {
                //console.log("correctionPercent="+correctionPercent);
                similarOdorPercentageOfSimilarity += correctionPercent;
                currentOdor.increaseSimilarOdorPercentage(similarOdorId.toString(), similarOdorPercentageOfSimilarity);
            }
            else if (correctionPercent == 0) {
                // нет ни одного совпадения по нотам - нужно исключить similarOdor из currentOdor
                currentOdor.removeSimilarOdor(similarOdorId.toString());
            }
        }
    };
    SimilarFinder.prototype.findNotesSimilarityPercentage = function (odorToCheckNoteCollection, currentOdorNoteCollection, singleNoteSimilarityPercent) {
        var j;
        var k;
        var odorToCheckSimilarityPercentage = 0;
        var odorToCheckNotesTotal = odorToCheckNoteCollection.length;
        var currentOdorNotesTotal = currentOdorNoteCollection.length;
        for (j = 0; j < odorToCheckNotesTotal; j++) {
            var odorToCheckCurrentNote = odorToCheckNoteCollection[j];
            for (k = 0; k < currentOdorNotesTotal; k++) {
                var currentOdorCurrentNote = currentOdorNoteCollection[k];
                if (currentOdorCurrentNote == odorToCheckCurrentNote) {
                    odorToCheckSimilarityPercentage += singleNoteSimilarityPercent;
                }
            }
        }
        //console.log("odorToCheckSimilarityPercentage="+odorToCheckSimilarityPercentage);
        var percentageCorrection = 1;
        if (odorToCheckNotesTotal != currentOdorNotesTotal) {
            var maxTypesNum;
            var minTypesNum;
            if (odorToCheckNotesTotal > currentOdorNotesTotal) {
                maxTypesNum = odorToCheckNotesTotal;
                minTypesNum = currentOdorNotesTotal;
            }
            else {
                maxTypesNum = currentOdorNotesTotal;
                minTypesNum = odorToCheckNotesTotal;
            }
        }
        //var correctedPercentage:number = percentageCorrection*100/odorToCheckSimilarityPercentage;
        percentageCorrection = maxTypesNum / minTypesNum;
        odorToCheckSimilarityPercentage = odorToCheckSimilarityPercentage / percentageCorrection;
        return Math.round(odorToCheckSimilarityPercentage);
    };
    SimilarFinder.prototype.findTypeSimilarityPercentage = function (odorToCheckTypeCollection, currentOdorTypeCollection, singleTypeSimilarityPercent) {
        var j;
        var k;
        var odorToCheckSimilarityPercentage = 0;
        var odorToCheckTypesTotal = odorToCheckTypeCollection.length;
        var currentOdorTotalTypes = currentOdorTypeCollection.length;
        for (j = 0; j < odorToCheckTypesTotal; j++) {
            var odorToCheckCurrentType = odorToCheckTypeCollection[j];
            for (k = 0; k < currentOdorTotalTypes; k++) {
                var currentOdorCurrentType = currentOdorTypeCollection[k];
                if (currentOdorCurrentType == odorToCheckCurrentType) {
                    odorToCheckSimilarityPercentage += singleTypeSimilarityPercent;
                }
            }
        }
        // TODO find difference in types num
        var percentageCorrection = 1;
        if (odorToCheckTypesTotal != currentOdorTotalTypes) {
            var maxTypesNum;
            var minTypesNum;
            if (odorToCheckTypesTotal > currentOdorTotalTypes) {
                maxTypesNum = odorToCheckTypesTotal;
                minTypesNum = currentOdorTotalTypes;
            }
            else {
                maxTypesNum = currentOdorTotalTypes;
                minTypesNum = odorToCheckTypesTotal;
            }
        }
        //var correctedPercentage:number = percentageCorrection*100/odorToCheckSimilarityPercentage;
        percentageCorrection = maxTypesNum / minTypesNum;
        odorToCheckSimilarityPercentage = odorToCheckSimilarityPercentage / percentageCorrection;
        //return odorToCheckSimilarityPercentage;
        return Math.round(odorToCheckSimilarityPercentage);
    };
    return SimilarFinder;
}());
//# sourceMappingURL=SimilarFinder.js.map