import * as React from 'react';
import { select } from '../../../utils/model';
import { connect, Dispatch } from 'dva';
import { LoginState } from '../../login/Login.model';
import { IntlKeys } from '../../../locale/zh_CN';
import { Popconfirm } from 'antd';
import withLocale from '../../../utils/withLocale';
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  action?: Function;
  hidden?: boolean;
  disabled?: boolean;
  onCallback?: Function;
  login?: LoginState;
  site?: (p: IntlKeys) => React.ReactNode;
  dispatch?: Dispatch;
  // 当boolean类型时, title{`确定`${''}吗},  为ReactNode时, title={confirm} confirm 为一段文字
  confirm?: boolean | React.ReactNode;
}
interface State {}
let actionsDel = '删除'.split(',');
let actionsUpdate = '编辑'.split(',');
let actionsView = '查看'.split(',');
let actionsFinish = '立即提交'.split(',');

// site('查看') site('编辑') site('删除') site('操作') site('立即删除') site('下载申诉表')
/**
 * 表格操作按钮组件
 * 适用于增删改查等按钮，允许有弹出框 Popconfirm
 * 增删改查按钮对应后台权限，无权限不显示操作按钮
 * 示例 轮播广告 {@link AdList#render}
 */
@withLocale
@select('login')
export default class LinkComponent extends React.PureComponent<LinkProps, {}> {
  render() {
    const {
      confirm,
      login = {} as LoginState,
      hidden,
      children,
      site = () => '',
      dispatch,
      onClick,
      ...props
    } = this.props;
    const { isDelete, isUpdate, isFetch, isFinish } = login;
    const noDelete = actionsDel.map(v => site(v)).includes(children) && !isDelete;
    const noUpdate = actionsUpdate.map(v => site(v)).includes(children) && !isUpdate;
    const noView = actionsView.map(v => site(v)).includes(children) && !isFetch;
    const noFinish = actionsFinish.map(v => site(v)).includes(children) && !isFinish;
    return confirm ? (
      <Popconfirm
        placement="top"
        title={confirm === true ? `确定要${children}吗` : confirm}
        onConfirm={onClick}
        okText="确定"
        cancelText="取消"
      >
        <a {...props} hidden={noDelete || noUpdate || noView || noFinish || hidden}>
          {this.props.children}
        </a>
      </Popconfirm>
    ) : (
      <a {...props} hidden={noDelete || noUpdate || noView || noFinish || hidden} onClick={onClick}>
        {this.props.children}
      </a>
    );
  }
}
