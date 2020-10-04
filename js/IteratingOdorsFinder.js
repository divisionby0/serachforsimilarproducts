///<reference path="Odor.ts"/>
var IteratingOdorsFinder = (function () {
    function IteratingOdorsFinder(collection) {
        /*
        private collection:any[] = new Array(
            {id:0, notes:["1","2","3","4","86"],similarsOdors:new Array()},
            {id:1, notes:["1","0","3","4","7","9"],similarsOdors:new Array()},
            {id:2, notes:["0","2","3","7","1","17","8"],similarsOdors:new Array()},
            {id:3, notes:["1","2","88","4"],similarsOdors:new Array()},
            {id:4, notes:["19","23","32","40"],similarsOdors:new Array()},
            {id:5, notes:["1","0","3","2"],similarsOdors:new Array()}
        );
        */
        this.totalOdors = 0;
        this.minNoteSimilarityPercentageToAllow = 19;
        this.checkedDirections = new Array();
        this.collection = collection;
        this.totalOdors = this.collection.length;
    }
    IteratingOdorsFinder.prototype.start = function () {
        var i;
        var j;
        for (i = 0; i < this.collection.length - 1; i++) {
            this.findSimilars(i);
        }
        //this.debugCollection();
    };
    IteratingOdorsFinder.prototype.findSimilars = function (indexToCheck) {
        var j;
        var totalIterations = this.collection.length;
        for (j = indexToCheck + 1; j < totalIterations; j++) {
            var notes1 = this.collection[indexToCheck].getNotes();
            var notes2 = this.collection[j].getNotes();
            notes1.sort();
            notes2.sort();
            var directionForward = this.collection[indexToCheck].getId() + "->" + this.collection[j].getId();
            var directionBackward = this.collection[j].getId() + "->" + this.collection[indexToCheck].getId();
            var directions = directionForward + "," + directionBackward;
            var directionForwardAlreadyChecked = this.checkedDirections.indexOf(directionForward) != -1;
            var directionForwardBackwardChecked = this.checkedDirections.indexOf(directionBackward) != -1;
            if (directionForwardAlreadyChecked != true || directionForwardBackwardChecked != true) {
                var maxNotesNum = 0;
                if (notes1.length > notes2.length) {
                    maxNotesNum = notes1.length;
                }
                else if (notes1.length < notes2.length) {
                    maxNotesNum = notes2.length;
                }
                else {
                    maxNotesNum = notes1.length;
                }
                var differenceArray = this.findDifference(notes1, notes2);
                var totalDifferences = differenceArray.length;
                // пропорция
                // 100% похожесть = макс кол-во нот (выбрать из двух один с бОльшим кол-вом)
                // differenceArray.length = ?%
                var similarityPercent = 100 - Math.round(totalDifferences * 100 / maxNotesNum);
                if (similarityPercent >= this.minNoteSimilarityPercentageToAllow) {
                    this.collection[indexToCheck].addSimilarOdor(this.collection[j].getId(), similarityPercent);
                    this.collection[j].addSimilarOdor(this.collection[indexToCheck].getId(), similarityPercent);
                }
            }
        }
    };
    IteratingOdorsFinder.prototype.findDifference = function (arr1, arr2) {
        var result = [];
        arr1.forEach(function (element) {
            if (!~arr2.indexOf(element))
                result.push(element);
        });
        return result;
    };
    IteratingOdorsFinder.prototype.debugCollection = function () {
        for (var i = 0; i < this.collection.length; i++) {
            var currentOdor = this.collection[i];
            console.log("\nODOR: ", currentOdor.id, "  notes:", currentOdor.notes);
            console.log("Similars:");
            var similars = currentOdor.similarsOdors;
            if (similars) {
                var totalSimilarOdors = similars.length;
                for (var j = 0; j < totalSimilarOdors; j++) {
                    var currentSimilarOdorData = similars[j];
                    var currentSimilarOdorId = currentSimilarOdorData.id;
                    var currentSimilarOdor = this.getOdorById(currentSimilarOdorId);
                    var currentSimilarOdorNotes = currentSimilarOdor.notes;
                    var currentSimilarOdorSimilarityPercent = currentSimilarOdorData.perc;
                    console.log("    ID:", currentSimilarOdorId, " notes:", currentSimilarOdorNotes, " similarity:", currentSimilarOdorSimilarityPercent, "%");
                }
            }
            else {
                console.log("no similars");
            }
        }
    };
    IteratingOdorsFinder.prototype.getOdorById = function (id) {
        var i;
        var total = this.collection.length;
        for (i = 0; i < total; i++) {
            var current = this.collection[i];
            if (parseInt(current.id) == id) {
                return current;
            }
        }
    };
    return IteratingOdorsFinder;
}());
//# sourceMappingURL=IteratingOdorsFinder.js.map