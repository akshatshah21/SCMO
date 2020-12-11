import React, { useEffect } from "react";
import { Link, Route } from "react-router-dom";
import M from "materialize-css";

import SendShipment from "./SendShipment";
import Inventory from "./Inventory";
import ShipmentsList from "./ShipmentsList";

export default function StorageCenter() {
  useEffect(() => {
    M.Parallax.init(document.querySelector(".parallax"), {});
  }, []);

  return (
    <div className="container">
      <div className="parallax-container">
        <div className="parallax">
          <img
            src="warehouse.jpg"
            alt="storage-center"
            className="responsive-img"
          />
        </div>
      </div>
      <div className="container">
        <Route exact path="/storage-center">
          <h1 className="center-align">Storage Center</h1>
          <div className="row center-align">
            <div className="card col s8 offset-s2">
              <Link to="/storage-center/send">
                <h5>Send Shipment</h5>
              </Link>
            </div>
          </div>
          <div className="row center-align">
            <div className="card col s4 offset-s2">
              <Link to="/storage-center/incoming">
                <h5>Incoming Shipments</h5>
              </Link>
            </div>
            <div className="card col s4">
              <Link to="/storage-center/outgoing">
                <h5>Outgoing Shipments</h5>
              </Link>
            </div>
          </div>
          <div className="row center-align">
            <div className="card col s8 offset-s2">
              <Link to="/storage-center/inventory">
                <h5>Inventory</h5>
              </Link>
            </div>
          </div>
        </Route>
        <Route path="/storage-center/send" component={SendShipment} />
        <Route
          path="/storage-center/incoming"
          render={() => (
            <ShipmentsList title="Incoming Shipments" type="incoming" />
          )}
        />
        <Route
          path="/storage-center/outgoing"
          render={() => (
            <ShipmentsList title="Outgoing Shipments" type="outgoing" />
          )}
        />
        <Route path="/storage-center/inventory" component={Inventory} />
      </div>
    </div>
  );
}
