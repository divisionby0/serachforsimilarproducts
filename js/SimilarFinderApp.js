///<reference path="lib/events/EventBus.ts"/>
///<reference path="OdorsParser.ts"/>
///<reference path="Odor.ts"/>
///<reference path="lib/collections/KeyMap.ts"/>
///<reference path="SimilarFinder.ts"/>
///<reference path="ajax/GetOdorsRequest.ts"/>
var SimilarFinderApp = (function () {
    function SimilarFinderApp(j$) {
        this.ver = "0.0.1";
        this.j$ = j$;
        console.log("SimilarFinderApp " + this.ver);
        this.state = SimilarFinderApp.IDLE;
        this.createListeners();
        this.createButtonListener();
    }
    SimilarFinderApp.prototype.onOdorsLoaded = function (data) {
        var odorsParser = new OdorsParser(data);
        var odors = odorsParser.parse();
        var logElement = this.buildLogElement({ logText: "Total odors: " + odors.size() });
        this.addLogElement(logElement);
        var similarFinder = new SimilarFinder(odors);
        similarFinder.find();
    };
    SimilarFinderApp.prototype.onLog = function (data) {
        var logElement = this.buildLogElement(data);
        this.addLogElement(logElement);
    };
    SimilarFinderApp.prototype.onOdorsLoadError = function (error) {
        alert("Odors load error: " + error);
    };
    SimilarFinderApp.prototype.createButtonListener = function () {
        var _this = this;
        this.startButton = this.j$("#searchButton");
        this.startButton.on("click", function (event) { return _this.onSearchButtonClicked(event); });
    };
    SimilarFinderApp.prototype.onSearchButtonClicked = function (event) {
        if (this.state == SimilarFinderApp.WORKING) {
            alert("Im working. Please wait...");
        }
        else {
            this.state = SimilarFinderApp.WORKING;
            console.log("Start working. Reading DB...");
            var logElement = this.buildLogElement({ logText: "Start finding similar. Reading DB..." });
            this.addLogElement(logElement);
            new GetOdorsRequest(this.j$);
        }
    };
    SimilarFinderApp.prototype.createListeners = function () {
        var _this = this;
        EventBus.addEventListener("ODORS_LOADED", function (data) { return _this.onOdorsLoaded(data); });
        EventBus.addEventListener("ODORS_LOAD_ERROR", function (error) { return _this.onOdorsLoadError(error); });
        EventBus.addEventListener("LOG", function (data) { return _this.onLog(data); });
    };
    SimilarFinderApp.prototype.buildLogElement = function (data) {
        var logText = data.logText;
        var name = data.name;
        if (name) {
            var currentNum = data.currentNum;
            var total = data.total;
            return this.j$("<div style='width: 100%; float: left; display: block;'>" + logText + " <b>'" + name + "'</b> " + currentNum + "/" + total + "</div>");
        }
        else {
            return this.j$("<div style='width: 100%; float: left; display: block;'>" + logText + "</div>");
        }
    };
    SimilarFinderApp.prototype.addLogElement = function (element) {
        element.appendTo(this.j$("#logView"));
    };
    SimilarFinderApp.IDLE = "IDLE";
    SimilarFinderApp.WORKING = "WORKING";
    return SimilarFinderApp;
}());
//# sourceMappingURL=SimilarFinderApp.js.map