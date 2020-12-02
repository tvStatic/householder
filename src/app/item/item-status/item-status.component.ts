import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Item, ItemStatus } from '../item';

@Component({
  selector: 'item-status',
  templateUrl: './item-status.component.html',
  styleUrls: ['./item-status.component.less']
})
export class ItemStatusComponent implements OnInit {
  @Input() item: Item;
  @Output() ok = new EventEmitter();
  @Output() needMore = new EventEmitter();
  @Output() buyOnSale = new EventEmitter();
  @Output() toggleActive = new EventEmitter();
  @Output() setQuantity = new EventEmitter<number>();
  @Output() delete = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  private selectedClass(
    item: Item,
    selectedStatus: ItemStatus,
    expired: boolean
  ) {
    if (item.status === selectedStatus) {
      if (expired) {
        return 'btn-outline-success expired';
      }
      return 'btn-success';
    }

    return 'btn-light';
  }

  okClass() {
    return this.selectedClass(this.item, ItemStatus.OK, this.item.isExpired());
  }

  needMoreClass() {
    return this.selectedClass(
      this.item,
      ItemStatus.NEED_MORE,
      this.item.bought
    );
  }

  buyOnSaleClass() {
    return this.selectedClass(
      this.item,
      ItemStatus.BUY_ON_SALE,
      this.item.bought
    );
  }
}
