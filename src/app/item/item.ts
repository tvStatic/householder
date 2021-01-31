export interface IItemGroup {
  name: string;
  items: Item[];
}

export enum GroupBy {
  NONE = '---',
  CATEGORY = 'category',
  LOCATION = 'location'
}

export enum ItemStatus {
  OK,
  NEED_MORE,
  BUY_ON_SALE
}

export class Item {
  /* tslint:disable:variable-name */
  _id: string;
  _rev: string;
  /* tslint:enable:variable-name */

  orderIndex: number;
  status: ItemStatus | undefined;
  name = '';
  maxSalePrice: number | undefined;
  unit: string | undefined;
  notes = '';
  category: string | undefined;
  location: string | undefined;
  buyOnSaleOnly = false;
  lastStatusUpdate: number | undefined;
  reminderTime: number | undefined;
  reminderExtensionTime: number | undefined;
  reminderTimeOverride: number | undefined;
  bought = false;
  active = true;

  quantityBased = false;
  quantityUnit: string | undefined;
  minQuantity: number | undefined;
  maxQuantity: number | undefined;
  incrementQuantity: number | undefined;
  quantity: number | undefined;

  custom: boolean;

  constructor() {}

  public static formatDate(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return (
      year +
      '-' +
      month.toString().padStart(2, '0') +
      '-' +
      day.toString().padStart(2, '0')
    );
  }

  private static daysSince(now: number, since: number) {
    function toMidnight(date: Date) {
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);
    }

    const nowDate = new Date(now);
    const sinceDate = new Date(since);

    toMidnight(nowDate);
    toMidnight(sinceDate);

    // Timezone differences (especially for daylight saving adjustments) may
    // mean that the difference in dates isn't exactly one day, so just round
    // the result.
    return Math.round((nowDate.getTime() - sinceDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  public static daysToExpireToDate(daysToExpire: number) {
    const ret = new Date();
    ret.setDate(ret.getDate() + daysToExpire);
    return ret;
  }

  getLastUpdated() {
    if (this.lastStatusUpdate) {
      const lastUpdate = new Date(this.lastStatusUpdate);
      return Item.formatDate(lastUpdate);
    }
  }

  onShoppingList() {
    return (
      this.active &&
      (this.status === ItemStatus.NEED_MORE ||
        this.status === ItemStatus.BUY_ON_SALE)
    );
  }

  isBuyOnSale() {
    return this.status === ItemStatus.BUY_ON_SALE;
  }

  isStatusSet() {
    return this.status !== undefined;
  }

  private timeToExpire(now: number, expireTime: number) {
    if (!expireTime || !this.lastStatusUpdate) {
      return;
    }

    const daysSinceLastUpdate = Item.daysSince(now, this.lastStatusUpdate);

    return expireTime - daysSinceLastUpdate;
  }

  private checkExpired(now: number, expireTime: number) {
    if (!expireTime || !this.lastStatusUpdate) {
      return false;
    }

    return this.timeToExpire(now, expireTime) <= 0;
  }

  getReminderTime() {
    if (this.status === undefined || this.onShoppingList()) {
      return undefined;
    }

    if (this.reminderTimeOverride) {
      return this.reminderTimeOverride;
    }

    return this.reminderTime ?? undefined;
  }

  isExpired() {
    const reminderTime = this.getReminderTime();
    if (reminderTime === undefined) {
      return false;
    }

    const now = Date.now();

    return this.checkExpired(now, reminderTime);
  }

  canExtend() {
    return (
      this.reminderExtensionTime && !this.onShoppingList() && this.isExpired()
    );
  }

  // returns true if there is no expiry for the current status
  noExpiry() {
    return !this.getReminderTime();
  }

  daysToRemind() {
    const reminderTime = this.getReminderTime();
    if (reminderTime === undefined) {
      return;
    }

    const now = Date.now();

    return this.timeToExpire(now, reminderTime);
  }

  reminderDate() {
    const days = this.daysToRemind();
    if (days === undefined) {
      return;
    }

    const ret = new Date();
    ret.setDate(ret.getDate() + days);
    return ret;
  }

  extendReminder() {
    if (this.reminderExtensionTime) {
      this.overrideReminderFromToday(this.reminderExtensionTime);
    }
  }

  overrideReminderFromToday(daysToRemind: number | undefined) {
    if (!daysToRemind) {
      this.reminderTimeOverride = undefined;
    } else {
      const now = Date.now();
      const daysSince = Item.daysSince(now, this.lastStatusUpdate);
      this.reminderTimeOverride = daysSince + daysToRemind;
    }
  }

  getOverrideReminderFromToday() {
    if (!this.reminderTimeOverride) {
      return;
    }

    const now = Date.now();
    const daysSince = Item.daysSince(now, this.lastStatusUpdate);
    return this.reminderTimeOverride - daysSince;
  }

  getReminderTimeFromToday() {
    if (!this.reminderTime) {
      return;
    }

    const now = Date.now();
    const daysSince = Item.daysSince(now, this.lastStatusUpdate);
    return this.reminderTime - daysSince;
  }

  private onUpdate() {
    this.lastStatusUpdate = Date.now().valueOf();
  }

  reset() {
    this.status = undefined;
    this.reminderTimeOverride = undefined;
    this.bought = false;
    this.onUpdate();
  }

  private toggleStatus(status: ItemStatus) {
    if (this.isExpired() || this.bought) {
      this.status = status;
    } else if (this.status !== status) {
      this.status = status;
    } else {
      this.status = undefined;
    }

    this.reminderTimeOverride = undefined;

    if (!this.bought) {
      this.onUpdate();
    }

    this.bought = false;
    this.setQuantityFromStatus();
  }

  ok() {
    this.toggleStatus(ItemStatus.OK);
  }

  needMore() {
    this.toggleStatus(ItemStatus.NEED_MORE);
  }

  buyOnSale() {
    this.toggleStatus(ItemStatus.BUY_ON_SALE);
  }

  toggleBought() {
    this.bought = !this.bought;
    this.onUpdate();
  }

  getRequiredQuantity() {
    if (!this.quantityBased || !this.onShoppingList()) {
      return;
    }

    const quantity = this.quantity || 0;

    return this.minQuantity - quantity;
  }

  getOnSaleQuantity() {
    if (!this.quantityBased || !this.onShoppingList()) {
      return;
    }

    const quantity = this.quantity || 0;

    return this.maxQuantity - quantity;
  }

  setQuantity(newQuantity: number) {
    this.quantity = newQuantity;
    this.bought = false;
    this.setQuantityStatus();
    this.onUpdate();
  }

  getBoughtQuantity() {
    if (!this.quantityBased) {
      return;
    }

    let boughtQuantity = 0;

    if (this.isBuyOnSale()) {
      if (this.maxQuantity) {
        boughtQuantity = this.maxQuantity;
      } else {
        boughtQuantity = this.minQuantity;
      }
    } else if (this.minQuantity) {
      boughtQuantity = this.minQuantity;
    } else {
      boughtQuantity = this.maxQuantity ?? 0;
    }

    const quantity = this.quantity ?? 0;

    return boughtQuantity - quantity;
  }

  setQuantityStatus() {
    const minQuantitySet = this.minQuantity !== undefined;
    const maxQuantitySet = this.maxQuantity !== undefined;

    if (
      !this.quantityBased ||
      this.quantity === undefined ||
      (!minQuantitySet && !maxQuantitySet)
    ) {
      return;
    }

    if (minQuantitySet && this.quantity < this.minQuantity) {
      this.status = ItemStatus.NEED_MORE;
    } else if (maxQuantitySet && this.quantity < this.maxQuantity) {
      this.status = ItemStatus.BUY_ON_SALE;
    } else {
      this.status = ItemStatus.OK;
    }
  }

  private setQuantityFromStatus() {
    if (!this.quantityBased) {
      return;
    }

    if (!this.status) {
      this.quantity = undefined;
    }

    if (this.status === ItemStatus.OK) {
      if (this.maxQuantity) {
        this.quantity = this.maxQuantity;
      } else if (this.minQuantity) {
        this.quantity = this.minQuantity;
      }
    } else if (this.status === ItemStatus.BUY_ON_SALE) {
      if (this.minQuantity) {
        this.quantity = this.minQuantity;
      } else {
        this.quantity = 0;
      }
    } else {
      this.quantity = 0;
    }
  }
}
