import { Injectable } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private _offline: boolean;
  private _animateRoutes: boolean;
  private _adminMode: boolean;
  private _autoShowRundendetails: boolean;

  public get offline(): boolean {
    return this._offline;
  }
  
  public set offline(value: boolean) {
    this._offline = value;
    this.setBoolean("offline", value);
  }

  public get animateRoutes(): boolean {
    return this._animateRoutes;
  }
  
  public set animateRoutes(value: boolean) {
    this._animateRoutes = value;
    this.setBoolean("animateRoutes", value);
  }

  public get adminMode(): boolean {
    return this._adminMode;
  }
  
  public set adminMode(value: boolean) {
    this._adminMode = value;
    this.setBoolean("adminMode", value);
  }

  public get autoShowRundendetails(): boolean {
    return this._autoShowRundendetails;
  }
  
  public set autoShowRundendetails(value: boolean) {
    this._autoShowRundendetails = value;
    this.setBoolean("autoShowRundendetails", value);
  }

  constructor(private localStorage: LocalStorage) { 
    this.getBoolean("offline").subscribe(value => this._offline = value && value.valueOf())
    this.getBoolean("animateRoutes").subscribe(value => this._animateRoutes = value && value.valueOf())
    this.getBoolean("adminMode").subscribe(value => this._adminMode = value && value.valueOf())
    this.getBoolean("autoShowRundendetails").subscribe(value => this._autoShowRundendetails = value && value.valueOf())
  }

  private setBoolean(name: string, value: boolean) {
    this.localStorage.setItemSubscribe(name, value);
  }

  private getBoolean(name: string): Observable<Boolean> {
    return this.localStorage.getItem<boolean>(name, { schema: { type: 'boolean' } });
  }

}
