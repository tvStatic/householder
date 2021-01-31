import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { UserService } from '../user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'current-user',
  templateUrl: './current-user.component.html',
  styleUrls: ['./current-user.component.less']
})
export class CurrentUserComponent implements OnInit, OnDestroy {
  username?: string;
  readonly canLogout = !environment.dbName;

  subscription: Subscription;

  constructor(
    private userService: UserService,
    private zone: NgZone,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    // subscribe to changes in the user and get the current value
    this.username = this.userService.getUsername();
    this.subscription = this.userService.subscribeToCurrentUserChanges({
      next: (value?: string) => {
        this.zone.run(() => {
          this.username = value;
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  login() {
    this.modalService.open(LoginDialogComponent);
  }

  logout() {
    this.userService.logout();
  }
}
