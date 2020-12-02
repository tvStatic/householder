import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentUserComponent } from './current-user.component';
import { UserService } from '../user.service';

describe('CurrentUserComponent', () => {
  let component: CurrentUserComponent;
  let fixture: ComponentFixture<CurrentUserComponent>;
  let userServiceSpy: {
    getUsername: jasmine.Spy;
    subscribeToCurrentUserChanges: jasmine.Spy;
  };

  beforeEach(async(() => {
    userServiceSpy = jasmine.createSpyObj('UserService', [
      'getUsername',
      'subscribeToCurrentUserChanges'
    ]);
    userServiceSpy.getUsername.and.returnValue('testUser');

    TestBed.configureTestingModule({
      declarations: [CurrentUserComponent],
      providers: [
        CurrentUserComponent,
        { provide: UserService, useValue: userServiceSpy }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
