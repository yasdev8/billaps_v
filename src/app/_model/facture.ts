export interface Facture {
    idApp:number;
    idBack?:number;
    title:string;
    emetteur?:string;
    dateAjout?:Date;
    dateModif?:Date;
    dateFacture?:Date;
    photoTitle?:string;
    photos?:string;
    photoType:string;
    pdfPath?:string;
    pdf?:any;
    pdfBlob?:any;
    prixTTC?:number;
    prixHT?:number;
}
