import React from 'react';
import PropTypes from 'prop-types';
import './App.css';

export default function App(props) {
  console.log('App Component')
  return (
    <div className="App">
      App
      {React.Children.toArray(props.children)}
    </div>
  );
};

App.propTypes = {
  children: PropTypes.node,
};

