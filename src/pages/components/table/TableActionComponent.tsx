import * as React from 'react';
import { Divider } from 'antd';

interface Props {
  children: React.ReactNode[];
}

/** 表格操作区的链接之间加分隔竖线 */
export default function TableActionComponent({ children }: Props) {
  const childrenVisible = React.Children.toArray(children).filter(item => {
    if (typeof item === 'object') {
      const props = item.props as { hidden: boolean };
      return props.hidden !== true; // 不渲染：hidden 即认为是样式 display: none 的元素
    } else {
      return true;
    }
  });
  const length = childrenVisible.length > 0 ? childrenVisible.length - 1 : 0;
  return (
    <span>
      {childrenVisible.map((item, index) => {
        if (index !== length) {
          return [item, <Divider type="vertical" key={index} />];
        } else {
          return item;
        }
      })}
    </span>
  );
}
