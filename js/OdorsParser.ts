
///<reference path="lib/collections/KeyMap.ts"/>
///<reference path="Odor1.ts"/>
class OdorsParser{
    private data:Odor1[];

    constructor(data:any[]){
        this.data = data;
    }
    
    public parse():Odor1[]{
        console.log("FUCK parser");
        var collection:any[] = new Array();

        var i:number;
        for(i=0; i<this.data.length; i++){
            var odorData:any = this.data[i];
            var id:string = odorData.id;
            var name:string = odorData.title;
            
            odorData.notes.sort();

            console.log("odor data notes:",odorData.notes);

            var newOdor:Odor1 = new Odor1(id, name, odorData.notes);
            newOdor.clearSimilarOdors();
            console.log("parsed new odor :",newOdor);

            collection.push(newOdor);
        }
        console.log("parsed collection: ",collection);


        return collection;
    }
}
