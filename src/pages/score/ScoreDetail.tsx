import * as React from 'react';
import { Form, Input, Button, DatePicker, InputNumber, Checkbox, Select } from 'antd';
import styled from 'styled-components';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { Dispatch } from 'dva';
import { select } from '../../utils/model';
import { compose, values as valuesFn, sumBy, pick } from 'lodash/fp';
import { LoginState, User } from '../login/Login.model';
import { Score } from './Score.model';
import * as moment from 'moment';
import { messageError, messageResult } from '../../utils/showMessage';
import { autobind } from 'core-decorators';
import { push } from 'react-router-redux';
import SelectAbcd from './SelectAbcd';
import { graphql, MutationFn, Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Result } from '../../utils/result';

interface Hoc {
  dispatch: Dispatch;
  form: WrappedFormUtils;
  login: LoginState;
  routing: { location: Location };
  saveMutation: MutationFn;
  data: { detail: Result<ScoreDetail> };
  match: { params: { uid: string; date: string } };
}
interface Props extends Partial<Hoc> {}

interface State {
  score: Partial<Score>;
  routing?: { location: Location };
}

const FormWrap = styled(Form)`
  th,
  td {
    padding: 5px;
    border-bottom: 1px solid #ddd;
  }
  tr.title {
    font-weight: 500;
    background: #def5fe;
  }
`;

const DefaultScore: Partial<Score> = {
  uid: NaN,
  date: moment(),
  dateType: 'month',
  hard: {
    rateBoss: 30,
    rateSelf: 30,
    about: '',
    levelBoss: '',
    levelSelf: ''
  },
  speed: {
    rateBoss: 30,
    rateSelf: 30,
    about: '',
    levelBoss: '',
    levelSelf: ''
  },
  reactive: {
    rateBoss: 20,
    rateSelf: 20,
    about: '',
    levelBoss: '',
    levelSelf: ''
  },
  test: {
    rateBoss: 10,
    rateSelf: 10,
    about: '',
    levelBoss: '',
    levelSelf: ''
  },
  quality: {
    rateBoss: 10,
    rateSelf: 10,
    about: '',
    levelBoss: '',
    levelSelf: ''
  },
  grow: {
    rateBoss: 50,
    about: '',
    levelBoss: '',
    levelSelf: ''
  },
  team: {
    rateBoss: 20,
    about: '',
    levelBoss: '',
    levelSelf: ''
  },
  meeting: {
    rateBoss: 30,
    about: '',
    levelBoss: '',
    levelSelf: ''
  }
};

/** 月评表 */
@Form.create()
@select(['login', 'routing'])
@graphql<{}, {}, {}>(
  gql`
    query detailQuery($uid: Int!, $date: String!) {
      detail(uid: $uid, date: $date) {
        state
        message
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
    options: ({ match, login }: Hoc) => {
      const uid = parseInt(match.params.uid, 10) || login.list.id;
      const date = match.params.date || moment().format('YYYY-MM');
      return { variables: { uid, date } };
    }
  }
)
@graphql<{}, {}, {}>(
  gql`
    mutation saveMutation($score: ScoreInput!) {
      save(score: $score) {
        state
        message
      }
    }
  `,
  {
    name: 'saveMutation',
    options: {
      refetchQueries: ['detailQuery']
    }
  }
)
@autobind
export default class ScoreDetail extends React.PureComponent<Props, State> {
  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    const {
      data: { detail = {} as Result<ScoreDetail> },
      login,
      match
    } = nextProps as Hoc;
    const uid = parseInt(match.params.uid, 10) || login.list.id;
    const scoreDefault = { ...DefaultScore, uid };
    let score = (match.params.uid && detail.data) || scoreDefault;
    return {
      score: score,
      routing: nextProps.routing
    };
  }

  state = {
    score: DefaultScore,
    routing: this.props.routing
  };

  onSubmit(e: React.FormEvent<HTMLFontElement>) {
    e.preventDefault();
    const {
      dispatch,
      form: { validateFields }
    } = this.props as Hoc;
    // moment.fn.toJSON = function() { return this.format('YYYY-MM'); };
    validateFields((err, values: Score) => {
      if (err) {
        return;
      }
      const { saveMutation } = this.props as Hoc;
      saveMutation({
        variables: {
          score: { ...values, date: values.date.format('YYYY-MM') }
        }
      })
        .then(messageResult<'save'>('save'))
        .then(({ data: { save: { state = NaN } = {} } = {} }) => {
          if (state === 0) {
            dispatch(push(`/list`));
          }
        })
        .catch((error: Error) => messageError(error, dispatch));
    });
  }

  render(): React.ReactNode {
    const {
      form: { getFieldDecorator, resetFields },
      login,
      match,
      dispatch
    } = this.props as Hoc;
    const formItemLayout = {
      labelCol: { xs: { span: 24 }, sm: { span: 6 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 18 } }
    };
    const score = this.state.score as Score;
    const amountKeys = 'hard,speed,reactive,test,quality'.split(',');
    const natureKeys = 'grow,team,meeting'.split(',');
    const amount = {
      totalRate: compose(sumBy('rateSelf'), valuesFn, pick(amountKeys))(score) || 0,
      totalSelf: '',
      totalBoss: ''
    };
    const nature = {
      totalRate: compose(sumBy('rateBoss'), valuesFn, pick(natureKeys))(score) || 0,
      totalSelf: '',
      totalBoss: ''
    };
    const uid = parseInt(match.params.uid, 10) || login.list.id;
    const isSelf = uid === login.list.id;
    const user = isSelf ? login.list : score;
    return (
      <FormWrap layout="inline" onSubmit={this.onSubmit}>
        <table style={{ border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ textAlign: 'center' }}>
              <th colSpan={8}>员工绩效考核评分表（II类员工）</th>
            </tr>
            <tr>
              <th colSpan={8}>
                <Form.Item label="被考核者" {...formItemLayout}>
                  {getFieldDecorator('truename', {
                    initialValue: score.truename || login.list.truename
                  })(<Input disabled={true} />)}
                  {getFieldDecorator('uid', { initialValue: uid })(
                    <Input style={{ display: 'none' }} />
                  )}
                </Form.Item>
                <Form.Item label="职位" {...formItemLayout}>
                  {getFieldDecorator('job', { initialValue: user.job })(<Input disabled={true} />)}
                </Form.Item>
                <Form.Item label="所属部门" {...formItemLayout}>
                  {getFieldDecorator('part', { initialValue: user.part })(
                    <Input disabled={true} />
                  )}
                </Form.Item>
              </th>
            </tr>
            <tr>
              <th colSpan={8}>
                <Form.Item
                  label="直接主管"
                  labelCol={{ span: 9 }}
                  wrapperCol={{ span: 15 }}
                  style={{ width: 200 }}
                >
                  <Query
                    query={gql`
                      query allQuery {
                        all {
                          data {
                            id
                            truename
                          }
                        }
                      }
                    `}
                    skip={!uid}
                  >
                    {({ data: { all: { data = [] } = {} } = {} }) =>
                      getFieldDecorator('parent', { initialValue: score.parent })(
                        <Select>
                          {data.map(({ truename, id }: User, i: number) => (
                            <Select.Option key={i} value={String(id)}>
                              {truename}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                  </Query>
                </Form.Item>
                <Form.Item
                  label="考核年月"
                  labelCol={{ span: 3 }}
                  wrapperCol={{ span: 21 }}
                  style={{ width: 600 }}
                >
                  {getFieldDecorator('date', { initialValue: moment(score.date) })(
                    <DatePicker.MonthPicker
                      onChange={date => {
                        this.setState({ score: DefaultScore });
                        resetFields();
                        if (date) {
                          dispatch(push(`/${score.uid}/${date.format('YYYY-MM')}`));
                        }
                      }}
                    />
                  )}
                  <p style={{ display: 'inline-block', width: 10 }} />
                  {getFieldDecorator('dateType', {
                    initialValue: Array.isArray(score.dateType) ? score.dateType : [score.dateType]
                  })(
                    <Checkbox.Group>
                      <Checkbox value="month">月度</Checkbox>
                      <Checkbox value="quarter">季度</Checkbox>
                      <Checkbox value="halfYear">半年度</Checkbox>
                    </Checkbox.Group>
                  )}
                </Form.Item>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="title">
              <td rowSpan={7}>定量考核指标(70%)</td>
              <td>考核内容</td>
              <td>考核权重</td>
              <td>考核标准</td>
              <td>工作完成情况说明</td>
              <td>自我评价</td>
              <td>主管评价</td>
            </tr>
            <tr>
              <td>需求难度</td>
              <td>
                {getFieldDecorator('hard.rateSelf', { initialValue: score.hard.rateSelf })(
                  <InputNumber />
                )}
              </td>
              <td>A 特难 B 高难 C 适中 D 简单</td>
              <td>
                {getFieldDecorator('hard.about', { initialValue: score.hard.about })(
                  <Input.TextArea />
                )}
              </td>
              <td>
                {getFieldDecorator('hard.levelSelf', { initialValue: score.hard.levelSelf })(
                  <SelectAbcd disabled={!isSelf} />
                )}
              </td>
              <td>
                {getFieldDecorator('hard.levelBoss', { initialValue: score.hard.levelBoss })(
                  <SelectAbcd disabled={isSelf} />
                )}
              </td>
            </tr>
            <tr>
              {/*<td>定量考核指标(70%)</td>*/}
              <td>开发进度</td>
              <td>
                {getFieldDecorator('speed.rateSelf', { initialValue: score.speed.rateSelf })(
                  <InputNumber />
                )}
              </td>
              <td>A.提前完成 B.按时完成 C.延迟少 D.延误多</td>
              <td>
                {getFieldDecorator('speed.about', { initialValue: score.speed.about })(
                  <Input.TextArea />
                )}
              </td>
              <td>
                {getFieldDecorator('speed.levelSelf', { initialValue: score.speed.levelSelf })(
                  <SelectAbcd disabled={!isSelf} />
                )}
              </td>
              <td>
                {getFieldDecorator('speed.levelBoss', { initialValue: score.speed.levelBoss })(
                  <SelectAbcd disabled={isSelf} />
                )}
              </td>
            </tr>
            <tr>
              {/*<td>定量考核指标(70%)</td>*/}
              <td>需求响应</td>
              <td>
                {getFieldDecorator('reactive.rateSelf', {
                  initialValue: score.reactive.rateSelf
                })(<InputNumber />)}
              </td>
              <td>A.积极响应 B.及时响应 C.未及时响应 D.消极响应</td>
              <td>
                {getFieldDecorator('reactive.about', { initialValue: score.reactive.about })(
                  <Input.TextArea />
                )}
              </td>
              <td>
                {getFieldDecorator('reactive.levelSelf', {
                  initialValue: score.reactive.levelSelf
                })(<SelectAbcd disabled={!isSelf} />)}
              </td>
              <td>
                {getFieldDecorator('reactive.levelBoss', {
                  initialValue: score.reactive.levelBoss
                })(<SelectAbcd disabled={isSelf} />)}
              </td>
            </tr>
            <tr>
              {/*<td>定量考核指标(70%)</td>*/}
              <td>代码质量</td>
              <td>
                {getFieldDecorator('quality.rateSelf', { initialValue: score.quality.rateSelf })(
                  <InputNumber />
                )}
              </td>
              <td>A.自文档 B.很规范 C.有待提升 D.可读性差</td>
              <td>
                {getFieldDecorator('quality.about', { initialValue: score.quality.about })(
                  <Input.TextArea />
                )}
              </td>
              <td>
                {getFieldDecorator('quality.levelSelf', {
                  initialValue: score.quality.levelSelf
                })(<SelectAbcd disabled={!isSelf} />)}
              </td>
              <td>
                {getFieldDecorator('quality.levelBoss', {
                  initialValue: score.quality.levelBoss
                })(<SelectAbcd disabled={isSelf} />)}
              </td>
            </tr>
            <tr>
              {/*<td>定量考核指标(70%)</td>*/}
              <td>单元测试</td>
              <td>
                {getFieldDecorator('test.rateSelf', { initialValue: score.test.rateSelf })(
                  <InputNumber />
                )}
              </td>
              <td>A.完美测试 B.完整测试 C.基本测试 D.无测试</td>
              <td>
                {getFieldDecorator('test.about', { initialValue: score.test.about })(
                  <Input.TextArea />
                )}
              </td>
              <td>
                {getFieldDecorator('test.levelSelf', { initialValue: score.test.levelSelf })(
                  <SelectAbcd disabled={!isSelf} />
                )}
              </td>
              <td>
                {getFieldDecorator('test.levelBoss', { initialValue: score.test.levelBoss })(
                  <SelectAbcd disabled={isSelf} />
                )}
              </td>
            </tr>
            <tr>
              <td>小 计</td>
              <td>{amount.totalRate}</td>
              <td>至少写两项，权重自定</td>
              <td />
              <td>{amount.totalSelf}</td>
              <td>{amount.totalBoss}</td>
            </tr>
            <tr className="title">
              <td rowSpan={5}>定性考核指标 (30%)</td>
              <td>考核内容</td>
              <td>考核权重</td>
              <td>考核说明</td>
              <td>执行情况说明</td>
              <td>自我评价</td>
              <td>主管评价</td>
            </tr>
            <tr>
              <td>个人成长</td>
              <td>
                {getFieldDecorator('grow.rateBoss', { initialValue: score.grow.rateBoss })(
                  <InputNumber disabled={true} />
                )}
              </td>
              <td>
                <p>
                  A. 帮助大家一起成长（积极组织分享会）<br />
                  B. 帮助他人共同成长（线上线下积极分享经验心得）<br />
                  C. 学无止境，与时俱进 <br />
                  D. 抱残守缺，停滞不前
                </p>
              </td>
              <td>
                {getFieldDecorator('grow.about', { initialValue: score.grow.about })(
                  <Input.TextArea />
                )}
              </td>
              <td>
                {getFieldDecorator('grow.levelSelf', { initialValue: score.grow.levelSelf })(
                  <SelectAbcd disabled={!isSelf} />
                )}
              </td>
              <td>
                {getFieldDecorator('grow.levelBoss', { initialValue: score.grow.levelBoss })(
                  <SelectAbcd disabled={isSelf} />
                )}
              </td>
            </tr>
            <tr>
              {/*<td>定量考核指标(70%)</td>*/}
              <td>团建活动</td>
              <td>
                {getFieldDecorator('team.rateBoss', { initialValue: score.team.rateBoss })(
                  <InputNumber disabled={true} />
                )}
              </td>
              <td>
                <p>
                  A. 积极组织活动 <br />
                  B. 从不缺席 <br />
                  C. 偶尔缺席 <br />
                  D. 经常缺席
                </p>
              </td>
              <td>
                {getFieldDecorator('team.about', { initialValue: score.team.about })(
                  <Input.TextArea />
                )}
              </td>
              <td>
                {getFieldDecorator('team.levelSelf', { initialValue: score.team.levelSelf })(
                  <SelectAbcd disabled={!isSelf} />
                )}
              </td>
              <td>
                {getFieldDecorator('team.levelBoss', { initialValue: score.team.levelBoss })(
                  <SelectAbcd disabled={isSelf} />
                )}
              </td>
            </tr>
            <tr>
              {/*<td>定量考核指标(70%)</td>*/}
              <td>团队管理</td>
              <td>
                {getFieldDecorator('meeting.rateBoss', { initialValue: score.meeting.rateBoss })(
                  <InputNumber disabled={true} />
                )}
              </td>
              <td>
                <p>
                  A. 积极发言（准备充分、有建设性）<br />
                  B. 从不缺席 <br />
                  C. 偶尔缺席 <br />
                  D. 经常缺席
                </p>
              </td>
              <td>
                {getFieldDecorator('meeting.about', { initialValue: score.meeting.about })(
                  <Input.TextArea />
                )}
              </td>
              <td>
                {getFieldDecorator('meeting.levelSelf', {
                  initialValue: score.meeting.levelSelf
                })(<SelectAbcd disabled={!isSelf} />)}
              </td>
              <td>
                {getFieldDecorator('meeting.levelBoss', {
                  initialValue: score.meeting.levelBoss
                })(<SelectAbcd disabled={isSelf} />)}
              </td>
            </tr>
            <tr>
              <td>小 计</td>
              <td>{nature.totalRate}</td>
              <td />
              <td />
              <td>{nature.totalSelf}</td>
              <td>{nature.totalBoss}</td>
            </tr>
          </tbody>
        </table>
        <div style={{ textAlign: 'center', margin: '15px 0' }}>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            disabled={!!match.params.uid && score.finishBoss}
          >
            保存
          </Button>
        </div>
      </FormWrap>
    );
  }
}
