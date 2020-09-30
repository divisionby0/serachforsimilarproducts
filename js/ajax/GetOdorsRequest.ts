///<reference path="../lib/events/EventBus.ts"/>
declare var ajaxurl:string;
class GetOdorsRequest{
    
    constructor(j$:any){
        console.log("ajaxurl="+ajaxurl);

        var data:any = {
            'action': 'find_odors'
        };
        
        j$.ajax({
            type: "POST",
            url: ajaxurl,
            data: data,
            success: (response)=>this.onResponse(response),
            error: (XMLHttpRequest, textStatus, errorThrown)=>this.onFail(XMLHttpRequest, textStatus, errorThrown)
        });
    }
    
    private onResponse(response:any):void{
        if(response){
            EventBus.dispatchEvent("ODORS_LOADED", response);
        }
        else{
            EventBus.dispatchEvent("ODORS_LOAD_ERROR","response is empty");
        }
    }

    private onFail(xhr:any, status:any, error:any):void {
        EventBus.dispatchEvent("ODORS_LOAD_ERROR",error);
    }
}
