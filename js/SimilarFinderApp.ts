///<reference path="lib/events/EventBus.ts"/>
///<reference path="OdorsParser.ts"/>
///<reference path="Odor.ts"/>
///<reference path="lib/collections/KeyMap.ts"/>
///<reference path="SimilarFinder.ts"/>
///<reference path="ajax/GetOdorsRequest.ts"/>
///<reference path="ajax/UpdateOdorSimilarityRequest.ts"/>
class SimilarFinderApp{

    private j$:any;

    private ver:string = "0.0.2";

    private startButton:any;

    private state:string;
    public static IDLE:string = "IDLE";
    public static WORKING:string = "WORKING";

    private ids:number[];
    private odors:KeyMap<Odor>;

    private maxOdorsToLoad:number = 20;

    constructor(j$:any){
        this.j$ = j$;
        console.log("SimilarFinderApp "+this.ver);

        this.state = SimilarFinderApp.IDLE;
        this.createListeners();
        this.createButtonListener();

        this.getIDs();
        if(this.maxOdorsToLoad == -1){
            this.maxOdorsToLoad = this.ids.length;
        }
    }
    
    private onOdorsLoaded(data:any[]):void{
        var odorsParser:OdorsParser = new OdorsParser(data);
        this.odors = odorsParser.parse();
        
        var logElement:any = this.buildLogElement({logText:"Total odors: "+this.odors.size()});
        this.addLogElement(logElement);
        
        var similarFinder:SimilarFinder = new SimilarFinder(this.odors);
        similarFinder.find();

        console.log("Search similar complete. Updated collection ",this.odors);

        this.updateSimilarityDBRecords();
    }

    private updateSimilarityDBRecords():void{
        console.log("updateSimilarityDBRecords");
        var firstOdor:Odor = this.odors.get("46905");

        console.log("first odor:",firstOdor);

        var similars:any[] = new Array();
        var similarIterator:MapIterator = firstOdor.getSimilarOdorsIterator();
        while(similarIterator.hasNext()){
            var similar:any = similarIterator.next();
            similars.push({id:similar.id, perc:similar.percentageOfSimilarity});
        }
        console.log("similars:",similars);
        var request:UpdateOdorSimilarityRequest = new UpdateOdorSimilarityRequest(this.j$, "46905", similars);
        request.execute();
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
            console.log("Start working. Reading DB...");

            var logElement:any = this.buildLogElement({logText:"Start finding similar. Reading DB..."});
            this.addLogElement(logElement);
            
            new GetOdorsRequest(this.j$, this.ids, this.maxOdorsToLoad);
        }
    }
    
    private createListeners():void {
        EventBus.addEventListener("ODORS_LOADED", (data)=>this.onOdorsLoaded(data));
        EventBus.addEventListener("ODORS_LOAD_OPERATION_TIME", (seconds)=>this.onOdorsLoadedOperationTime(seconds));
        EventBus.addEventListener("ODORS_LOAD_ERROR", (error)=>this.onOdorsLoadError(error));
        EventBus.addEventListener("LOG", (data)=>this.onLog(data));
        EventBus.addEventListener("PARSE_ODOR_OPERATION_DURATION_DATA", (data)=>this.onParseOdorOperationDurationData(data));
    }

    private onParseOdorOperationDurationData(data:any):void{

        var operationSeconds:number = data.seconds;
        var operationLeft:number = data.operationsLeft;

        var estimatedSeconds:number = operationLeft*operationSeconds;

        /*
        var operationSeconds:number = data.seconds;
        var operationLeft:number = data.operationsLeft;

        var estimatedSeconds:number = operationLeft*operationSeconds;

        var minutesLeft:number = Math.floor(estimatedSeconds / 60);
        var secondsLeft = Math.floor(estimatedSeconds - minutesLeft * 60);
        */
        
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
