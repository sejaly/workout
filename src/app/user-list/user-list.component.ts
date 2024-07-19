import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '../local-storage.service';
import { MatDialog } from '@angular/material/dialog';
import { GraphDialogComponent } from '../graph-dialog/graph-dialog.component';

interface Workout {
  type: string;
  minutes: number;
}

interface User {
  id: number;
  name: string;
  workouts: Workout[];
}

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  searchTerm = '';
  filterType = '';
  workoutTypes = ['Running', 'Cycling', 'Swimming', 'Yoga'];
  newUser = { name: '', type: '', minutes: 0 };
  currentPage = 1;
  itemsPerPage = 5;

  private userData: User[] = [
    {
      id: 1,
      name: 'John Doe',
      workouts: [
        { type: 'Running', minutes: 30 },
        { type: 'Cycling', minutes: 45 }
      ]
    },
    {
      id: 2,
      name: 'Jane Smith',
      workouts: [
        { type: 'Swimming', minutes: 60 },
        { type: 'Running', minutes: 20 }
      ]
    },
    {
      id: 3,
      name: 'Mike Johnson',
      workouts: [
        { type: 'Yoga', minutes: 50 },
        { type: 'Cycling', minutes: 40 }
      ]
    }
  ];

  constructor(private localStorageService: LocalStorageService, public dialog: MatDialog) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    const storedUsers = this.localStorageService.getItem('users');
    if (storedUsers) {
      try {
        this.users = JSON.parse(storedUsers) as User[];
      } catch (e) {
        console.error('Failed to parse users from local storage:', e);
        this.users = this.userData; 
      }
    } else {
      this.users = this.userData; 
    }
  }

  addUser() {
    const existingUser = this.users.find(user => user.name === this.newUser.name);
    if (existingUser) {
      existingUser.workouts.push({ type: this.newUser.type, minutes: this.newUser.minutes });
    } else {
      const newUser: User = {
        id: this.users.length ? Math.max(...this.users.map(u => u.id)) + 1 : 1,
        name: this.newUser.name,
        workouts: [{ type: this.newUser.type, minutes: this.newUser.minutes }]
      };
      this.users.push(newUser);
    }
    this.localStorageService.setItem('users', JSON.stringify(this.users));
    this.newUser = { name: '', type: '', minutes: 0 };
  }

  filteredUsers() {
    let filtered = this.users.filter(user =>
      user.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    if (this.filterType) {
      filtered = filtered.filter(user =>
        user.workouts.some(w => w.type === this.filterType)
      );
    }

    return filtered;
  }

  get paginatedUsers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers().slice(startIndex, startIndex + this.itemsPerPage);
  }

  getTotalWorkoutMinutes(user: User): number {
    return user.workouts.reduce((sum, w) => sum + w.minutes, 0);
  }

  getWorkoutTypes(user: User): string {
    const uniqueTypes = new Set(user.workouts.map(w => w.type));
    return Array.from(uniqueTypes).join(', ');
  }

  getNumberOfWorkouts(user: User): number {
    const uniqueWorkouts = new Set(user.workouts.map(w => w.type));
    return uniqueWorkouts.size;
  }

  get totalPages() {
    return Math.ceil(this.filteredUsers().length / this.itemsPerPage);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // handleButtonClick(user: User) {
  //   // Implement the logic for button click, e.g., show details or edit user
  //   alert(`Button clicked for user: ${user.name}`);
  // }

 
  openGraphDialog(user: User) {
    this.dialog.open(GraphDialogComponent, {
      data: {
        graphTitle: `${user.name}'s Workout Progress`,
        chartLabels: user.workouts.map(w => w.type),
        chartData: user.workouts.map(w => w.minutes)
      }
    });
  }
}

