export declare module 'react-apollo' {
  import { OperationOption, DataProps, MutateProps, DataProps } from 'react-apollo/types';
  import { DocumentNode } from 'graphql';
  export function graphql<TProps extends TGraphQLVariables | {} = {}, TData = {},
  TGraphQLVariables = {}, TChildProps = Partial<DataProps<TData, TGraphQLVariables>>
  & Partial<MutateProps<TData, TGraphQLVariables>>>
(document: DocumentNode,
 operationOptions?: OperationOption<TProps, TData, TGraphQLVariables, TChildProps>):
  (WrappedComponent: any) => any;
}