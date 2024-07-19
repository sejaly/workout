import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-graph-dialog',
  templateUrl: './graph-dialog.component.html',
  styleUrls: ['./graph-dialog.component.css']
})
export class GraphDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.createChart();
  }

  createChart() {
    
    const workoutData = this.processData(this.data.chartLabels, this.data.chartData);

    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    if (ctx) {
      new Chart(ctx.getContext('2d') as CanvasRenderingContext2D, {
        type: 'bar',
        data: {
          labels: workoutData.labels,
          datasets: [{
            label: 'Minutes',
            data: workoutData.data,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Minutes'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Workout Type'
              }
            }
          }
        }
      });
    } else {
      console.error('Canvas element not found.');
    }
  }

  processData(labels: string[], data: number[]) {
    const uniqueData = new Map<string, number>();

    labels.forEach((label, index) => {
      if (uniqueData.has(label)) {
        uniqueData.set(label, uniqueData.get(label)! + data[index]);
      } else {
        uniqueData.set(label, data[index]);
      }
    });

    
    return {
      labels: Array.from(uniqueData.keys()),
      data: Array.from(uniqueData.values())
    };
  }
}
