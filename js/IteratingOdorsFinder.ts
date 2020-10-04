///<reference path="Odor.ts"/>
class IteratingOdorsFinder{

    private collection:Odor[];
    /*
    private collection:any[] = new Array(
        {id:0, notes:["1","2","3","4","86"],similarsOdors:new Array()},
        {id:1, notes:["1","0","3","4","7","9"],similarsOdors:new Array()},
        {id:2, notes:["0","2","3","7","1","17","8"],similarsOdors:new Array()},
        {id:3, notes:["1","2","88","4"],similarsOdors:new Array()},
        {id:4, notes:["19","23","32","40"],similarsOdors:new Array()},
        {id:5, notes:["1","0","3","2"],similarsOdors:new Array()}
    );
    */
    private totalOdors:number = 0;
    private minNoteSimilarityPercentageToAllow:number = 19;

    private checkedDirections:string[] = new Array();

    constructor(collection:any[]){
        this.collection = collection;
        this.totalOdors = this.collection.length;
    }

    public start():void{
        var i:number;
        var j:number;
        for(i = 0; i<this.collection.length-1; i++){
            this.findSimilars(i);
        }

        //this.debugCollection();
    }

    private findSimilars(indexToCheck:number):void{
        var j:number;
        var totalIterations:number = this.collection.length;

        for(j=indexToCheck+1; j<totalIterations; j++){

            var notes1:string[] = this.collection[indexToCheck].getNotes();
            var notes2:string[] = this.collection[j].getNotes();

            notes1.sort();
            notes2.sort();

            var directionForward:string = this.collection[indexToCheck].getId()+"->"+this.collection[j].getId();
            var directionBackward:string = this.collection[j].getId()+"->"+this.collection[indexToCheck].getId();
            var directions:string = directionForward+","+directionBackward;

            var directionForwardAlreadyChecked:boolean = this.checkedDirections.indexOf(directionForward)!=-1;
            var directionForwardBackwardChecked:boolean = this.checkedDirections.indexOf(directionBackward)!=-1;

            if(directionForwardAlreadyChecked != true || directionForwardBackwardChecked != true){
                var maxNotesNum:number = 0;
                if(notes1.length > notes2.length){
                    maxNotesNum = notes1.length;
                }
                else if(notes1.length < notes2.length){
                    maxNotesNum = notes2.length;
                }
                else{
                    maxNotesNum = notes1.length;
                }

                var differenceArray:string[] = this.findDifference(notes1, notes2);
                var totalDifferences:number = differenceArray.length;

                // пропорция
                // 100% похожесть = макс кол-во нот (выбрать из двух один с бОльшим кол-вом)
                // differenceArray.length = ?%

                var similarityPercent:number = 100-Math.round(totalDifferences*100/maxNotesNum);
                
                if(similarityPercent >= this.minNoteSimilarityPercentageToAllow){
                    this.collection[indexToCheck].addSimilarOdor(this.collection[j].getId(), similarityPercent);
                    this.collection[j].addSimilarOdor(this.collection[indexToCheck].getId(), similarityPercent);
                }
            }
        }
    }

    private findDifference(arr1:string[], arr2:string[]):string[]{
        var result:string[] = [];
        arr1.forEach( function (element) {
            if ( !~arr2.indexOf(element) ) result.push(element)
        });
        return result;
    }
    
    
    private debugCollection():void{
        for(var i=0; i<this.collection.length; i++){
            var currentOdor:any = this.collection[i];
            console.log("\nODOR: ",currentOdor.id,"  notes:",currentOdor.notes);
            console.log("Similars:");

            var similars:any[] = currentOdor.similarsOdors;
            if(similars){
                var totalSimilarOdors:number = similars.length;
                for(var j=0; j<totalSimilarOdors; j++){

                    var currentSimilarOdorData:any = similars[j];
                    var currentSimilarOdorId:number = currentSimilarOdorData.id;
                    var currentSimilarOdor:any = this.getOdorById(currentSimilarOdorId);
                    var currentSimilarOdorNotes:string[] = currentSimilarOdor.notes;
                    var currentSimilarOdorSimilarityPercent:string[] = currentSimilarOdorData.perc;

                    console.log("    ID:",currentSimilarOdorId," notes:",currentSimilarOdorNotes, " similarity:",currentSimilarOdorSimilarityPercent,"%");
                }
            }
            else{
                console.log("no similars");
            }
        }
    }

    private getOdorById(id:number):any{
        var i:number;
        var total:number = this.collection.length;
        for(i=0; i<total; i++){
            var current:any = this.collection[i];
            if(parseInt(current.id) == id){
                return current;
            }
        }
    }
    
}
