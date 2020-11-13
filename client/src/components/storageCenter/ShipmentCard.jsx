import React from "react";
import { Link } from "react-router-dom";

export default function ShipmentCard(props) {
  return (
    <div className="card row">
      <div className="card-content col s8">
        <p>
          <strong>To: </strong>
          {props.shipment.recipient}
        </p>
        <p>
          <strong>Start: </strong>
          {props.shipment.start}
        </p>
        <p>
          <strong>Products: </strong>
          {props.shipment.products}
        </p>
      </div>
      <div className="card-action col s4 right-align row">
        <Link to="/shipment">
          <button className="btn blue darken-3 white-text btn-flat center-align">
            Details
          </button>
        </Link>
      </div>
    </div>
  );
}
