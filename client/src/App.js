import React from "react";
import { Route, Link, BrowserRouter } from "react-router-dom";
import "materialize-css/dist/css/materialize.min.css";
import M from "materialize-css";

import StorageCenter from "./components/storageCenter/StorageCenter";

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
              <Link to="/storage-center">Storage Center</Link>
            </li>
          </ul>
        </nav>
        {/* <Route path="/" component={Home}  />
        <Route path="/login" component={Login} /> */}
        <Route path="/storage-center" component={StorageCenter} />
      </div>
    </BrowserRouter>
  );
}

export default App;
