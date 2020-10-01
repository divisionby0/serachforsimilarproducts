///<reference path="lib/events/EventBus.ts"/>
///<reference path="OdorsParser.ts"/>
///<reference path="Odor.ts"/>
///<reference path="lib/collections/KeyMap.ts"/>
///<reference path="SimilarFinder.ts"/>
///<reference path="ajax/GetOdorsRequest.ts"/>
///<reference path="ajax/UpdateOdorSimilarityRequest.ts"/>
var SimilarFinderApp = (function () {
    function SimilarFinderApp(j$) {
        this.ver = "0.0.2";
        this.maxOdorsToLoad = 20;
        this.j$ = j$;
        console.log("SimilarFinderApp " + this.ver);
        this.state = SimilarFinderApp.IDLE;
        this.createListeners();
        this.createButtonListener();
        this.getIDs();
        if (this.maxOdorsToLoad == -1) {
            this.maxOdorsToLoad = this.ids.length;
        }
    }
    SimilarFinderApp.prototype.onOdorsLoaded = function (data) {
        var odorsParser = new OdorsParser(data);
        this.odors = odorsParser.parse();
        var logElement = this.buildLogElement({ logText: "Total odors: " + this.odors.size() });
        this.addLogElement(logElement);
        var similarFinder = new SimilarFinder(this.odors);
        similarFinder.find();
        console.log("Search similar complete. Updated collection ", this.odors);
        this.updateSimilarityDBRecords();
    };
    SimilarFinderApp.prototype.updateSimilarityDBRecords = function () {
        console.log("updateSimilarityDBRecords");
        var firstOdor = this.odors.get("46905");
        console.log("first odor:", firstOdor);
        var similars = new Array();
        var similarIterator = firstOdor.getSimilarOdorsIterator();
        while (similarIterator.hasNext()) {
            var similar = similarIterator.next();
            similars.push({ id: similar.id, perc: similar.percentageOfSimilarity });
        }
        console.log("similars:", similars);
        var request = new UpdateOdorSimilarityRequest(this.j$, "46905", similars);
        request.execute();
    };
    SimilarFinderApp.prototype.onOdorsLoadedOperationTime = function (seconds) {
        var minutes = Math.floor(seconds / 60);
        var logElement = this.buildLogElement({ logText: "Read odors took <b>" + seconds + "</b> seconds (<b>" + minutes + "</b> minutes)" });
        this.addLogElement(logElement);
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
            new GetOdorsRequest(this.j$, this.ids, this.maxOdorsToLoad);
        }
    };
    SimilarFinderApp.prototype.createListeners = function () {
        var _this = this;
        EventBus.addEventListener("ODORS_LOADED", function (data) { return _this.onOdorsLoaded(data); });
        EventBus.addEventListener("ODORS_LOAD_OPERATION_TIME", function (seconds) { return _this.onOdorsLoadedOperationTime(seconds); });
        EventBus.addEventListener("ODORS_LOAD_ERROR", function (error) { return _this.onOdorsLoadError(error); });
        EventBus.addEventListener("LOG", function (data) { return _this.onLog(data); });
        EventBus.addEventListener("PARSE_ODOR_OPERATION_DURATION_DATA", function (data) { return _this.onParseOdorOperationDurationData(data); });
    };
    SimilarFinderApp.prototype.onParseOdorOperationDurationData = function (data) {
        var operationSeconds = data.seconds;
        var operationLeft = data.operationsLeft;
        var estimatedSeconds = operationLeft * operationSeconds;
        /*
        var operationSeconds:number = data.seconds;
        var operationLeft:number = data.operationsLeft;

        var estimatedSeconds:number = operationLeft*operationSeconds;

        var minutesLeft:number = Math.floor(estimatedSeconds / 60);
        var secondsLeft = Math.floor(estimatedSeconds - minutesLeft * 60);
        */
        var timeLeft = this.formatTime(estimatedSeconds);
        this.j$("#timeElement").html("Estimated left: <b style='color:blue;'>" + timeLeft + "</b>");
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
        this.j$("#logView").scrollTop(this.j$("#logView").prop("scrollHeight"));
    };
    SimilarFinderApp.prototype.getIDs = function () {
        var data = this.j$("#ids").text();
        this.ids = JSON.parse(data);
    };
    SimilarFinderApp.prototype.formatTime = function (time) {
        // Hours, minutes and seconds
        var hrs = ~~(time / 3600);
        var mins = ~~((time % 3600) / 60);
        var secs = ~~time % 60;
        // Output like "1:01" or "4:03:59" or "123:03:59"
        var ret = "";
        if (hrs > 0) {
            ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
        }
        ret += "" + mins + ":" + (secs < 10 ? "0" : "");
        ret += "" + secs;
        return ret;
    };
    SimilarFinderApp.IDLE = "IDLE";
    SimilarFinderApp.WORKING = "WORKING";
    return SimilarFinderApp;
}());
//# sourceMappingURL=SimilarFinderApp.js.map