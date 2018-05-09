import * as React from 'react';
import styled from 'styled-components';
import { Button } from 'antd';
import { IntlKeys } from '../../locale/zh_CN';
import withLocale from '../../utils/withLocale';
import notFoundPng from '../../assets/images/notFound/404.png';

const SectionWrap = styled.div`
  text-align: center;

  img {
    margin-top: 24px;
    margin-bottom: 24px;
    opacity: 0.6;
  }

  p {
    color: rgba(0, 0, 0, 0.45);
    font-size: 16px;
    line-height: 28px;
    margin-bottom: 16px;
  }
`;

/** 404 */
@withLocale
export default class NotFound extends React.PureComponent<NotFoundProp> {
  render() {
    const { site = () => '' } = this.props;
    return (
      <SectionWrap>
        <img src={notFoundPng} width={320} alt="404" />
        <p>{site('抱歉，您访问的页面不存在')}</p>
        <a href="/">
          <Button type="primary">{site('返回首页')}</Button>
        </a>
      </SectionWrap>
    );
  }
}

interface NotFoundProp {
  site?: (words: IntlKeys) => React.ReactNode;
}
