import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { RundenlisteComponent } from "./rundenliste/rundenliste.component";
import { RundeComponent } from "./runde/runde.component";

const routes: Routes = [
  { path: "rundenliste", component: RundenlisteComponent },
  { path: "runde", component: RundeComponent },
  { path: "**", component: RundenlisteComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes)],
  exports: [
    RouterModule
  ],
})
export class AppRoutingModule { }
