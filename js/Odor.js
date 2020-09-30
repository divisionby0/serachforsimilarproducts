var Odor = (function () {
    function Odor(id, name, types, notes, permalink) {
        this.id = id;
        this.name = name;
        this.types = types;
        this.notes = notes;
        this.permalink = permalink;
    }
    Odor.prototype.getId = function () {
        return this.id;
    };
    Odor.prototype.getName = function () {
        return this.name;
    };
    Odor.prototype.getTypes = function () {
        return this.types;
    };
    Odor.prototype.getNotes = function () {
        return this.notes;
    };
    Odor.prototype.getPermalink = function () {
        return this.permalink;
    };
    return Odor;
}());
//# sourceMappingURL=Odor.js.map