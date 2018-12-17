import { Component } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/api';
import { DynamicDialogRef } from 'primeng/api';

import { Rules } from 'src/model/rules';

@Component({
  selector: 'app-regelaenderung',
  templateUrl: './regelaenderung.component.html',
  styleUrls: ['./regelaenderung.component.css']
})
export class RegelaenderungComponent {

  rules: Rules;

  constructor(public config: DynamicDialogConfig, 
    public dialog: DynamicDialogRef) {
      const configRules = config.data["rules"] as Rules;
      this.rules = new Rules(
        configRules.maxBoecke,
        configRules.maxBoeckeAtBegin,
        configRules.withSub,
        configRules.herzGehtRumBoecke,
        configRules.gespaltenerArschBoecke,
        configRules.reKontraBoecke);
    }

  onClose() {
    this.dialog.close(this.rules);
  }

  onCancel() {
    this.dialog.close(undefined);
  }

}
