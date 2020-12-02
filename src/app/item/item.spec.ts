import { TestBed } from '@angular/core/testing';

import { Item, ItemStatus } from './item';

describe('Item', () => {
  let item: Item;
  const daysInMS = 1000 * 60 * 60 * 24;

  beforeEach(() => {
    item = new Item();
  });

  describe('onShoppingList()', () => {
    describe('inactive should return false', () => {
      beforeEach(() => {
        item.active = false;
      });

      it('NEED_MORE', () => {
        item.status = ItemStatus.NEED_MORE;
        expect(item.onShoppingList()).toBeFalse();
      });

      it('BUY_ON_SALE', () => {
        item.status = ItemStatus.BUY_ON_SALE;
        expect(item.onShoppingList()).toBeFalse();
      });
    });

    it('OK should return false', () => {
      item.status = ItemStatus.OK;
      expect(item.onShoppingList()).toBeFalse();
    });

    it('NEED_MORE should return true', () => {
      item.status = ItemStatus.NEED_MORE;
      expect(item.onShoppingList()).toBeTrue();
    });

    it('BUY_ON_SALE should return true', () => {
      item.status = ItemStatus.BUY_ON_SALE;
      expect(item.onShoppingList()).toBeTrue();
    });
  });

  describe('isBuyOnSale()', () => {
    it('should return true if status is BUY_ON_SALE', () => {
      item.status = ItemStatus.BUY_ON_SALE;
      expect(item.isBuyOnSale()).toBeTrue();
    });

    it('should return false if status is not BUY_ON_SALE', () => {
      expect(item.isBuyOnSale()).toBeFalse();
    });
  });

  describe('isStatusSet()', () => {
    it('should return true if status is not undefined', () => {
      item.status = ItemStatus.BUY_ON_SALE;
      expect(item.isStatusSet()).toBeTrue();
    });

    it('should return false if status is undefined', () => {
      expect(item.isStatusSet()).toBeFalse();
    });
  });

  describe('noExpiry()', () => {
    it('null reminderTime should return true', () => {
      item.status = ItemStatus.OK;
      item.reminderTime = null;
      expect(item.noExpiry()).toBeTrue();
    });

    it('undefined reminderTime should return true', () => {
      item.status = ItemStatus.OK;
      item.reminderTime = undefined;
      expect(item.noExpiry()).toBeTrue();
    });

    it('0 reminderTime should return true', () => {
      item.status = ItemStatus.OK;
      item.reminderTime = 0;
      expect(item.noExpiry()).toBeTrue();
    });

    describe('defined reminderTime', () => {
      beforeEach(() => {
        item.reminderTime = 1;
      });

      it('status is NEED_MORE should return true', () => {
        item.status = ItemStatus.NEED_MORE;
        expect(item.noExpiry()).toBeTrue();
      });

      it('status is BUY_ON_SALE should return true', () => {
        item.status = ItemStatus.BUY_ON_SALE;
        expect(item.noExpiry()).toBeTrue();
      });

      it('status is OK should return false', () => {
        item.status = ItemStatus.OK;
        expect(item.noExpiry()).toBeFalse();
      });
    });
  });

  describe('getReminderTime()', () => {
    const reminderTime = 1;
    const overrideTime = 2;
    beforeEach(() => {
      item.status = ItemStatus.OK;
      item.reminderTime = reminderTime;
    });

    describe('override set', () => {
      beforeEach(() => {
        item.reminderTimeOverride = overrideTime;
      });

      it('status is NEED_MORE should return undefined', () => {
        item.status = ItemStatus.NEED_MORE;
        expect(item.getReminderTime()).toBeUndefined();
      });

      it('status is BUY_ON_SALE should return undefined', () => {
        item.status = ItemStatus.BUY_ON_SALE;
        expect(item.getReminderTime()).toBeUndefined();
      });

      it('status is OK should return override', () => {
        expect(item.getReminderTime()).toBe(overrideTime);
      });
    });

    it('reminderTime is null should return undefined', () => {
      item.reminderTime = null;
      expect(item.getReminderTime()).toBeUndefined();
    });

    it('reminderTime is 0 should return 0', () => {
      item.reminderTime = 0;
      expect(item.getReminderTime()).toBe(0);
    });

    it('status is NEED_MORE should return undefined', () => {
      item.status = ItemStatus.NEED_MORE;
      expect(item.getReminderTime()).toBeUndefined();
    });

    it('status is BUY_ON_SALE should return undefined', () => {
      item.status = ItemStatus.BUY_ON_SALE;
      expect(item.getReminderTime()).toBeUndefined();
    });

    it('status is undefined should return undefined', () => {
      item.status = undefined;
      expect(item.getReminderTime()).toBeUndefined();
    });

    it('status is OK should return reminderTime', () => {
      expect(item.getReminderTime()).toBe(reminderTime);
    });
  });

  describe('isExpired()', () => {
    it('should return false if reminderTime and reminderTimeOverride are undefined', () => {
      expect(item.isExpired()).toBeFalse();
    });

    it('should return false if status is NEED_MORE', () => {
      item.status = ItemStatus.NEED_MORE;
      item.reminderTime = -1;
      expect(item.isExpired()).toBeFalse();
    });

    it('should return false if status is BUY_ON_SALE', () => {
      item.status = ItemStatus.BUY_ON_SALE;
      item.reminderTime = -1;
      expect(item.isExpired()).toBeFalse();
    });

    it('should return false if status is undefined', () => {
      item.reminderTime = -1;
      expect(item.isExpired()).toBeFalse();
    });

    it('should return true if reminderTime is < now - lastStatusUpdate', () => {
      item.reminderTime = 1;
      item.ok();
      item.lastStatusUpdate -= daysInMS;
      expect(item.isExpired()).toBeTrue();
    });

    it('should return true if reminderTimeOverride is < now - lastStatusUpdate', () => {
      item.reminderTime = 5;
      item.ok();
      item.reminderTimeOverride = 1;
      item.lastStatusUpdate -= daysInMS;
      expect(item.isExpired()).toBeTrue();
    });

    it('should return false if reminderTimeOverride is > now - lastStatusUpdate', () => {
      item.reminderTime = 1;
      item.ok();
      item.reminderTimeOverride = 5;
      item.lastStatusUpdate -= daysInMS;
      expect(item.isExpired()).toBeFalse();
    });

    it('should return false if reminderTime is > now - lastStatusUpdate', () => {
      item.reminderTime = 2;
      item.ok();
      item.lastStatusUpdate -= daysInMS;
      expect(item.isExpired()).toBeFalse();
    });
  });

  describe('reset()', () => {
    beforeEach(() => {
      item.status = ItemStatus.OK;
      item.bought = true;
      item.reminderTimeOverride = 1;

      item.reset();
    });

    it('unsets status', () => {
      expect(item.status).toBeUndefined();
    });

    it('unsets reminder time override', () => {
      expect(item.reminderTimeOverride).toBeUndefined();
    });

    it('sets bought to false', () => {
      expect(item.bought).toBeFalse();
    });

    it('sets lastStatusUpdate', () => {
      expect(item.lastStatusUpdate).toBeDefined();
    });
  });

  function toggleStatusSuite(
    status: ItemStatus,
    otherStatus: ItemStatus,
    toggleStatus: () => void
  ) {
    return () => {
      it('sets status if current status is undefined', () => {
        toggleStatus();
        expect(item.status).toBe(status);
      });

      it('sets status if current status is different', () => {
        item.status = otherStatus;
        toggleStatus();
        expect(item.status).toBe(status);
      });

      it('sets status if bought', () => {
        item.bought = true;
        toggleStatus();
        expect(item.status).toBe(status);
      });

      if (status === ItemStatus.OK) {
        it('sets status if expired', () => {
          toggleStatus();
          item.reminderTimeOverride = -1;

          toggleStatus();
          expect(item.status).toBe(status);
        });
      }

      it('unsets status if current status is the same', () => {
        item.status = status;
        toggleStatus();
        expect(item.status).toBeUndefined();
      });

      it('sets bought to false', () => {
        item.bought = true;
        toggleStatus();
        expect(item.bought).toBeFalse();
      });

      it('unsets reminder time override', () => {
        item.reminderTimeOverride = 1;
        toggleStatus();
        expect(item.reminderTimeOverride).toBeUndefined();
      });

      it('sets lastStatusUpdate if not bought', () => {
        toggleStatus();
        expect(item.lastStatusUpdate).toBeDefined();
      });

      it('does not set lastStatusUpdate if bought', () => {
        item.bought = true;
        toggleStatus();
        expect(item.lastStatusUpdate).toBeUndefined();
      });
    };
  }

  describe(
    'ok()',
    toggleStatusSuite(ItemStatus.OK, ItemStatus.NEED_MORE, () => {
      item.ok();
    })
  );
  describe(
    'needMore()',
    toggleStatusSuite(ItemStatus.NEED_MORE, ItemStatus.OK, () => {
      item.needMore();
    })
  );
  describe(
    'buyOnSale()',
    toggleStatusSuite(ItemStatus.BUY_ON_SALE, ItemStatus.NEED_MORE, () => {
      item.buyOnSale();
    })
  );

  describe('toggleBought()', () => {
    it('sets bought to false if bought is true', () => {
      item.bought = true;
      item.toggleBought();
      expect(item.bought).toBeFalse();
    });

    it('sets bought to true if bought is false', () => {
      item.toggleBought();
      expect(item.bought).toBeTrue();
    });

    it('sets lastStatusUpdate', () => {
      item.toggleBought();
      expect(item.lastStatusUpdate).toBeDefined();
    });
  });

  describe('setQuantityStatus()', () => {
    const minQuantity = 2;
    const maxQuantity = 5;

    beforeEach(() => {
      item.quantityBased = true;
      item.minQuantity = minQuantity;
      item.maxQuantity = maxQuantity;
    });

    it('does nothing if quantityBased is false', () => {
      item.quantityBased = false;
      item.quantity = minQuantity - 1;
      item.setQuantityStatus();
      expect(item.status).toBeUndefined();
    });

    it('does nothing if quantity is undefined', () => {
      item.quantity = undefined;
      item.status = ItemStatus.OK;
      item.setQuantityStatus();
      expect(item.status).toBe(ItemStatus.OK);
    });

    describe('sets status', () => {
      it('to undefined if quantity is undefined', () => {
        item.setQuantityStatus();
        expect(item.status).toBeUndefined();
      });

      it('to NEED_MORE if quantity < minQuantity', () => {
        item.quantity = minQuantity - 1;
        item.setQuantityStatus();
        expect(item.status).toBe(ItemStatus.NEED_MORE);
      });

      it('to BUY_ON_SALE if quantity > minQuantity && quantity < maxQuantity', () => {
        item.quantity = maxQuantity - 1;
        item.setQuantityStatus();
        expect(item.status).toBe(ItemStatus.BUY_ON_SALE);
      });

      it('to BUY_ON_SALE if minQuantity is undefined && quantity < maxQuantity', () => {
        item.quantity = maxQuantity - 1;
        item.setQuantityStatus();
        expect(item.status).toBe(ItemStatus.BUY_ON_SALE);
      });

      it('to OK if quantity >= maxQuantity', () => {
        item.quantity = maxQuantity;
        item.setQuantityStatus();
        expect(item.status).toBe(ItemStatus.OK);
      });

      it('to OK if quantity > minQuantity && maxQuantity is undefined', () => {
        item.maxQuantity = undefined;
        item.quantity = minQuantity + 1;
        item.setQuantityStatus();
        expect(item.status).toBe(ItemStatus.OK);
      });
    });
  });

  describe('setQuantity()', () => {
    const newQuantity = 5;

    beforeEach(() => {
      item.quantityBased = true;
    });

    it('sets quantity', () => {
      item.setQuantity(newQuantity);
      expect(item.quantity).toBe(newQuantity);
    });

    it('sets lastStatusUpdate', () => {
      item.setQuantity(newQuantity);
      expect(item.lastStatusUpdate).toBeDefined();
    });

    describe('sets status', () => {
      const minQuantity = 2;
      const maxQuantity = 5;

      beforeEach(() => {
        item.minQuantity = minQuantity;
        item.maxQuantity = maxQuantity;
      });

      it('to NEED_MORE if quantity < minQuantity', () => {
        item.setQuantity(minQuantity - 1);
        expect(item.status).toBe(ItemStatus.NEED_MORE);
      });

      it('to BUY_ON_SALE if quantity > minQuantity && quantity < maxQuantity', () => {
        item.setQuantity(maxQuantity - 1);
        expect(item.status).toBe(ItemStatus.BUY_ON_SALE);
      });

      it('to BUY_ON_SALE if minQuantity is undefined && quantity < maxQuantity', () => {
        item.setQuantity(maxQuantity - 1);
        expect(item.status).toBe(ItemStatus.BUY_ON_SALE);
      });

      it('to OK if quantity >= maxQuantity', () => {
        item.setQuantity(maxQuantity);
        expect(item.status).toBe(ItemStatus.OK);
      });

      it('to OK if quantity > minQuantity && maxQuantity is undefined', () => {
        item.maxQuantity = undefined;
        item.setQuantity(minQuantity + 1);
        expect(item.status).toBe(ItemStatus.OK);
      });
    });
  });
});
