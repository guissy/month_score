import * as React from 'react';
import { select } from '../../utils/model';
import styled from 'styled-components';
import { Layout, LocaleProvider, Modal } from 'antd';
import { addLocaleData, IntlProvider } from 'react-intl';
import en from 'react-intl/locale-data/en';
import zh from 'react-intl/locale-data/zh';
import * as localeData from '../../locale';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import en_US from 'antd/lib/locale-provider/en_US';
import { LoginState } from '../login/Login.model';

import Header from './header/Header';
import Routes from '../routes/Routes';
import { compose, withApollo } from 'react-apollo';
import ApolloClient from 'apollo-client/ApolloClient';
import LoginComponent from '../login/LoginComponent';

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
@compose(withApollo, select('login'))
export default class Home extends React.PureComponent<HomeProps, {}> {
  render() {
    addLocaleData([...zh, ...en]);
    addLocaleData({ locale: 'zh_CN', ...localeData.zh_CN, parentLocale: 'zh' });
    addLocaleData({ locale: 'zh_HK', ...localeData.zh_HK, parentLocale: 'zh' });
    addLocaleData({ locale: 'en_US', ...localeData.en_US, parentLocale: 'en' });

    const { login = {} as LoginState } = this.props;
    const lang = 'zh_CN';
    return (
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
  client: ApolloClient<object>;
  login?: LoginState;
}
