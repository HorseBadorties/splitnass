import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import * as _ from "lodash";

import { Spieltag } from 'src/model/spieltag';
import { SpieltagService } from '../../services/spieltag.service';
import { playerColors } from './colors';
import { Spieler } from 'src/model/spieler';
import { formatDate } from '../../util';
import { Runde } from 'src/model/runde';
import { Solo } from 'src/model/solo';

@Component({
  selector: 'app-global-charts',
  templateUrl: './global-charts.component.html',
  styleUrls: ['./global-charts.component.css']
})
export class GlobalChartsComponent implements OnInit, OnDestroy {
  subscribtion: Subscription;
  spieltage: Array<Spieltag>;

  punkte: any;
  gewonneneSpieltage: any;
  solos: any;
  rundenProSpieltag: any;
  punkteProSpieltag: any;

  constructor(
    public spieltagService: SpieltagService, 
    private location: Location) { }

  ngOnInit() {
    this.subscribtion = this.spieltagService.listSpieltage().subscribe(_spieltage => {
      const data = [];
      _spieltage.forEach(s => data.push(Spieltag.fromJSON(JSON.stringify(s))));            
      this.calcData(data);
    });
  }

  ngOnDestroy() {
    if (this.subscribtion) {
      this.subscribtion.unsubscribe();
    }
  }

  navigateBack() {
    this.location.back();
  }

  optionsPunkte = {
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
  }

  optionsGewonneneSpieltage = {
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

  optionsSolos = {
    legend: {
      display: true,
      position: 'left',
      labels: {
        fontColor: 'white'
      }
    }    
  };

  optionsRundenProSpieltag = {
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
        ticks: {
          fontColor: 'white'
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: false
        },
        ticks: {
          fontColor: 'white'
        }
      }]
    }
  }

  optionsPunkteProSpieltag = {
    title: {
      display: false
    },
    legend: {
      display: false
    },
    scales: {
      xAxes: [{
        scaleLabel: {
          display: false
        },
        ticks: {
          fontColor: 'white'
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: false
        },
        ticks: {
          fontColor: 'white'
        }
      }]
    }
  }

  private calcData(data: Array<Spieltag>) {  
    if (!data) return;  
    const _data = _.sortBy(data, spieltag => spieltag.beginn);  

    // Punkte
    const newPunkteData = {};
    newPunkteData["labels"] = _data.map(spieltag => formatDate(spieltag.beginn));
    const datasetsPunkte = [];
    Spieler.all.forEach(s => {
      const dataset = {};     
      let punkte = 0;
      dataset["label"] = s.name;      
      dataset["data"] = _data.map(_spieltag => {
        punkte += _spieltag.getPunktestand(_spieltag.aktuelleRunde, s);
        return punkte;
      });
      dataset["fill"] = false;      
      datasetsPunkte.push(dataset);
    });
    _.forEach(datasetsPunkte, (value, index) => value["borderColor"] = playerColors[index]);
    newPunkteData["datasets"] = datasetsPunkte;
    this.punkte = newPunkteData;

    // Gewonnene Spieltage
    const newGewonneneSpieltageData = {};
    newGewonneneSpieltageData["labels"] = Spieler.all.map(s => s.name);
    const dataset = {"label": ""};
    dataset["data"] = Spieler.all.map(s => this.countGewonneneSpieltage(s, data));
    dataset["backgroundColor"] = playerColors.slice(0, Spieler.all.length);
    newGewonneneSpieltageData["datasets"] = [dataset];
    this.gewonneneSpieltage = newGewonneneSpieltageData;

    // Solo-Verteilung
    const newSolos = {};
    newSolos["labels"] = Solo.all.map(s => s.name);
    const datasetSolos = {"label": ""};
    datasetSolos["data"] =  Solo.all.map(s => this.countSolo(s, data));
    datasetSolos["backgroundColor"] = playerColors.slice(0, Solo.all.length);
    newSolos["datasets"] = [datasetSolos];
    this.solos = newSolos;

    // Runden und Böcke pro Spieltag
    const newRunden = {};
    newRunden["labels"] =  _data.map(spieltag => formatDate(spieltag.beginn));
    const datasetRunden = {"label": "Anzahl Runden"};
    datasetRunden["data"] =  _data.map(s => s.aktuelleRunde.nr - 1);
    datasetRunden["borderColor"] = playerColors[0];
    const datasetBoecke = {"label": "Anzahl Böcke"};
    datasetBoecke["data"] =  _data.map(s => this.countBoecke(s));
    datasetBoecke["borderColor"] = playerColors[1];
    newRunden["datasets"] = [datasetRunden, datasetBoecke];
    this.rundenProSpieltag = newRunden;

    // Punkte pro Spieltag
    const newPunkteProSpieltag = {};
    newPunkteProSpieltag["labels"] =  _data.map(spieltag => formatDate(spieltag.beginn));
    const datasetPunkte = {};
    datasetPunkte["data"] =  _data.map(s => this.maxPunktestand(s.aktuelleRunde));
    datasetPunkte["borderColor"] = playerColors[2];
    newPunkteProSpieltag["datasets"] = [datasetPunkte];
    this.punkteProSpieltag = newPunkteProSpieltag;

    
    this.spieltage = _data;
  }

  private countGewonneneSpieltage(spieler: Spieler, spieltage: Array<Spieltag>) {
    let result = 0;
    spieltage.filter(s => s.spieler.includes(spieler)).forEach(s => {
      if (s.getPunktestand(s.aktuelleRunde, spieler) === this.maxPunktestand(s.aktuelleRunde)) {
        result++;
      }
    });
    return result;
  }

  private countSolo(solo: Solo, spieltage: Array<Spieltag>) {
    return _.flatMap(spieltage, s => s.runden).filter(r => r.solo === solo).length;
  }

  private countBoecke(spieltag: Spieltag) {
    return _.sum(spieltag.runden.map(r => r.boecke));
  }

  private maxPunktestand(runde: Runde) {
    return _.max(runde.spieltag.spieler.map(s => runde.spieltag.getPunktestand(runde, s)));
  }

}
