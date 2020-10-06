///<reference path="../lib/events/EventBus.ts"/>
var GetOdorsRequest = (function () {
    function GetOdorsRequest(j$, ids, max) {
        this.odors = new Array();
        console.log("ajaxurl=" + ajaxurl);
        this.j$ = j$;
        this.ids = ids;
        this.total = ids.length;
        this.max = max;
        this.counter = 0;
        this.getNextPost();
    }
    GetOdorsRequest.prototype.getNextPost = function () {
        var _this = this;
        EventBus.dispatchEvent("LOG", { logText: "odor " + this.counter + " / " + this.max });
        this.startTime = new Date();
        this.currentId = this.ids[this.counter];
        var data = {
            'action': 'get_odor',
            'id': this.currentId
        };
        this.j$.ajax({
            type: "POST",
            url: ajaxurl,
            data: data,
            dataType: "json",
            success: function (response) { return _this.onResponse(response); },
            error: function (XMLHttpRequest, textStatus, errorThrown) { return _this.onFail(XMLHttpRequest, textStatus, errorThrown); }
        });
    };
    GetOdorsRequest.prototype.onComplete = function () {
        var finishTime = new Date();
        var dif = this.startTime.getTime() - finishTime.getTime();
        var Seconds_from_T1_to_T2 = dif / 1000;
        var Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2);
        EventBus.dispatchEvent("ODORS_LOAD_OPERATION_TIME", Seconds_Between_Dates);
        EventBus.dispatchEvent("LOG", { logText: "load odors complete" });
        EventBus.dispatchEvent("ODORS_LOADED", this.odors);
    };
    GetOdorsRequest.prototype.onResponse = function (response) {
        if (response) {
            var finishTime = new Date();
            var dif = this.startTime.getTime() - finishTime.getTime();
            var Seconds_from_T1_to_T2 = dif / 1000;
            var operationTimeSeconds = Math.abs(Seconds_from_T1_to_T2);
            EventBus.dispatchEvent("PARSE_ODOR_OPERATION_DURATION_DATA", { seconds: operationTimeSeconds, operationsLeft: this.max - this.counter - 1 });
            this.odors.push(response);
            this.counter++;
            if (this.counter < this.max) {
                this.getNextPost();
            }
            else {
                this.onComplete();
            }
        }
        else {
            EventBus.dispatchEvent("ODORS_LOAD_ERROR", "response is empty");
        }
    };
    GetOdorsRequest.prototype.onFail = function (xhr, status, error) {
        EventBus.dispatchEvent("ODOR_LOAD_FAIL", { xhr: xhr, status: status, error: error });
    };
    return GetOdorsRequest;
}());
//# sourceMappingURL=GetOdorsRequest.js.map