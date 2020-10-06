///<reference path="Odor1.ts"/>
class IteratingOdorsFinder{
    private totalOdors:number = 0;
    private minNoteSimilarityPercentageToAllow:number = 19;
    private maxSimilarOdorsToAdd:number = 9;

    private updateCollection:any[] = new Array();
    private j$:any;

    constructor(j$:any, collection:any[]){
        //console.log("IteratingOdorsFinder collection:",collection);
        //this.collection = collection;
        this.j$ = j$;
        this.totalOdors = collection.length;

        for(var i:number = 0; i < this.totalOdors; i++){
            var odorData:any = collection[i];
            var id:string = odorData.id;
            var name:string = odorData.name;
            var notes:string = odorData.notes;

            this.updateCollection.push({id:id, name:name, notes:notes, similars:new Array()});
        }

        //console.log("collection before update:", JSON.parse(JSON.stringify(this.updateCollection)));
    }

    public start():any[]{

        var i:number;
        var j:number;
        for(i = 0; i<this.updateCollection.length-1; i++){
            this.findSimilars(i);
        }

        var newCollection:any[] = new Array();

        for(var i:number = 0; i < this.updateCollection.length; i++){
            var odorData:any = this.updateCollection[i];
            var similars:any[] = odorData.similars;
            var totalSimilars:number = similars.length;

            similars.sort(function(a, b){return parseInt(b.perc) - parseInt(a.perc)});

            var id:string = odorData.id;
            var newOdor:any = {id:id, similars:new Array()};


            //console.log("similars:",similars);
            //console.log("this.maxSimilarOdorsToAdd="+this.maxSimilarOdorsToAdd);


            if(totalSimilars > this.maxSimilarOdorsToAdd){
                for(j=0; j<this.maxSimilarOdorsToAdd; j++){
                    var similarData:any = similars[j];
                    newOdor.similars.push(similarData);
                }
                similars = similars.slice(0, this.maxSimilarOdorsToAdd);
            }
            else{
                for(j=0; j<totalSimilars; j++){
                    var similarData:any = similars[j];
                    newOdor.similars.push(similarData);
                }
            }
            //console.log("similars after cut:",similars);

            newCollection.push(newOdor);
        }

        return newCollection;
    }

    private findSimilars(indexToCheck:number):void{

        var j:number;
        var totalIterations:number = this.updateCollection.length;

        var sampleId:number = parseInt(this.updateCollection[indexToCheck].id);

        //console.log("\nfindSimilars for "+sampleId+" ...");
        //console.log("notes ",this.updateCollection[indexToCheck].notes);

        for(j=indexToCheck+1; j<totalIterations; j++){

            var idToCheck:number = parseInt(this.updateCollection[j].id);

            var notes1:string[] = this.updateCollection[indexToCheck].notes;
            var notes2:string[] = this.updateCollection[j].notes;
            notes1.sort();
            notes2.sort();

            /*
            console.log("   id to check "+this.updateCollection[j].id);
            console.log("   notes1:",notes1);
            console.log("   notes2:",notes2);
            */

            notes1.sort();
            notes2.sort();

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

            //console.log("differenceArray=",differenceArray);
            //console.log("totalDifferences=",totalDifferences);

            // пропорция
            // 100% похожесть = макс кол-во нот (выбрать из двух один с бОльшим кол-вом)
            // differenceArray.length = ?%

            var similarityPercent:number = 100-Math.round(totalDifferences*100/maxNotesNum);
            //console.log("similarityPercent=",similarityPercent);

            if(similarityPercent >= this.minNoteSimilarityPercentageToAllow){

                //console.log("adding to similarities array for both odors");

                //console.log("odor id "+this.updateCollection[indexToCheck].id+" add similar odor "+this.updateCollection[j].id+" perc:"+similarityPercent);
                this.updateCollection[indexToCheck].similars.push({id:this.updateCollection[j].id, perc:similarityPercent});

                //console.log("odor id "+this.updateCollection[j].id+" add similar odor "+this.updateCollection[indexToCheck].id+" perc:"+similarityPercent);
                //this.updateCollection[j].similars.push({id:this.updateCollection[indexToCheck].id, perc:similarityPercent});
            }
        }
    }

    private findDifference(a:string[], b:string[]):string[]{

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

        
        //return a1.diff1(a2);

        //return difference;
        /*
        var result:string[] = [];

        var i:number;
        var j:number;

        if(arr2.length >= arr1.length){

        }
        else{
            arr2.forEach( function (element) {
                if ( !~arr1.indexOf(element) ) result.push(element)
            });
        }
        */

        /*
        var result:string[] = [];

        if(arr2.length >= arr1.length){
            arr1.forEach( function (element) {
                if ( !~arr2.indexOf(element) ) result.push(element)
            });
        }
        else{
            arr2.forEach( function (element) {
                if ( !~arr1.indexOf(element) ) result.push(element)
            });
        }
        */

        //return result;
    }
    
    
    private debugCollection():void{
        console.log("collection after find:");
        console.log(this.updateCollection);
    }

    private getOdorById(id:number):any{
        var i:number;
        var total:number = this.updateCollection.length;
        for(i=0; i<total; i++){
            var current:any = this.updateCollection[i];
            if(parseInt(current.id) == id){
                return current;
            }
        }
    }
    
}
