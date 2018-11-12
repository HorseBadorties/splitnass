import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogComponent } from './dialog.component';
import { InsertionDirective } from './insertion.directive';
import { SettingsComponent } from '../components/settings/settings.component';
import { SpielerauswahlComponent } from '../components/spielerauswahl/spielerauswahl.component';

@NgModule({
  declarations: [DialogComponent, InsertionDirective],
  imports: [CommonModule],
  entryComponents: [DialogComponent, SettingsComponent, SpielerauswahlComponent]
})
export class DialogModule { }
