import {Facture} from './facture';

export interface FacturesArbreMonth {
    open:boolean;
    monthNum:number;
    month:string;
    listFactures:Array<Facture>;
}

export interface FacturesArbreYear {
    open:boolean;
    yearNum:number;
    numberFact:number;
    liste:Array<FacturesArbreMonth>;
}
