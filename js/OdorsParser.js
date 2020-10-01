///<reference path="Odor.ts"/>
///<reference path="lib/collections/KeyMap.ts"/>
var OdorsParser = (function () {
    function OdorsParser(data) {
        this.data = data;
    }
    OdorsParser.prototype.parse = function () {
        var collection = new KeyMap("odors");
        var i;
        for (i = 0; i < this.data.length; i++) {
            var odorData = this.data[i];
            var id = odorData.id;
            var name = odorData.title;
            odorData.types.sort();
            odorData.notes.sort();
            collection.add(id, new Odor(id, name, odorData.types, odorData.notes));
        }
        return collection;
    };
    return OdorsParser;
}());
//# sourceMappingURL=OdorsParser.js.map