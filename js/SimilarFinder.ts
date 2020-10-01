///<reference path="Odor.ts"/>
///<reference path="lib/collections/KeyMap.ts"/>
///<reference path="lib/events/EventBus.ts"/>
class SimilarFinder{
    
    private collection:KeyMap<Odor>;
    private currentOdorNum:number = 0;
    private totalOdors:number = 0;

    private maxTypeSimilarityPercentageAllocated:number = 50;
    private maxNoteSimilarityPercentageAllocated:number = 40;
    private minPercentageTypeSimilarityToAllow:number = 0;

    constructor(collection:KeyMap<Odor>){
        this.collection = collection;
        this.totalOdors = this.collection.size();
    }
    
    public find():any{
        this.findTypesSimilarity();
        this.findNotesSimilarity();
        console.log("Similar finder job complete");
    }

    private findTypesSimilarity():void{
        var odorsIterator:KeyMapIterator = this.collection.getIterator();
        while(odorsIterator.hasNext()){
            var currentOdor:Odor = odorsIterator.next();
            EventBus.dispatchEvent("LOG", {logText:"Finding similar by types for ", name:currentOdor.getName(), currentNum:this.currentOdorNum, total:this.totalOdors});

            this.findSimilarByType(currentOdor);
            this.currentOdorNum++;
        }
    }

    private findNotesSimilarity():void{
        console.log("findNotesSimilarity");
        this.currentOdorNum = 0;
        var odorsIterator:KeyMapIterator = this.collection.getIterator();

        while(odorsIterator.hasNext()){
            var currentOdor:Odor = odorsIterator.next();

            if(currentOdor.hasSimilarOdors()){
                EventBus.dispatchEvent("LOG", {logText:"Finding similar by notes for ", name:currentOdor.getName(), currentNum:this.currentOdorNum, total:this.totalOdors});

                this.findSimilarByNote(currentOdor);
                this.currentOdorNum++;
            }
        }
    }

    private findSimilarByType(currentOdor:Odor):any{
        //console.log("findSimilarByType currentOdor=",currentOdor);

        var odorsToCheckIterator:KeyMapIterator = this.collection.getIterator();

        var currentOdorTypeCollection:string[] = currentOdor.getTypes();
        var currentOdorTotalTypes:number = currentOdorTypeCollection.length;

        var singleTypeSimilarityPercent:number = Math.round(this.maxTypeSimilarityPercentageAllocated/currentOdorTotalTypes);

        // проходимся заново по всей коллекции
        while(odorsToCheckIterator.hasNext()){

            // получаем запах из коллекции
            var odorToCheck:Odor = odorsToCheckIterator.next();
            var odorToCheckSimilarityPercentage:number = 0;

            var odorToCheckTypeCollection:string[] = odorToCheck.getTypes();

            if(odorToCheck.getId()!=currentOdor.getId()){
                odorToCheckSimilarityPercentage = this.findTypeSimilarityPercentage(odorToCheckTypeCollection, currentOdorTypeCollection, singleTypeSimilarityPercent);
            }

            if(odorToCheckSimilarityPercentage > this.minPercentageTypeSimilarityToAllow){
                currentOdor.addSimilarOdor(odorToCheck.getId(), odorToCheckSimilarityPercentage, odorToCheck.getTypes(), odorToCheck.getNotes());
            }
        }
    }

    private findSimilarByNote(currentOdor:Odor):void{
        console.log("\nfindSimilarByNote currentOdor="+currentOdor.getName());
        console.log(currentOdor);
        
        var similarKeys:string[] = currentOdor.getSimilarKeys();
        
        var currentOdorTotalNotes:number = currentOdor.getNotes().length;
        var singleNoteSimilarityPercent:number = Math.round(this.maxNoteSimilarityPercentageAllocated/currentOdorTotalNotes);

        for(var k:number = 0; k < similarKeys.length; k++){
            console.log(similarKeys[k]);
        }

        var similarOdorsIterator:KeyMapIterator = currentOdor.getSimilarOdorsIterator();
        while(similarOdorsIterator.hasNext()){

            var similarOdorData:any = similarOdorsIterator.next();
            
            console.log("similarOdorData = ",similarOdorData);

            var similarOdorId:string = similarOdorData.id;
            var similarOdor:Odor = this.collection.get(similarOdorId);
            var similarOdorName:string = similarOdor.getName();

            console.log("possible similar odor "+similarOdorId+" : "+similarOdorName);
            var similarOdorPercentageOfSimilarity:number = similarOdorData.percentageOfSimilarity;
            var similarOdorNotes:string[] = similarOdorData.notes;
            
            //console.log("similar odor ",similarOdorName," init PercentageOfSimilarity=",similarOdorPercentageOfSimilarity," notes:",similarOdorNotes, "current odor notes:",currentOdor.getNotes());

            var correctionPercent:number = this.findNotesSimilarityPercentage(similarOdorNotes, currentOdor.getNotes(), singleNoteSimilarityPercent);

            if(!isNaN(correctionPercent) && correctionPercent!=0){
                //console.log("correctionPercent="+correctionPercent);
                similarOdorPercentageOfSimilarity+=correctionPercent;
                currentOdor.increaseSimilarOdorPercentage(similarOdorId.toString(), similarOdorPercentageOfSimilarity);
            }
            else if(correctionPercent == 0){
                // нет ни одного совпадения по нотам - нужно исключить similarOdor из currentOdor
                currentOdor.removeSimilarOdor(similarOdorId.toString());
            }
        }
    }



    private findNotesSimilarityPercentage(odorToCheckNoteCollection:string[], currentOdorNoteCollection:string[], singleNoteSimilarityPercent:number):number{
        var j:number;
        var k:number;
        var odorToCheckSimilarityPercentage:number = 0;
        var odorToCheckNotesTotal:number = odorToCheckNoteCollection.length;
        var currentOdorNotesTotal:number = currentOdorNoteCollection.length;


        for(j = 0; j < odorToCheckNotesTotal; j++){
            var odorToCheckCurrentNote:string = odorToCheckNoteCollection[j];

            for(k = 0; k < currentOdorNotesTotal; k++){
                var currentOdorCurrentNote:string = currentOdorNoteCollection[k];

                if(currentOdorCurrentNote == odorToCheckCurrentNote){
                    odorToCheckSimilarityPercentage+=singleNoteSimilarityPercent;
                }
            }
        }

        //console.log("odorToCheckSimilarityPercentage="+odorToCheckSimilarityPercentage);

        var percentageCorrection:number = 1;
        if(odorToCheckNotesTotal!=currentOdorNotesTotal){
            var maxTypesNum:number;
            var minTypesNum:number;

            if(odorToCheckNotesTotal > currentOdorNotesTotal){
                maxTypesNum = odorToCheckNotesTotal;
                minTypesNum = currentOdorNotesTotal;
            }
            else{
                maxTypesNum = currentOdorNotesTotal;
                minTypesNum = odorToCheckNotesTotal;
            }
        }

        //var correctedPercentage:number = percentageCorrection*100/odorToCheckSimilarityPercentage;
        percentageCorrection = maxTypesNum/minTypesNum;
        odorToCheckSimilarityPercentage = odorToCheckSimilarityPercentage/percentageCorrection;

        return Math.round(odorToCheckSimilarityPercentage);
    }

    private findTypeSimilarityPercentage(odorToCheckTypeCollection:string[], currentOdorTypeCollection:string[], singleTypeSimilarityPercent:number):number{
        var j:number;
        var k:number;
        var odorToCheckSimilarityPercentage:number = 0;
        var odorToCheckTypesTotal:number = odorToCheckTypeCollection.length;
        var currentOdorTotalTypes:number = currentOdorTypeCollection.length;


        for(j = 0; j < odorToCheckTypesTotal; j++){
            var odorToCheckCurrentType:string = odorToCheckTypeCollection[j];


            for(k = 0; k < currentOdorTotalTypes; k++){
                var currentOdorCurrentType:string = currentOdorTypeCollection[k];

                if(currentOdorCurrentType == odorToCheckCurrentType){
                    odorToCheckSimilarityPercentage+=singleTypeSimilarityPercent;
                }
            }
        }

        // TODO find difference in types num
        var percentageCorrection:number = 1;
        if(odorToCheckTypesTotal!=currentOdorTotalTypes){
            var maxTypesNum:number;
            var minTypesNum:number;

            if(odorToCheckTypesTotal > currentOdorTotalTypes){
                maxTypesNum = odorToCheckTypesTotal;
                minTypesNum = currentOdorTotalTypes;
            }
            else{
                maxTypesNum = currentOdorTotalTypes;
                minTypesNum = odorToCheckTypesTotal;
            }
            //percentageCorrection = minTypesNum*100/maxTypesNum;
        }

        //var correctedPercentage:number = percentageCorrection*100/odorToCheckSimilarityPercentage;
        percentageCorrection = maxTypesNum/minTypesNum;
        odorToCheckSimilarityPercentage = odorToCheckSimilarityPercentage/percentageCorrection;

        //return odorToCheckSimilarityPercentage;
        return Math.round(odorToCheckSimilarityPercentage);
    }
}
