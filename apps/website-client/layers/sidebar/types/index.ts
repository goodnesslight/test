import type { Component } from 'vue';

export interface SidebarNavItem {
  to: string;
  label: string;
  icon: Component;
}
