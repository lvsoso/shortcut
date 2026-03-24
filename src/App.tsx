import { useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { registry } from './core/registry';
import { jsonFormatter } from './modules/json-formatter';
import { mermaidViewer } from './modules/mermaid-viewer';
import { dataConverter } from './modules/data-converter';
import { networkTools } from './modules/network-tools';
import { timestampConverter } from './modules/timestamp-converter';
import { useToolStore } from './stores/toolStore';

function registerTools() {
  registry.register(jsonFormatter);
  registry.register(mermaidViewer);
  registry.register(dataConverter);
  registry.register(networkTools);
  registry.register(timestampConverter);
}

function App() {
  const { currentToolId, setCurrentTool } = useToolStore();

  useEffect(() => {
    registerTools();
    if (!currentToolId) {
      setCurrentTool('json-formatter');
    }
  }, []);

  const currentTool = currentToolId ? registry.getTool(currentToolId) : null;
  const ToolComponent = currentTool?.component;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        {ToolComponent ? (
          <ToolComponent />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            请从左侧选择一个工具
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
