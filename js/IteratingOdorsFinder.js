///<reference path="Odor1.ts"/>
var IteratingOdorsFinder = (function () {
    function IteratingOdorsFinder(j$, collection) {
        this.totalOdors = 0;
        this.minNoteSimilarityPercentageToAllow = 19;
        this.maxSimilarOdorsToAdd = 9;
        this.updateCollection = new Array();
        //console.log("IteratingOdorsFinder collection:",collection);
        //this.collection = collection;
        this.j$ = j$;
        this.totalOdors = collection.length;
        for (var i = 0; i < this.totalOdors; i++) {
            var odorData = collection[i];
            var id = odorData.id;
            var name = odorData.name;
            var notes = odorData.notes;
            this.updateCollection.push({ id: id, name: name, notes: notes, similars: new Array() });
        }
        //console.log("collection before update:", JSON.parse(JSON.stringify(this.updateCollection)));
    }
    IteratingOdorsFinder.prototype.start = function () {
        var i;
        var j;
        for (i = 0; i < this.updateCollection.length - 1; i++) {
            this.findSimilars(i);
        }
        var newCollection = new Array();
        for (var i = 0; i < this.updateCollection.length; i++) {
            var odorData = this.updateCollection[i];
            var similars = odorData.similars;
            var totalSimilars = similars.length;
            similars.sort(function (a, b) { return parseInt(b.perc) - parseInt(a.perc); });
            var id = odorData.id;
            var newOdor = { id: id, similars: new Array() };
            //console.log("similars:",similars);
            //console.log("this.maxSimilarOdorsToAdd="+this.maxSimilarOdorsToAdd);
            if (totalSimilars > this.maxSimilarOdorsToAdd) {
                for (j = 0; j < this.maxSimilarOdorsToAdd; j++) {
                    var similarData = similars[j];
                    newOdor.similars.push(similarData);
                }
                similars = similars.slice(0, this.maxSimilarOdorsToAdd);
            }
            else {
                for (j = 0; j < totalSimilars; j++) {
                    var similarData = similars[j];
                    newOdor.similars.push(similarData);
                }
            }
            //console.log("similars after cut:",similars);
            newCollection.push(newOdor);
        }
        return newCollection;
    };
    IteratingOdorsFinder.prototype.findSimilars = function (indexToCheck) {
        var j;
        var totalIterations = this.updateCollection.length;
        var sampleId = parseInt(this.updateCollection[indexToCheck].id);
        //console.log("\nfindSimilars for "+sampleId+" ...");
        //console.log("notes ",this.updateCollection[indexToCheck].notes);
        for (j = indexToCheck + 1; j < totalIterations; j++) {
            var idToCheck = parseInt(this.updateCollection[j].id);
            var notes1 = this.updateCollection[indexToCheck].notes;
            var notes2 = this.updateCollection[j].notes;
            notes1.sort();
            notes2.sort();
            /*
            console.log("   id to check "+this.updateCollection[j].id);
            console.log("   notes1:",notes1);
            console.log("   notes2:",notes2);
            */
            notes1.sort();
            notes2.sort();
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
            //console.log("differenceArray=",differenceArray);
            //console.log("totalDifferences=",totalDifferences);
            // пропорция
            // 100% похожесть = макс кол-во нот (выбрать из двух один с бОльшим кол-вом)
            // differenceArray.length = ?%
            var similarityPercent = 100 - Math.round(totalDifferences * 100 / maxNotesNum);
            //console.log("similarityPercent=",similarityPercent);
            if (similarityPercent >= this.minNoteSimilarityPercentageToAllow) {
                //console.log("adding to similarities array for both odors");
                //console.log("odor id "+this.updateCollection[indexToCheck].id+" add similar odor "+this.updateCollection[j].id+" perc:"+similarityPercent);
                this.updateCollection[indexToCheck].similars.push({ id: this.updateCollection[j].id, perc: similarityPercent });
            }
        }
    };
    IteratingOdorsFinder.prototype.findDifference = function (a, b) {
        var arrays = Array.prototype.slice.call(arguments);
        var diff = [];
        arrays.forEach(function (arr, i) {
            var other = i === 1 ? a : b;
            arr.forEach(function (x) {
                if (other.indexOf(x) === -1) {
                    diff.push(x);
                }
            });
        });
        return diff;
        //return a1.diff1(a2);
        //return difference;
        /*
        var result:string[] = [];

        var i:number;
        var j:number;

        if(arr2.length >= arr1.length){

        }
        else{
            arr2.forEach( function (element) {
                if ( !~arr1.indexOf(element) ) result.push(element)
            });
        }
        */
        /*
        var result:string[] = [];

        if(arr2.length >= arr1.length){
            arr1.forEach( function (element) {
                if ( !~arr2.indexOf(element) ) result.push(element)
            });
        }
        else{
            arr2.forEach( function (element) {
                if ( !~arr1.indexOf(element) ) result.push(element)
            });
        }
        */
        //return result;
    };
    IteratingOdorsFinder.prototype.debugCollection = function () {
        console.log("collection after find:");
        console.log(this.updateCollection);
    };
    IteratingOdorsFinder.prototype.getOdorById = function (id) {
        var i;
        var total = this.updateCollection.length;
        for (i = 0; i < total; i++) {
            var current = this.updateCollection[i];
            if (parseInt(current.id) == id) {
                return current;
            }
        }
    };
    return IteratingOdorsFinder;
}());
//# sourceMappingURL=IteratingOdorsFinder.js.map