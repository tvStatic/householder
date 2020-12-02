import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrentUserComponent } from './current-user/current-user.component';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    CurrentUserComponent,
    LoginDialogComponent,
  ],
  imports: [CommonModule, FormsModule, NgbModule, RouterModule],
  exports: [CurrentUserComponent]
})
export class UserModule {}
