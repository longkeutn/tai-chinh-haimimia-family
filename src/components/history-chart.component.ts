
import { Component, ElementRef, ViewChild, input, effect } from '@angular/core';
import { FinanceRecord } from '../models/history.model';

declare const d3: any;

@Component({
  selector: 'app-history-chart',
  standalone: true,
  template: `
    <div class="w-full flex flex-col items-center">
      <div #chartContainer class="w-full h-[300px]"></div>
      <div class="flex gap-4 mt-2 text-xs text-slate-500">
        <div class="flex items-center gap-1"><span class="w-3 h-3 bg-blue-500 rounded-sm"></span> Thu nhập</div>
        <div class="flex items-center gap-1"><span class="w-3 h-3 bg-red-400 rounded-sm"></span> Chi tiêu</div>
      </div>
    </div>
  `
})
export class HistoryChartComponent {
  data = input.required<FinanceRecord[]>();
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  constructor() {
    effect(() => {
      const records = this.data();
      if (records && this.chartContainer) {
        // Take last 6 months for chart clarity and reverse to show chronological order left-to-right
        const chartData = [...records].slice(0, 6).reverse(); 
        this.drawChart(chartData);
      }
    });
  }

  private drawChart(data: FinanceRecord[]) {
    const element = this.chartContainer.nativeElement;
    d3.select(element).selectAll('*').remove();

    if (data.length === 0) return;

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${element.clientWidth} 300`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Axis
    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => d.month))
      .padding(0.3);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'middle');

    // Y Axis
    const maxVal = d3.max(data, (d: any) => Math.max(d.income, d.totalExpense)) || 0;
    const y = d3.scaleLinear()
      .domain([0, maxVal * 1.1])
      .range([height, 0]);

    svg.append('g').call(d3.axisLeft(y).ticks(5).tickFormat((d: any) => {
        if(d >= 1000000) return (d/1000000) + 'M';
        if(d >= 1000) return (d/1000) + 'k';
        return d;
    }));

    // Draw Income Bars
    svg.selectAll('barIncome')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d: any) => x(d.month)!)
      .attr('y', (d: any) => y(d.income))
      .attr('width', x.bandwidth() / 2)
      .attr('height', (d: any) => height - y(d.income))
      .attr('fill', '#3b82f6')
      .attr('rx', 2);

    // Draw Expense Bars
    svg.selectAll('barExpense')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d: any) => x(d.month)! + x.bandwidth() / 2)
      .attr('y', (d: any) => y(d.totalExpense))
      .attr('width', x.bandwidth() / 2)
      .attr('height', (d: any) => height - y(d.totalExpense))
      .attr('fill', '#f87171')
      .attr('rx', 2);
  }
}
