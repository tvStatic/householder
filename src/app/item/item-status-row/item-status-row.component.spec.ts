import { ItemStatusRowComponent } from './item-status-row.component';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Item, ItemStatus } from '../item';

describe('ItemStatusRowComponent', () => {
  let component: ItemStatusRowComponent;
  let fixture: ComponentFixture<ItemStatusRowComponent>;
  let item: Item;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ItemStatusRowComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    item = new Item();

    fixture = TestBed.createComponent(ItemStatusRowComponent);
    component = fixture.componentInstance;
    component.item = item;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('okClass()', () => {
    it('should return "btn-light" if not OK', () => {
      expect(component.okClass()).toBe('btn-light');
    });

    // TODO - expire tests and others
  });

  describe('needMoreClass()', () => {
    it('should return "btn-light" if not NEED_MORE', () => {
      expect(component.needMoreClass()).toBe('btn-light');
    });

    it('should return "btn-outline-success expired" if NEED_MORE and bought', () => {
      item.status = ItemStatus.NEED_MORE;
      item.bought = true;
      expect(component.needMoreClass()).toBe('btn-outline-success expired');
    });

    it('should return "btn-success" if NEED_MORE and not bought', () => {
      item.status = ItemStatus.NEED_MORE;
      expect(component.needMoreClass()).toBe('btn-success');
    });
  });

  describe('buyOnSaleClass()', () => {
    it('should return "btn-light" if not BUY_ON_SALE', () => {
      expect(component.buyOnSaleClass()).toBe('btn-light');
    });

    it('should return "btn-outline-success expired" if BUY_ON_SALE and bought', () => {
      item.status = ItemStatus.BUY_ON_SALE;
      item.bought = true;
      expect(component.buyOnSaleClass()).toBe('btn-outline-success expired');
    });

    it('should return "btn-success" if BUY_ON_SALE and not bought', () => {
      item.status = ItemStatus.BUY_ON_SALE;
      expect(component.buyOnSaleClass()).toBe('btn-success');
    });
  });
});
