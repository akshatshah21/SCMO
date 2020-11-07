import React from "react";
import { Route, Link, BrowserRouter } from "react-router-dom";
import "materialize-css/dist/css/materialize.min.css";
import M from "materialize-css";
import { Provider } from "react-redux";
import store from "./redux/store";


import Warehouse from "./components/Warehouse";
import Authenticate from "./components/auth/Authenticate";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/auth">Authenticate</Link>
              </li>
              <li>
                <Link to="/warehouse">Warehouse</Link>
              </li>
            </ul>
          </nav>
          <div className="container">
            {/* <Route path="/" component={Home}  /> */}
            <Route path="/auth" component={Authenticate} />
            <Route path="/warehouse" component={Warehouse} />
          </div>
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
