import { Injectable } from '@angular/core';
import { ErrorsService } from '../errors.service';
import { Item, GroupBy, IItemGroup } from './item';
import { DatastoreService } from '../datastore.service';
import { Subject, PartialObserver } from 'rxjs';
import { Config, GroupByConfig } from './config';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private static readonly idType = 'shoppingItem';

  private initialised = false;
  private firstIndex: number;
  private lastIndex: number;
  private changedSubject: Subject<void>;

  private items: Item[];
  private groupByOptions: GroupBy[] = [
    GroupBy.NONE,
    GroupBy.CATEGORY,
    GroupBy.LOCATION
  ];

  private config: Config = new Config();

  constructor(
    private dataStoreService: DatastoreService,
    private errorsService: ErrorsService
  ) {
    this.changedSubject = new Subject();
    this.items = [];
  }

  private static generateId() {
    return DatastoreService.generateId(ItemService.idType);
  }

  public async init() {
    if (this.initialised) {
      return;
    }

    await this.loadItems();

    this.dataStoreService.subscribeToChange({
      next: () => {
        // TODO - need zone?
        this.loadItems().then(() => {
          this.changedSubject.next();
        });
      }
    });
  }

  private async loadItems() {
    await this.dataStoreService
      .getDocs(ItemService.idType)
      .catch(err => {
        // throw some sort of error here
        this.errorsService.add(err);
      })
      .then(items => {
        if (items) {
          this.items = items.map(i => {
            return Object.assign(new Item(), i);
          });

          this.postLoadItems();
        }
      });

    await this.loadConfig();
  }

  private async loadConfig() {
    await this.dataStoreService
      .getDoc(Config.id)
      .catch(err => {
        if (err.name !== 'not_found') {
          this.errorsService.add(err);
        }
      })
      .then(doc => {
        if (doc) {
          this.config = Object.assign(new Config(), doc);
          this.config.statusConfig = Object.assign(new GroupByConfig(), this.config.statusConfig);
          this.config.shoppingConfig = Object.assign(new GroupByConfig(), this.config.shoppingConfig);
        }
      });
  }

  private postLoadItems() {
    let first = true;

    // if first order index not set, assume none are
    this.items.forEach(item => {
      if (item.orderIndex === undefined) {
        if (this.lastIndex === undefined) {
          this.lastIndex = 0.0;
        } else {
          this.lastIndex += 1.0;
        }

        item.orderIndex = this.lastIndex;
      } else {
        this.lastIndex = item.orderIndex;
      }

      if (first) {
        this.firstIndex = item.orderIndex;
        first = false;
      }
    });
  }

  public subscribeToChangeEvent(observer: PartialObserver<void>) {
    return this.changedSubject.subscribe(observer);
  }

  public getItems() {
    return this.items;
  }

  public getConfig() {
    return this.config;
  }

  public async saveConfig(config: Config) {
    await this.dataStoreService.save(config);
  }

  public get(id: string) {
    return this.items.find(item => {
      return item._id === id;
    });
  }

  public getGroupByOptions() {
    return this.groupByOptions;
  }

  public addItem(item: Item) {
    item._id = ItemService.generateId();
    this.items.push(item);

    this.dataStoreService.save(item);
  }

  public updateItem(item: Item) {
    const index = this.items.findIndex(i => {
      return i._id === item._id;
    });

    if (index !== -1) {
      this.items[index] = item;
    }

    this.dataStoreService.save(item);
  }

  public async deleteItem(item: Item) {
    const index = this.items.indexOf(item);

    if (index !== -1) {
      this.items.splice(index, 1);

      if (this.items.length > 0) {
        if (index === 0) {
          this.firstIndex = this.items[0].orderIndex;
        }
        if (index === this.items.length) {
          this.lastIndex = this.items[this.items.length - 1].orderIndex;
        }
      }
    }

    await this.dataStoreService.remove(item);
  }

  public groupItems(items: Item[], groupBy: GroupBy): IItemGroup[] {
    const groupSet = {};
    // assume location for now
    const groups: IItemGroup[] = [];

    let customGroup;

    items.forEach(item => {
      let groupName = '';
      let group: IItemGroup;

      if (groupBy === GroupBy.LOCATION && item.location) {
        groupName = item.location;
      } else if (groupBy === GroupBy.CATEGORY && item.category) {
        groupName = item.category;
      }

      if (item.custom) {
        if (!customGroup) {
          customGroup = {
            name: 'Custom',
            items: []
          };
        }

        group = customGroup;
      } else {
        group = groupSet[groupName];
      }

      if (!group) {
        group = {
          name: groupName,
          items: []
        };
        groupSet[groupName] = group;
        groups.push(group);
      }

      group.items.push(item);
    });

    // sort the items within groups
    groups.forEach(g => {
      g.items.sort((a, b) => {
        if (a.orderIndex !== b.orderIndex) {
          return a.orderIndex - b.orderIndex;
        } else {
          return a.name.localeCompare(b.name);
        }
      });
    });

    // sort groups
    groups.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    if (customGroup) {
      groups.push(customGroup);
    }

    return groups;
  }

  private setOrderIndex(item: Item, index: number) {
    let prevIndex: number;
    let nextIndex: number;

    // assumes item already added to list

    // special case for empty list
    if (this.items.length === 1) {
      this.firstIndex = 0.0;
      this.lastIndex = 0.0;
      item.orderIndex = this.firstIndex;
      return;
    }

    if (index >= this.items.length - 1) {
      this.lastIndex += 1.0;
      item.orderIndex = this.lastIndex;
    } else if (index <= 0) {
      this.firstIndex -= 1.0;
      item.orderIndex = this.firstIndex;
    } else {
      // get the orderIndex values of index - 1 and index + 1
      // and average them to get the orderIndex
      prevIndex = this.items[index - 1].orderIndex;
      nextIndex = this.items[index + 1].orderIndex;
      item.orderIndex = (prevIndex + nextIndex) / 2;
    }
  }

  private moveItem(existingIndex: number, newIndex: number) {
    if (existingIndex === newIndex) {
      return;
    }

    if (
      existingIndex < 0 ||
      existingIndex >= this.items.length ||
      newIndex < 0 ||
      newIndex > this.items.length
    ) {
      return;
    }

    const item = this.items[existingIndex];
    this.items.splice(newIndex, 0, this.items.splice(existingIndex, 1)[0]);
    this.setOrderIndex(item, newIndex);

    this.updateItem(item);
  }

  // moves toMove to the index prior to beforeItem
  moveBefore(toMove: Item, beforeItem: Item) {
    const existingIndex = this.items.indexOf(toMove);
    const beforeIndex = this.items.indexOf(beforeItem);
    this.moveItem(existingIndex, beforeIndex);
  }

  moveAfter(toMove: Item, afterItem: Item) {
    const existingIndex = this.items.indexOf(toMove);
    const afterIndex = this.items.indexOf(afterItem);
    this.moveItem(existingIndex, afterIndex + 1);
  }

  public exportItems() {
    const data = JSON.stringify(this.items, null, 1);
    const a = document.createElement('a');
    const file = new Blob([data], { type: 'application/json' });
    a.href = URL.createObjectURL(file);
    a.download = 'shoppingItems.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  public async importItems(data: any[]) {
    const newItems = data.map(i => {
      return Object.assign(new Item(), i);
    });

    // strip out the _rev fields of the input
    newItems.forEach(o => {
      delete o._rev;
    });

    // delete the existing items
    const itemsCopy = Object.assign([], this.items);
    for (const item of itemsCopy) {
      await this.deleteItem(item);
    }

    for (const item of newItems) {
      this.items.push(item);

      await this.dataStoreService.save(item);
    }

    this.changedSubject.next();
  }

  public getAllCategories() {
    const ret = [];
    this.items.forEach(item => {
      if (item.category && !ret.includes(item.category)) {
        ret.push(item.category);
      }
    });

    ret.sort();
    return ret;
  }

  public getAllLocations() {
    const ret = [];
    this.items.forEach(item => {
      if (item.location && !ret.includes(item.location)) {
        ret.push(item.location);
      }
    });

    ret.sort();
    return ret;
  }
}
