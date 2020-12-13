import React from "react";
import { Route, Link, BrowserRouter, Switch } from "react-router-dom";
import "materialize-css/dist/css/materialize.min.css";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import jwt_decode from "jwt-decode";

import Home from "./components/Home";
import StorageCenter from "./components/storageCenter/StorageCenter";
import Shipment from "./components/storageCenter/Shipment";
import store from "./redux/store";
import Authenticate from "./components/auth/Authenticate";
import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser } from "./redux/actions/authActions";
import PrivateRoute from "./components/auth/PrivateRoute";
import Admin from "./components/admin/Admin";

if (localStorage.jwt) {
  const token = localStorage.jwt;
  setAuthToken(token);
  const decoded = jwt_decode(token);
  store.dispatch(setCurrentUser(decoded));

  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    store.dispatch(logoutUser());
    window.location.href = "./authenticate";
  }
}

function App({ auth, logoutUser }) {
  return (
    <BrowserRouter>
      <div>
        <nav className="indigo darken-4">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            {auth.isAuthenticated ? (
              <>
                {auth.user.type === "stage" && (
                  <li>
                    <Link to="/storage-center">Storage Center</Link>
                  </li>
                )} 
                {auth.user.type === "admin" && 
                <li>
                  <Link to="/admin">Admin</Link>
                </li>
                }

                <li>
                  <a
                    href="/"
                    onClick={(e) => {
                      console.log("Logout click");
                      e.preventDefault();
                      logoutUser();
                    }}
                  >
                    Logout
                  </a>
                </li>
              </>
            ) : (
              <li>
                <Link to="/auth/login">Authenticate</Link>
              </li>
            )}
            {auth.isAuthenticated && (
              <li className="right" style={{marginRight: "50px"}}>{auth.user.username}</li>
            )}
          </ul>
        </nav>
        <Switch>
          <PrivateRoute exact path="/shipment" component={Shipment} />

          <Route exact path="/" component={Home} />
          <Route path="/auth" component={Authenticate} />
          <PrivateRoute path="/storage-center" component={StorageCenter} />
          <PrivateRoute path="/admin" component={Admin} />
        </Switch>
      </div>
    </BrowserRouter>
  );
}

const mapStateToProps = (state) => ({
  auth: state.auth,
});

App.propTypes = {
  auth: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, { logoutUser })(App);
