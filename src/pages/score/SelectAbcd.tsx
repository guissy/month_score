import * as React from 'react';
import { Select } from 'antd';

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  disabled: boolean;
}

interface State {}

/** SelectAbcd */
export default class SelectAbcd extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    const { value, onChange, disabled } = this.props;
    return (
      <Select value={value} onChange={onChange} disabled={disabled}>
        {Array.from('ABCD').map((char: string, i: number) => (
          <Select.Option key={char} value={char}>
            {char}
          </Select.Option>
        ))}
      </Select>
    );
  }
}
