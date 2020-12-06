import React from "react";
import { Link } from "react-router-dom";

export default function ShipmentCard({ type, shipment, receiveClick }) {
  return (
    <div className="card row">
      <div className="card-content col s8">
        <h5>
          <strong>{type === "incoming" ? "From" : "To"}: </strong>
          {shipment.name}
        </h5>
      </div>
      <div className="card-action col s4 right-align row">
        <Link
          to={{
            pathname: "/shipment",
            state: {
              shipment,
              type
            },
          }}
        >
          <button className="btn blue darken-3 white-text btn-flat center-align">
            Details
          </button>
        </Link>
        <br />
        <br />
        {type === "incoming" && shipment.status === "ongoing" && (
          <button
            className="btn green darken-3 white-text btn-flat center-align"
            onClick={() => receiveClick(shipment.id)}
          >
            Receive
          </button>
        )}
      </div>
    </div>
  );
}
