import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import classnames from "classnames";
import M from "materialize-css";

import { registerUser } from "../../redux/actions/authActions";
import axios from "axios";

function Register({ registerUser, errors, auth, history }) {
  const [input, setInput] = useState({
    username: "",
    password: "",
    password2: "",
    type: "",
    stageId: ""
  });
  const [stages, setStages] = useState([]);

  const handleChange = (e) => {
    console.log(e.target.name);
    console.log(e.target.value);
    setInput((prevInput) => ({
      ...prevInput,
      [e.target.name]: e.target.value,
    }));
    console.log(input);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    registerUser(input, history);
  };

  useEffect(() => {
    const initStages = async () => {
      let res = await axios.get("/api/stage");
      setStages(() =>
        res.data.map((stage) => ({ name: stage.stageName, id: stage.stageId }))
      );
    };
    initStages();
    var selects = document.querySelectorAll("select");
    M.FormSelect.init(selects);
  }, [input.type]);

  return (
    <div className="col s6 offset-s3">
      <h2 className="center-align">Register</h2>
      <form noValidate autoComplete="off">
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
              <option value="3" disabled>
                Option 3
              </option>
            </select>
            <label>Type of account</label>
            <span className="red-text">{errors.type}</span>
          </div>
        </div>
        {input.type === "stage" && (
          <div className="row">
            <div className="input-field col s12">
              <select
                name="stageId"
                error={errors && errors.stageId}
                onChange={handleChange}
                className={classnames({
                  invalid: errors.stageId,
                })}
                defaultValue=""
              >
                <option value="" disabled>
                  Choose storage center
                </option>
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
              <label>Storage Center</label>
            <span className="red-text">{errors.stageId}</span>
            </div>
          </div>
        )}
        <div className="row">
          <div className="input-field col s12">
            <input
              type="text"
              name="username"
              value={input.username}
              onChange={handleChange}
              error={errors && errors.username}
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
              error={errors && errors.password}
              className={classnames({
                invalid: errors.password,
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
                invalid: errors.password2,
              })}
            />
            <label htmlFor="password2">Confirm Password</label>
            <span className="red-text">{errors.password2}</span>
          </div>
        </div>
        <div className="row">
          <button
            className="waves-effect waves-light btn btn-small blue col s8 offset-s2"
            onClick={handleSubmit}
          >
            Register
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

Register.propTypes = {
  registerUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, { registerUser })(withRouter(Register));
