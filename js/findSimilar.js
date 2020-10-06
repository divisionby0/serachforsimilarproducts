var j$ = jQuery.noConflict();
console.log("find similar j$=",j$);

j$ ( document ).ready(function() {
    
    // testing
    doTests();
    
    Array.prototype.diff = function(arr2) {
        var ret = [];
        for(var i in this) {
            if(arr2.indexOf(this[i]) > -1){
                ret.push(this[i]);
            }
        }
        return ret;
    };

    Array.prototype.diff1 = function(a) {
        return this.filter(function(i) {return a.indexOf(i) < 0;});
    };

    var currentScreenElement = j$("#currentScreen");

    var currentScreen="notMyPlugin";

    try{
        currentScreen = currentScreenElement.text();
    }
    catch(error){
        console.log("not my plugin");
    }

    if(currentScreen == "searchsimilarodorpluginscreen"){
        j$("#savePluginSettingsButton").click(()=>onSaveClicked());
        j$("#clearButton").click(()=>onClearClicked());

        new SimilarFinderApp(j$);
    }
});

function doTests(){
    /*
    var a1 = ["Белый ирис", "Бергамот", "Герань", "Древесина", "Кардамон", "Кинза", "Кувшинка", "Листья фиалки", "Пачули", "Сандал"];
    var a2 = ["Базилик", "Ветивер", "Герань", "Грейпфрут", "Кардамон", "Кориандр", "Лабданум", "Лаванда", "Мускатный орех", "Пачули", "Табак"];
    */

    var a1 = ["Ирис", "Роза", "Белый мускус"];
    var a2 = ["Ирис", "Сандал", "Белый мускус"];
    //var a2 = ["Базилик", "Ветивер", "Герань", "Грейпфрут", "Кардамон", "Кориандр", "Лабданум", "Лаванда", "Мускатный орех", "Пачули", "Табак"];

    a1.sort();
    a2.sort();

    console.log("А: ",a1);
    console.log("Б: ",a2);

    var diff = findDiff(a1,a2);

    console.log("разница между ними:",diff);

    var totalDifferences = diff.length;

    var maxNotesNum = 0;

    if(a1.length > a2.length){
        maxNotesNum = a1.length;
    }
    else if(a1.length < a1.length){
        maxNotesNum = a2.length;
    }
    else{
        maxNotesNum = a1.length;
    }

    var similarityPercent = 100 - Math.round(totalDifferences*100/maxNotesNum);

    if(similarityPercent < 0){
        similarityPercent = 0;
    }
    console.log("схожесть: "+ similarityPercent+" %");
}

function findDiff(a, b){
    var arrays = Array.prototype.slice.call(arguments);
    var diff = [];

    arrays.forEach(function(arr, i) {
        var other = i === 1 ? a : b;
        arr.forEach(function(x) {
            if (other.indexOf(x) === -1) {
                diff.push(x);
            }
        });
    });

    return diff;
}

function onClearClicked(){
    console.log("clear clicked");
    var data = {
        'action': 'clear_records'
    };
    
    console.log("data=",data);

    j$.ajax({
        type: "POST",
        url: ajaxurl,
        data: data,
        dataType: "text",
        success: (response)=>onClearResponse(response),
        error: (XMLHttpRequest, textStatus, errorThrown)=>onClearFail(XMLHttpRequest, textStatus, errorThrown)
    });
}

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

function onClearResponse(response){
    console.log("clear response:",response);
    alert("Похожие очищены");
}
function onClearFail(XMLHttpRequest, textStatus, errorThrown){
    console.error("onClearFail errorThrown=",errorThrown);
}

function onSaveResponse(response){
    console.log("on save response ",response);
}
function onFail(XMLHttpRequest, textStatus, errorThrown){
    console.error("save error errorThrown=",errorThrown);
}
