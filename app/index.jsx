import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import Main from './Container/Main/Main';
import Login from './Container/Login/Login';
import Containers from './Container/Containers/Containers';
import Container from './Container/Container/Container';
import Compose from './Container/Compose/Compose';

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/" component={Main}>
      <IndexRoute component={Containers} />
      <Route path="/login" component={Login} />
      <Route path="/containers/New" component={Compose} />
      <Route path="/containers/:containerId" component={Container} />
    </Route>
  </Router>,
  document.getElementById('root'),
);
