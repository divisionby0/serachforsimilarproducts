///<reference path="lib/collections/KeyMap.ts"/>
///<reference path="Odor1.ts"/>
var OdorsParser = (function () {
    function OdorsParser(data) {
        this.data = data;
    }
    OdorsParser.prototype.parse = function () {
        console.log("FUCK parser");
        var collection = new Array();
        var i;
        for (i = 0; i < this.data.length; i++) {
            var odorData = this.data[i];
            var id = odorData.id;
            var name = odorData.title;
            odorData.notes.sort();
            console.log("odor data notes:", odorData.notes);
            var newOdor = new Odor1(id, name, odorData.notes);
            newOdor.clearSimilarOdors();
            console.log("parsed new odor :", newOdor);
            collection.push(newOdor);
        }
        console.log("parsed collection: ", collection);
        return collection;
    };
    return OdorsParser;
}());
//# sourceMappingURL=OdorsParser.js.map