///<reference path="Odor.ts"/>
///<reference path="lib/collections/KeyMap.ts"/>
class OdorsParser{
    private data:any[];

    constructor(data:any[]){
        this.data = data;
    }
    
    public parse():KeyMap<Odor>{
        var collection:KeyMap<Odor> = new KeyMap<Odor>("odors");

        var i:number;
        for(i=0; i<this.data.length; i++){
            var odorData:any = this.data[i];
            var id:string = odorData.id;
            var name:string = odorData.title;
            
            odorData.notes.sort();

            var newOdor:Odor = new Odor(id, name, odorData.notes);
            collection.add(id, newOdor);
        }

        return collection;
    }
}
