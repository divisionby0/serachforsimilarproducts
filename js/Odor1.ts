///<reference path="lib/collections/KeyMap.ts"/>
///<reference path="lib/collections/iterators/KeyMapIterator.ts"/>
class Odor1{
    private id:string;
    private name:string;
    private notes:string[];
    private similars:any[];
    private maxSimilarOdorsToAdd:number = 9;
    private ver:string = "0.0.1";

    constructor(id:string, name:string, notes:string[]){
        this.id = id;
        this.name = name;
        this.notes = notes;
        this.similars = new Array();

        console.log("Im odor ver=",this.ver," ",this, "my similars:",this.similars);
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
        console.log("addSimilarOdor id=",id,"perc",percentageOfSimilarity);
        this.similars.push({id:id, perc:percentageOfSimilarity});

        this.similars.sort(function(a, b){return parseInt(b.perc) - parseInt(a.perc)});

        if(this.similars.length > this.maxSimilarOdorsToAdd){
            this.similars = this.similars.slice(0, this.maxSimilarOdorsToAdd);
        }
    }

    public clearSimilarOdors():void{
        this.similars = new Array();
    }
    
    public hasSimilarOdors():boolean{
        return this.similars.length>0;
    }

    public getSimilarOdors():Odor1[]{
        return this.similars;
    }
}
