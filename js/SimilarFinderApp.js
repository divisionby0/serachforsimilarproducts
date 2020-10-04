///<reference path="lib/events/EventBus.ts"/>
///<reference path="OdorsParser.ts"/>
///<reference path="Odor.ts"/>
///<reference path="lib/collections/KeyMap.ts"/>
///<reference path="SimilarFinder.ts"/>
///<reference path="ajax/GetOdorsRequest.ts"/>
///<reference path="ajax/UpdateOdorSimilarityRequest.ts"/>
///<reference path="lib/collections/json/MapJsonDecoder.ts"/>
var SimilarFinderApp = (function () {
    function SimilarFinderApp(j$) {
        this.ver = "0.0.4";
        this.maxOdorsToLoad = 30;
        this.counter = 0;
        this.phases = new Array("Чтение из базы", "Поиск похожих", "Запись в базу");
        this.currentPhaseIndex = -1;
        this.maxSimilarOdors = 9;
        this.j$ = j$;
        console.log("SimilarFinderApp " + this.ver);
        this.maxNoteSimilarityPercentageAllocated = this.j$("#maxNoteSimilarityPercentageAllocatedInput").val();
        this.minNoteSimilarityPercentageToAllow = this.j$("#minNoteSimilarityPercentageToAllowInput").val();
        this.maxOdorsToLoad = parseInt(this.j$("#maxOdorsToLoadInput").val());
        this.state = SimilarFinderApp.IDLE;
        this.createListeners();
        this.createButtonListener();
        this.createMaxOdorsToLoadInputListener();
        this.loadDataFile();
        this.getIDs();
        if (this.maxOdorsToLoad == -1) {
            this.maxOdorsToLoad = this.ids.length;
        }
        console.log("max odors to load " + this.maxOdorsToLoad);
    }
    SimilarFinderApp.prototype.loadDataFile = function () {
        var _this = this;
        var pluginUrl = this.j$("#pluginUrlElement").text();
        if (pluginUrl && pluginUrl != "") {
            this.j$.get(pluginUrl + 'data/odorsToUpdateJSON_1.txt', function (data) { return _this.onDataFileLoaded(data); });
        }
    };
    SimilarFinderApp.prototype.onDataFileLoaded = function (fileContent) {
        //console.log("onDataFileLoaded data=",fileContent);
        var json = JSON.parse(fileContent);
        console.log("parsed data:", fileContent);
    };
    SimilarFinderApp.prototype.createMaxOdorsToLoadInputListener = function () {
        var _this = this;
        this.j$("#maxOdorsToLoadInput").change(function (event) { return _this.onMaxOdorsToLoadInputChanged(event); });
    };
    SimilarFinderApp.prototype.onMaxOdorsToLoadInputChanged = function (event) {
        this.maxOdorsToLoad = parseInt(this.j$("#maxOdorsToLoadInput").val());
        if (this.maxOdorsToLoad == -1) {
            this.maxOdorsToLoad = this.ids.length;
        }
    };
    SimilarFinderApp.prototype.onOdorsLoaded = function (data) {
        var odorsParser = new OdorsParser(data);
        this.odors = odorsParser.parse();
        var jsonEncoder = this.odors.getEncoder();
        var json = jsonEncoder.encode();
        console.log("Loaded odors:", json);
        var logElement = this.buildLogElement({ logText: "Total odors: " + this.odors.size() });
        this.addLogElement(logElement);
        this.currentPhaseIndex = 1;
        this.changePhase();
        var similarFinder = new SimilarFinder(this.odors, this.maxNoteSimilarityPercentageAllocated, this.minNoteSimilarityPercentageToAllow);
        similarFinder.find();
        console.log("Search similar complete. Updated collection ", this.odors);
        this.currentPhaseIndex = 2;
        this.changePhase();
        this.odorsToUpdate = new KeyMap("odorsToUpdate");
        var odorsIterator = this.odors.getIterator();
        while (odorsIterator.hasNext()) {
            var currentOdor = odorsIterator.next();
            if (currentOdor.hasSimilarOdors()) {
                this.odorsToUpdate.add(currentOdor.getId(), currentOdor);
            }
        }
        console.log("odors to update ", this.odorsToUpdate);
        this.totalOdorsToUpdate = this.odorsToUpdate.size();
        this.updateSimilarityDBRecords();
    };
    SimilarFinderApp.prototype.updateSimilarityDBRecords = function () {
        console.log("updateSimilarityDBRecords");
        var logElement = this.buildLogElement({ logText: "updateSimilarityDBRecords" });
        this.addLogElement(logElement);
        this.updateNextOdor();
    };
    SimilarFinderApp.prototype.updateNextOdor = function () {
        this.odorIdCollection = this.odorsToUpdate.getKeys();
        this.currentOdorId = this.odorIdCollection[this.counter];
        var currentOdor = this.odorsToUpdate.get(this.currentOdorId);
        if (currentOdor.hasSimilarOdors()) {
            var similars = new Array();
            var similarIterator = currentOdor.getSimilarOdorsIterator();
            while (similarIterator.hasNext()) {
                var similar = similarIterator.next();
                similars.push({ id: similar.id, perc: similar.percentageOfSimilarity });
            }
            similars.sort(function (a, b) { return parseInt(b.perc) - parseInt(a.perc); });
            if (similars.length > this.maxSimilarOdors) {
                similars = similars.slice(0, this.maxSimilarOdors);
            }
            var logElement = this.buildLogElement({ logText: "update odor " + this.counter + " / " + this.totalOdorsToUpdate });
            this.addLogElement(logElement);
            var request = new UpdateOdorSimilarityRequest(this.j$, currentOdor.getId(), similars);
            request.execute();
        }
        else {
            this.counter++;
            if (this.counter < this.totalOdorsToUpdate) {
                this.updateNextOdor();
            }
            else {
                console.log("update complete");
                this.onComplete();
            }
        }
    };
    SimilarFinderApp.prototype.onUpdateOdorComplete = function (operationSeconds) {
        EventBus.dispatchEvent("PARSE_ODOR_OPERATION_DURATION_DATA", { seconds: operationSeconds, operationsLeft: this.totalOdorsToUpdate - this.counter - 1 });
        this.counter++;
        if (this.counter < this.totalOdorsToUpdate) {
            this.updateNextOdor();
        }
        else {
            console.log("update complete");
            this.onComplete();
        }
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
            this.onStateChanged();
            this.counter = 0;
            this.currentPhaseIndex = 0;
            this.changePhase();
            var logElement = this.buildLogElement({ logText: "Start finding similar. Reading DB..." });
            this.addLogElement(logElement);
            new GetOdorsRequest(this.j$, this.ids, this.maxOdorsToLoad);
        }
    };
    SimilarFinderApp.prototype.onStateChanged = function () {
        if (this.state == SimilarFinderApp.WORKING) {
            this.j$("#maxNoteSimilarityPercentageAllocatedInput").prop("disabled", true);
            this.j$("#minNoteSimilarityPercentageToAllowInput").prop("disabled", true);
            this.j$("#maxOdorsToLoadInput").prop("disabled", true);
            this.j$("#savePluginSettingsButton").prop("disabled", true);
            this.j$("#searchButton").prop("disabled", true);
        }
        else {
            this.j$("#maxNoteSimilarityPercentageAllocatedInput").prop("disabled", false);
            this.j$("#minNoteSimilarityPercentageToAllowInput").prop("disabled", false);
            this.j$("#maxOdorsToLoadInput").prop("disabled", false);
            this.j$("#savePluginSettingsButton").prop("disabled", false);
            this.j$("#searchButton").prop("disabled", false);
        }
    };
    SimilarFinderApp.prototype.changePhase = function () {
        this.currentPhase = this.phases[this.currentPhaseIndex];
        this.onPhaseChanged();
    };
    SimilarFinderApp.prototype.onPhaseChanged = function () {
        this.j$("#phaseElement").text("Этап '" + this.currentPhase + "' " + (this.currentPhaseIndex + 1) + "/" + this.phases.length);
    };
    SimilarFinderApp.prototype.createListeners = function () {
        var _this = this;
        EventBus.addEventListener("ODORS_LOADED", function (data) { return _this.onOdorsLoaded(data); });
        EventBus.addEventListener("ODORS_LOAD_OPERATION_TIME", function (seconds) { return _this.onOdorsLoadedOperationTime(seconds); });
        EventBus.addEventListener("ODORS_LOAD_ERROR", function (error) { return _this.onOdorsLoadError(error); });
        EventBus.addEventListener("LOG", function (data) { return _this.onLog(data); });
        EventBus.addEventListener("PARSE_ODOR_OPERATION_DURATION_DATA", function (data) { return _this.onParseOdorOperationDurationData(data); });
        EventBus.addEventListener("UPDATE_ODOR_SIMILARITY_COMPLETE", function (data) { return _this.onUpdateOdorComplete(data); });
        EventBus.addEventListener("SIMILAR_FINDING_COMPLETE", function () { return _this.onComplete(); });
    };
    SimilarFinderApp.prototype.onComplete = function () {
        this.state = SimilarFinderApp.IDLE;
        this.onStateChanged();
        console.log("Odors to update:", this.odorsToUpdate);
        alert("Complete");
    };
    SimilarFinderApp.prototype.onParseOdorOperationDurationData = function (data) {
        var operationSeconds = data.seconds;
        var operationLeft = data.operationsLeft;
        var estimatedSeconds = operationLeft * operationSeconds;
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