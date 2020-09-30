///<reference path="Odor.ts"/>
///<reference path="lib/collections/KeyMap.ts"/>
var OdorsParser = (function () {
    function OdorsParser(data) {
        this.data = data;
    }
    OdorsParser.prototype.parse = function () {
        var dataArray = JSON.parse(this.data);
        console.log("dataArray=", dataArray);
        var collection = new KeyMap("odors");
        var i;
        for (i = 0; i < dataArray.length; i++) {
            var odorData = JSON.parse(dataArray[i]);
            var id = odorData.id;
            var name = odorData.name;
            var permalink = odorData.permalink;
            var types = JSON.parse(odorData.types);
            var notes = JSON.parse(odorData.notes);
            collection.add(id, new Odor(id, name, types, notes, permalink));
        }
        return collection;
    };
    return OdorsParser;
}());
//# sourceMappingURL=OdorsParser.js.map