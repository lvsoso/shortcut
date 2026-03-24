import { useState, useEffect, useCallback } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { ToolContainer } from '../../components/layout/ToolContainer';
import { Button } from '../../components/common/Button';
import { CopyButton } from '../../components/common/CopyButton';

function formatBeijingTime(date: Date): string {
  return date.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function TimestampConverter() {
  const [timestamp, setTimestamp] = useState<string>('');
  const [beijingTime, setBeijingTime] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [error, setError] = useState<string>('');

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 时间戳转北京时间
  const convertTimestampToBeijing = useCallback((ts: string) => {
    setError('');
    if (!ts.trim()) {
      setBeijingTime('');
      return;
    }

    let timestampNum: number;
    const cleanTs = ts.trim();

    // 尝试解析（支持秒和毫秒）
    if (/^\d+$/.test(cleanTs)) {
      timestampNum = parseInt(cleanTs, 10);
      // 判断是秒还是毫秒（13位是毫秒，10位是秒）
      if (cleanTs.length === 10) {
        timestampNum *= 1000;
      } else if (cleanTs.length !== 13) {
        setError('时间戳应为 10 位（秒）或 13 位（毫秒）');
        return;
      }
    } else {
      setError('请输入有效的数字时间戳');
      return;
    }

    const date = new Date(timestampNum);
    if (isNaN(date.getTime())) {
      setError('无效的时间戳');
      return;
    }

    setBeijingTime(formatBeijingTime(date));
  }, []);

  // 北京时间转时间戳
  const convertBeijingToTimestamp = useCallback((timeStr: string) => {
    setError('');
    if (!timeStr.trim()) {
      setTimestamp('');
      return;
    }

    // 尝试解析各种格式
    let date: Date;
    const cleanTime = timeStr.trim();

    // 替换中文格式
    const normalized = cleanTime
      .replace(/年/g, '-')
      .replace(/月/g, '-')
      .replace(/日/g, ' ')
      .replace(/时/g, ':')
      .replace(/分/g, ':')
      .replace(/秒/g, '');

    date = new Date(normalized);

    // 如果解析失败，尝试加年份
    if (isNaN(date.getTime()) && !normalized.includes('-')) {
      const now = new Date();
      date = new Date(`${now.getFullYear()}-${normalized}`);
    }

    if (isNaN(date.getTime())) {
      setError('无法解析时间格式，请使用 YYYY-MM-DD HH:mm:ss');
      return;
    }

    // 转换为时间戳（毫秒）
    const ts = date.getTime();
    setTimestamp(ts.toString());
  }, []);

  // 使用当前时间
  const useCurrentTime = () => {
    const now = new Date();
    setTimestamp(now.getTime().toString());
    setBeijingTime(formatBeijingTime(now));
    setError('');
  };

  // 清空
  const clearAll = () => {
    setTimestamp('');
    setBeijingTime('');
    setError('');
  };

  return (
    <ToolContainer
      title="时间戳转换"
      description="Unix 时间戳与北京时间相互转换"
    >
      <div className="space-y-6">
        {/* 当前时间显示 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <Clock className="w-5 h-5" />
            <span className="font-medium">当前时间</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">时间戳（秒）</div>
              <div className="font-mono text-lg">
                {Math.floor(currentTime.getTime() / 1000)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">时间戳（毫秒）</div>
              <div className="font-mono text-lg">
                {currentTime.getTime()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">北京时间</div>
              <div className="font-mono text-lg">
                {formatBeijingTime(currentTime)}
              </div>
            </div>
          </div>
        </div>

        {/* 转换区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 时间戳输入 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Unix 时间戳
              </label>
              <div className="flex gap-1">
                <Button variant="secondary" size="sm" onClick={useCurrentTime}>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  当前
                </Button>
                <CopyButton text={timestamp} disabled={!timestamp} />
              </div>
            </div>
            <textarea
              value={timestamp}
              onChange={(e) => {
                setTimestamp(e.target.value);
                convertTimestampToBeijing(e.target.value);
              }}
              placeholder="输入时间戳（秒或毫秒）..."
              className="w-full h-32 px-3 py-2 border rounded-md shadow-sm font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="text-xs text-gray-500">
              支持 10 位（秒）或 13 位（毫秒）
            </div>
          </div>

          {/* 北京时间输入 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                北京时间
              </label>
              <CopyButton text={beijingTime} disabled={!beijingTime} />
            </div>
            <textarea
              value={beijingTime}
              onChange={(e) => {
                setBeijingTime(e.target.value);
                convertBeijingToTimestamp(e.target.value);
              }}
              placeholder="输入北京时间..."
              className="w-full h-32 px-3 py-2 border rounded-md shadow-sm font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="text-xs text-gray-500">
              格式: YYYY-MM-DD HH:mm:ss
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {/* 常用转换参考 */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mb-3">常用时间参考</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[
              { label: '1 分钟', seconds: 60 },
              { label: '1 小时', seconds: 3600 },
              { label: '1 天', seconds: 86400 },
              { label: '1 周', seconds: 604800 },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  const ts = (Math.floor(Date.now() / 1000) + item.seconds).toString();
                  setTimestamp(ts);
                  convertTimestampToBeijing(ts);
                }}
                className="text-left p-2 bg-white rounded border hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="text-gray-500 text-xs">{item.label}后</div>
                <div className="font-mono text-blue-600">
                  +{item.seconds.toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 清空按钮 */}
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={clearAll}>
            清空
          </Button>
        </div>
      </div>
    </ToolContainer>
  );
}
