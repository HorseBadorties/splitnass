import { Injectable } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private _offline: boolean;

  public get offline(): boolean {
    return this._offline;
  }
  
  public set offline(value: boolean) {
    this._offline = value;
    this.setBoolean("offline", value);
  }

  constructor(private localStorage: LocalStorage) { 
    this.getBoolean("offline").subscribe(value => this._offline = value && value.valueOf())
  }

  private setBoolean(name: string, value: boolean) {
    this.localStorage.setItemSubscribe(name, Boolean(value));
  }

  private getBoolean(name: string): Observable<Boolean> {
    return this.localStorage.getItem<Boolean>(name, { schema: { type: 'boolean' } });
  }

}
