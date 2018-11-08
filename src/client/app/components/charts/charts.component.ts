import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import * as _ from "lodash";

import { SocketService } from '../../services/socket.service';
import { Spieltag } from 'src/model/spieltag';
import { Spieler } from 'src/model/spieler';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit, OnDestroy {

  subscribtion: Subscription;
  colors = [
    'rgb(255, 99, 132)', // red
	  'rgb(153, 102, 255)', // purple
	  'rgb(255, 205, 86)', // yellow
	  'rgb(75, 192, 192)', // green
	  'rgb(54, 162, 235)', // blue
    'rgb(255, 159, 64)', // orange
    'rgb(201, 203, 207)' // grey
  ];
  spieltag: Spieltag;
  spieltagsverlauf: any;
  optionsSpieltagsverlauf = {
    title: {
        display: true,
        text: 'Punkteverlauf des Spieltags',
        fontSize: 16
    },
    legend: {
        position: 'top'
    },
    steppedLine : true
  };
  anzahlGewonnenerRunden: any;
  optionsAnzahlGewonnenerRunden = {
    title: {
        display: true,
        text: 'Anzahl gewonnener Runden',
        fontSize: 16
    },
    legend: {
        position: 'top'
    }
  };

  constructor(public socketService: SocketService, private router: Router) { }

  ngOnInit() {
    this.subscribtion = this.socketService.updatedSpieltag.subscribe(spieltag => this.calcData(spieltag));
  }

  ngOnDestroy() {
    if (this.subscribtion) {
      this.subscribtion.unsubscribe();
    }
  }

  toRundenliste() {
    this.router.navigate(["rundenliste"], {skipLocationChange: true});
  }

  private calcData(spieltag: Spieltag) {    
    this.spieltag = spieltag;
    const gespielteRunden = spieltag.runden.filter(r => r.isBeendet);

    // Spieltagsverlauf
    const newSpieltagsverlaufData = {};
    newSpieltagsverlaufData["labels"] = gespielteRunden.map(r => r.nr.toString());
    const datasetsSpieltagsverlauf = [];
    spieltag.spieler.forEach(s => {
      const dataset = {};     
      dataset["label"] = s.name;      
      dataset["data"] = gespielteRunden.map(r => spieltag.getPunktestand(r, s));      
      dataset["fill"] = false;      
      datasetsSpieltagsverlauf.push(dataset);
    });
    _.forEach(datasetsSpieltagsverlauf, (value, index) => value["borderColor"] = this.colors[index]);
    newSpieltagsverlaufData["datasets"] = datasetsSpieltagsverlauf;
    this.spieltagsverlauf = newSpieltagsverlaufData;

    // Anzahl gewonnene Runden
    const newAnzahlGewonnenerRundenData = {};
    newAnzahlGewonnenerRundenData["labels"] = spieltag.spieler.map(s => s.name);
    const dataset = {};
    dataset["data"] = [];
    spieltag.spieler.forEach(s => {
      dataset["data"].push(spieltag.getPunktestand(spieltag.aktuelleRunde, s));      
    });
    dataset["backgroundColor"] = this.colors.slice(0, spieltag.spieler.length);
   
    newAnzahlGewonnenerRundenData["datasets"] = [dataset];
    this.anzahlGewonnenerRunden = newAnzahlGewonnenerRundenData;
  }


}
