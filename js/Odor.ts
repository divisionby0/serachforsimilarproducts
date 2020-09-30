class Odor{
    
    private id:string;
    private name:string;
    private types:string[];
    private notes:string[];
    private permalink:string;

    constructor(id:string, name:string, types:string[], notes:string[], permalink:string){
        this.id = id;
        this.name = name;
        this.types = types;
        this.notes = notes;
        this.permalink = permalink;
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
    public getPermalink():string{
        return this.permalink;
    }
}
