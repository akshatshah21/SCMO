import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classnames from "classnames";
import M from "materialize-css";

import { loginUser } from "../../redux/actions/authActions";

function Login({ loginUser, errors, auth, history }) {
  // Works only on login form submit, not when a logged in user comes to this component
  if (auth.isAuthenticated) {
    console.log("Already logged in");
    history.push("/");
  }

  const [input, setInput] = useState({
    username: "",
    password: "",
    type: "",
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
      type: input.type
    };
    // console.log(userData);
    loginUser(userData);
  };

  useEffect(() => {
    var selects = document.querySelectorAll("select");
    M.FormSelect.init(selects);
  }, [])

  return (
    <div className="card col s6 offset-s3" style={{ marginTop: 0 }}>
      <h3 className="center-align">Login</h3>
      <form noValidate>
      <div className="row">
          <div className="input-field col s12">
            <select
              name="type"
              onChange={handleChange}
              error={errors && errors.type}
              className={classnames({
                invalid: errors.type,
              })}
              defaultValue=""
            >
              <option value="" disabled>
                Choose account type
              </option>
              <option value="stage">Storage Center</option>
              <option value="admin">Admin</option>
            </select>
            <label>Type of account</label>
            <span className="red-text">{errors.type}</span>
          </div>
        </div>
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
          <button
            className="waves-effect waves-light btn btn-small blue col s8 offset-s2"
            onClick={handleSubmit}
          >
            Login
          </button>
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
