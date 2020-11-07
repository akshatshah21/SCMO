import React from "react";
import { Route, Link, BrowserRouter } from "react-router-dom";

import Warehouse from "./components/Warehouse";

function App() {
  return (
    <BrowserRouter>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/warehouse">Warehouse</Link>
            </li>
          </ul>
        </nav>
        {/* <Route path="/" component={Home}  />
        <Route path="/login" component={Login} /> */}
        <Route path="/warehouse" component={Warehouse} />
      </div>
    </BrowserRouter>
  );
}

export default App;
