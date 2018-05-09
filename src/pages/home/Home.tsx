import * as React from 'react';
import { select } from '../../utils/model';
import styled from 'styled-components';
import { Layout, Modal, LocaleProvider } from 'antd';
import { addLocaleData, IntlProvider } from 'react-intl';
import en from 'react-intl/locale-data/en';
import zh from 'react-intl/locale-data/zh';
import * as localeData from '../../locale';

import zh_CN from 'antd/lib/locale-provider/zh_CN';
import zh_TW from 'antd/lib/locale-provider/zh_TW';
import en_US from 'antd/lib/locale-provider/en_US';

import { HomeState } from './Home.model';
import LoginComponent from '../components/login/LoginComponent';
import { LoginState } from '../login/Login.model';

import Header from './header/Header';
import Routes from '../routes/Routes';
import ErrorBoundary from '../components/error/ErrorBoundary';

const Content = styled(Layout.Content)`
  overflow-x: hidden;
  margin: 24px;
`;
const LayoutWrap = styled(Layout)`
  min-height: 100%;
`;
const Layouter = styled.div`
  overflow: initial;
  width: 100%;
`;

/** 首页：布局和路由 */
@select(['home', 'login', 'setting'])
export default class Home extends React.PureComponent<HomeProps, {}> {
  constructor(props: HomeProps) {
    super(props);
  }

  // componentDidMount() {
  //   const { dispatch } = this.props as SubscriptionAPI;
  //   dispatch({ type: 'home/query' });
  // }

  render() {
    addLocaleData([...zh, ...en]);
    addLocaleData({ locale: 'zh_CN', ...localeData.zh_CN, parentLocale: 'zh' });
    addLocaleData({ locale: 'zh_HK', ...localeData.zh_HK, parentLocale: 'zh' });
    addLocaleData({ locale: 'en_US', ...localeData.en_US, parentLocale: 'en' });

    const { login = {} as LoginState } = this.props;
    const lang = 'zh_CN';
    return (
      // <React.StrictMode>
      // </React.StrictMode>
      <LocaleProvider locale={zh_CN}>
        <IntlProvider locale={lang} messages={localeData[lang]}>
          <LayoutWrap>
            <Layouter>
              <Header />
              <Content>
                <Routes />
                <Modal
                  visible={login.needLogin}
                  footer={null}
                  destroyOnClose={true}
                  maskClosable={false}
                  closable={false}
                >
                  <LoginComponent />
                </Modal>
              </Content>
            </Layouter>
          </LayoutWrap>
        </IntlProvider>
      </LocaleProvider>
    );
  }
}

interface HomeProps {
  home?: HomeState;
  login?: LoginState;
}
