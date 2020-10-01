///<reference path="Odor.ts"/>
///<reference path="lib/collections/KeyMap.ts"/>
class OdorsParser{
    private data:any[];

    constructor(data:any[]){
        this.data = data;
    }
    
    public parse():KeyMap<Odor>{
        var collection:KeyMap<any> = new KeyMap<any>("odors");

        var i:number;
        for(i=0; i<this.data.length; i++){
            var odorData:any = this.data[i];
            var id:string = odorData.id;
            var name:string = odorData.title;

            odorData.types.sort();
            odorData.notes.sort();
            
            collection.add(id, new Odor(id, name, odorData.types, odorData.notes));
        }

        return collection;

    }
}
