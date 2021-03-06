import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { sortBy, forEach, flatMap, sum, max } from "lodash-es";
import { Chart } from 'chart.js';

import { Spieltag } from 'src/model/spieltag';
import { SpieltagService } from '../../services/spieltag.service';
import { playerColors } from './colors';
import { Spieler } from 'src/model/spieler';
import { formatDate } from '../../util';
import { Runde } from 'src/model/runde';
import { Solo } from 'src/model/solo';
import { ThemeService } from '../../services/theme.service';

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
  punkteRundenBoecke: any;
  fontColor: string = "white";
  fontSize: number = 12;
  optionsPunkte;
  optionsGewonneneSpieltage;
  optionsSolos;
  optionsPunkteRundenBoecke;

  constructor(
    public spieltagService: SpieltagService, 
    private themeService: ThemeService, 
    private location: Location) { 
      this.fontColor = this.themeService.isDarkTheme() ? "white" : "black";
      this.fontSize = window.matchMedia("(max-width: 600px)").matches || window.matchMedia("(max-height: 600px)").matches ? 12 : 16;
      this.setOptions();

    }

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

  private setOptions() {
    Chart.defaults.global.elements.point.radius = 0;
    this.optionsPunkte = {
      title: {
        display: false
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          fontColor: this.fontColor,
          fontSize: this.fontSize, 
          padding: 14
        }
      },
      scales: {
        xAxes: [{
          ticks: {
            fontColor: this.fontColor,
            fontSize: this.fontSize, 
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Punkte',
            fontColor: this.fontColor,
            fontSize: this.fontSize, 
          },
          ticks: {
            fontColor: this.fontColor,
            fontSize: this.fontSize, 
          }
        }]
      }
    }

    this.optionsGewonneneSpieltage = {
      legend: {
        display: false,
        labels: {
          fontColor: this.fontColor,
          fontSize: this.fontSize, 
          padding: 14
        }
      },
      title: {
        display: false      
      },
      scales: {
        xAxes: [{
          ticks: {
            fontColor: this.fontColor,
            fontSize: this.fontSize, 
          }
        }],
        yAxes: [{
          ticks: {
            min: 0,
            stepSize: 1,
            fontColor: this.fontColor,
            fontSize: this.fontSize, 
          }
        }]
      }
    };

    this.optionsSolos = {
      legend: {
        display: true,
        position: 'left',
        labels: {
          fontColor: this.fontColor,
          fontSize: this.fontSize, 
          padding: 14
        }
      }    
    };

    this.optionsPunkteRundenBoecke = {
      title: {
        display: false
        
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          fontColor: this.fontColor,
          fontSize: this.fontSize, 
          padding: 14
        }
      },
      scales: {
        xAxes: [{
          ticks: {
            fontColor: this.fontColor,
            // fontSize: this.fontSize, 
          }
        }],
        yAxes: [{
          scaleLabel: {
            display: false
          },
          ticks: {
            fontColor: this.fontColor,
            fontSize: this.fontSize, 
          }
        }]
      }
    }
  }

  private calcData(data: Array<Spieltag>) {  
    if (!data) return;  
    const _data = sortBy(data.filter(spieltag => spieltag.isBeendet), spieltag => spieltag.beginn);  

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
      dataset["borderWidth"] = 12;
      datasetsPunkte.push(dataset);
    });
    forEach(datasetsPunkte, (value, index) => value["borderColor"] = playerColors[index]);
    newPunkteData["datasets"] = datasetsPunkte;
    this.punkte = newPunkteData;

    // Gewonnene Spieltage
    const newGewonneneSpieltageData = {};
    newGewonneneSpieltageData["labels"] = Spieler.all.map(s => s.name);
    const dataset = {"label": ""};
    dataset["data"] = Spieler.all.map(s => this.countGewonneneSpieltage(s, _data));
    dataset["backgroundColor"] = playerColors.slice(0, Spieler.all.length);
    newGewonneneSpieltageData["datasets"] = [dataset];
    this.gewonneneSpieltage = newGewonneneSpieltageData;

    // Solo-Verteilung
    const newSolos = {};
    newSolos["labels"] = Solo.all.map(s => s.name);
    const datasetSolos = {"label": ""};
    datasetSolos["data"] =  Solo.all.map(s => this.countSolo(s, _data));
    datasetSolos["backgroundColor"] = playerColors.slice(0, Solo.all.length);
    newSolos["datasets"] = [datasetSolos];
    this.solos = newSolos;

    // Punkte, Runden und Böcke pro Spieltag
    const _punkteRundenBoecke = {};
    _punkteRundenBoecke["labels"] =  _data.map(spieltag => formatDate(spieltag.beginn));
    const datasetRunden = {"label": "Anzahl Runden"};
    datasetRunden["data"] =  _data.map(s => s.aktuelleRunde.nr - 1);
    datasetRunden["borderColor"] = playerColors[0];
    const datasetBoecke = {"label": "Anzahl Böcke"};
    datasetBoecke["data"] =  _data.map(s => this.countBoecke(s));
    datasetBoecke["borderColor"] = playerColors[1];    
    const datasetPunkte = {"label": "Punkte"};
    datasetPunkte["data"] =  _data.map(s => this.maxPunktestand(s.aktuelleRunde));
    datasetPunkte["borderColor"] = playerColors[2];
    _punkteRundenBoecke["datasets"] = [datasetRunden, datasetBoecke, datasetPunkte];
    this.punkteRundenBoecke = _punkteRundenBoecke;
   
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
    return flatMap(spieltage, s => s.runden).filter(r => r.solo === solo).length;
  }

  private countBoecke(spieltag: Spieltag) {
    return sum(spieltag.runden.map(r => r.boecke));
  }

  private maxPunktestand(runde: Runde) {
    return max(runde.spieltag.spieler.map(s => runde.spieltag.getPunktestand(runde, s)));
  }

}
