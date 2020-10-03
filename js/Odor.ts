///<reference path="lib/collections/KeyMap.ts"/>
///<reference path="lib/collections/iterators/KeyMapIterator.ts"/>
class Odor{
    
    private id:string;
    private name:string;
    private types:string[];
    private notes:string[];
    private similarOdors:KeyMap<any>;

    constructor(id:string, name:string, types:string[], notes:string[]){
        this.id = id;
        this.name = name;
        this.types = types;
        this.notes = notes;
        this.similarOdors = new KeyMap<any>("similarOdors");
    }

    public getId():string{
        return this.id;
    }
    public getName():string{
        return this.name;
    }
    public getTypes():string[]{
        return this.types;
    }
    public getNotes():string[]{
        return this.notes;
    }
    
    public removeSimilarOdor(id:string):void{
        if(this.similarOdors.has(id)){
            this.similarOdors.remove(id);
        }
    }
    
    public addSimilarOdor(id:string, percentageOfSimilarity:number, types:string[], notes:string[]):void{
        if(!this.similarOdors.has(id)){
            this.similarOdors.add(id, {id:id, percentageOfSimilarity:percentageOfSimilarity, types, notes});
        }
        else{
            console.error("similar with id " + id + "already exists with perc:"+this.similarOdors.get(id).percentageOfSimilarity);   
        }
    }
    
    public hasSimilarOdors():boolean{
        return this.similarOdors.size()>0;
    }

    public increaseSimilarOdorPercentage(id:string, percentage:number):void{
        var similarOdor:any = this.similarOdors.get(id);
        similarOdor.percentageOfSimilarity+=percentage; 
    }
    
    public getSimilarOdorsIterator():KeyMapIterator{
        return this.similarOdors.getIterator();
    }
}
