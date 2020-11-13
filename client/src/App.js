import React from "react";
import { Route, Link, BrowserRouter } from "react-router-dom";
import "materialize-css/dist/css/materialize.min.css";
import M from "materialize-css";

import StorageCenter from "./components/storageCenter/StorageCenter";
import Shipment from "./components/storageCenter/Shipment";
import { Provider } from "react-redux";
import store from "./redux/store";
import Authenticate from "./components/auth/Authenticate";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div>
          <nav className="indigo darken-4">
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/auth/login">Authenticate</Link>
              </li>
              <li>
                    <Link to="/storage-center">Storage Center</Link>
              </li>
            </ul>
          </nav>
          <Route exact path="/shipment" component={Shipment}   />
          <div className="container">
            {/* <Route path="/" component={Home}  /> */}
            <Route path="/auth" component={Authenticate} />
            <Route path="/storage-center" component={StorageCenter} />
          </div>
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
