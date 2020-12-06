import axios from "axios";
import React, { useState, useEffect } from "react";
import M from "materialize-css";
import mapboxgl from "mapbox-gl";
import socketIOClient from 'socket.io-client'

const ENDPOINT = "http://127.0.0.1:5000"; // localhost. Change this
const socket = socketIOClient(ENDPOINT)

export default function Shipment({ location }) {
  const [products, setProducts] = useState([]);
  const [shipmentLocation, setShipmentLocation] = useState({
    latitude: 0,
    longitude: 0
  });

  useEffect(() => {
    let getProducts = async () => {
      try {
        let res = await axios.get(
          "/api/transfer/" + location.state.shipment.id + "/products"
        );
        setProducts(res.data);
      } catch (error) {
        console.log(error);
        M.toast({ html: "Error" });
      }
    };
    getProducts();
  }, [location.state]);

  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiYWtzaGF0c2hhaDIxIiwiYSI6ImNrZ3Vob2dpNjBvZDgycG5hOHMzbTVxdTMifQ.NXZnqYPxl7x-gp4bNsRRsg";
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11", // stylesheet location
      center: [73, 19], // starting position [lng, lat]
      zoom: 7, // starting zoom
    });
    socket.connect()

  }, [location.state]);


  return (
    <div className="row" style={{ height: "90vh" }}>
      <div className="col s12 m2 l3 grey lighten-4" style={{ height: "100%" }}>
        <h5 className="center-align text-muted">Details of Transfer</h5>
        <h4>
          <strong>
            {location.state.type === "incoming" ? "From" : "To"}:{" "}
          </strong>
          {location.state.shipment.name}
        </h4>
        {/* backend doesn't process stage's address, email so do that and add here later */}
        <h5>Products</h5>

        <table>
          <tbody>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
            </tr>
            {products.map((product) => (
              <tr key={product.productId}>
                <td>{product.productName}</td>
                <td>{product.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div id="map" className="col s12 m10 l9" style={{height:"100%"}}></div>
    </div>
  );
}
