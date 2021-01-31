import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatastoreService } from '../datastore.service';
import { Subject, PartialObserver } from 'rxjs';
import { environment } from 'src/environments/environment';

interface IUserCtx {
  name: string;
  roles: string[];
}

interface ILoginResponse {
  userCtx: IUserCtx;
  [propName: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private static readonly sessionPath = '/_session';

  private username: string | undefined;
  private dbURL: string | undefined;
  private readonly usernameSubject = new Subject<string | undefined>();

  constructor(
    private http: HttpClient,
    private dataStoreService: DatastoreService
  ) {}

  private static getDBSessionURL(dbURL: string) {
    // remove the last path segment
    const lastSlash = dbURL.lastIndexOf('/');
    let baseURL = dbURL;
    if (lastSlash !== -1) {
      baseURL = dbURL.substring(0, lastSlash);
    }

    // append session path
    baseURL = baseURL + UserService.sessionPath;
    return baseURL;
  }

  public getUsername() {
    return this.username;
  }

  public subscribeToCurrentUserChanges(
    observer?: PartialObserver<string | undefined>
  ) {
    return this.usernameSubject.subscribe(observer);
  }

  // TODO - these belong in DataStoreService
  public async login(username: string, password: string, dbURL: string) {
    // convert URL to base URL to get the session path

    if (username) {
      return await this.http
        .post<IUserCtx>(
          UserService.getDBSessionURL(dbURL),
          {
            name: username,
            password
          },
          { withCredentials: true }
        )
        .toPromise()
        .then(value => this.postLogin(value, dbURL));
    }

    this.postLogin({ name: 'admin', roles: []}, dbURL);
    return Promise.resolve();
  }

  private postLogin(value: IUserCtx, dbURL: string) {
    if (!value?.name && value.roles.length === 0) {
      this.username = undefined;
    } else {
      this.username = value.name || "admin";
      this.dataStoreService.startCouchDBSync(dbURL);
    }

    this.dbURL = dbURL;
    this.usernameSubject.next(this.username);
  }

  async logout() {
    return await this.http
      .delete<any>(UserService.getDBSessionURL(this.dbURL), {
        withCredentials: true
      })
      .toPromise()
      .then(() => {
        this.dataStoreService.stopCouchSync();

        this.username = undefined;
        this.dbURL = undefined;
        this.usernameSubject.next(this.username);
      });
  }

  async resumeSession(dbURL?: string) {
    this.dbURL = dbURL;
    if (this.dbURL) {
      return await this.http
        .get<ILoginResponse>(UserService.getDBSessionURL(this.dbURL), {
          withCredentials: true
        })
        .toPromise()
        .then(
          value => this.postLogin(value?.userCtx, this.dbURL),
          () => {
            // ignore errors. Just means we'll be left not logged in.
          }
        );
    }
  }
}
