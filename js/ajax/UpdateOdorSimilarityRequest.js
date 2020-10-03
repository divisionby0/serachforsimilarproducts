///<reference path="../Odor.ts"/>
///<reference path="../lib/events/EventBus.ts"/>
var UpdateOdorSimilarityRequest = (function () {
    function UpdateOdorSimilarityRequest(j$, odorId, similarOdorIDs) {
        this.j$ = j$;
        this.odorId = odorId;
        this.similarOdorIDs = similarOdorIDs;
    }
    UpdateOdorSimilarityRequest.prototype.execute = function () {
        var _this = this;
        this.startTime = new Date();
        var data = {
            'action': 'update_similarity',
            'odorId': this.odorId,
            'similarOdors': JSON.stringify(this.similarOdorIDs)
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
    UpdateOdorSimilarityRequest.prototype.onResponse = function (response) {
        var finishTime = new Date();
        var dif = this.startTime.getTime() - finishTime.getTime();
        var Seconds_from_T1_to_T2 = dif / 1000;
        var Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2);
        EventBus.dispatchEvent("UPDATE_ODOR_SIMILARITY_COMPLETE", Seconds_Between_Dates);
    };
    UpdateOdorSimilarityRequest.prototype.onFail = function (xhr, status, error) {
        EventBus.dispatchEvent("UPDATE_ODOR_SIMILARITY_ERROR", error);
    };
    return UpdateOdorSimilarityRequest;
}());
//# sourceMappingURL=UpdateOdorSimilarityRequest.js.map