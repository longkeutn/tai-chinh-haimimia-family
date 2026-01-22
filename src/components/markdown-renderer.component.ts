
import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-markdown-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="markdown-content space-y-4 text-gray-800 leading-relaxed" [innerHTML]="processedContent()"></div>
  `,
  styles: [`
    :host ::ng-deep h3 { font-size: 1.25rem; font-weight: 700; color: #1f2937; margin-top: 1.5rem; margin-bottom: 0.5rem; }
    :host ::ng-deep strong { font-weight: 600; color: #111827; }
    :host ::ng-deep ul { list-style-type: disc; padding-left: 1.5rem; margin-top: 0.5rem; }
    :host ::ng-deep li { margin-bottom: 0.25rem; }
    :host ::ng-deep p { margin-bottom: 0.75rem; }
  `]
})
export class MarkdownRendererComponent {
  content = input.required<string>();

  processedContent = computed(() => {
    let text = this.content();
    if (!text) return '';

    // Escape HTML first to prevent XSS from input
    text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Headers (### Header)
    text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold (**text**)
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Lists (* item)
    // Wrap lists in <ul> is hard with regex alone without strict state, 
    // so we just replace list items with styled divs or lis.
    // A simple approach for this specific output format:
    text = text.replace(/^\* (.*$)/gim, '<li>$1</li>');
    
    // Wrap consecutive <li> in <ul> (Naive approach)
    // For robust markdown, we'd use a library, but here we do simple checks
    // We will trust the browser to handle <li> somewhat gracefully or just use <br>
    
    // Better approach for lists in this simple parser:
    // If a line starts with <li>, we leave it. If we have a block of them...
    // Actually, let's keep it simple: Replace newlines with <br> unless it's a header/list
    
    text = text.replace(/\n/g, '<br>');
    
    // Cleanup <br> after headers
    text = text.replace(/<\/h3><br>/g, '</h3>');
    
    return text;
  });
}
