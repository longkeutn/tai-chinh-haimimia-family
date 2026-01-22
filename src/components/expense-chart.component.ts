
import { Component, ElementRef, ViewChild, input, effect, OnDestroy } from '@angular/core';

declare const d3: any;

@Component({
  selector: 'app-expense-chart',
  standalone: true,
  template: `
    <div class="w-full flex flex-col items-center">
      <div #chartContainer class="relative w-full max-w-[300px] h-[300px]"></div>
      <div class="mt-4 grid grid-cols-2 gap-2 text-sm w-full">
        @for (item of legendData(); track item.label) {
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full" [style.background-color]="item.color"></span>
            <span class="text-gray-600 truncate">{{ item.label }}</span>
            <span class="font-medium text-gray-900 ml-auto">{{ item.formattedValue }}</span>
          </div>
        }
      </div>
    </div>
  `
})
export class ExpenseChartComponent {
  data = input.required<{ category: string; amount: number }[]>();
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  
  legendData = input<{label: string, value: number, color: string, formattedValue: string}[]>([]);

  constructor() {
    effect(() => {
      const chartData = this.data();
      if (chartData && chartData.length > 0 && this.chartContainer) {
        this.drawChart(chartData);
      }
    });
  }

  private drawChart(data: { category: string; amount: number }[]) {
    const element = this.chartContainer.nativeElement;
    d3.select(element).selectAll('*').remove();

    const width = 300;
    const height = 300;
    const margin = 20;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.category))
      .range(d3.schemeSet2); // Nice pastel colors

    // Compute the position of each group on the pie:
    const pie = d3.pie()
      .value((d: any) => d.amount)
      .sort(null); // Do not sort by size if you want to keep input order

    const data_ready = pie(data);

    // Shape helper to build arcs:
    const arc = d3.arc()
      .innerRadius(radius * 0.5)         // This is the size of the donut hole
      .outerRadius(radius * 0.8);

    const arcHover = d3.arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius * 0.9);

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
      .selectAll('allSlices')
      .data(data_ready)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d: any) => color(d.data.category))
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .style('opacity', 0.9)
      .style('transition', 'opacity 0.3s')
      .on('mouseover', function(this: any, event: any, d: any) {
         d3.select(this).transition().duration(200).attr('d', arcHover).style('opacity', 1);
      })
      .on('mouseout', function(this: any, event: any, d: any) {
         d3.select(this).transition().duration(200).attr('d', arc);
      });

    // Add center text
    const total = data.reduce((acc, curr) => acc + curr.amount, 0);
    const formattedTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumSignificantDigits: 3 }).format(total);

    svg.append("text")
       .attr("text-anchor", "middle")
       .attr("dy", "-0.5em")
       .text("Tổng chi")
       .style("font-size", "14px")
       .style("fill", "#6b7280");
    
    svg.append("text")
       .attr("text-anchor", "middle")
       .attr("dy", "1em")
       .text(formattedTotal)
       .style("font-size", "16px")
       .style("font-weight", "bold")
       .style("fill", "#111827");
  }
}
