import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogComponent } from './dialog.component';
import { InsertionDirective } from './insertion.directive';
import { SettingsComponent } from './settings/settings.component';
import { SpielerauswahlComponent } from './spielerauswahl/spielerauswahl.component';
import { NumberpickerComponent } from './numberpicker/numberpicker.component';
import { NeuerSpieltagComponent } from './neuer-spieltag/neuer-spieltag.component';
import { GewinnerauswahlComponent } from './gewinnerauswahl/gewinnerauswahl.component';

@NgModule({
  declarations: [DialogComponent, InsertionDirective],
  imports: [CommonModule],
  entryComponents: [
    DialogComponent, 
    SettingsComponent, 
    SpielerauswahlComponent, 
    NumberpickerComponent,
    NeuerSpieltagComponent,
    GewinnerauswahlComponent
  ]
})
export class DialogModule { }
