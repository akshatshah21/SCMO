import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classnames from "classnames";

import { loginUser } from "../../redux/actions/authActions";

function Login({ loginUser, errors, auth, history }) {
  // NOT WORKING!
  if (auth.isAuthenticated) {
    console.log("Already logged in");
    history.push("/");
  }

  const [input, setInput] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setInput((prevInput) => ({
      ...prevInput,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = {
      username: input.username,
      password: input.password,
    };
    loginUser(userData);
  };
  return (
    <div className="col s6 offset-s3">
      <h2 className="center-align">Login</h2>
      <form noValidate>
        <div className="row">
          <div className="input-field col s12">
            <input
              type="text"
              name="username"
              value={input.username}
              onChange={handleChange}
              error={errors.username}
              className={classnames({
                invalid: errors.username,
              })}
            />
            <label htmlFor="username">Username</label>
            <span className="red-text">{errors.username}</span>
          </div>
        </div>
        <div className="row">
          <div className="input-field col s12">
            <input
              type="password"
              name="password"
              value={input.password}
              onChange={handleChange}
              error={errors.password}
              className={classnames({
                invalid: errors.password,
              })}
            />
            <label htmlFor="password">Password</label>
            <span className="red-text">{errors.password}</span>
          </div>
        </div>
        <div className="row">
          <a
            className="waves-effect waves-light btn btn-small blue col s8 offset-s2"
            onClick={handleSubmit}
          >
            Login
          </a>
        </div>
      </form>
    </div>
  );
}

const mapStateToProps = (state) => ({
  errors: state.errors,
  auth: state.auth,
});

Login.propTypes = {
  loginUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, { loginUser })(Login);
