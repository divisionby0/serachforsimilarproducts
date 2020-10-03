///<reference path="Odor.ts"/>
///<reference path="lib/collections/KeyMap.ts"/>
///<reference path="lib/events/EventBus.ts"/>
///<reference path="lib/collections/json/MapJsonEncoder.ts"/>
class SimilarFinder{
    private collection:KeyMap<Odor>;
    private currentOdorNum:number = 0;
    private totalOdors:number = 0;

    private maxNoteSimilarityPercentageAllocated:number = 90;
    private minNoteSimilarityPercentageToAllow:number = 19;

    private alreadyCheckedIDs:string[] = new Array();

    constructor(collection:KeyMap<Odor>, maxNoteSimilarityPercentageAllocated:number, minNoteSimilarityPercentageToAllow:number){
        this.collection = collection;
        this.maxNoteSimilarityPercentageAllocated = maxNoteSimilarityPercentageAllocated;
        this.minNoteSimilarityPercentageToAllow = minNoteSimilarityPercentageToAllow;
        
        this.totalOdors = this.collection.size();
    }
    
    public find():any{
        this.findNotesSimilarity();

        console.log("Similar finder job complete");
        //EventBus.dispatchEvent("SIMILAR_FINDING_COMPLETE", null);
    }

    private findNotesSimilarity():void{
        console.log("findNotesSimilarity");
        this.currentOdorNum = 0;
        var odorsIterator:KeyMapIterator = this.collection.getIterator();

        while(odorsIterator.hasNext()){
            var currentOdor:Odor = odorsIterator.next();

            var currentOdorId:string = currentOdor.getId();
            var alreadyChecked:boolean = this.alreadyCheckedIDs.indexOf(currentOdorId)!=-1;

            if(!alreadyChecked){
                EventBus.dispatchEvent("LOG", {logText:"Finding similar by notes for ", name:currentOdor.getName(), currentNum:this.currentOdorNum, total:this.totalOdors});

                this.findSimilarByNote(currentOdor);
                this.currentOdorNum++;
            }
        }
    }

    private findSimilarByNote(currentOdor:Odor):void{
        var similarOdorsIterator:KeyMapIterator = this.collection.getIterator();
        
        var currentOdorTotalNotes:number = currentOdor.getNotes().length;
        var singleNoteSimilarityPercent:number = Math.round(this.maxNoteSimilarityPercentageAllocated/currentOdorTotalNotes);

        while(similarOdorsIterator.hasNext()){

            var possibleSimilarOdor:Odor = similarOdorsIterator.next();
            var possibleSimilarOdorId:string = possibleSimilarOdor.getId();

            var alreadyChecked:boolean = this.alreadyCheckedIDs.indexOf(possibleSimilarOdorId)!=-1;

            if(!alreadyChecked){
                if(currentOdor.getId()!=possibleSimilarOdorId){

                    var possibleSimilarOdorNotes:string[] = possibleSimilarOdor.getNotes();
                    var percent:number = this.findNotesSimilarityPercentage(possibleSimilarOdorNotes, currentOdor.getNotes(), singleNoteSimilarityPercent);
                    if(!isNaN(percent) && percent!=0 && percent>=this.minNoteSimilarityPercentageToAllow){

                        // добавляем похожий к эталонному
                        currentOdor.addSimilarOdor(possibleSimilarOdorId, percent, possibleSimilarOdor.getTypes(), possibleSimilarOdor.getNotes());

                        // добавляем эталонный к похожему
                        possibleSimilarOdor.addSimilarOdor(currentOdor.getId(), percent, currentOdor.getTypes(), currentOdor.getNotes());

                        this.alreadyCheckedIDs.push(currentOdor.getId());
                        this.alreadyCheckedIDs.push(possibleSimilarOdorId);
                    }
                }
            }
        }
    }

    private findNotesSimilarityPercentage(odorToCheckNoteCollection:string[], currentOdorNoteCollection:string[], singleNoteSimilarityPercent:number):number{
        var diff:string[] = odorToCheckNoteCollection.diff(currentOdorNoteCollection);
        var total:number = diff.length;
        return total*singleNoteSimilarityPercent;
    }
}
