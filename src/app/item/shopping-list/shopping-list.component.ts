import {
  Component,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { ItemService } from '../item.service';
import { IItemGroup, GroupBy, Item } from '../item';
import { Subscription } from 'rxjs';
import { Config } from '../config';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmBoughtDialogComponent } from '../confirm-bought-dialog/confirm-bought-dialog.component';

@Component({
  selector: 'shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.less']
})
export class ShoppingListComponent implements OnInit, OnDestroy {
  newItemName: '';
  groups: IItemGroup[];
  groupByOptions: GroupBy[];

  config: Config;

  subscriptions: Subscription[] = [];

  constructor(
    private itemService: ItemService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.groupByOptions = this.itemService.getGroupByOptions();
    this.config = this.itemService.getConfig();
    this.groupItems();

    this.subscriptions.push(
      this.itemService.subscribeToChangeEvent({
        next: () => {
          this.config = this.itemService.getConfig();
          this.groupItems();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  async groupByChanged() {
    await this.itemService.saveConfig(this.config);
    this.groupItems();
  }

  itemUpdated(item: Item) {
    this.itemService.updateItem(item);
  }

  async toggleGroupCollapse(group: IItemGroup) {
    this.config.shoppingConfig.toggleGroupCollapse(group.name);
    await this.itemService.saveConfig(this.config);
  }

  addNewItem() {
    if (this.newItemName) {
      const newItem = new Item();

      newItem.name = this.newItemName;
      newItem.custom = true;
      newItem.needMore();

      this.itemService.addItem(newItem);
      this.newItemName = '';
      this.groupItems();
    }
  }

  newItemKeyPress($event) {
    const enter = 13;
    if ($event.keyCode === enter) {
      this.addNewItem();
    }
  }

  private groupItems() {
    const items = this.itemService.getItems().filter(item => {
      return item.onShoppingList();
    });

    this.groups = this.itemService.groupItems(items, this.config.shoppingConfig.groupBy);
  }

  hasCompleted() {
    return this.groups.some(group => {
      return group.items.some(item => {
        return item.bought;
      });
    });
  }

  private hasCompletedQuantityBased() {
    return this.groups.some(group => {
      return group.items.some(item => {
        return item.bought && item.quantityBased;
      });
    });
  }

  private getCompletedQuantityBased() {
    let ret = [];
    this.groups.forEach(group => {
      ret = ret.concat(
        group.items.filter(item => {
          return item.bought && item.quantityBased;
        })
      );
    });

    return ret;
  }

  private addBought(boughtItem: Item) {
    this.groups.some(group => {
      const found = group.items.find(item => {
        return item._id === boughtItem._id;
      });

      if (found) {
        found.setQuantity(found.quantity + boughtItem.quantity);
        this.itemService.updateItem(found);
        return true;
      }
    });
  }

  complete() {
    if (this.hasCompletedQuantityBased()) {
      const modal = this.modalService.open(ConfirmBoughtDialogComponent);
      modal.componentInstance.items = this.getCompletedQuantityBased();

      modal.result.then((result: Item[]) => {
        if (result) {
          result.forEach(item => {
            this.addBought(item);
          });

          this.removeCompleted();
        }
      });
    } else {
      this.removeCompleted();
    }
  }

  private removeCompleted() {
    this.groups.forEach(group => {
      group.items.forEach(item => {
        if (item.bought) {
          if (!item.quantityBased) {
            item.ok();
          }

          if (item.custom) {
            this.itemService.deleteItem(item);
          } else {
            this.itemService.updateItem(item);
          }
        }
      });
    });

    this.groupItems();
  }
}
