import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb-browser';
import { Subject, PartialObserver } from 'rxjs';

declare function emit(key: any, value?: any);

interface IDBNameDoc extends PouchDB.Core.IdMeta, PouchDB.Core.GetMeta {
  name: string;
}

interface IView extends PouchDB.Core.IdMeta, PouchDB.Core.GetMeta {
  version?: number;
}

export enum SyncStatusEnum {
  Offline,
  Synced,
  SyncedReadOnly,
  InProgress,
  Error
}

export interface SyncStatus {
  status: SyncStatusEnum;
  lastSynced: Date | undefined;
  syncError: any;
}

@Injectable({
  providedIn: 'root'
})
export class DatastoreService {
  private static readonly viewsId = 'views';
  private static readonly byTypeView = DatastoreService.viewsId + '/by_type';

  private db: PouchDB.Database;

  private sync: PouchDB.Replication.ReplicationEventEmitter<{}, any, any>;

  private syncStatus: SyncStatus;

  private syncSubject: Subject<SyncStatus>;
  private changeSubject: Subject<void>;

  readonly dbId = 'dbName';
  readonly syncTimeout = 5;
  readonly errorRetryInterval = 30;

  constructor() {
    this.db = new PouchDB('householder');

    this.syncSubject = new Subject<SyncStatus>();
    this.changeSubject = new Subject<void>();
    this.syncStatus = {
      lastSynced: undefined,
      syncError: undefined,
      status: SyncStatusEnum.Offline
    };
  }

  public static generateId(type: string) {
    let ret = type + '_';
    ret += Date.now().valueOf();
    ret +=
      '_' +
      Math.random()
        .toString(36)
        .substr(2);
    return ret;
  }

  public async init() {
    this.db = new PouchDB('householder');

    const ddoc = {
      _id: '_design/' + DatastoreService.viewsId,
      _rev: undefined,
      version: 1,
      views: {
        by_type: {
          /* tslint:disable-next-line:only-arrow-functions */
          map: function(doc) {
            /* tslint:disable-next-line:no-var-keyword */
            var sepIndex = doc._id.indexOf('_');
            sepIndex = sepIndex === -1 ? undefined : sepIndex;
            emit(doc._id.substr(0, sepIndex), 1);
          }.toString()
        }
      }
    };

    let doPut = true;

    // update the design doc if present
    await this.db
      .get(ddoc._id)
      .catch(err => {
        // not present, ignore and we'll create it anyway
        if (err.name !== 'not_found') {
          throw err;
        }
      })
      .then((doc: PouchDB.Core.ExistingDocument<IView>) => {
        if (doc) {
          if (!doc.version || doc.version !== ddoc.version) {
            ddoc._rev = doc._rev;
          } else {
            doPut = false;
          }
        }
      });

    if (doPut) {
      await this.db.put(ddoc);
    }
  }

  public async getDocs(
    type: string
  ): Promise<PouchDB.Core.ExistingDocument<{}>[]> {
    return await this.db
      .query(DatastoreService.byTypeView, { key: type, include_docs: true })
      .then(res => {
        return res.rows.map(row => {
          return row.doc;
        });
      });
  }

  public async getDoc(
    id: string
  ): Promise<PouchDB.Core.ExistingDocument<{}>[]> {
    return await this.db.get(id);
  }

  public async save<Model>(object: PouchDB.Core.PutDocument<Model>) {
    try {
      const resp = await this.db.put(object);
      object._rev = resp.rev;
    } catch (err) {
      throw err;
      // if (err.name === "conflict") {
      //   // TODO - handle conflict
      //   this.errorsService.add(err);
      // } else {
      //   this.errorsService.add(err);
      // }
    }
  }

  public async remove(object: PouchDB.Core.RemoveDocument) {
    try {
      await this.db.remove(object._id, object._rev);
    } catch (err) {
      throw err;
    }
  }

  private async checkDBNameChanged(dbName: string) {
    return await this.db.get(this.dbId).then(
      (doc: IDBNameDoc) => {
        if (doc.name !== dbName) {
          // the dbName is present and different from the provided database name
          // clear the local and sync from the new remote
          return this.db.destroy().then(() => {
            this.init();
          });
        }
      },
      (err: any) => {
        if (err.status === 404) {
          // not set. Set it now
          const doc = {
            _id: this.dbId,
            name: dbName
          };
          // not yet initialised, set the dbname now
          return this.db.put(doc).catch(e => {
            throw e;
          });
        } else {
          // rethrow
          throw err;
        }
      }
    );
  }

  public async startCouchDBSync(server: string) {
    await this.checkDBNameChanged(server);

    const options: PouchDB.Replication.SyncOptions = {
      live: true,
      retry: false,
      filter(doc: any) {
        return (
          !doc._id.startsWith('_design/') && !doc._id.startsWith('_local_')
        );
      }
    };

    this.onSyncInProgress();

    this.sync = this.db
      .sync(server, options)
      .on('change', info => {
        this.onSyncInProgress();

        if (info.direction === 'pull') {
          this.changeSubject.next();
        }
      });

    this.sync
      .on('paused', err => {
        this.onSyncComplete(err);
      })
      .on('active', () => {
        this.onSyncInProgress();
      })
      .on('denied', (err: any) => {
        // a document failed to replicate (e.g. due to permissions)
        // TODO - maybe route to different method
        if (err && err.doc && err.doc.message) {
          this.onSyncError(err.doc.message);
        } else {
          this.onSyncError(err);
        }
      })
      .on('complete', () => {
        this.onSyncOffline();
      })
      .on('error', (err: any) => {
        if (err && err.reason) {
          this.onSyncError(err.error + ': ' + err.reason);
        } else if (err && err.result && err.result.status === 'aborting') {
          this.onSyncOffline();

          // retry after timeout
          setTimeout(
            () => this.startCouchDBSync(server),
            this.errorRetryInterval * 1000
          );
        } else {
          this.onSyncError(err);
        }
      });

    // TODO - do we need change detection?
    // changes = this.db.changes({
    //   since: 'now',
    //   live: true,
    //   include_docs: true
    // }).on('change', change => {
    //   // received a change
    //   $rootScope.$apply(() => {
    //     $rootScope.$broadcast('pouchdb:change', change);
    //   });
    // }).on('error', err => {
    //   // handle errors
    //   console.log('error subscribing to changes feed', err);
    // });
  }

  public stopCouchSync() {
    if (this.sync) {
      this.sync.cancel();
      this.sync = undefined;
      this.onSyncOffline();
    }
  }

  public subscribeToSyncStatus(observer: PartialObserver<SyncStatus>) {
    this.syncSubject.subscribe(observer);
    this.syncStatusChanged();
  }

  public subscribeToChange(observer: PartialObserver<void>) {
    this.changeSubject.subscribe(observer);
  }

  private onSyncOffline() {
    this.syncStatus.status = SyncStatusEnum.Offline;
    this.syncStatusChanged();
  }

  private onSyncInProgress() {
    this.syncStatus.status = SyncStatusEnum.InProgress;
    this.syncStatus.syncError = undefined;
    this.syncStatusChanged();
  }

  private onSyncError(err) {
    this.syncStatus.status = SyncStatusEnum.Error;
    this.syncStatus.syncError = err;
    this.syncStatusChanged();
  }

  private onSyncComplete(err) {
    if (err) {
      this.onSyncError(err);
    } else if (!this.syncStatus.syncError) {
      // don't clear error if present
      this.syncStatus.status = SyncStatusEnum.Synced;
      this.syncStatus.syncError = undefined;
      this.syncStatus.lastSynced = new Date();
      this.syncStatusChanged();
    }
  }

  private syncStatusChanged() {
    this.syncSubject.next(Object.assign({}, this.syncStatus));
  }
}
