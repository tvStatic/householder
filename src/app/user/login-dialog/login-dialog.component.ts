import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../user.service';

@Component({
  selector: 'login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.less']
})
export class LoginDialogComponent implements OnInit {
  loading: boolean;
  error: string;
  username: string;
  password: string;
  server: string;

  constructor(public modal: NgbActiveModal, private userService: UserService) {}

  ngOnInit(): void {}

  inputsValid() {
    return this.server;
  }

  async login() {
    if (!this.inputsValid()) {
      return;
    }

    this.loading = true;
    await this.userService
      .login(this.username, this.password, this.server)
      .then(() => {
        this.modal.close();
      })
      .catch(err => {
        this.error = err?.error?.reason;
      })
      .finally(() => {
        this.loading = false;
      });
  }
}
