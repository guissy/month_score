import * as React from 'react';
import dva, { Action, SubscriptionAPI } from 'dva';
import { ConnectedRouter } from 'react-router-redux';
import { Switch, Route } from 'react-router';
import createBrowserHistory from 'history/createBrowserHistory';
import registerServiceWorker from './registerServiceWorker';
import './assets/fonts/iconfont';
import './assets/styles/app.scss';
import { omit } from 'lodash/fp';

import Home from './pages/home/Home';
import HomeModel from './pages/home/Home.model';
import Login from './pages/login/Login';
import LoginModel, { LoginState } from './pages/login/Login.model';

// 头部
import HeaderModel from './pages/home/header/Header.model';
import RegisterModel from './pages/register/Register.model';
import throttleEffect from './utils/throttleEffect';
import { effectLoadingLoadError, loadReducer, effectErrorMessage } from './utils/model';
import Register from './pages/register/Register';
import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import environment from './utils/environment';
import { ApolloProvider } from 'react-apollo';
import Playground from 'graphql-playground';
import './assets/styles/google.css';
import ErrorBoundary from './zongzi/pc/error/ErrorBoundary';

const app = dva({
  history: createBrowserHistory(),
  onEffect: effectLoadingLoadError,
  onReducer: loadReducer,
  onError: effectErrorMessage
});

app.model({
  namespace: 'loading',
  state: false,
  reducers: { update: (state: boolean, { payload }: Action) => payload }
});
app.model(throttleEffect(LoginModel));
app.model(throttleEffect(RegisterModel));
app.model(throttleEffect(HomeModel));
app.model(throttleEffect(HeaderModel));

const httpLink = createHttpLink({
  uri: `${environment.apiHost}/graphql`
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = sessionStorage.getItem(environment.tokenName);
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  };
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink)
});

const router = ({ history }: SubscriptionAPI) => {
  return (
    <ErrorBoundary>
      <ApolloProvider client={client}>
        <ConnectedRouter history={history}>
          <Switch>
            <Route exect={true} path="/login" component={Login} />
            <Route exect={true} path="/register" component={Register} />
            {/*<Route*/}
            {/*exact={true}*/}
            {/*path="/graphql"*/}
            {/*component={() =>*/}
            {/*<Playground endpoint="http://127.0.0.1:8899/graphql" />*/}
            {/*}*/}
            />
            <Route path="/" component={Home} />
          </Switch>
        </ConnectedRouter>
      </ApolloProvider>
    </ErrorBoundary>
  );
};

app.router(router);
app.start(document.getElementById('root'));
registerServiceWorker();

// hot module replace
if (module.hot) {
  module.hot.accept('./pages/home/Home', () => {
    app.router(router);
    app.start(document.getElementById('root'));
  });
}
