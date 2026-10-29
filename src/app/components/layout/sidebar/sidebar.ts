import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LayoutService } from '../../../services/layout.service';
import { ProcurementService } from '../../../services/procurement.service';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  badge?: string;
  badgeType?: 'danger' | 'warning' | 'info' | 'success';
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Mobile Backdrop Drawer Overlay -->
    <div
      class="mobile-backdrop"
      *ngIf="isMobileOpen"
      (click)="closeMobileMenu()"
    ></div>

    <aside
      class="sidebar"
      [class.sidebar-collapsed]="isCollapsed"
      [class.mobile-open]="isMobileOpen"
    >
      <!-- Header / Government Branding -->
      <div class="sidebar-header">
        <div class="emblem-box">
          <i class="fa-solid fa-wheat-awn emblem-icon"></i>
        </div>
        <div class="brand-text" *ngIf="!isCollapsed">
          <span class="brand-title">🌾 MandiConnect <span class="ai-badge">AI</span></span>
          <span class="brand-sub">Crop Price Prediction & Mandi Operations</span>
        </div>

        <!-- Collapse Toggle Button -->
        <button class="collapse-btn" (click)="toggleCollapse()" title="Toggle Sidebar">
          <i class="fa-solid" [class.fa-chevron-left]="!isCollapsed" [class.fa-chevron-right]="isCollapsed"></i>
        </button>
      </div>

      <div class="sih-tag" *ngIf="!isCollapsed">
<!--        <i class="fa-solid fa-trophy text-gold"></i>-->
        <span>ANGULAR & SPRING BOOT FINAL PROJECT</span>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav">
        <div class="nav-section-title" *ngIf="!isCollapsed">MANDI OPERATIONS PLATFORM</div>

        <a *ngFor="let item of navItems"
           [routerLink]="item.path"
           routerLinkActive="active"
           class="nav-item"
           [title]="item.label"
        >
          <i [class]="item.icon + ' nav-icon'"></i>
          <span class="nav-label" *ngIf="!isCollapsed">{{ item.label }}</span>
          <span
            *ngIf="item.badge && !isCollapsed"
            [class]="'badge-pill badge-' + (item.badgeType || 'info')"
          >
            {{ item.badge }}
          </span>
        </a>
      </nav>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer" *ngIf="!isCollapsed">
        <div class="status-indicator">
          <span class="ping-dot"></span>
          <div class="status-text">
            <span class="status-title">Mandi Network Online</span>
            <span class="status-sub">5 Mandis Connected</span>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .mobile-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(27, 42, 50, 0.7);
      backdrop-filter: blur(2px);
      z-index: 999;
    }

    .sidebar {
      width: 280px;
      background-color: #1B2A32;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      height: 100vh;
      position: sticky;
      top: 0;
      z-index: 1000;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      flex-shrink: 0;
      transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sidebar.sidebar-collapsed {
      width: 76px;
    }

    .sidebar-header {
      padding: 20px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      height: 72px;
    }

    .emblem-box {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #0D5C3A, #169B62);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 1.2rem;
      box-shadow: 0 4px 10px rgba(13, 92, 58, 0.4);
      flex-shrink: 0;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .brand-title {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1.05rem;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ai-badge {
      background: linear-gradient(135deg, #E5A93C, #D97706);
      color: #ffffff;
      font-size: 0.65rem;
      padding: 1px 5px;
      border-radius: 5px;
      font-weight: 800;
    }

    .brand-sub {
      font-size: 0.65rem;
      color: #94A3B8;
      line-height: 1.2;
      margin-top: 1px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .collapse-btn {
      background: rgba(255, 255, 255, 0.08);
      border: none;
      color: #94A3B8;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .collapse-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
    }

    .sih-tag {
      margin: 12px 14px;
      padding: 7px 10px;
      background: rgba(229, 169, 60, 0.12);
      border: 1px solid rgba(229, 169, 60, 0.3);
      border-radius: 8px;
      font-size: 0.725rem;
      font-weight: 600;
      color: #E5A93C;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sidebar-nav {
      flex: 1;
      padding: 12px 10px;
      overflow-y: auto;
    }

    .nav-section-title {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #64748B;
      padding: 0 10px 8px;
      margin-top: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      color: #CBD5E1;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 4px;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .nav-item:hover {
      background-color: rgba(255, 255, 255, 0.07);
      color: #ffffff;
    }

    .nav-item.active {
      background: linear-gradient(90deg, #0D5C3A, #169B62);
      color: #ffffff;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(13, 92, 58, 0.3);
    }

    .nav-icon {
      font-size: 1.1rem;
      width: 22px;
      text-align: center;
      flex-shrink: 0;
    }

    .nav-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .badge-pill {
      font-size: 0.68rem;
      padding: 2px 7px;
      border-radius: 999px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .badge-danger { background-color: #EF4444; color: #ffffff; }
    .badge-warning { background-color: #E5A93C; color: #1B2A32; }
    .badge-info { background-color: #3B82F6; color: #ffffff; }
    .badge-success { background-color: #10B981; color: #ffffff; }

    .sidebar-footer {
      padding: 14px 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background-color: rgba(0, 0, 0, 0.2);
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .ping-dot {
      width: 9px;
      height: 9px;
      background-color: #10B981;
      border-radius: 50%;
      box-shadow: 0 0 10px #10B981;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 7px rgba(16, 185, 129, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }

    .status-text {
      display: flex;
      flex-direction: column;
    }

    .status-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: #ffffff;
    }

    .status-sub {
      font-size: 0.65rem;
      color: #94A3B8;
    }

    @media (max-width: 992px) {
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        transform: translateX(-100%);
        box-shadow: 10px 0 30px rgba(0, 0, 0, 0.3);
      }

      .sidebar.mobile-open {
        transform: translateX(0);
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  isMobileOpen = false;

  navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-pie' },
    { path: '/centres', label: 'Procurement Centres', icon: 'fa-solid fa-building-wheat', badge: '5 Mandis', badgeType: 'success' },
    { path: '/farmers', label: 'Farmers Directory', icon: 'fa-solid fa-users-gear' },
    { path: '/queue', label: 'Queue Management', icon: 'fa-solid fa-list-check', badge: 'Live Queue', badgeType: 'warning' },
    { path: '/procurement', label: 'Crop Arrivals & Quality', icon: 'fa-solid fa-truck-ramp-box' },
    { path: '/payments', label: 'Payments & DBT', icon: 'fa-solid fa-indian-rupee-sign' },
    { path: '/ai-intelligence', label: 'Price & Mandi Intelligence', icon: 'fa-solid fa-brain', badge: 'Live', badgeType: 'danger' },
    { path: '/reports', label: 'Reports & Analytics', icon: 'fa-solid fa-file-invoice' },
    { path: '/settings', label: 'System Settings', icon: 'fa-solid fa-sliders' },
    { path: '/audit', label: 'Audit Logs', icon: 'fa-solid fa-clipboard-list' }
  ];

  constructor(
    private layoutService: LayoutService,
    private procurementService: ProcurementService
  ) {}

  ngOnInit() {
    this.layoutService.isCollapsed$.subscribe(val => this.isCollapsed = val);
    this.layoutService.isMobileOpen$.subscribe(val => this.isMobileOpen = val);

    this.procurementService.getQueue().subscribe(q => {
      const activeCount = q.filter(item => item.status !== 'COMPLETED' && item.status !== 'CANCELLED').length;
      const queueItem = this.navItems.find(n => n.path === '/queue');
      if (queueItem) {
        queueItem.badge = `${activeCount} Live`;
      }
    });

    this.procurementService.getAuditLogs().subscribe(logs => {
      const auditItem = this.navItems.find(n => n.path === '/audit');
      if (auditItem) {
        auditItem.badge = `${logs.length}`;
      }
    });
  }

  toggleCollapse() {
    this.layoutService.toggleSidebar();
  }

  closeMobileMenu() {
    this.layoutService.closeMobileMenu();
  }
}
