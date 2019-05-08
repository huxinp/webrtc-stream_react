import React from 'react';
import PropTypes from 'prop-types';
import './index.scss';

export default function Login(props) {
  console.log('Login Component')
  return <div className="login">Login</div>
}

Login.propTypes = {
  children: PropTypes.node,
}
