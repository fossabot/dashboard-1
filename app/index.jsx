import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import Main from './Main';
import Login from './Login/Login';
import Containers from './Container/Containers';
import Container from './Container/Container';

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/" component={Main}>
      <IndexRoute component={Containers} />
      <Route path=":containerId" component={Container} />
      <Route path="login" component={Login} />
    </Route>
  </Router>,
  document.getElementById('root'),
);
