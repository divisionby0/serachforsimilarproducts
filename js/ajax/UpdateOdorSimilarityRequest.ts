///<reference path="../Odor.ts"/>
///<reference path="../lib/events/EventBus.ts"/>
declare var ajaxurl:string;
class UpdateOdorSimilarityRequest{

    private j$:any;
    private odorId:string;
    private similarOdorIDs:string[];

    constructor(j$:any, odorId:string, similarOdorIDs:string[]){
        this.j$ = j$;
        this.odorId = odorId;
        this.similarOdorIDs = similarOdorIDs;
    }

    public execute():void{
        var data:any = {
            'action': 'update_similarity',
            'odorId': this.odorId,
            'similarOdors': JSON.stringify(this.similarOdorIDs)
        };

        console.log("data=",data);
        
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
        console.log("Update similar response:",response);
        if(response){
            

            if(response.result == "1"){
                EventBus.dispatchEvent("UPDATE_ODOR_SIMILARITY_COMPLETE","");
            }
            else if(response.error){
                EventBus.dispatchEvent("UPDATE_ODOR_SIMILARITY_ERROR",response.error);
            }
        }
        else{
            EventBus.dispatchEvent("UPDATE_ODOR_SIMILARITY_ERROR","response is empty");
        }
    }

    private onFail(xhr:any, status:any, error:any):void {
        EventBus.dispatchEvent("UPDATE_ODOR_SIMILARITY_ERROR",error);
    }
}
