import {Facture} from './facture';

export interface FacturesArbreMonth {
    monthNum:number;
    month:string;
    listFactures:Array<Facture>;
}

export interface FacturesArbreYear {
    yearNum:number;
    liste:Array<FacturesArbreMonth>;
}
