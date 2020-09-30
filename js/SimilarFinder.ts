///<reference path="Odor.ts"/>
///<reference path="lib/collections/KeyMap.ts"/>
///<reference path="lib/collections/iterators/MapIterator.ts"/>
///<reference path="lib/events/EventBus.ts"/>
class SimilarFinder{
    
    private collection:KeyMap<Odor>;
    private currentOdorNum:number = 0;
    private totalOdors:number = 0;
    
    constructor(collection:KeyMap<Odor>){
        this.collection = collection;
        this.totalOdors = this.collection.size();
    }
    
    public find():any{
        var odorsIterator:MapIterator = this.collection.getIterator();
        while(odorsIterator.hasNext()){
            var currentOdor:Odor = odorsIterator.next();
            EventBus.dispatchEvent("LOG", {logText:"Finding similar for ", name:currentOdor.getName(), currentNum:this.currentOdorNum, total:this.totalOdors});
            console.log("current odor: ",currentOdor);
            
            this.findSimilarByType(currentOdor);

            this.currentOdorNum++;
        }
    }
    
    private findSimilarByType(currentOdor:Odor):any{
        
    }
}
