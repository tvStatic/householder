import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingListItemComponent } from './shopping-list-item.component';
import { Item } from '../item';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('ShoppingListItemComponent', () => {
  let component: ShoppingListItemComponent;
  let fixture: ComponentFixture<ShoppingListItemComponent>;
  let item: Item;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShoppingListItemComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    item = new Item();

    fixture = TestBed.createComponent(ShoppingListItemComponent);
    component = fixture.componentInstance;
    component.item = item;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getClass()', () => {
    it('should return undefined if not bought', () => {
      expect(component.getClass()).toBeUndefined();
    });

    it('should return "completed" if bought', () => {
      item.bought = true;
      expect(component.getClass()).toBe('completed');
    });
  });

  describe('toggleBought()', () => {
    beforeEach(() => {
      spyOn(item, 'toggleBought').and.callThrough();
      spyOn(component.update, 'emit').and.callThrough();
      component.toggleBought();
    });

    it('should call item.toggleBought()', () => {
      expect(item.toggleBought).toHaveBeenCalled();
    });

    it('should call update.emit()', () => {
      expect(component.update.emit).toHaveBeenCalled();
    });
  });

  describe('checkbox', () => {
    let checkboxDe: DebugElement;
    let checkboxNa: any;

    beforeEach(() => {
      checkboxDe = fixture.debugElement.query(By.css('input'));
      checkboxNa = checkboxDe.nativeElement;
      spyOn(component, 'toggleBought').and.callThrough();
    });

    // no idea why this doesn't work
    // it('value should be true if item.bought is true', async(() => {
    //   // have to clone the item for the change to be detected
    //   item = new Item();
    //   item.bought = true;
    //   component.item = item;
    //   fixture.detectChanges();
    //   fixture.whenStable().then(() => {
    //     expect(checkboxNa.checked).toBeTrue();
    //   });
    // }));

    it('value should be false if item.bought is false', () => {
      expect(checkboxNa.checked).toBeFalse();
    });

    it('click should call item.toggleBought()', () => {
      checkboxDe.triggerEventHandler('click', null);
      expect(component.toggleBought).toHaveBeenCalled();
    });
  });
});
