import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Item } from '../item';

@Component({
  selector: 'app-confirm-bought-dialog',
  templateUrl: './confirm-bought-dialog.component.html',
  styleUrls: ['./confirm-bought-dialog.component.less']
})
export class ConfirmBoughtDialogComponent implements OnInit, OnChanges {
  @Input() items: Item[];

  localItems: Item[];

  constructor(public modal: NgbActiveModal) {}

  ngOnInit(): void {
    this.ngOnChanges();
  }

  ngOnChanges() {
    if (this.items) {
      this.localItems = this.items.map(item => {
        const ret = Object.assign(new Item(), item);
        ret.quantity = item.getBoughtQuantity();
        return ret;
      });
    } else {
      this.localItems = undefined;
    }
  }

  submit() {
    this.modal.close(this.localItems);
  }

  setQuantity(item: Item, quantity: number) {
    item.quantity = quantity;
  }
}
