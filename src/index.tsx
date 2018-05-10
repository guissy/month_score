import * as React from 'react';
import dva, { Action, SubscriptionAPI } from 'dva';
import { ConnectedRouter } from 'react-router-redux';
import { Switch, Route } from 'react-router';
import createBrowserHistory from 'history/createBrowserHistory';
import registerServiceWorker from './registerServiceWorker';

import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import { ApolloProvider } from 'react-apollo';
import { ApolloLink } from 'apollo-link';
import Playground from 'graphql-playground';

import './assets/fonts/iconfont';
import './assets/styles/app.scss';
import Home from './pages/home/Home';
import LoginModel, { hasLoginUser, LoginUser } from './pages/login/Login.model';
import throttleEffect from './utils/throttleEffect';
import { effectLoadingLoadError, loadReducer, effectErrorMessage } from './utils/model';
import Register from './pages/register/Register';
import environment from './utils/environment';
import './assets/styles/google.css';
import ErrorBoundary from './zongzi/pc/error/ErrorBoundary';
import { messageError } from './utils/showMessage';
import LoginComponent from './pages/login/LoginComponent';

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

const httpLink = createHttpLink({
  uri: `${environment.apiHost}/graphql`
});

const authLink = setContext((_, { headers }) => {
  const token = sessionStorage.getItem(environment.tokenName);
  const auth = token ? { authorization: `Bearer ${token}` } : {};
  return { headers: { ...headers, ...auth } };
});

const errorLink = onError(error => {
  if (error.graphQLErrors) {
    error.graphQLErrors.map(({ message, locations, path }) =>
      console.warn(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    );
  }
  if (hasLoginUser(client)) {
    client.writeFragment({
      id: 'user/login',
      fragment: LoginUser,
      data: {
        hasLogin: false
      }
    });
  }
  // console.log('☞☞☞ 9527 index 76', client.extract());
  messageError(error, app._store.dispatch);
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([authLink, errorLink, httpLink])
});
const router = ({ history }: SubscriptionAPI) => {
  return (
    <ErrorBoundary>
      <ApolloProvider client={client}>
        <ConnectedRouter history={history}>
          <Switch>
            <Route exect={true} path="/login" component={LoginComponent} />
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
