///<reference path="lib/events/EventBus.ts"/>
///<reference path="OdorsParser.ts"/>
///<reference path="lib/collections/KeyMap.ts"/>
///<reference path="ajax/GetOdorsRequest.ts"/>
///<reference path="ajax/UpdateOdorSimilarityRequest.ts"/>
///<reference path="lib/collections/json/MapJsonDecoder.ts"/>
///<reference path="IteratingOdorsFinder.ts"/>
///<reference path="Odor1.ts"/>
declare var testData:string;
class SimilarFinderApp{

    private j$:any;

    private ver:string = "0.0.7";

    private startButton:any;

    private state:string;
    public static IDLE:string = "IDLE";
    public static WORKING:string = "WORKING";

    private ids:number[];
    private odors:any[];

    private maxOdorsToLoad:number = 30;

    private counter:number = 0;
    private odorIdCollection:string[];
    private currentOdorId:string;
    private totalOdorsToUpdate:number;
    private odorsToUpdate:any[];

    private maxNoteSimilarityPercentageAllocated:number;
    private minNoteSimilarityPercentageToAllow:number;

    private phases:string[] = new Array("Чтение из базы", "Поиск похожих", "Запись в базу");
    private currentPhaseIndex:number = -1;
    private currentPhase:string;

    private maxSimilarOdors:number = 9;
    private updatedCollection:any[];

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
        
        this.getIDs();

        if(this.maxOdorsToLoad == -1){
            this.maxOdorsToLoad = this.ids.length;
        }
        //console.log("max odors to load "+this.maxOdorsToLoad);
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
        // parse odors
        this.odors = new Array();

        var rawCollection:any[] = new Array();
        
        for(var i:number=0; i<data.length; i++){
            var odorData:any = data[i];
            var id:string = odorData.id;
            var notes:string[] = odorData.notes;
            var name:string = odorData.title;

            rawCollection.push({id:id, notes:notes, name:name, similars:new Array()});
        }

        //console.log("parsed odor collection",rawCollection);

        var logElement:any = this.buildLogElement({logText:"Total odors: "+rawCollection.length});
        this.addLogElement(logElement);

        this.currentPhaseIndex = 1;
        this.changePhase();

        //console.log("send collection to finder ",rawCollection);

        var finder:IteratingOdorsFinder = new IteratingOdorsFinder(this.j$, rawCollection);
        this.updatedCollection = finder.start();

        //console.log("similar find complete rawCollection=",this.updatedCollection);

        this.odorsToUpdate = new Array();

        var i:number;
        for(i=0; i<this.updatedCollection.length; i++){
            var currentOdor:any = this.updatedCollection[i];

            if(currentOdor.similars.length > 0 ){
                this.odorsToUpdate.push({id:currentOdor.id, similars:currentOdor.similars});
            }
        }

        this.currentPhaseIndex = 2;
        this.changePhase();

        console.log("odors to update ",this.odorsToUpdate);

        this.totalOdorsToUpdate = this.odorsToUpdate.length;

        this.updateSimilarityDBRecords();
    }

    private updateSimilarityDBRecords():void{
        console.log("updateSimilarityDBRecords");
        var logElement:any = this.buildLogElement({logText:"updateSimilarityDBRecords"});
        this.addLogElement(logElement);

       this.updateNextOdor();
    }

    private updateNextOdor():void{
        //console.log("next. counter="+this.counter+"  total:"+this.odorsToUpdate.length);
        if(this.odorsToUpdate.length == 0){
            //console.log("nothing to update");
            this.onComplete();
        }
        else{
            if(this.counter < this.odorsToUpdate.length){
                var currentOdor:any = this.odorsToUpdate[this.counter];
                //console.log("current odor to update: ",currentOdor);

                var logElement:any = this.buildLogElement({logText:"update odor "+this.counter+" / "+this.odorsToUpdate.length});
                this.addLogElement(logElement);

                var request:UpdateOdorSimilarityRequest = new UpdateOdorSimilarityRequest(this.j$, currentOdor.id, currentOdor.similars);
                request.execute();
            }
            else{
                this.onComplete();
            }
        }
    }

    private onUpdateOdorComplete(operationSeconds:number):void{
        EventBus.dispatchEvent("PARSE_ODOR_OPERATION_DURATION_DATA", {seconds: operationSeconds, operationsLeft: this.totalOdorsToUpdate - this.counter - 1});
        //console.log("update operations left", this.totalOdorsToUpdate - this.counter - 1);
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
        EventBus.addEventListener("ODOR_LOAD_FAIL", (xhr, status, error)=>this.onOdorLoadFail(xhr, status, error));
        EventBus.addEventListener("LOG", (data)=>this.onLog(data));
        EventBus.addEventListener("PARSE_ODOR_OPERATION_DURATION_DATA", (data)=>this.onParseOdorOperationDurationData(data));
        EventBus.addEventListener("UPDATE_ODOR_SIMILARITY_COMPLETE", (data)=>this.onUpdateOdorComplete(data));
        EventBus.addEventListener("SIMILAR_FINDING_COMPLETE", ()=>this.onComplete());
    }

    private onComplete():void{
        this.state = SimilarFinderApp.IDLE;
        this.onStateChanged();
        console.log("JOB COMPLETE");
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

    private onOdorLoadFail(xhr:any, status:any, error:any) {
        console.log("onOdorLoadFail xhr=",xhr, "status=",status, "error=",error);
    }
}
