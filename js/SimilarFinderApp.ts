///<reference path="lib/events/EventBus.ts"/>
///<reference path="OdorsParser.ts"/>
///<reference path="Odor.ts"/>
///<reference path="lib/collections/KeyMap.ts"/>
///<reference path="SimilarFinder.ts"/>
///<reference path="ajax/GetOdorsRequest.ts"/>
class SimilarFinderApp{

    private j$:any;

    private ver:string = "0.0.1";

    private startButton:any;

    private state:string;
    public static IDLE:string = "IDLE";
    public static WORKING:string = "WORKING";

    constructor(j$:any){
        this.j$ = j$;
        console.log("SimilarFinderApp "+this.ver);

        this.state = SimilarFinderApp.IDLE;
        this.createListeners();
        this.createButtonListener();
    }

    private onOdorsLoaded(data:string):void{
        var odorsParser:OdorsParser = new OdorsParser(data);
        var odors:KeyMap<Odor> = odorsParser.parse();
        
        var logElement:any = this.buildLogElement({logText:"Total odors: "+odors.size()});
        this.addLogElement(logElement);
        
        var similarFinder:SimilarFinder = new SimilarFinder(odors);
        similarFinder.find();
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
            
            new GetOdorsRequest(this.j$);
        }
    }
    
    private createListeners():void {
        EventBus.addEventListener("ODORS_LOADED", (data)=>this.onOdorsLoaded(data));
        EventBus.addEventListener("ODORS_LOAD_ERROR", (error)=>this.onOdorsLoadError(error));
        EventBus.addEventListener("LOG", (data)=>this.onLog(data));
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
    }
}
