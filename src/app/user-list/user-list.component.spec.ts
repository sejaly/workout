
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { UserListComponent } from './user-list.component';
import { LocalStorageService } from '../local-storage.service';
import { GraphDialogComponent } from '../graph-dialog/graph-dialog.component';

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let mockLocalStorageService: jasmine.SpyObj<LocalStorageService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    mockLocalStorageService = jasmine.createSpyObj('LocalStorageService', ['getItem', 'setItem']);
    
    
    const matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed', 'close']);
    matDialogRefMock.afterClosed.and.returnValue(of({ someProperty: 'someValue' }));

    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    mockDialog.open.and.returnValue(matDialogRefMock);

    await TestBed.configureTestingModule({
      imports: [FormsModule, MatDialogModule],
      declarations: [UserListComponent, GraphDialogComponent],
      providers: [
        { provide: LocalStorageService, useValue: mockLocalStorageService },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize users from local storage or fallback to default data', () => {
   
    const mockUsers = [{ id: 1, name: 'John Doe', workouts: [{ type: 'Running', minutes: 30 }] }];
    mockLocalStorageService.getItem.and.returnValue(JSON.stringify(mockUsers));
    component.ngOnInit();
    expect(component.users).toEqual(mockUsers);

    mockLocalStorageService.getItem.and.returnValue('invalid json');
    spyOn(console, 'error');
    component.ngOnInit();
    expect(console.error).toHaveBeenCalledWith('Failed to parse users from local storage:', jasmine.any(SyntaxError));
    expect(component.users).toEqual(component['userData']);

    
    mockLocalStorageService.getItem.and.returnValue(null);
    component.ngOnInit();
    expect(component.users).toEqual(component['userData']);
  });

  it('should handle adding a new user', () => {
    component.newUser = { name: 'New User', type: 'Cycling', minutes: 45 };
    component.users = [
      { id: 1, name: 'John Doe', workouts: [{ type: 'Running', minutes: 30 }] },
      { id: 2, name: 'Jane Smith', workouts: [{ type: 'Swimming', minutes: 60 }] }
    ];
    component.addUser();
    expect(component.users.length).toBe(3);
    expect(component.users[2].name).toBe('New User');
    expect(mockLocalStorageService.setItem).toHaveBeenCalledWith('users', JSON.stringify(component.users));
  });

  it('should handle adding duplicate users', () => {
    component.newUser = { name: 'John Doe', type: 'Cycling', minutes: 45 };
    component.users = [
      { id: 1, name: 'John Doe', workouts: [{ type: 'Running', minutes: 30 }] }
    ];
    component.addUser();
    expect(component.users.length).toBe(1);
    expect(component.users[0].workouts.length).toBe(2);
    expect(component.users[0].workouts[1].type).toBe('Cycling');
    expect(component.users[0].workouts[1].minutes).toBe(45);
    expect(mockLocalStorageService.setItem).toHaveBeenCalledWith('users', JSON.stringify(component.users));
  });

  it('should filter users correctly', () => {
    component.users = [
      { id: 1, name: 'John Doe', workouts: [{ type: 'Running', minutes: 30 }] },
      { id: 2, name: 'Jane Smith', workouts: [{ type: 'Swimming', minutes: 60 }] }
    ];
    component.searchTerm = 'John';
    component.filterType = 'Running';
    const filteredUsers = component.filteredUsers();
    expect(filteredUsers.length).toBe(1);
    expect(filteredUsers[0].name).toBe('John Doe');

    // No matches
    component.searchTerm = 'Nonexistent';
    const noMatchUsers = component.filteredUsers();
    expect(noMatchUsers.length).toBe(0);

    // Only filter type
    component.searchTerm = '';
    component.filterType = 'Running';
    const filteredByType = component.filteredUsers();
    expect(filteredByType.length).toBe(1);
    expect(filteredByType[0].name).toBe('John Doe');
  });

  it('should paginate users correctly', () => {
    component.users = new Array(10).fill({ id: 1, name: 'User', workouts: [] });
    
    // Pagination on first page
    component.currentPage = 1;
    const firstPageUsers = component.paginatedUsers;
    expect(firstPageUsers.length).toBe(5);
    expect(firstPageUsers[0].name).toBe('User');

    // Pagination on second page
    component.currentPage = 2;
    const secondPageUsers = component.paginatedUsers;
    expect(secondPageUsers.length).toBe(5);
    expect(secondPageUsers[0].name).toBe('User');
    
    // Test with fewer items than itemsPerPage
    component.users = new Array(3).fill({ id: 1, name: 'User', workouts: [] });
    component.currentPage = 1;
    const fewerItemsPage = component.paginatedUsers;
    expect(fewerItemsPage.length).toBe(3);
  });

  it('should calculate total workout minutes for a user', () => {
    const user = { id: 1, name: 'John Doe', workouts: [{ type: 'Running', minutes: 30 }, { type: 'Cycling', minutes: 45 }] };
    const totalMinutes = component.getTotalWorkoutMinutes(user);
    expect(totalMinutes).toBe(75);
  });

  it('should get workout types for a user', () => {
    const user = { id: 1, name: 'John Doe', workouts: [{ type: 'Running', minutes: 30 }, { type: 'Cycling', minutes: 45 }] };
    const workoutTypes = component.getWorkoutTypes(user);
    expect(workoutTypes).toBe('Running, Cycling');
  });

  it('should get number of unique workouts for a user', () => {
    const user = { id: 1, name: 'John Doe', workouts: [{ type: 'Running', minutes: 30 }, { type: 'Cycling', minutes: 45 }, { type: 'Running', minutes: 20 }] };
    const numOfWorkouts = component.getNumberOfWorkouts(user);
    expect(numOfWorkouts).toBe(2);
  });

  it('should correctly navigate to previous page', () => {
    component.currentPage = 2;
    component.prevPage();
    expect(component.currentPage).toBe(1);
  });

  it('should correctly navigate to next page', () => {
    component.currentPage = 1;
    component.users = new Array(10).fill({ id: 1, name: 'User', workouts: [] });
    component.nextPage();
    expect(component.currentPage).toBe(2);
  });

  it('should not navigate to previous page if already on first page', () => {
    component.currentPage = 1;
    component.prevPage();
    expect(component.currentPage).toBe(1);
  });

  it('should not navigate to next page if already on last page', () => {
    component.currentPage = 3;
    component.users = new Array(15).fill({ id: 1, name: 'User', workouts: [] });
    component.nextPage();
    expect(component.currentPage).toBe(3);
  });

  it('should get the total number of pages', () => {
    component.users = new Array(10).fill({ id: 1, name: 'User', workouts: [] });
    expect(component.totalPages).toBe(2);
    
    // Test with fewer items than itemsPerPage
    component.users = new Array(3).fill({ id: 1, name: 'User', workouts: [] });
    expect(component.totalPages).toBe(1);
  });

  it('should reset search term and filter type', () => {
    component.searchTerm = 'John';
    component.filterType = 'Running';
    component.filteredUsers(); // Apply filters
    component.searchTerm = '';
    component.filterType = '';
    expect(component.filteredUsers().length).toBe(3); // Assuming initial data has 3 users
  });

  it('should clear new user after adding', () => {
    component.newUser = { name: 'New User', type: 'Cycling', minutes: 45 };
    component.addUser();
    expect(component.newUser).toEqual({ name: '', type: '', minutes: 0 });
  });

  it('should open graph dialog with correct data', () => {
    const user = { id: 1, name: 'John Doe', workouts: [{ type: 'Running', minutes: 30 }] };
    component.openGraphDialog(user);

    expect(mockDialog.open).toHaveBeenCalledWith(GraphDialogComponent, {
      data: {
        graphTitle: `${user.name}'s Workout Progress`,
        chartLabels: user.workouts.map(w => w.type),
        chartData: user.workouts.map(w => w.minutes)
      }
    });
  });
});
