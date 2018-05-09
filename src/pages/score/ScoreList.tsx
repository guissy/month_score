import * as React from 'react';
import { DatePicker, Form, Tag } from 'antd';
import styled from 'styled-components';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { Dispatch } from 'dva';
import { select } from '../../utils/model';
import { LoginState } from '../login/Login.model';
import * as moment from 'moment';
import TableActionComponent from '../components/table/TableActionComponent';
import LinkComponent from '../components/link/LinkComponent';
import TableComponent from '../components/table/TableComponent';
import { autobind } from 'core-decorators';
import { push } from 'react-router-redux';
import environment from '../../utils/environment';
import { Link } from 'react-router-dom';
import { messageError, messageResult } from '../../utils/showMessage';
import { isEqual } from 'lodash/fp';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { GraphqlQueryControls } from 'react-apollo/types';
import { MutationFn } from 'react-apollo/Mutation';
import { Result } from '../../utils/result';
import { Score } from './Score.model';

const DivWrap = styled('div')`
  .header {
    display: flex;
    justify-content: space-between;
  }
`;

interface Hoc {
  dispatch: Dispatch;
  form: WrappedFormUtils;
  login: LoginState;
  listQuery: { list: Result<Score> } & GraphqlQueryControls;
  deleteMutation: MutationFn;
  doneMutation: MutationFn;
  routing: { location: Location };
}
interface Props extends Partial<Hoc> {}

/** ProfileList */
@Form.create()
@select(['login', 'routing'])
@graphql<{}, {}, {}>(
  gql`
    query listQuery($date: String) {
      list(date: $date) {
        state
        data {
          id
          uid
          hard {
            ...ScoreItemFragment
          }
          speed {
            ...ScoreItemFragment
          }
          reactive {
            ...ScoreItemFragment
          }
          test {
            ...ScoreItemFragment
          }
          quality {
            ...ScoreItemFragment
          }
          grow {
            ...ScoreItemFragment
          }
          team {
            ...ScoreItemFragment
          }
          meeting {
            ...ScoreItemFragment
          }
          truename
          job
          part
          parent
          date
          finishBoss
          finishSelf
          createdTime
        }
      }
    }

    fragment ScoreItemFragment on ScoreItem {
      rateBoss
      rateSelf
      about
      levelBoss
      levelSelf
    }
  `,
  {
    alias: '月评列表',
    name: 'listQuery',
    options: () => {
      const [, , date] = window.location.pathname.split('/');
      return { variables: { date } };
    }
  }
)
@graphql<{}, {}, {}>(
  gql`
    mutation deleteMutation($uid: Int!, $date: String!) {
      delete(uid: $uid, date: $date) {
        state
        message
      }
    }
  `,
  {
    alias: '月评列表删除',
    name: 'deleteMutation',
    options: {
      refetchQueries: ['listQuery']
    }
  }
)
@graphql<{}, {}, {}>(
  gql`
    mutation doneMutation($uid: Int!, $date: String!) {
      done(uid: $uid, date: $date) {
        state
        message
      }
    }
  `,
  {
    name: 'doneMutation',
    options: {
      refetchQueries: ['listQuery']
    }
  }
)
@autobind
export default class ScoreList extends React.PureComponent<Props, {}> {
  static getDerivedStateFromProps(nextProps: Hoc, prevState: { routing: { location: Location } }) {
    if (!isEqual(nextProps.routing, prevState.routing)) {
      // nextProps.dispatch({ type: 'profile/query', payload: {} });
    }
    return {
      routing: nextProps.routing
    };
  }

  state = {
    routing: this.props.routing
  };

  getFileName(score: Score): string {
    const now = moment().format('hh:mm');
    const pathname = `${environment.apiHost}/assets/xlsx/${score.date}/${score.uid}/`;
    const fileName = `${score.truename}月度绩效表（${score.date}）_${now}.xlsx`;
    return pathname + fileName;
  }

  getAskFile(): string {
    const pathname = `${environment.apiHost}/assets/xlsx/ask.docx`;
    return pathname;
  }

  config() {
    return [
      {
        title: '姓名',
        dataIndex: 'truename'
      },
      {
        title: '难度说明',
        dataIndex: 'hard.about'
      },
      {
        title: '年月',
        dataIndex: 'date'
      },
      {
        title: '状态',
        dataIndex: 'finishBoss',
        render: (text: string, record: Score) => {
          if (record.finishBoss) {
            return <Tag className="account-opened">主管已评价</Tag>;
          } else if (record.finishSelf) {
            return <Tag className="audit-no">已提交给主管</Tag>;
          } else {
            return <Tag className="account-close">未提交给主管</Tag>;
          }
        }
      },
      {
        title: '创建时间',
        dataIndex: 'createdTime',
        render: (text: string) => text && moment(Number(text)).format('YYYY-MM-DD hh:mm')
      },
      {
        title: '操作',
        dataIndex: 'op',
        render: (text: string, record: Score) => (
          <TableActionComponent>
            <LinkComponent onClick={() => this.onEdit(record)}>
              {!record.finishBoss ? '编辑' : '查看'}
            </LinkComponent>
            <LinkComponent
              confirm={true}
              onClick={() => this.delete(record)}
              disabled={record.finishBoss}
            >
              删除
            </LinkComponent>
            <LinkComponent href={this.getFileName(record)}>导出</LinkComponent>
            <LinkComponent
              confirm={true}
              onClick={() => this.onFinish(record)}
              disabled={record.finishBoss}
            >
              立即提交
            </LinkComponent>
          </TableActionComponent>
        )
      }
    ];
  }

  // tslint:disable-next-line
  onChangePage(page: number, page_size: number) {
    const { dispatch, listQuery } = this.props as Hoc;
    // dispatch({ type: 'profile/query', payload: { page, page_size } });
  }

  // 编辑跳转
  onEdit(editing: Score) {
    const { dispatch } = this.props as Hoc;
    // dispatch({ type: 'profile/update', payload: { editing } });
    dispatch(push(`/${editing.uid}/${editing.date}`));
  }

  delete(score: Score) {
    const { dispatch, deleteMutation, listQuery } = this.props as Hoc;
    // dispatch({ type: 'profile/delete', payload: score })
    // console.log('☞☞☞ 9527 ProfileList 237', listQuery);
    deleteMutation({
      variables: {
        uid: score.uid,
        date: score.date
      }
    })
      .then(messageResult('delete'))
      .catch((e: Error) => messageError(e, dispatch));
  }

  onFinish(score: Score) {
    const { login } = this.props as Hoc;
    const isSelf = login.list.id === score.uid;
    const amountKeys = 'hard,speed,reactive,test,quality'.split(',');
    const natureKeys = 'grow,team,meeting'.split(',');
    const amountSelf = amountKeys.reduce(
      (total, key) => (total += !!score[key].levelSelf ? 1 : 0),
      0
    );
    const amountBoss = amountKeys.reduce(
      (total, key) => (total += !!score[key].levelBoss ? 1 : 0),
      0
    );
    const natureSelf = natureKeys.reduce(
      (total, key) => (total += !!score[key].levelSelf ? 1 : 0),
      0
    );
    const natureBoss = natureKeys.reduce(
      (total, key) => (total += !!score[key].levelBoss ? 1 : 0),
      0
    );
    const hasFinishSelf = isSelf && amountSelf >= 2 && natureSelf === 3;
    const hasFinishBoss = score.finishSelf && !isSelf && amountBoss >= 2 && natureBoss === 3;
    if (hasFinishSelf || hasFinishBoss) {
      // this.props.dispatch!({ type: 'profile/finish', payload: score })
      const { dispatch, doneMutation, listQuery } = this.props as Hoc;
      doneMutation({
        variables: {
          uid: score.uid,
          date: score.date
        }
      })
        .then(messageResult('done'))
        .catch((e: Error) => messageError(e, dispatch));
    } else {
      messageError('还有一些项目未完成呢？');
    }
  }

  render(): React.ReactNode {
    const {
      listQuery: { list: profile = { data: [] } }
    } = this.props as Hoc;
    const [, , month] = window.location.pathname.split('/');
    return (
      <DivWrap>
        <div className="header">
          <DatePicker.MonthPicker
            defaultValue={month ? moment(month) : undefined}
            onChange={date => {
              const { dispatch } = this.props as Hoc;
              dispatch(push(date ? `/list/${date.format('YYYY-MM')}` : '/list'));
            }}
          />
          <LinkComponent href={this.getAskFile()} download="绩效考核申诉表">
            下载申诉表
          </LinkComponent>
        </div>
        <TableComponent
          columns={this.config()}
          dataSource={profile.data}
          paginate={false}
          bordered={true}
          locale={{
            emptyText: (
              <>
                暂无数据, <Link to={'/month'}>点击这里新建</Link>
              </>
            )
          }}
          rowKey={(r: object, i: number) => String(i)}
        />
      </DivWrap>
    );
  }
}
