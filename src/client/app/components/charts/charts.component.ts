import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import * as _ from "lodash";

import { SocketService } from '../../services/socket.service';
import { Spieltag } from 'src/model/spieltag';
import { Spieler } from 'src/model/spieler';
import { Solo } from 'src/model/solo';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit, OnDestroy {

  colors = [
    'rgb(255, 99, 132)', // red
	  'rgb(153, 102, 255)', // purple
	  'rgb(255, 205, 86)', // yellow
	  'rgb(75, 192, 192)', // green
	  'rgb(54, 162, 235)', // blue
    'rgb(255, 159, 64)', // orange
    'rgb(201, 203, 207)' // grey
  ];
  
  subscribtion: Subscription;
  spieltag: Spieltag;
  spieltagsverlauf: any;
  anzahlGewonnenerRunden: any;
  anzahlSolos: any;

  optionsSpieltagsverlauf = {
    title: {
      display: false
    },
    legend: {
      display: true,
      position: 'top',
      labels: {
        fontColor: 'white'
      }
    },
    scales: {
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Runde',
          fontColor: 'white'
        },
        ticks: {
          fontColor: 'white'
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Punkte',
          fontColor: 'white'
        },
        ticks: {
          fontColor: 'white'
        }
      }]
    }
  };
  optionsAnzahlGewonneneRunden = {
    legend: {
      display: false
    },
    title: {
      display: false      
    },
    scales: {
      xAxes: [{
        ticks: {
          fontColor: 'white'
        }
      }],
      yAxes: [{
        ticks: {
          min: 0,
          stepSize: 1,
          fontColor: 'white'
        }
      }]
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
    const dataset = {"label": ""};
    dataset["data"] = spieltag.spieler.map(s => this.countAnzahlGewonnenerRunden(s));
    dataset["backgroundColor"] = this.colors.slice(0, spieltag.spieler.length);
    newAnzahlGewonnenerRundenData["datasets"] = [dataset];
    this.anzahlGewonnenerRunden = newAnzahlGewonnenerRundenData;

    // Anzahl Solos
    const newAnzahlSolos = {};
    newAnzahlSolos["labels"] = spieltag.spieler.map(s => s.name);
    const datasetSolos = {"label": ""};
    datasetSolos["data"] = spieltag.spieler.map(s => this.countAnzahlGespielteSolos(s));
    datasetSolos["backgroundColor"] = this.colors.slice(0, spieltag.spieler.length);
    newAnzahlSolos["datasets"] = [datasetSolos];
    this.anzahlSolos = newAnzahlSolos;
  }

  private countAnzahlGewonnenerRunden(spieler: Spieler) {
    return this.spieltag.runden.filter(r => r.gewinner.includes(spieler)).length;
  }

  private countAnzahlGespielteSolos(spieler: Spieler) {
    return this.spieltag.runden.filter(r => {
      if (r.spieler.includes(spieler) && r.solo !== Solo.KEIN_SOLO) {
        return (r.reGewinnt && r.gewinner.includes(spieler)) || (!r.reGewinnt && ! r.gewinner.includes(spieler));
      }
    }).length;
  }


}
