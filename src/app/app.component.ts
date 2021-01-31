import { Component, NgZone, OnInit } from '@angular/core';
import { ItemService } from './item/item.service';
import { ErrorsService } from './errors.service';
import {
  DatastoreService,
  SyncStatus,
  SyncStatusEnum
} from './datastore.service';
import { UserService } from './user/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  readonly syncPendingClass = 'fas fa-sync';
  readonly syncProgressClass = 'fas fa-sync fa-spin';
  readonly syncErrorClass = 'text-danger fas fa-exclamation';
  readonly syncSuccessClass = 'fas fa-cloud';
  readonly roSuccessClass = 'fas fa-cloud-download-alt';

  loading = true;
  syncStatus: SyncStatus;
  isMenuCollapsed = true;

  constructor(
    private userService: UserService,
    private itemService: ItemService,
    private dataStoreService: DatastoreService,
    public errorsService: ErrorsService,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.init();
  }

  async init() {
    this.dataStoreService.subscribeToSyncStatus({
      next: (value: SyncStatus) => {
        this.zone.run(() => {
          this.syncStatus = value;
        });
      }
    });

    await this.dataStoreService.init();
    await this.dataStoreService.getDBName().then((dbName) => {
      return this.userService.resumeSession(dbName);
    });

    if (!this.dataStoreService.isConnected() && environment.dbName) {
      // connect using hard-coded credentials
      let dbName = environment.dbName;
      if (!dbName.startsWith("http")) {
        // assume using same location
        dbName = window.location.protocol + '//' + window.location.hostname;
        if (!environment.dbName.startsWith(":") && !environment.dbName.startsWith("/")) {
          dbName += "/";
        }

        dbName += environment.dbName;
      }
      await this.userService.login(environment.username, environment.pw, dbName)
    }
    
    await this.itemService.init();
    this.loading = false;
  }

  isOffline() {
    return this.syncStatus.status === SyncStatusEnum.Offline;
  }

  inProgress() {
    return this.syncStatus.status === SyncStatusEnum.InProgress;
  }

  getSyncIconClass() {
    switch (this.syncStatus.status) {
      case SyncStatusEnum.InProgress:
        return this.syncProgressClass;
      case SyncStatusEnum.Error:
        return this.syncErrorClass;
      case SyncStatusEnum.Synced:
        return this.syncSuccessClass;
      case SyncStatusEnum.SyncedReadOnly:
        return this.roSuccessClass;
    }
  }

  getLastSynced() {
    let lastSync = '';
    if (this.syncStatus.status === SyncStatusEnum.SyncedReadOnly) {
      lastSync = 'Not replicating to cloud. Please renew subscription';
    } else if (this.syncStatus.lastSynced) {
      lastSync = 'Last sync: ';
      if (this.syncStatus.syncError) {
        lastSync = 'Last successful sync: ';
      }

      lastSync += this.syncStatus.lastSynced.toLocaleString();
    }

    return lastSync;
  }

  getSyncError() {
    if (this.syncStatus.syncError) {
      return 'Error: ' + this.syncStatus.syncError;
    }

    return '';
  }
}
