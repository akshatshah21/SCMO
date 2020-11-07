import React, { useState } from "react";

export default function Register() {
  const [input, setInput] = useState({
    username: "",
    password: "",
    password2: "",
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
    const newUser = {
      username: input.username,
      password: input.password,
      password2: input.password2,
    };

    console.log(newUser);
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
          <div className="input-field col s12">
            <input
              type="password"
              name="password2"
              value={input.password2}
              onChange={handleChange}
              error={errors.password2}
            />
            <label htmlFor="password2">Confirm Password</label>
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
