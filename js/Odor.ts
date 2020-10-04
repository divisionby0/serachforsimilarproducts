///<reference path="lib/collections/KeyMap.ts"/>
///<reference path="lib/collections/iterators/KeyMapIterator.ts"/>
class Odor{
    
    private id:string;
    private name:string;
    private notes:string[];
    private similarOdors:any[];
    private maxSimilarOdorsToAdd:number = 9;
    private currentMaxPercentage:number = 0;
    private currentMaxPercentageId:string = "-1";

    constructor(id:string, name:string, notes:string[]){
        this.id = id;
        this.name = name;
        this.notes = notes;
        this.similarOdors = new Array();
    }

    public getId():string{
        return this.id;
    }
    public getName():string{
        return this.name;
    }
    public getNotes():string[] {
        return this.notes;
    }
    
    public addSimilarOdor(id:string, percentageOfSimilarity:number):void{
        this.similarOdors.push({id:id, perc:percentageOfSimilarity});

        this.similarOdors.sort(function(a, b){return parseInt(b.perc) - parseInt(a.perc)});

        if(this.similarOdors.length > this.maxSimilarOdorsToAdd){
            this.similarOdors = this.similarOdors.slice(0, this.maxSimilarOdorsToAdd);
        }
    }

    public hasSimilarOdors():boolean{
        return this.similarOdors.length>0;
    }

    public getSimilarOdors():Odor[]{
        return this.similarOdors;
    }
}
