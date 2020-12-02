import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DndModule } from 'ngx-drag-drop';

import {
  NgbDropdownModule,
  NgbTypeaheadModule
} from '@ng-bootstrap/ng-bootstrap';

import { StatusListComponent } from './status-list/status-list.component';
import { ItemDetailComponent } from './item-detail/item-detail.component';
import { ItemStatusRowComponent } from './item-status-row/item-status-row.component';
import { ShoppingListComponent } from './shopping-list/shopping-list.component';
import { ShoppingListItemComponent } from './shopping-list-item/shopping-list-item.component';
import { ItemFilterPipe } from './itemFilter.pipe';
import { ItemMenuComponent } from './item-menu/item-menu.component';
import { ItemStatusComponent } from './item-status/item-status.component';
import { ItemQuantityComponent } from './item-quantity/item-quantity.component';
import { ConfirmBoughtDialogComponent } from './confirm-bought-dialog/confirm-bought-dialog.component';

@NgModule({
  declarations: [
    StatusListComponent,
    ItemDetailComponent,
    ItemStatusRowComponent,
    ShoppingListComponent,
    ShoppingListItemComponent,
    ItemMenuComponent,
    ItemStatusComponent,
    ItemQuantityComponent,
    ConfirmBoughtDialogComponent,
    ItemFilterPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DndModule,
    NgbDropdownModule,
    NgbTypeaheadModule
  ],
  providers: []
})
export class ItemModule {}
