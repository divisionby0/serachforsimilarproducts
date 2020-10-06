///<reference path="../lib/events/EventBus.ts"/>
declare var ajaxurl:string;
class GetOdorsRequest{

    private j$:any;

    private currentId:number;
    private counter:number;
    private total:number;
    private max:number;
    private ids:number[];

    private odors:any[] = new Array();

    private startTime:Date;

    constructor(j$:any, ids:number[], max:number){
        console.log("ajaxurl="+ajaxurl);
        this.j$ = j$;
        this.ids = ids;
        this.total = ids.length;
        this.max = max;
        this.counter = 0;

        this.getNextPost();
    }

    private getNextPost():void{
        EventBus.dispatchEvent("LOG", {logText:"odor "+this.counter+" / "+this.max});

        this.startTime = new Date();

        this.currentId = this.ids[this.counter];

        var data:any = {
            'action': 'get_odor',
            'id':this.currentId
        };

        this.j$.ajax({
            type: "POST",
            url: ajaxurl,
            data: data,
            dataType: "json",
            success: (response)=>this.onResponse(response),
            error: (XMLHttpRequest, textStatus, errorThrown)=>this.onFail(XMLHttpRequest, textStatus, errorThrown)
        });
    }

    private onComplete():void{
        var finishTime:Date = new Date();
        var dif:number = this.startTime.getTime() - finishTime.getTime();
        var Seconds_from_T1_to_T2:number = dif / 1000;
        var Seconds_Between_Dates:number = Math.abs(Seconds_from_T1_to_T2);

        EventBus.dispatchEvent("ODORS_LOAD_OPERATION_TIME", Seconds_Between_Dates);

        EventBus.dispatchEvent("LOG", {logText:"load odors complete"});

        EventBus.dispatchEvent("ODORS_LOADED", this.odors);
    }

    private onResponse(response:any):void{
        if(response){

            var finishTime:Date = new Date();

            var dif:number = this.startTime.getTime() - finishTime.getTime();
            var Seconds_from_T1_to_T2:number = dif / 1000;
            var operationTimeSeconds:number = Math.abs(Seconds_from_T1_to_T2);

            EventBus.dispatchEvent("PARSE_ODOR_OPERATION_DURATION_DATA", {seconds: operationTimeSeconds, operationsLeft: this.max - this.counter - 1});

            this.odors.push(response);
            this.counter++;
            
            if(this.counter < this.max){
                this.getNextPost();
            }
            else{
                this.onComplete();
            }
        }
        else{
            EventBus.dispatchEvent("ODORS_LOAD_ERROR","response is empty");
        }
    }

    private onFail(xhr:any, status:any, error:any):void {
        EventBus.dispatchEvent("ODOR_LOAD_FAIL",{xhr:xhr, status:status, error:error});
    }
}
