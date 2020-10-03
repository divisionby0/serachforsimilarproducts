///<reference path="../Odor.ts"/>
///<reference path="../lib/events/EventBus.ts"/>
declare var ajaxurl:string;
class UpdateOdorSimilarityRequest{

    private j$:any;
    private odorId:string;
    private similarOdorIDs:string[];

    private startTime:Date;

    constructor(j$:any, odorId:string, similarOdorIDs:string[]){
        this.j$ = j$;
        this.odorId = odorId;
        this.similarOdorIDs = similarOdorIDs;
    }

    public execute():void{
        this.startTime = new Date();
        var data:any = {
            'action': 'update_similarity',
            'odorId': this.odorId,
            'similarOdors': JSON.stringify(this.similarOdorIDs)
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

    private onResponse(response:any):void{

        var finishTime:Date = new Date();
        var dif:number = this.startTime.getTime() - finishTime.getTime();
        var Seconds_from_T1_to_T2:number = dif / 1000;
        var Seconds_Between_Dates:number = Math.abs(Seconds_from_T1_to_T2);
        
        EventBus.dispatchEvent("UPDATE_ODOR_SIMILARITY_COMPLETE",Seconds_Between_Dates);
    }

    private onFail(xhr:any, status:any, error:any):void {
        EventBus.dispatchEvent("UPDATE_ODOR_SIMILARITY_ERROR",error);
    }
}
