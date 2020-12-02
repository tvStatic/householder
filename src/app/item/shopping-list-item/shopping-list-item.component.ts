import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Item, ItemStatus } from '../item';

@Component({
  selector: '[shopping-list-item]',
  templateUrl: './shopping-list-item.component.html',
  styleUrls: ['./shopping-list-item.component.less']
})
export class ShoppingListItemComponent implements OnInit {
  @Input() item: Item;
  @Output() update = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  getClass() {
    if (this.item.bought) {
      return 'completed';
    }
  }

  toggleBought() {
    this.item.toggleBought();
    this.update.emit();
  }

  getShoppingListQuantity() {
    let quantity = 0;

    if (this.item.isBuyOnSale()) {
      quantity = this.item.getOnSaleQuantity();
    } else {
      quantity = this.item.getRequiredQuantity();
    }

    if (quantity) {
      if (this.item.quantityUnit) {
        return `${quantity} ${this.item.quantityUnit}`;
      }
      return `${quantity}x`;
    }
  }

  getOnSaleQuantity() {
    if (!this.item.quantityBased || this.item.isBuyOnSale()) {
      return;
    }

    const quantity = this.item.getOnSaleQuantity();
    if (quantity) {
      if (this.item.quantityUnit) {
        return `${quantity} ${this.item.quantityUnit}`;
      }
      return `${quantity}x`;
    }
  }
}
