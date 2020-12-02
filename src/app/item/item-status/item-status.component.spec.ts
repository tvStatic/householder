import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemStatusComponent } from './item-status.component';
import { Item } from '../item';

describe('ItemQuantityComponent', () => {
  let component: ItemStatusComponent;
  let fixture: ComponentFixture<ItemStatusComponent>;
  let item: Item;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ItemStatusComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    item = new Item();

    fixture = TestBed.createComponent(ItemStatusComponent);
    component = fixture.componentInstance;
    component.item = item;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
