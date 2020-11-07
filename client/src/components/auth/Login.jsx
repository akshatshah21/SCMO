import React, { useState } from "react";

export default function Login() {
  const [input, setInput] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

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
  };
  return (
    <div className="col s6 offset-s3">
      <h2>Login</h2>
      <form>
        <div className="row">
          <div className="input-field col s12">
            <input
              type="text"
              name="username"
              value={input.username}
              onChange={handleChange}
              error={errors.username}
            />
            <label htmlFor="username">Username</label>
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
            />
            <label htmlFor="password">Password</label>
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
