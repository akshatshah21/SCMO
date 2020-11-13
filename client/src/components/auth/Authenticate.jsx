import React, { useState } from "react";
import { Link, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";

export default function Authenticate() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      <div className="row" style={{ marginTop: "1.5rem" }}>
        <nav className="nav-extended col s6 offset-s3 row indigo darken-4">
          <div className="nav-content">
            <div className="row tabs tabs-transparent">
              <Link
                className="col s6 tab waves-effect waves-light"
                to="/auth/register"
                onClick={() => setIsLogin(false)}
                style={{ borderBottom: isLogin ? "none" : "white 2px solid" }}
              >
                Register
              </Link>
              <Link
                className="col s6 tab waves-effect waves-light"
                to="/auth/login"
                onClick={() => setIsLogin(true)}
                style={{ borderBottom: isLogin ? "white 2px solid" : "none" }}
              >
                Login
              </Link>
            </div>
          </div>
        </nav>
      </div>
      <div className="row">
        <Route path="/auth/register" component={Register} />
        <Route path="/auth/login" component={Login} />
      </div>
    </>
  );
}
