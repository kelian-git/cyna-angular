import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import Chart from 'chart.js/auto';
import { forkJoin } from 'rxjs';
import { Category, Order, Product } from '../../../core/models';
import { CategoryService } from '../../../core/services/category.service';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { formatPrice } from '../../../core/utils/formatters.util';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements AfterViewInit, OnDestroy {
  private readonly orderService = inject(OrderService);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);

  @ViewChild('salesCanvas') salesCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('basketCanvas') basketCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieCanvas') pieCanvas!: ElementRef<HTMLCanvasElement>;

  readonly orders = signal<Order[]>([]);
  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly period = signal<'7d' | '5w'>('7d');

  private charts: Chart[] = [];

  revenue(): string {
    return formatPrice(this.orders().reduce((s, o) => s + (o.totalAmount || 0), 0));
  }

  ngAfterViewInit(): void {
    forkJoin({
      orders: this.orderService.getAll(),
      products: this.productService.getAll(),
      categories: this.categoryService.getAll(),
    }).subscribe({
      next: ({ orders, products, categories }) => {
        this.orders.set(orders);
        this.products.set(products);
        this.categories.set(categories);
        this.render();
      },
      error: () => this.render(),
    });
  }

  setPeriod(p: '7d' | '5w'): void {
    this.period.set(p);
    this.render();
  }

  private destroyCharts(): void {
    this.charts.forEach((c) => c.destroy());
    this.charts = [];
  }

  private render(): void {
    this.destroyCharts();
    const buckets = this.period() === '7d' ? 7 : 5;
    const stepDays = this.period() === '7d' ? 1 : 7;
    const labels: string[] = [];
    const totals: number[] = [];
    const now = new Date();
    for (let i = buckets - 1; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - i * stepDays);
      labels.push(start.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
      const sum = this.orders()
        .filter((o) => {
          const d = new Date(o.orderDate);
          const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
          return diff >= i * stepDays && diff < (i + 1) * stepDays;
        })
        .reduce((s, o) => s + (o.totalAmount || 0), 0);
      totals.push(sum);
    }

    if (this.salesCanvas) {
      this.charts.push(
        new Chart(this.salesCanvas.nativeElement, {
          type: 'bar',
          data: {
            labels,
            datasets: [{ label: 'Ventes (€)', data: totals, backgroundColor: '#3d2b8e' }],
          },
        }),
      );
    }

    const catNames = this.categories().map((c) => c.name);
    const avgBaskets = this.categories().map((c) => {
      const prods = this.products().filter((p) => p.categoryName === c.name);
      if (!prods.length) return 0;
      return Math.round(prods.reduce((s, p) => s + p.price, 0) / prods.length);
    });
    if (this.basketCanvas) {
      this.charts.push(
        new Chart(this.basketCanvas.nativeElement, {
          type: 'bar',
          data: {
            labels: catNames,
            datasets: [{ label: 'Panier moyen / catégorie (€)', data: avgBaskets, backgroundColor: '#7c3aed' }],
          },
        }),
      );
    }

    if (this.pieCanvas) {
      this.charts.push(
        new Chart(this.pieCanvas.nativeElement, {
          type: 'pie',
          data: {
            labels: catNames,
            datasets: [
              {
                label: 'Produits par catégorie',
                data: this.categories().map(
                  (c) => this.products().filter((p) => p.categoryName === c.name).length,
                ),
                backgroundColor: ['#3d2b8e', '#7c3aed', '#5b3fc0', '#8f7ad9', '#2f2170', '#ad9fe6'],
              },
            ],
          },
        }),
      );
    }
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }
}
