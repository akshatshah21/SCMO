import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import classnames from "classnames";

import { registerUser } from "../../redux/actions/authActions";

function Register({ registerUser, errors, auth, history }) {
  const [input, setInput] = useState({
    username: "",
    password: "",
    password2: "",
  });

  // const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setInput((prevInput) => ({
      ...prevInput,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newUser = {
      username: input.username,
      password: input.password,
      password2: input.password2,
    };

    console.log(newUser);
    registerUser(newUser, history);
  };

  return (
    <div className="col s6 offset-s3">
      <h2>Register</h2>
      <form noValidate autoComplete="off">
        <div className="row">
          <div className="input-field col s12">
            <input
              type="text"
              name="username"
              value={input.username}
              onChange={handleChange}
              error={errors && errors.username}
              className={classnames({
                invalid: errors.username
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
              error={errors && errors.password}
              className={classnames({
                invalid: errors.password
              })}
            />
            <label htmlFor="password">Password</label>
            <span className="red-text">{errors.password}</span>
          </div>
        </div>
        <div className="row">
          <div className="input-field col s12">
            <input
              type="password"
              name="password2"
              value={input.password2}
              onChange={handleChange}
              error={errors && errors.password2}
              className={classnames({
                invalid: errors.password2
              })}
            />
            <label htmlFor="password2">Confirm Password</label>
            <span className="red-text">{errors.password2}</span>
          </div>
        </div>
        <div className="row">
          <a
            className="waves-effect waves-light btn btn-small blue col s8 offset-s2"
            onClick={handleSubmit}
          >
            Register
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

Register.propTypes = {
  registerUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, { registerUser })(withRouter(Register));