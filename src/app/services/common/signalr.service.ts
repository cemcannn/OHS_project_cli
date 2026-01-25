import { Inject, Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState, IHttpConnectionOptions } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  private connections = new Map<string, Promise<HubConnection>>();

  constructor(@Inject("baseSignalRUrl") private baseSignalRUrl: string) { }

  private normalizeHubPath(hubUrlOrPath: string) {
    // absolute URL ise olduğu gibi bırak
    if (/^https?:\/\//i.test(hubUrlOrPath)) return hubUrlOrPath;
    // path normalize
    const path = hubUrlOrPath.startsWith('/') ? hubUrlOrPath : `/${hubUrlOrPath}`;
    // base normalize (tek slash)
    const base = this.baseSignalRUrl.endsWith('/') ? this.baseSignalRUrl.slice(0, -1) : this.baseSignalRUrl;
    return `${base}${path}`;
  }

  async start(hubUrlOrPath: string): Promise<HubConnection> {
    const hubUrl = this.normalizeHubPath(hubUrlOrPath);

    const existing = this.connections.get(hubUrl);
    if (existing) return existing;

    const connectionPromise = (async () => {
      const builder: HubConnectionBuilder = new HubConnectionBuilder();

      const options: IHttpConnectionOptions = {
        accessTokenFactory: () => localStorage.getItem("accessToken") ?? ""
      };

      const hubConnection: HubConnection = builder
        .withUrl(hubUrl, options)
        .withAutomaticReconnect()
        .build();

      hubConnection.onreconnected(() => console.log("Reconnected"));
      hubConnection.onreconnecting(() => console.log("Reconnecting"));
      hubConnection.onclose(() => console.log("Closed"));

      await hubConnection.start();
      console.log("Connected");
      return hubConnection;
    })().catch(err => {
      // bağlantı kurulamazsa cache'i temizle ki tekrar deneyebilelim
      this.connections.delete(hubUrl);
      throw err;
    });

    this.connections.set(hubUrl, connectionPromise);
    return connectionPromise;
  }

  async invoke(hubUrlOrPath: string, procedureName: string, message: any, successCallBack?: (value: any) => void, errorCallBack?: (error: any) => void) {
    try {
      const connection = await this.start(hubUrlOrPath);
      const result = await connection.invoke(procedureName, message);
      successCallBack?.(result);
    } catch (error) {
      errorCallBack?.(error);
    }
  }

  async on(hubUrlOrPath: string, procedureName: string, callBack: (...message: any) => void) {
    const connection = await this.start(hubUrlOrPath);
    // aynı handler birden fazla kez register edilmesin diye önce kaldırıp tekrar ekliyoruz
    connection.off(procedureName);
    connection.on(procedureName, callBack);
  }
}