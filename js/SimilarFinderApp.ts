///<reference path="lib/events/EventBus.ts"/>
///<reference path="OdorsParser.ts"/>
///<reference path="Odor.ts"/>
///<reference path="lib/collections/KeyMap.ts"/>
///<reference path="SimilarFinder.ts"/>
///<reference path="ajax/GetOdorsRequest.ts"/>
///<reference path="ajax/UpdateOdorSimilarityRequest.ts"/>
///<reference path="lib/collections/json/MapJsonDecoder.ts"/>
declare var testData:string;
class SimilarFinderApp{

    private j$:any;

    private ver:string = "0.0.4";

    private startButton:any;

    private state:string;
    public static IDLE:string = "IDLE";
    public static WORKING:string = "WORKING";

    private ids:number[];
    private odors:KeyMap<Odor>;

    private maxOdorsToLoad:number = 30;

    private counter:number = 0;
    private odorIdCollection:string[];
    private currentOdorId:string;
    private totalOdorsToUpdate:number;
    private odorsToUpdate:KeyMap<Odor>;

    private maxNoteSimilarityPercentageAllocated:number;
    private minNoteSimilarityPercentageToAllow:number;

    private phases:string[] = new Array("Чтение из базы", "Поиск похожих", "Запись в базу");
    private currentPhaseIndex:number = -1;
    private currentPhase:string;

    private maxSimilarOdors:number = 9;

    constructor(j$:any){
        this.j$ = j$;
        console.log("SimilarFinderApp "+this.ver);

        this.maxNoteSimilarityPercentageAllocated = this.j$("#maxNoteSimilarityPercentageAllocatedInput").val();
        this.minNoteSimilarityPercentageToAllow = this.j$("#minNoteSimilarityPercentageToAllowInput").val();

        this.maxOdorsToLoad = parseInt(this.j$("#maxOdorsToLoadInput").val());

        this.state = SimilarFinderApp.IDLE;
        this.createListeners();
        this.createButtonListener();
        this.createMaxOdorsToLoadInputListener();

        this.loadDataFile();

        this.getIDs();

        if(this.maxOdorsToLoad == -1){
            this.maxOdorsToLoad = this.ids.length;
        }
        console.log("max odors to load "+this.maxOdorsToLoad);
    }

    private loadDataFile():void{
        var pluginUrl:string = this.j$("#pluginUrlElement").text();

        if(pluginUrl && pluginUrl!=""){
            this.j$.get(pluginUrl+'data/odorsToUpdateJSON_1.txt', (data)=>this.onDataFileLoaded(data));
        }
    }

    private onDataFileLoaded(fileContent:string):void{
        //console.log("onDataFileLoaded data=",fileContent);
        var json:any = JSON.parse(fileContent);
        console.log("parsed data:",fileContent);
    }

    private createMaxOdorsToLoadInputListener():void{
        this.j$("#maxOdorsToLoadInput").change((event)=>this.onMaxOdorsToLoadInputChanged(event));
    }

    private onMaxOdorsToLoadInputChanged(event:any):void{
        this.maxOdorsToLoad = parseInt(this.j$("#maxOdorsToLoadInput").val());

        if(this.maxOdorsToLoad == -1){
            this.maxOdorsToLoad = this.ids.length;
        }
    }

    private onOdorsLoaded(data:any[]):void{
        var odorsParser:OdorsParser = new OdorsParser(data);
        this.odors = odorsParser.parse();

        var jsonEncoder:MapJsonEncoder = this.odors.getEncoder();
        var json:string = jsonEncoder.encode();

        console.log("Loaded odors:",json);
        var logElement:any = this.buildLogElement({logText:"Total odors: "+this.odors.size()});
        this.addLogElement(logElement);

        this.currentPhaseIndex = 1;
        this.changePhase();

        var similarFinder:SimilarFinder = new SimilarFinder(this.odors, this.maxNoteSimilarityPercentageAllocated, this.minNoteSimilarityPercentageToAllow);
        similarFinder.find();
        console.log("Search similar complete. Updated collection ",this.odors);

        this.currentPhaseIndex = 2;
        this.changePhase();

        this.odorsToUpdate = new KeyMap<Odor>("odorsToUpdate");
        var odorsIterator:KeyMapIterator = this.odors.getIterator();
        while(odorsIterator.hasNext()){
            var currentOdor:Odor = odorsIterator.next();
            if(currentOdor.hasSimilarOdors()){
                this.odorsToUpdate.add(currentOdor.getId(), currentOdor);
            }
        }

        console.log("odors to update ",this.odorsToUpdate);

        this.totalOdorsToUpdate = this.odorsToUpdate.size();

        this.updateSimilarityDBRecords();
    }

    private updateSimilarityDBRecords():void{
        console.log("updateSimilarityDBRecords");
        var logElement:any = this.buildLogElement({logText:"updateSimilarityDBRecords"});
        this.addLogElement(logElement);

       this.updateNextOdor();
    }

    private updateNextOdor():void{
        this.odorIdCollection = this.odorsToUpdate.getKeys();
        this.currentOdorId = this.odorIdCollection[this.counter];

        var currentOdor:Odor = this.odorsToUpdate.get(this.currentOdorId);

        if(currentOdor.hasSimilarOdors()){
            var similars:any[] = new Array();
            var similarIterator:KeyMapIterator = currentOdor.getSimilarOdorsIterator();

            while(similarIterator.hasNext()){
                var similar:any = similarIterator.next();
                similars.push({id:similar.id, perc:similar.percentageOfSimilarity});
            }

            similars.sort(function(a, b){return parseInt(b.perc) - parseInt(a.perc)});

            if(similars.length > this.maxSimilarOdors){
                similars = similars.slice(0, this.maxSimilarOdors);
            }

            var logElement:any = this.buildLogElement({logText:"update odor "+this.counter+" / "+this.totalOdorsToUpdate});
            this.addLogElement(logElement);



            var request:UpdateOdorSimilarityRequest = new UpdateOdorSimilarityRequest(this.j$, currentOdor.getId(), similars);
            request.execute();
        }
        else{
            this.counter++;
            if(this.counter < this.totalOdorsToUpdate){
                this.updateNextOdor();
            }
            else{
                console.log("update complete");
                this.onComplete();
            }
        }
    }

    private onUpdateOdorComplete(operationSeconds:number):void{

        EventBus.dispatchEvent("PARSE_ODOR_OPERATION_DURATION_DATA", {seconds: operationSeconds, operationsLeft: this.totalOdorsToUpdate - this.counter - 1});
        
        this.counter++;
        if(this.counter < this.totalOdorsToUpdate){
            this.updateNextOdor();
        }
        else{
            console.log("update complete");
            this.onComplete();
        }
    }

    private onOdorsLoadedOperationTime(seconds:number):void{
        var minutes:number = Math.floor(seconds/60);

        var logElement:any = this.buildLogElement({logText:"Read odors took <b>"+seconds+"</b> seconds (<b>"+minutes+"</b> minutes)"});
        this.addLogElement(logElement);
    }

    private onLog(data:any):void{
        var logElement:any = this.buildLogElement(data);
        this.addLogElement(logElement);
    }
    
    private onOdorsLoadError(error:string):void{
        alert("Odors load error: "+error);
    }
    
    private createButtonListener():void {
        this.startButton = this.j$("#searchButton");
        this.startButton.on("click", (event)=>this.onSearchButtonClicked(event));
    }

    private onSearchButtonClicked(event:any):void {
        if(this.state == SimilarFinderApp.WORKING){
            alert("Im working. Please wait...");
        }
        else{
            this.state = SimilarFinderApp.WORKING;
            this.onStateChanged();

            this.counter = 0;
            this.currentPhaseIndex = 0;
            this.changePhase();

            var logElement:any = this.buildLogElement({logText:"Start finding similar. Reading DB..."});
            this.addLogElement(logElement);
            
            new GetOdorsRequest(this.j$, this.ids, this.maxOdorsToLoad);
        }
    }

    private onStateChanged():void{
        if(this.state == SimilarFinderApp.WORKING){
            this.j$("#maxNoteSimilarityPercentageAllocatedInput").prop("disabled", true);
            this.j$("#minNoteSimilarityPercentageToAllowInput").prop("disabled", true);
            this.j$("#maxOdorsToLoadInput").prop("disabled", true);
            this.j$("#savePluginSettingsButton").prop("disabled", true);
            this.j$("#searchButton").prop("disabled", true);
        }
        else{
            this.j$("#maxNoteSimilarityPercentageAllocatedInput").prop("disabled", false);
            this.j$("#minNoteSimilarityPercentageToAllowInput").prop("disabled", false);
            this.j$("#maxOdorsToLoadInput").prop("disabled", false);
            this.j$("#savePluginSettingsButton").prop("disabled", false);
            this.j$("#searchButton").prop("disabled", false);
        }
    }

    private changePhase():void{
        this.currentPhase = this.phases[this.currentPhaseIndex];
        this.onPhaseChanged();
    }

    private onPhaseChanged():void{
        this.j$("#phaseElement").text("Этап '"+this.currentPhase+"' "+(this.currentPhaseIndex+1)+"/"+this.phases.length);
    }

    private createListeners():void {
        EventBus.addEventListener("ODORS_LOADED", (data)=>this.onOdorsLoaded(data));
        EventBus.addEventListener("ODORS_LOAD_OPERATION_TIME", (seconds)=>this.onOdorsLoadedOperationTime(seconds));
        EventBus.addEventListener("ODORS_LOAD_ERROR", (error)=>this.onOdorsLoadError(error));
        EventBus.addEventListener("LOG", (data)=>this.onLog(data));
        EventBus.addEventListener("PARSE_ODOR_OPERATION_DURATION_DATA", (data)=>this.onParseOdorOperationDurationData(data));
        EventBus.addEventListener("UPDATE_ODOR_SIMILARITY_COMPLETE", (data)=>this.onUpdateOdorComplete(data));
        EventBus.addEventListener("SIMILAR_FINDING_COMPLETE", ()=>this.onComplete());
    }

    private onComplete():void{
        this.state = SimilarFinderApp.IDLE;
        this.onStateChanged();
        console.log("Odors to update:",this.odorsToUpdate);
        alert("Complete");
    }

    private onParseOdorOperationDurationData(data:any):void{
        var operationSeconds:number = data.seconds;
        var operationLeft:number = data.operationsLeft;

        var estimatedSeconds:number = operationLeft*operationSeconds;
        
        var timeLeft:string = this.formatTime(estimatedSeconds);
        this.j$("#timeElement").html("Estimated left: <b style='color:blue;'>"+timeLeft+"</b>");
    }
    
    private buildLogElement(data:any):any{ //TODO лучше чтобы это была factory
        var logText:string = data.logText;
        var name:string = data.name;
        
        if(name){
            var currentNum:string = data.currentNum;
            var total:string = data.total;
            
            return this.j$("<div style='width: 100%; float: left; display: block;'>"+logText+" <b>'"+name+"'</b> "+currentNum+"/"+total+"</div>");
        }
        else{
            return this.j$("<div style='width: 100%; float: left; display: block;'>"+logText+"</div>");
        }
    }
    private addLogElement(element:any):void{
        element.appendTo(this.j$("#logView"));
        this.j$("#logView").scrollTop(this.j$("#logView").prop("scrollHeight"));
    }

    private getIDs():void {
        var data:string = this.j$("#ids").text();
        this.ids = JSON.parse(data);
    }

    private formatTime(time) {
        // Hours, minutes and seconds
        var hrs:number = ~~(time / 3600);
        var mins:number = ~~((time % 3600) / 60);
        var secs:number = ~~time % 60;

        // Output like "1:01" or "4:03:59" or "123:03:59"
        var ret = "";
        if (hrs > 0) {
            ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
        }
        ret += "" + mins + ":" + (secs < 10 ? "0" : "");
        ret += "" + secs;
        return ret;
    }
}
