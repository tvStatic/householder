import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  TemplateRef
} from '@angular/core';
import { Item, ItemStatus } from '../item';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: '[item-status-row]',
  templateUrl: './item-status-row.component.html',
  styleUrls: ['./item-status-row.component.less']
})
export class ItemStatusRowComponent {
  @Input() item: Item;

  @Output() update = new EventEmitter();
  @Output() delete = new EventEmitter();

  @ViewChild('setReminderDialog')
  private setReminderDialog: TemplateRef<any>;

  thisReminderTime: number | undefined;
  setReminderForStatus: boolean;

  constructor(private modalService: NgbModal) {}

  ok() {
    this.item.ok();
    this.update.emit();
  }

  needMore() {
    this.item.needMore();
    this.update.emit();
  }

  buyOnSale() {
    this.item.buyOnSale();
    this.update.emit();
  }

  setQuantity(quantity: number) {
    this.item.setQuantity(quantity);
    this.update.emit();
  }

  deleteItem() {
    this.delete.emit();
  }

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

  getUpdateReminderStatus() {
    const daysToRemind = this.item.daysToRemind();
    if (daysToRemind > 0) {
      const expireDate = Item.formatDate(Item.daysToExpireToDate(daysToRemind));
      return 'Reminding in ' + daysToRemind + ' days (' + expireDate + ')';
    } else if (this.item.lastStatusUpdate) {
      return 'Last updated ' + this.item.getLastUpdated();
    }
  }

  toggleActive() {
    this.item.active = !this.item.active;
    this.update.emit();
  }

  onSetReminder() {
    this.thisReminderTime = this.item.getOverrideReminderFromToday();
    if (!this.thisReminderTime || this.thisReminderTime < 1) {
      this.thisReminderTime = this.item.getReminderTimeFromToday();

      if (!this.thisReminderTime || this.thisReminderTime < 1) {
        this.thisReminderTime = undefined;
      }
    }

    this.setReminderForStatus = false;
    this.modalService.open(this.setReminderDialog).result.then(result => {
      if (result) {
        this.item.overrideReminderFromToday(this.thisReminderTime);

        if (this.thisReminderTime && this.setReminderForStatus) {
          this.item.reminderTime = this.thisReminderTime;
        }

        this.update.emit();
      }
    });
  }

  onMakeExpired(modal: any) {
    this.thisReminderTime = -1;
    modal.close(true);
  }

  onExtendReminder() {
    this.item.extendReminder();
    this.update.emit();
  }

  getThisReminderDate() {
    if (!this.thisReminderTime) {
      return;
    }

    return Item.formatDate(Item.daysToExpireToDate(this.thisReminderTime));
  }
}
