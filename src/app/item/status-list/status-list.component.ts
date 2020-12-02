import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  OnDestroy
} from '@angular/core';
import { ItemService } from '../item.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IItemGroup, GroupBy, Item } from '../item';
import { DndDropEvent } from 'ngx-drag-drop';
import { Subscription } from 'rxjs';
import { ErrorsService } from 'src/app/errors.service';
import { Config, GroupByConfig } from '../config';

@Component({
  selector: 'status-list',
  templateUrl: './status-list.component.html',
  styleUrls: ['./status-list.component.less']
})
export class StatusListComponent implements OnInit, OnDestroy {
  @ViewChild('confirmImportDialog')
  private confirmImportDialog: TemplateRef<any>;

  collapsedViewOptions = true;

  groups: IItemGroup[];
  groupByOptions: GroupBy[];

  filter: string;
  config: Config;
  statusConfig: GroupByConfig;

  toDelete: Item | undefined;

  subscriptions: Subscription[] = [];

  constructor(
    private itemService: ItemService,
    private modalService: NgbModal,
    private errorService: ErrorsService
  ) {}

  ngOnInit(): void {
    this.groupByOptions = this.itemService.getGroupByOptions();
    this.config = this.itemService.getConfig();
    this.statusConfig = this.config.statusConfig;
    this.groupItems();

    this.subscriptions.push(
      this.itemService.subscribeToChangeEvent({
        next: () => {
          this.config = this.itemService.getConfig();
          this.statusConfig = this.config.statusConfig;
          this.groupItems();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  getStatusClass(item: Item) {
    if (!item.active) {
      return 'inactive';
    }
    if (item.status === undefined) {
      return 'no-status';
    }
    if (item.isExpired()) {
      return 'expired';
    }
  }

  onItemStateChange(item: Item) {
    this.itemService.updateItem(item);
  }

  deleteItem(item: Item, dialog: any) {
    this.toDelete = item;
    this.modalService.open(dialog).result.then(result => {
      if (result) {
        this.itemService.deleteItem(item);
        this.groupItems();
      }

      delete this.toDelete;
    });
  }

  move(items: Item[], event: DndDropEvent) {
    const item: Item = event.data;
    let index = event.index;

    const oldIndex = items.findIndex(i => {
      return i._id === item._id;
    });

    if (index === oldIndex || index === oldIndex + 1) {
      return false;
    }

    if (index > oldIndex) {
      index--;
    }

    const toMove = items.splice(oldIndex, 1)[0];
    items.splice(index, 0, toMove);

    // modify the item store
    if (index > oldIndex) {
      this.itemService.moveAfter(toMove, items[index - 1]);
    } else {
      this.itemService.moveBefore(toMove, items[index + 1]);
    }

    return true;
  }

  async configChanged() {
    await this.itemService.saveConfig(this.config);
    this.groupItems();
  }

  async toggleGroupCollapse(group: IItemGroup) {
    this.statusConfig.toggleGroupCollapse(group.name);
    await this.itemService.saveConfig(this.config);
  }

  resetAll() {
    this.groups.forEach(group => {
      group.items.forEach(item => {
        item.reset();
      });
    });
  }

  private groupItems() {
    const items = this.itemService.getItems().filter(item => {
      if (item.custom) {
        // ignore custom items
        return false;
      }

      // ignore inactive items unless in edit mode
      if (!item.active && !this.config.showInactive) {
        return false;
      }

      if (this.config.hideItemsOutsideReminder) {
        return (
          !item.isStatusSet() ||
          item.onShoppingList() ||
          item.noExpiry() ||
          item.isExpired()
        );
      }

      return true;
    });

    this.groups = this.itemService.groupItems(items, this.statusConfig.groupBy);
  }

  export() {
    this.itemService.exportItems();
  }

  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      const file = input.files[0];

      const reader = new FileReader();
      reader.readAsText(file);

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          let data: object[];
          try {
            data = JSON.parse(reader.result) as object[];
          } catch (err) {
            this.errorService.add(err);
            return;
          }

          this.modalService
            .open(this.confirmImportDialog)
            .result.then(result => {
              if (result) {
                this.itemService.importItems(data);
              }
            });
        }
      };
    };

    input.click();
  }
}
