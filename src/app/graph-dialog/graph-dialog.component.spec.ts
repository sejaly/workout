import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GraphDialogComponent } from './graph-dialog.component';

describe('GraphDialogComponent', () => {
  let component: GraphDialogComponent;
  let fixture: ComponentFixture<GraphDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule],
      declarations: [GraphDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { 
          graphTitle: 'Test Title', 
          chartLabels: ['Running', 'Swimming'], 
          chartData: [30, 60] 
        }}
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct title', () => {
    expect(component.data.graphTitle).toBe('Test Title');
  });

  it('should process data correctly', () => {
    const processedData = component.processData(['Running', 'Swimming', 'Running'], [30, 60, 15]);
    expect(processedData.labels).toEqual(['Running', 'Swimming']);
    expect(processedData.data).toEqual([45, 60]);
  });

  // Add more tests as needed
});
