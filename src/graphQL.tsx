import React from 'react';
import ReactDOM from 'react-dom';
import Playground from 'graphql-playground';
import './assets/styles/google.css';
// import './assets/styles/graphqlbin.css';
// import 'graphql-playground-react/playground.css';

ReactDOM.render(
  <Playground endpoint="http://127.0.0.1:8899/graphql" />,
  document.querySelector('#root')
);
