
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { GeminiService } from './services/gemini.service';
import { HistoryService } from './services/history.service';
import { ExpenseChartComponent } from './components/expense-chart.component';
import { HistoryChartComponent } from './components/history-chart.component';
import { MarkdownRendererComponent } from './components/markdown-renderer.component';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, INVESTMENT_CATEGORIES, OWNERS, SAMPLE_DATA } from './data/categories';
import { FinanceRecord } from './models/history.model';

declare const d3: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ExpenseChartComponent, MarkdownRendererComponent, HistoryChartComponent],
  template: `
    <div class="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      <!-- Top Navigation -->
      <nav class="bg-indigo-800 text-white shadow-lg sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-3">
              <div class="bg-white/10 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div class="leading-tight">
                <div class="font-bold text-lg tracking-wide">Family Finance AI</div>
                <div class="text-xs text-indigo-200">Quản lý & Đầu tư</div>
              </div>
            </div>
            <div class="flex gap-2 text-sm font-medium bg-indigo-900/50 p-1 rounded-lg">
              <button (click)="viewMode.set('analysis')" 
                [class]="viewMode() === 'analysis' ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-200 hover:text-white'"
                class="px-4 py-1.5 rounded-md transition-all">
                Phân tích
              </button>
              <button (click)="viewMode.set('history')" 
                [class]="viewMode() === 'history' ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-200 hover:text-white'"
                class="px-4 py-1.5 rounded-md transition-all">
                Lịch sử
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto px-4 py-8">
        
        <!-- MODE: ANALYSIS -->
        @if (viewMode() === 'analysis') {
          
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <!-- Left Column: Input Form -->
            <div class="lg:col-span-5 space-y-6">
              <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h2 class="font-bold text-slate-700 flex items-center gap-2">
                    <svg class="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Dữ liệu Tài chính
                  </h2>
                  <button type="button" (click)="fillSampleData()" 
                          class="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline">
                    Mẫu chi tiết
                  </button>
                </div>
                
                <form [formGroup]="financeForm" (ngSubmit)="analyze()" class="p-5 space-y-6">
                  
                  <!-- Month -->
                  <div>
                    <label class="block text-xs font-bold uppercase text-slate-400 mb-1">Tháng báo cáo</label>
                    <input type="month" formControlName="thoi_gian" 
                           class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 font-medium">
                  </div>

                  <!-- Income Section -->
                  <div class="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                    <div class="flex justify-between items-center mb-3">
                       <label class="block text-xs font-bold uppercase text-indigo-800">Nguồn thu nhập</label>
                       <span class="text-sm font-bold text-indigo-700">{{ formatCurrency(calculateTotalIncome()) }}</span>
                    </div>

                    <div formArrayName="nguon_thu" class="space-y-2">
                      @for (control of incomeArray.controls; track $index) {
                        <div [formGroupName]="$index" class="flex gap-2 items-center">
                          <select formControlName="category" 
                                  class="flex-grow w-full px-2 py-1.5 bg-white border border-indigo-200 rounded-md text-sm focus:outline-none focus:border-indigo-500">
                             @for (cat of incomeCategories; track cat) {
                               <option [value]="cat">{{ cat }}</option>
                             }
                          </select>
                          <input type="number" formControlName="amount" placeholder="Số tiền"
                                 class="w-24 px-2 py-1.5 bg-white border border-indigo-200 rounded-md text-sm text-right focus:outline-none focus:border-indigo-500">
                          <button type="button" (click)="removeIncomeRow($index)" class="text-slate-400 hover:text-red-500">
                            &times;
                          </button>
                        </div>
                      }
                    </div>
                    <button type="button" (click)="addIncomeRow()" class="mt-2 text-xs text-indigo-600 hover:underline flex items-center gap-1">
                      + Thêm nguồn thu
                    </button>
                  </div>

                  <!-- Expenses Section -->
                  <div>
                    <div class="flex justify-between items-end mb-2">
                      <label class="block text-xs font-bold uppercase text-slate-400">Các khoản chi</label>
                      <span class="text-xs text-slate-500">Tổng: {{ formatCurrency(calculateTotalExpenses()) }}</span>
                    </div>
                    
                    <div formArrayName="chi_tiet_chi_tieu" class="space-y-2 mb-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                      @for (control of expenseArray.controls; track $index) {
                        <div [formGroupName]="$index" class="flex flex-col sm:flex-row gap-2 items-start sm:items-center p-2 rounded-lg border border-slate-100 bg-slate-50 hover:border-slate-300 transition-colors">
                          <div class="flex-grow w-full sm:w-auto">
                             <select formControlName="category" 
                                class="w-full bg-transparent font-medium text-sm text-slate-700 outline-none border-none p-0 focus:ring-0 cursor-pointer">
                                @for (cat of expenseCategories; track cat) {
                                  <option [value]="cat">{{ cat }}</option>
                                }
                             </select>
                          </div>
                          
                          <div class="flex items-center gap-2 w-full sm:w-auto">
                            <!-- Owner Selector -->
                            <div class="relative group">
                              <select formControlName="owner" 
                                      class="appearance-none w-6 h-6 rounded-full border-none cursor-pointer outline-none text-transparent"
                                      [style.background-color]="getOwnerColor($index)">
                                 @for (owner of owners; track owner.id) {
                                   <option [value]="owner.id">{{ owner.label }}</option>
                                 }
                              </select>
                              <div class="absolute inset-0 flex items-center justify-center pointer-events-none text-[10px] text-white font-bold uppercase">
                                {{ getOwnerLabel($index).charAt(0) }}
                              </div>
                            </div>

                            <input type="number" formControlName="amount" placeholder="Số tiền"
                                   class="w-24 px-2 py-1 bg-white border border-slate-200 rounded-md text-sm text-right focus:ring-1 focus:ring-indigo-500 outline-none">
                            
                            <button type="button" (click)="removeExpenseRow($index)" 
                                    class="text-slate-300 hover:text-red-500 transition-colors px-1">
                               &times;
                            </button>
                          </div>
                        </div>
                      }
                    </div>

                    <button type="button" (click)="addExpenseRow()" 
                            class="w-full py-2 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all text-sm font-medium flex justify-center items-center gap-2">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                      Thêm khoản chi
                    </button>
                  </div>

                  <!-- Investment Portfolio Section (NEW) -->
                  <div class="pt-2 border-t border-slate-100">
                    <div class="flex justify-between items-center mb-3">
                       <label class="block text-xs font-bold uppercase text-emerald-700">Danh mục Đầu tư & Tích lũy</label>
                       <span class="text-sm font-bold text-emerald-600">{{ formatCurrency(calculateTotalInvestment()) }}</span>
                    </div>

                    <div formArrayName="danh_muc_dau_tu" class="space-y-3">
                       @for (control of investmentArray.controls; track $index) {
                         <div [formGroupName]="$index" class="p-3 rounded-lg border border-emerald-100 bg-emerald-50/50 space-y-2">
                            <div class="flex gap-2">
                               <select formControlName="category" 
                                      class="flex-grow w-full px-2 py-1.5 bg-white border border-emerald-200 rounded-md text-sm focus:outline-none focus:border-emerald-500">
                                 @for (cat of investmentCategories; track cat) {
                                   <option [value]="cat">{{ cat }}</option>
                                 }
                               </select>
                               <button type="button" (click)="removeInvestmentRow($index)" class="text-slate-400 hover:text-red-500">
                                  &times;
                               </button>
                            </div>
                            <div class="flex gap-2">
                               <input type="number" formControlName="amount" placeholder="Giá trị hiện tại (VNĐ)"
                                      class="w-1/2 px-2 py-1.5 bg-white border border-emerald-200 rounded-md text-sm focus:outline-none focus:border-emerald-500 font-medium">
                               <input type="text" formControlName="note" placeholder="Ghi chú (giá mua, SL...)"
                                      class="w-1/2 px-2 py-1.5 bg-white border border-emerald-200 rounded-md text-sm focus:outline-none focus:border-emerald-500 italic">
                            </div>
                         </div>
                       }
                    </div>

                    <button type="button" (click)="addInvestmentRow()" class="mt-3 text-xs text-emerald-600 hover:underline flex items-center gap-1">
                      + Thêm tài sản đầu tư
                    </button>
                  </div>

                  <!-- Saving Goal (Simple) -->
                  <div class="pt-2">
                      <label class="block text-xs font-bold text-slate-500 mb-1">Mục tiêu tài chính</label>
                      <input type="text" formControlName="muc_tieu_tiet_kiem" placeholder="Vd: Mua xe, Quỹ đại học..." 
                             class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                  </div>

                  <button type="submit" [disabled]="step() === 'loading' || financeForm.invalid"
                          class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                    @if (step() === 'loading') {
                      <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang phân tích...
                    } @else {
                      Phân tích & Nhận lời khuyên
                    }
                  </button>
                </form>
              </div>
            </div>

            <!-- Right Column: Result / Charts -->
            <div class="lg:col-span-7 space-y-6">
              @if (step() === 'result') {
                 <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
                    
                    <!-- Result Header -->
                    <div class="bg-indigo-50 p-6 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                       <div>
                         <h3 class="text-xl font-bold text-indigo-900">Báo cáo Tài chính Gia đình</h3>
                         <div class="text-sm text-indigo-600 mt-1 flex gap-3">
                           <span>Tổng thu: <b>{{ formatCurrency(calculateTotalIncome()) }}</b></span>
                           <span>|</span>
                           <span>Tổng chi: <b>{{ formatCurrency(calculateTotalExpenses()) }}</b></span>
                         </div>
                       </div>
                       <div class="text-right bg-white px-4 py-2 rounded-lg border border-indigo-100 shadow-sm">
                          <div class="text-xs text-slate-500 uppercase font-semibold">Dư trong tháng</div>
                          <div class="text-xl font-bold" [class.text-red-500]="balance() < 0" [class.text-green-600]="balance() >= 0">
                            {{ formatCurrency(balance()) }}
                          </div>
                       </div>
                    </div>

                    <div class="p-6">
                       <div class="flex flex-col md:flex-row gap-8 mb-8">
                          <!-- Chart -->
                          <div class="md:w-5/12 flex flex-col items-center">
                            <h4 class="text-sm font-semibold text-slate-500 mb-4">Cơ cấu chi tiêu</h4>
                            <app-expense-chart [data]="chartData()" [legendData]="legendData()"></app-expense-chart>
                            
                            <!-- Legend for Owners -->
                            <div class="mt-6 flex justify-center gap-4 text-xs">
                              <div class="flex items-center gap-1">
                                <span class="w-3 h-3 rounded-full bg-blue-500"></span> Chồng
                              </div>
                              <div class="flex items-center gap-1">
                                <span class="w-3 h-3 rounded-full bg-pink-500"></span> Vợ
                              </div>
                              <div class="flex items-center gap-1">
                                <span class="w-3 h-3 rounded-full bg-slate-500"></span> Chung
                              </div>
                            </div>
                          </div>
                          <!-- AI Text -->
                          <div class="md:w-7/12">
                             <div class="prose prose-sm prose-indigo max-w-none bg-slate-50 p-5 rounded-xl border border-slate-200 h-full">
                                <app-markdown-renderer [content]="aiResponse()"></app-markdown-renderer>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              } @else {
                <!-- Empty State -->
                <div class="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-white/60 rounded-2xl border-2 border-dashed border-slate-200">
                  <div class="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                     <svg class="w-12 h-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                  </div>
                  <h3 class="text-lg font-bold text-slate-700">Chưa có phân tích nào</h3>
                  <p class="text-slate-500 max-w-sm mt-2">Nhập thu nhập, chi tiêu và danh mục đầu tư để AI phân tích toàn diện.</p>
                </div>
              }
            </div>
          </div>
        }

        <!-- MODE: HISTORY -->
        @if (viewMode() === 'history') {
           <div class="space-y-6 animate-fade-in">
              <div class="flex justify-between items-end">
                <h2 class="text-2xl font-bold text-slate-900">Lịch sử Tài chính</h2>
                <button (click)="clearHistory()" class="text-red-500 hover:text-red-700 text-sm underline" *ngIf="historyService.history().length > 0">
                   Xóa tất cả
                </button>
              </div>

              @if (historyService.history().length > 0) {
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                   <h3 class="text-lg font-semibold text-slate-800 mb-4">Xu hướng Tài sản</h3>
                   <app-history-chart [data]="historyService.history()"></app-history-chart>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   @for (record of historyService.history(); track record.id) {
                     <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div class="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex justify-between items-center">
                           <span class="font-bold text-indigo-900">{{ record.month }}</span>
                           <button (click)="deleteRecord(record.id)" class="text-slate-400 hover:text-red-500">&times;</button>
                        </div>
                        <div class="p-4 space-y-3">
                           <div class="flex justify-between text-sm">
                             <span class="text-slate-500">Tổng Thu nhập</span>
                             <span class="font-medium text-blue-600">{{ formatCurrency(record.income) }}</span>
                           </div>
                           <div class="flex justify-between text-sm">
                             <span class="text-slate-500">Tổng Chi tiêu</span>
                             <span class="font-medium text-red-500">{{ formatCurrency(record.totalExpense) }}</span>
                           </div>
                           <div class="pt-3 border-t border-dashed border-slate-200 flex justify-between items-center">
                             <span class="text-sm font-semibold text-slate-700">Số dư:</span>
                             <span class="font-bold" [class.text-green-600]="record.balance >= 0" [class.text-red-500]="record.balance < 0">
                               {{ formatCurrency(record.balance) }}
                             </span>
                           </div>
                        </div>
                     </div>
                   }
                </div>
              } @else {
                 <div class="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <p class="text-slate-500">Chưa có dữ liệu lịch sử.</p>
                 </div>
              }
           </div>
        }

      </main>
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
    /* Custom scrollbar for form area */
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
  `]
})
export class AppComponent {
  private fb = inject(FormBuilder);
  private geminiService = inject(GeminiService);
  public historyService = inject(HistoryService);

  incomeCategories = INCOME_CATEGORIES;
  expenseCategories = EXPENSE_CATEGORIES;
  investmentCategories = INVESTMENT_CATEGORIES;
  owners = OWNERS;
  
  // App State
  viewMode = signal<'analysis' | 'history'>('analysis');
  step = signal<'input' | 'loading' | 'result'>('input');
  financeForm: FormGroup;
  aiResponse = signal<string>('');
  
  chartData = signal<{ category: string; amount: number }[]>([]);
  balance = signal<number>(0);

  legendData = computed(() => {
    const data = this.chartData();
    const colors = d3.schemeSet2;
    return data.map((item, index) => ({
      label: item.category,
      value: item.amount,
      color: colors[index % colors.length],
      formattedValue: this.formatCurrency(item.amount)
    }));
  });

  constructor() {
    this.financeForm = this.fb.group({
      thoi_gian: [new Date().toISOString().slice(0, 7), Validators.required],
      nguon_thu: this.fb.array([]),
      chi_tiet_chi_tieu: this.fb.array([]),
      danh_muc_dau_tu: this.fb.array([]),
      muc_tieu_tiet_kiem: ['']
    });

    // Initialize with one row each
    this.addIncomeRow();
    this.addExpenseRow();
    this.addInvestmentRow();
  }

  get incomeArray() {
    return this.financeForm.get('nguon_thu') as FormArray;
  }

  get expenseArray() {
    return this.financeForm.get('chi_tiet_chi_tieu') as FormArray;
  }

  get investmentArray() {
    return this.financeForm.get('danh_muc_dau_tu') as FormArray;
  }

  // --- INCOME METHODS ---
  addIncomeRow(category: string = '', amount: number | null = null) {
    const group = this.fb.group({
      category: [category || this.incomeCategories[0], Validators.required],
      amount: [amount, [Validators.required, Validators.min(0)]]
    });
    this.incomeArray.push(group);
  }

  removeIncomeRow(index: number) {
    if (this.incomeArray.length > 1) {
      this.incomeArray.removeAt(index);
    }
  }

  calculateTotalIncome(): number {
    return this.incomeArray.controls.reduce((acc, control) => {
      return acc + (control.get('amount')?.value || 0);
    }, 0);
  }

  // --- EXPENSE METHODS ---
  addExpenseRow(category: string = '', amount: number | null = null, owner: string = 'shared') {
    const expenseGroup = this.fb.group({
      category: [category || this.expenseCategories[0], Validators.required],
      amount: [amount, [Validators.required, Validators.min(0)]],
      owner: [owner]
    });
    this.expenseArray.push(expenseGroup);
  }

  removeExpenseRow(index: number) {
    if (this.expenseArray.length > 1) {
      this.expenseArray.removeAt(index);
    }
  }

  calculateTotalExpenses(): number {
    return this.expenseArray.controls.reduce((acc, control) => {
      return acc + (control.get('amount')?.value || 0);
    }, 0);
  }

  // --- INVESTMENT METHODS ---
  addInvestmentRow(category: string = '', amount: number | null = null, note: string = '') {
    const group = this.fb.group({
      category: [category || this.investmentCategories[0], Validators.required],
      amount: [amount, [Validators.required, Validators.min(0)]],
      note: [note]
    });
    this.investmentArray.push(group);
  }

  removeInvestmentRow(index: number) {
    if (this.investmentArray.length > 0) {
      this.investmentArray.removeAt(index);
    }
  }

  calculateTotalInvestment(): number {
     return this.investmentArray.controls.reduce((acc, control) => {
      return acc + (control.get('amount')?.value || 0);
    }, 0);
  }

  // --- UTILS ---
  fillSampleData() {
    // Reset Arrays
    while (this.incomeArray.length) this.incomeArray.removeAt(0);
    while (this.expenseArray.length) this.expenseArray.removeAt(0);
    while (this.investmentArray.length) this.investmentArray.removeAt(0);
    
    // Fill basic fields
    this.financeForm.patchValue({
      thoi_gian: SAMPLE_DATA.thoi_gian,
      muc_tieu_tiet_kiem: SAMPLE_DATA.muc_tieu_tiet_kiem
    });

    // Fill Income
    SAMPLE_DATA.nguon_thu.forEach(item => {
      this.addIncomeRow(item.category, item.amount);
    });

    // Fill Expenses
    SAMPLE_DATA.chi_tiet.forEach(item => {
      this.addExpenseRow(item.category, item.amount, item.owner);
    });

    // Fill Investments
    if (SAMPLE_DATA.danh_muc_dau_tu) {
      SAMPLE_DATA.danh_muc_dau_tu.forEach(item => {
        this.addInvestmentRow(item.category, item.amount, item.note);
      });
    }
  }

  getOwnerColor(index: number): string {
    const ownerId = this.expenseArray.at(index).get('owner')?.value;
    return this.owners.find(o => o.id === ownerId)?.color || '#ccc';
  }

  getOwnerLabel(index: number): string {
    const ownerId = this.expenseArray.at(index).get('owner')?.value;
    return this.owners.find(o => o.id === ownerId)?.label || '?';
  }

  formatCurrency(value: number): string {
     if (!value) return '0đ';
     if (value >= 1000000000) return (value / 1000000000).toFixed(1) + ' tỷ';
     if (value >= 1000000) return (value / 1000000).toFixed(1).replace('.0', '') + ' tr';
     if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
     return value.toString();
  }

  async analyze() {
    if (this.financeForm.invalid) {
      this.financeForm.markAllAsTouched();
      return;
    }

    this.step.set('loading');

    const formVal = this.financeForm.value;
    const totalIncome = this.calculateTotalIncome();
    const totalExpense = this.calculateTotalExpenses();
    const currentBalance = totalIncome - totalExpense;

    // Prepare breakdown for Chart and AI
    const expenseBreakdown = formVal.chi_tiet_chi_tieu.map((item: any) => ({
      category: item.category,
      amount: item.amount,
      owner: item.owner
    }));

    const incomeBreakdown = formVal.nguon_thu.map((item: any) => ({
      category: item.category,
      amount: item.amount
    }));

    const investmentBreakdown = formVal.danh_muc_dau_tu.map((item: any) => ({
      category: item.category,
      amount: item.amount,
      note: item.note
    }));

    this.balance.set(currentBalance);
    this.chartData.set(expenseBreakdown);

    // Prepare Payload
    const payload = {
      thoi_gian: formVal.thoi_gian,
      tong_thu_nhap: totalIncome,
      chi_tiet_thu_nhap: incomeBreakdown,
      tong_chi_tieu: totalExpense,
      chi_tiet_chi_tieu: expenseBreakdown,
      danh_muc_dau_tu: investmentBreakdown,
      muc_tieu_tiet_kiem: formVal.muc_tieu_tiet_kiem || "Không có"
    };

    // AI Request
    const result = await this.geminiService.analyzeFinance(payload);
    this.aiResponse.set(result);
    
    // Save to History
    const record: FinanceRecord = {
      id: Date.now().toString(),
      month: formVal.thoi_gian,
      income: totalIncome,
      totalExpense: totalExpense,
      balance: currentBalance,
      aiAdvice: result,
      breakdown: expenseBreakdown,
      timestamp: Date.now()
    };
    this.historyService.saveRecord(record);

    this.step.set('result');
  }

  deleteRecord(id: string) {
    if(confirm('Bạn có chắc muốn xóa bản ghi này?')) {
      this.historyService.deleteRecord(id);
    }
  }

  clearHistory() {
    if(confirm('Xóa toàn bộ lịch sử? Hành động này không thể hoàn tác.')) {
      this.historyService.clearAll();
    }
  }
}
