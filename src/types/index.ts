import { ComponentType, LazyExoticComponent } from 'react';

export type ToolCategory = 'formatter' | 'viewer' | 'converter' | 'network' | 'translator' | 'time' | 'ai';

export interface ToolMeta {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  keywords: string[];
  order?: number;
}

export type ToolComponent = ComponentType<any> | LazyExoticComponent<ComponentType<any>>;

export interface ToolModule {
  meta: ToolMeta;
  component: ToolComponent;
}

export interface NavItem {
  id: string;
  name: string;
  icon: string;
  category: ToolCategory;
}
