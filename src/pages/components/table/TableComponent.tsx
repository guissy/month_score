import * as React from 'react';
import styled from 'styled-components';
import withLocale from '../../../utils/withLocale';
import { connect } from 'dva';
import { Table } from 'antd';
import { Attributes } from '../../../utils/result';
import { TablePaginationConfig, TableRowSelection } from 'antd/lib/table';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { messageError, prettyString } from '../../../utils/showMessage';
import { FormConfig } from '../form/FormCompoent';

const DivWrap = styled.div.attrs<{ hasActions: boolean }>({})`
  background: #fff;
  padding: 20px;
  .ant-table .ant-table-body > table {
    padding: 0;
  }

  .ant-table .ant-table-body > table .ant-table-thead > tr > th {
    background: #eef1f6;
  }

  .ant-table .ant-table-body > table .ant-table-thead > tr > th,
  .ant-table .ant-table-body > table .ant-table-tbody > tr > td {
    text-align: center;
  }
  .ant-table .ant-table-body > table .ant-table-tbody > tr > td:last-child {
    text-align: ${props => (props.hasActions ? 'left' : 'center')};
  }
`;

export default withLocale(
  connect<Store, {}, Props>(({ loading }: Store) => ({ loading }))(function TableComponent({
    rowKey = 'id',
    dataSource = [],
    columns = [],
    actionType,
    pagination,
    loading,
    site,
    ...props
  }: Props) {
    let tableColumns: FormConfig[];
    let hasActions = false;
    if (!Array.isArray(columns)) {
      tableColumns = [];
      messageError('表头column要求是数组，但是得到的是' + prettyString(dataSource));
    } else {
      tableColumns = columns.filter(v => v.notInTable !== true);
      const lastColumn = tableColumns.slice().pop();
      hasActions = lastColumn ? lastColumn.title === site!('操作') : false;
    }
    let totalRowsOk = [] as object[];
    if (typeof pagination === 'object') {
      const { totalRows } = pagination;
      totalRowsOk = totalRows.map((record: { rowName: string }) => {
        return {
          ...record,
          [tableColumns[0].dataIndex]: record.rowName
        };
      });
    }
    let dataSourceOk = [];
    if (Array.isArray(dataSource)) {
      dataSourceOk = dataSource.concat(totalRowsOk);
    } else {
      // messageError('Table 数据要求是数组，但是得到的是' + prettyString(dataSource));
    }
    return (
      <DivWrap hasActions={hasActions}>
        <Table
          size="small"
          rowKey={rowKey}
          dataSource={dataSourceOk}
          columns={tableColumns}
          bordered={true}
          pagination={pagination}
          loading={loading}
          {...props}
        />
      </DivWrap>
    );
  })
);

type Store = { loading?: boolean; site?: (words: string) => string };

interface TablePaginationConfigWithTotal extends TablePaginationConfig {
  totalRows: object[];
}

interface Props {
  dataSource: any[]; // tslint:disable-line:no-any // 数据数组
  columns: FormConfig[]; // 表格列的配置
  rowKey?: string | ((record: any, index: number) => string); // tslint:disable-line:no-any
  site?: (words: string) => string;
  form?: WrappedFormUtils;
  actionType?: string; // namespace/effect
  pagination: TablePaginationConfigWithTotal | false;
  loading?: boolean;
  rowSelection?: TableRowSelection<object>;
}

/**
 * antd 分页
 * @see PaginationProps
 */
export function getPagination(
  attributes: Attributes,
  onPageChange: (page: number, pageSize: number) => void
): TablePaginationConfigWithTotal {
  // tslint:disable-next-line:variable-name
  const { number, size, total } = attributes || { number: 1, size: 20, total: 0 };
  const totalRows = attributes ? getTotalRows(attributes).filter(Boolean) : [];
  return {
    showSizeChanger: true,
    showTotal: (totalNum: number) => withLocale.site('总共 {totalNum} 条', { totalNum }),
    onShowSizeChange: onPageChange,
    onChange: onPageChange,
    pageSize: size + totalRows.length,
    defaultCurrent: 1,
    current: number,
    total: total,
    showQuickJumper: true,
    totalRows: totalRows
  };
}

function getTotalRows(attributes: Attributes): [object, object] {
  const [subTotalRow, totalRow] = Object.entries(attributes)
    .filter(([key, record]) => /(subTotal|total)\w+/.test(key) && typeof record === 'object')
    .sort(([key1], [key2]) => key1.localeCompare(key2))
    .map(([key, record]) => ({
      ...record,
      isTotalRow: true,
      rowName: key.includes('sub') ? '小结' : '总结',
      id: key.includes('sub') ? Number.MAX_SAFE_INTEGER - 1 : Number.MAX_SAFE_INTEGER
    }));
  return [subTotalRow, totalRow];
}
