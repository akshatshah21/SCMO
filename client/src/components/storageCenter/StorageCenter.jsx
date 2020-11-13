import React from "react";
import { Link, Route } from "react-router-dom";

import SendShipment from "./SendShipment";
import ReceiveShipment from "./ReceiveShipment";
import Inventory from "./Inventory";
import ShipmentsList from "./ShipmentsList";

export default function StorageCenter() {
  return (
    <div className="container">

      <Route exact path="/storage-center">
        <h1 className="center-align">Storage Center</h1>
        <div className="row center-align">
          <div className="card col s4 offset-s2">
            <Link to="/storage-center/send"><h5>Send Shipment</h5></Link>
          </div>
          <div className="card col s4">
            <Link to="/storage-center/receive"><h5>Receive Shipment</h5></Link>
          </div>
        </div>
        <div className="row center-align">
          <div className="card col s4 offset-s2">
            <Link to="/storage-center/incoming"><h5>Incoming Shipments</h5></Link>
          </div>
          <div className="card col s4">
            <Link to="/storage-center/outgoing"><h5>Outgoing Shipments</h5></Link>
          </div> 
        </div>
        <div className="row center-align">
          <div className="card col s8 offset-s2">
            <Link to="/storage-center/inventory"><h5>Inventory</h5></Link>
          </div>
        </div>
      </Route>

      <Route path="/storage-center/send" component={SendShipment}/>
      <Route path="/storage-center/receive" component={ReceiveShipment}/>
      <Route path="/storage-center/incoming" render={() => <ShipmentsList title="Incoming Shipments" type="incoming" /> } />
      <Route path="/storage-center/outgoing" render={() => <ShipmentsList title="Outgoing Shipments" type="outgoing" /> } />
      <Route path="/storage-center/inventory" component={Inventory}/>

    </div>
  );
}
