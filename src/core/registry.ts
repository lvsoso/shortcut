import { ToolModule, ToolCategory } from '../types';

class ToolRegistry {
  private tools: Map<string, ToolModule> = new Map();

  register(tool: ToolModule): void {
    const existingTool = this.tools.get(tool.meta.id);
    if (existingTool === tool) {
      return;
    }

    if (existingTool) {
      this.tools.set(tool.meta.id, tool);
      return;
    }

    this.tools.set(tool.meta.id, tool);
  }

  unregister(toolId: string): void {
    this.tools.delete(toolId);
  }

  getTool(id: string): ToolModule | undefined {
    return this.tools.get(id);
  }

  getAllTools(): ToolModule[] {
    return Array.from(this.tools.values())
      .sort((a, b) => (a.meta.order ?? 0) - (b.meta.order ?? 0));
  }

  getToolsByCategory(category: ToolCategory): ToolModule[] {
    return this.getAllTools()
      .filter(tool => tool.meta.category === category);
  }

  searchTools(query: string): ToolModule[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllTools().filter(tool =>
      tool.meta.name.toLowerCase().includes(lowerQuery) ||
      tool.meta.description.toLowerCase().includes(lowerQuery) ||
      tool.meta.keywords.some(k => k.toLowerCase().includes(lowerQuery))
    );
  }
}

export const registry = new ToolRegistry();
