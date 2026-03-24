import { ToolModule } from '../../types';
import { TimestampConverter } from './TimestampConverter';

export const timestampConverter: ToolModule = {
  meta: {
    id: 'timestamp-converter',
    name: '时间戳转换',
    description: 'Unix 时间戳与北京时间互转',
    category: 'time',
    icon: 'clock',
    keywords: ['timestamp', 'time', 'date', 'unix', 'beijing', 'utc'],
    order: 5,
  },
  component: TimestampConverter,
};
