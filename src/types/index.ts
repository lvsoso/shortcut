import { ComponentType } from 'react';

export type ToolCategory = 'formatter' | 'viewer' | 'converter' | 'network' | 'translator' | 'time';

export interface ToolMeta {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  keywords: string[];
  order?: number;
}

export interface ToolModule {
  meta: ToolMeta;
  component: ComponentType;
}

export interface NavItem {
  id: string;
  name: string;
  icon: string;
  category: ToolCategory;
}
