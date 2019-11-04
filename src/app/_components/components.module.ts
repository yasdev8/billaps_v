import {NgModule} from "@angular/core";
import {FooterNavComponent} from "./footer-nav/footer-nav.component";
import {IonicModule} from "@ionic/angular";
import {CommonModule} from "@angular/common";

@NgModule({
    declarations: [FooterNavComponent],
    imports: [
        IonicModule,
        CommonModule
    ],
    exports: [FooterNavComponent]
})
export class ComponentsModule {}
