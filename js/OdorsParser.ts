///<reference path="Odor.ts"/>
///<reference path="lib/collections/KeyMap.ts"/>
class OdorsParser{
    private data:string;

    constructor(data:string){
        this.data = data;

    }
    
    public parse():KeyMap<Odor>{
        var dataArray:any[] = JSON.parse(this.data);
        console.log("dataArray=",dataArray);
        var collection:KeyMap<any> = new KeyMap<any>("odors");


        var i:number;
        for(i=0;i<dataArray.length; i++){
            var odorData:any = JSON.parse(dataArray[i]);
            var id:string = odorData.id;
            var name:string = odorData.name;
            var permalink:string = odorData.permalink;

            var types:string[] = JSON.parse(odorData.types);
            var notes:string[] = JSON.parse(odorData.notes);

            collection.add(id, new Odor(id, name, types, notes, permalink));
        }

        return collection;

    }
}
