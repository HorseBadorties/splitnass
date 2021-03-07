import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Observable, BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';
import { Rules } from 'src/model/rules';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private _offline: boolean;
  private _animateRoutes: boolean;
  private _adminMode: boolean;
  private _autoShowRundendetails: boolean;
  private _hideInactivePlayers: boolean;
  private _rules = new Rules();
  private _chartsFontSize = 12;

  public offlineStatus = new BehaviorSubject(undefined);
  public hideInactivePlayersStatus = new BehaviorSubject(undefined);
  public chartsFontSizeStatus = new BehaviorSubject(this._chartsFontSize);

  public get offline(): boolean {
    return this._offline;
  }

  public set offline(value: boolean) {
    this._offline = value;
    this.setBoolean('offline', value);
    this.offlineStatus.next(value);
  }

  public get animateRoutes(): boolean {
    return this._animateRoutes;
  }

  public set animateRoutes(value: boolean) {
    this._animateRoutes = value;
    this.setBoolean('animateRoutes', value);
  }

  public get adminMode(): boolean {
    return this._adminMode;
  }

  public set adminMode(value: boolean) {
    this._adminMode = value;
    this.setBoolean('adminMode', value);
  }

  public get autoShowRundendetails(): boolean {
    return this._autoShowRundendetails;
  }

  public set autoShowRundendetails(value: boolean) {
    this._autoShowRundendetails = value;
    this.setBoolean('autoShowRundendetails', value);
  }

  public get hideInactivePlayers(): boolean {
    return this._hideInactivePlayers;
  }

  public set hideInactivePlayers(value: boolean) {
    this._hideInactivePlayers = value;
    this.setBoolean('hideInactivePlayers', value);
    this.hideInactivePlayersStatus.next(value);
  }

  public get rules(): Rules {
    return this._rules;
  }

  public set rules(value: Rules) {
    this._rules = value;
    this.localStorage.set('rules', value).subscribe(() => {});
  }

  public saveSpieltagJSON(spieltagJSON: string) {
    this.setString('savedSpieltag', spieltagJSON);
  }

  public getSavedSpieltagJSON(): Observable<string> {
    return this.getString('savedSpieltag');
  }

  public joinedSpieltag(beginn: string) {
    this.setString('joinedSpieltag', beginn);
  }

  public getJoinedSpieltag(): Observable<string> {
    return this.getString('joinedSpieltag');
  }

  public setTheme(themeName: string) {
    this.setString('theme', themeName);
  }

  public getTheme(): Observable<string> {
    return this.getString('theme');
  }

  public get chartsFontSize(): number {
    return this._chartsFontSize;
  }

  public set chartsFontSize(value: number) {
    this._chartsFontSize = value;
    this.setNumber('chartsFontSize', value);
    this.chartsFontSizeStatus.next(value);
  }

  constructor(private localStorage: StorageMap) {
    this.getBoolean('offline').pipe(first()).subscribe(value => {
        this._offline = value && value.valueOf();
        this.offlineStatus.next(this._offline);
      });
    this.getBoolean('animateRoutes').pipe(first())
      .subscribe(value => this._animateRoutes = value !== null ? value.valueOf() : true);
    this.getBoolean('adminMode').pipe(first())
      .subscribe(value => this._adminMode = value !== null ? value.valueOf() : false);
    this.getBoolean('autoShowRundendetails').pipe(first())
      .subscribe(value => this._autoShowRundendetails = value !== null ? value.valueOf() : true);
    this.getBoolean('hideInactivePlayers').pipe(first())
      .subscribe(value => this._hideInactivePlayers = value !== null ? value.valueOf() : true);
    this.localStorage.get('rules').pipe(first())
      .subscribe(value => this._rules = value !== null ? value as Rules : new Rules());
    this.getNumber('chartsFontSize').pipe(first())
      .subscribe(value => this._chartsFontSize = value !== null ? value.valueOf() : 12);

  }

  private setBoolean(name: string, value: boolean) {
    this.localStorage.set(name, value).subscribe(() => {});
  }

  private getBoolean(name: string): Observable<boolean> {
    return this.localStorage.get(name, { type: 'boolean' });
  }

  private setNumber(name: string, value: number) {
    this.localStorage.set(name, value).subscribe(() => {});
  }

  private getNumber(name: string): Observable<number> {
    return this.localStorage.get(name, { type: 'number' });
  }

  private setString(name: string, value: string) {
    this.localStorage.set(name, value).subscribe(() => {});
  }

  private getString(name: string): Observable<string> {
    return this.localStorage.get(name, { type: 'string' });
  }

}
