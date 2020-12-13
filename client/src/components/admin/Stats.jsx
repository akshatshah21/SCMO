import React, { useState } from "react";
import { Link, Route } from "react-router-dom";

import ProductStats from "./ProductStats";
import ConnectionStats from "./ConnectionStats";

export default function Stats() {

  const [choice, setChoice] = useState("products");

  return (
    <div>
      <div className="row" style={{ marginTop: "1.5rem", marginBottom: 0 }}>
        <nav className="nav-extended col s6 offset-s3 row indigo darken-4">
          <div className="nav-content">
            <div className="row tabs tabs-transparent">
              <Link
                className="col s6 tab waves-effect waves-light"
                to="/admin/stats/products"
                onClick={() => setChoice("products")}
                style={{ borderBottom: choice === "products" ? "white 2px solid" : "none" }}
              >
                Products
              </Link>
              <Link
                className="col s6 tab waves-effect waves-light"
                to="/admin/stats/connections"
                onClick={() => setChoice("connections")}
                style={{ borderBottom: choice === "connections" ? "white 2px solid" : "none" }}
              >
                Connections
              </Link>
            </div>
          </div>
        </nav>
      </div>
      <div className="row">
        <Route path="/admin/stats/products" component={ProductStats} />
        <Route path="/admin/stats/connections" component={ConnectionStats} />
      </div>
    </div>
  )
}
