import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingListComponent } from './shopping-list.component';
import { Item, GroupBy } from '../item';
import { ItemService } from '../item.service';

describe('ShoppingListComponent', () => {
  let component: ShoppingListComponent;
  let fixture: ComponentFixture<ShoppingListComponent>;
  let customItem: Item;
  let item: Item;
  let items: Item[];
  let itemService: ItemService;

  beforeEach(async(() => {
    item = new Item();
    item.needMore();
    customItem = new Item();
    customItem.custom = true;
    customItem.needMore();
    items = [item, customItem];

    TestBed.configureTestingModule({
      declarations: [ShoppingListComponent]
    }).compileComponents();

    itemService = TestBed.inject(ItemService);
    spyOn(itemService, 'getItems').and.returnValue(items);
    spyOn(itemService, 'updateItem').and.stub();
    spyOn(itemService, 'deleteItem').and.stub();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShoppingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('complete()', () => {
    describe('items bought', () => {
      beforeEach(() => {
        customItem.bought = true;
        item.bought = true;
        component.complete();
      });

      it('itemService.deleteItem() is called with custom item', () => {
        expect(itemService.deleteItem).toHaveBeenCalledWith(customItem);
      });

      it('itemService.updateItem() is called with non-custom item', () => {
        expect(itemService.updateItem).toHaveBeenCalledWith(item);
      });
    });

    describe('items not bought', () => {
      beforeEach(() => {
        component.complete();
      });

      it('itemService.deleteItem() is not called', () => {
        expect(itemService.deleteItem).not.toHaveBeenCalledWith(customItem);
      });

      it('itemService.updateItem() is not called', () => {
        expect(itemService.updateItem).not.toHaveBeenCalledWith(item);
      });
    });
  });

  describe('hasCompleted()', () => {
    it('should return true if items bought', () => {
      customItem.bought = true;
      expect(component.hasCompleted()).toBeTrue();
    });

    it('should return false if no items bought', () => {
      expect(component.hasCompleted()).toBeFalse();
    });
  });
});
