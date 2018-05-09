import * as React from 'react';
import { Switch, Route, Redirect } from 'react-router';
import NotFound from '../notFound/NotFound';
import * as moment from 'moment';
import ScoreList from '../score/ScoreList';
import ScoreDetail from '../score/ScoreDetail';

export default () => {
  const [, , date = moment().format('YYYY-MM')] = window.location.pathname.split('/');
  return (
    <Switch>
      <Route exact={true} path="/month" component={ScoreDetail} />
      <Route exact={true} path="/list/:date?" component={ScoreList} />
      <Redirect exact={true} path="/NaN/:date" to={`/list/${date}`} />
      <Route exact={true} path="/:uid/:date" component={ScoreDetail} />
      <Route component={NotFound} />
    </Switch>
  );
};
