import React from 'react';
import onKeyDown from '../../Tools/input';
import Toolbar from '../../Presentational/Toolbar/Toolbar';
import ThrobberButton from '../../Presentational/Throbber/ThrobberButton';
import style from './Login.css';

const Login = ({ pending, onLogin, error }) => {
  let loginInput;
  let passwordInput;

  function submit() {
    onLogin(loginInput.value, passwordInput.value);
  }

  return (
    <span className={style.flex}>
      <h2>Login</h2>
      <input
        ref={e => (loginInput = e)}
        name="login"
        type="text"
        placeholder="login"
        onKeyDown={e => onKeyDown(e, submit)}
      />
      <input
        ref={e => (passwordInput = e)}
        name="password"
        type="password"
        placeholder="password"
        onKeyDown={e => onKeyDown(e, submit)}
      />
      <Toolbar className={style.center} error={error}>
        <ThrobberButton onClick={submit} pending={pending}>Login</ThrobberButton>
      </Toolbar>
    </span>
  );
};

Login.displayName = 'Login';

Login.propTypes = {
  pending: React.PropTypes.bool,
  onLogin: React.PropTypes.func.isRequired,
  error: React.PropTypes.string,
};

Login.defaultProps = {
  pending: false,
  error: '',
};

export default Login;
