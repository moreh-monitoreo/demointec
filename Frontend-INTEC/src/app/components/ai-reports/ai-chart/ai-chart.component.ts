import { Component, Input, OnChanges, OnDestroy, AfterViewInit, ViewChild, ElementRef, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { AiChartSpec } from '../../../models/ai-report';

const PALETTE = ['#F58525', '#54ADEC', '#2E8B57', '#8E5FD4', '#D64550', '#2FA39B'];

@Component({
  selector: 'app-ai-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-chart.component.html',
  styleUrl: './ai-chart.component.css',
})
export class AiChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) spec!: AiChartSpec;
  @ViewChild('canvasRef') canvasRef?: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;
  private viewReady = false;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      Chart.register(...registerables);
    }
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.render();
  }

  ngOnChanges(): void {
    if (this.viewReady) this.render();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private render(): void {
    if (!this.isBrowser || !this.canvasRef || !this.spec) return;

    this.chart?.destroy();
    const isCircular = this.spec.type === 'pie' || this.spec.type === 'doughnut';

    const config: ChartConfiguration = {
      type: this.spec.type,
      data: {
        labels: this.spec.labels,
        datasets: this.spec.datasets.map((ds, i) => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: isCircular
            ? this.spec.labels.map((_, j) => PALETTE[j % PALETTE.length])
            : PALETTE[i % PALETTE.length],
          borderColor: isCircular ? '#ffffff' : PALETTE[i % PALETTE.length],
          borderWidth: isCircular ? 2 : 0,
          borderRadius: isCircular ? 0 : 4,
          maxBarThickness: 48,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: !!this.spec.title,
            text: this.spec.title,
            color: '#333',
            font: { size: 13, weight: 'bold' },
            padding: { bottom: 14 },
          },
          legend: {
            display: this.spec.datasets.length > 1 || isCircular,
            position: 'bottom',
            labels: { boxWidth: 12, font: { size: 11 } },
          },
        },
        scales: isCircular ? {} : {
          y: { beginAtZero: true, grid: { color: '#eee' }, ticks: { font: { size: 11 } } },
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 11 },
              maxRotation: 35,
              minRotation: 0,
              autoSkip: true,
              callback: function (value) {
                const label = this.getLabelForValue(value as number);
                return label.length > 16 ? label.slice(0, 15) + '…' : label;
              },
            },
          },
        },
      },
    };

    this.chart = new Chart(this.canvasRef.nativeElement, config);
  }
}
