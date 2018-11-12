import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogComponent } from './dialog.component';
import { InsertionDirective } from './insertion.directive';
import { SettingsComponent } from '../components/settings/settings.component';

@NgModule({
  declarations: [DialogComponent, InsertionDirective],
  imports: [CommonModule],
  entryComponents: [DialogComponent, SettingsComponent]
})
export class DialogModule { }
