import axios from "axios";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import M from "materialize-css";

import ShipmentCard from "./ShipmentCard";

function ShipmentsList({ history, title, type, auth }) {
  const [shipments, setShipments] = useState([]);
  const [pending, setPending] = useState(true);
  const [code, setCode] = useState("");

  useEffect(() => {
    const getShipments = async () => {
      let url = `/api/transfer/${auth.user.stageId}/` + type;
      let res = await axios(url);
      setShipments(
        res.data.map((transfer) => ({
          id: transfer.transferId,
          status: transfer.transferStatus,
          name:
            type === "incoming"
              ? transfer.sourceName
              : transfer.destinationName,
        }))
      );
    };
    getShipments();
  }, [pending, type, auth]);

  useEffect(() => {
    var elems = document.querySelectorAll(".modal");
    var [instance] = M.Modal.init(elems, {
      onCloseEnd: () => {
        // display done and redirect to storage center
        M.toast({ html: "Shipment received" });
        setPending(false);
      },
    });
    if (instance) instance.open();
  }, [code]);

  const handleReceiveClick = async (id) => {
    let res = await axios.post("/api/transfer/finish", {
      transferId: id,
      stageId: auth.user.stageId
    });
    if(res.status === 200) {
      setCode(res.data.destinationCode);
    } else {
      M.toast({html: `Error: ${res.data.error}`});
    }
  }

  return (
    <div>
      <h2 className="center-align">{title}</h2>
      <div className="row" style={{ marginTop: "1.5rem" }}>
        <nav className="nav-extended col s12 row indigo darken-4">
          <ul className="row tabs tabs-transparent">
            <li
              className="col s6 tab waves-effect waves-light"
              onClick={() => setPending(true)}
              style={{ borderBottom: pending ? "white 2px solid" : "none" }}
            >
              <span>Pending</span>
            </li>
            <li
              className="col s6 tab waves-effect waves-light"
              onClick={() => setPending(false)}
              style={{ borderBottom: pending ? "none" : "white 2px solid" }}
            >
              <span>Completed</span>
            </li>
          </ul>
        </nav>
      </div>
      {shipments
        .filter(
          (shipment) => shipment.status === (pending ? "ongoing" : "completed")
        )
        .map((shipment) => (
          <ShipmentCard key={shipment.id} shipment={shipment} type={type} receiveClick={handleReceiveClick} />
        ))}

      {code !== "" ? (
        <div id="modal1" className="modal">
          <div className="modal-content">
            <h4>Receive Shipment</h4>
            <h5>
              To complete the shipment, give this code to the person in charge of
              moving the products to you.
            </h5>
            <h2 className="center-align">{code}</h2>
          </div>
          <div className="modal-footer">
            <a
              href="#!"
              className="modal-close waves-effect waves-green btn-flat"
            >
              Done
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, null)(ShipmentsList);
