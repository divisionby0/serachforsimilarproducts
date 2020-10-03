var j$ = jQuery.noConflict();
console.log("find similar j$=",j$);

j$ ( document ).ready(function() {

    Array.prototype.diff = function(arr2) {
        var ret = [];
        for(var i in this) {
            if(arr2.indexOf(this[i]) > -1){
                ret.push(this[i]);
            }
        }
        return ret;
    };

    var currentScreenElement = j$("#currentScreen");
    console.log("currentScreenElement=",currentScreenElement);

    var currentScreen="notMyPlugin";

    try{
        currentScreen = currentScreenElement.text();
    }
    catch(error){
        console.log("not my plugin");
    }

    console.log("currentScreen="+currentScreen);

    if(currentScreen == "searchsimilarodorpluginscreen"){
        j$("#savePluginSettingsButton").click(()=>onSaveClicked());

        new SimilarFinderApp(j$);
    }
});

function onSaveClicked(){
    console.log("save clicked");
    var data = {
        'action': 'save_plugin_settings',
        'maxNoteSimilarityPercentageAllocated':j$("#maxNoteSimilarityPercentageAllocatedInput").val(),
        'minNoteSimilarityPercentageToAllow':j$("#minNoteSimilarityPercentageToAllowInput").val()
    };

    j$.ajax({
        type: "POST",
        url: ajaxurl,
        data: data,
        dataType: "text",
        success: (response)=>onSaveResponse(response),
        error: (XMLHttpRequest, textStatus, errorThrown)=>onFail(XMLHttpRequest, textStatus, errorThrown)
    });
}

function onSaveResponse(response){
    console.log("on save response ",response);
}
function onFail(XMLHttpRequest, textStatus, errorThrown){
    console.error("save error errorThrown=",errorThrown);
}
