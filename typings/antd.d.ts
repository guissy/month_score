// tslint:disable-line
import { Form } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import { FormProps } from 'antd/lib/form';

declare module 'antd' {
  class Form extends React.Component<FormProps> {
    static Item: typeof FormItem;
    static create<P>(): (component: React.ComponentType<P>) => any; // tslint:disable-line
  }
}