///<reference path="../lib/events/EventBus.ts"/>
var GetOdorsRequest = (function () {
    function GetOdorsRequest(j$) {
        var _this = this;
        console.log("ajaxurl=" + ajaxurl);
        var data = {
            'action': 'find_odors'
        };
        j$.ajax({
            type: "POST",
            url: ajaxurl,
            data: data,
            success: function (response) { return _this.onResponse(response); },
            error: function (XMLHttpRequest, textStatus, errorThrown) { return _this.onFail(XMLHttpRequest, textStatus, errorThrown); }
        });
    }
    GetOdorsRequest.prototype.onResponse = function (response) {
        if (response) {
            EventBus.dispatchEvent("ODORS_LOADED", response);
        }
        else {
            EventBus.dispatchEvent("ODORS_LOAD_ERROR", "response is empty");
        }
    };
    GetOdorsRequest.prototype.onFail = function (xhr, status, error) {
        EventBus.dispatchEvent("ODORS_LOAD_ERROR", error);
    };
    return GetOdorsRequest;
}());
//# sourceMappingURL=GetOdorsRequest.js.map