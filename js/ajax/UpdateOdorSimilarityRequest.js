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
        var data = {
            'action': 'update_similarity',
            'odorId': this.odorId,
            'similarOdors': JSON.stringify(this.similarOdorIDs)
        };
        console.log("data=", data);
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
        console.log("Update similar response:", response);
        if (response) {
            if (response.result == "1") {
                EventBus.dispatchEvent("UPDATE_ODOR_SIMILARITY_COMPLETE", "");
            }
            else if (response.error) {
                EventBus.dispatchEvent("UPDATE_ODOR_SIMILARITY_ERROR", response.error);
            }
        }
        else {
            EventBus.dispatchEvent("UPDATE_ODOR_SIMILARITY_ERROR", "response is empty");
        }
    };
    UpdateOdorSimilarityRequest.prototype.onFail = function (xhr, status, error) {
        EventBus.dispatchEvent("UPDATE_ODOR_SIMILARITY_ERROR", error);
    };
    return UpdateOdorSimilarityRequest;
}());
//# sourceMappingURL=UpdateOdorSimilarityRequest.js.map