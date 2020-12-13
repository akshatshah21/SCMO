import React, { useState, useEffect } from "react";

import axios from "axios";
import M from "materialize-css";
import mapboxgl from "mapbox-gl";

import { MAPBOX_API_TOKEN } from "../../config/keys";
import {
  MAPBOX_STYLESHEET_LOCATION,
  MAPBOX_START_ZOOM,
  MAPBOX_START_CENTER,
  API_URL,
} from "../../config/options";

mapboxgl.accessToken = MAPBOX_API_TOKEN;

export default function AdminMap() {
  const [map, setMap] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: "map",
      style: MAPBOX_STYLESHEET_LOCATION,
      center: MAPBOX_START_CENTER,
      zoom: MAPBOX_START_ZOOM,
    });
    const getStages = async () => {
      try {
        let { data: stages } = await axios.post(
          API_URL + "/api/stage/stagesInBuffer",
          {
            latitude: MAPBOX_START_CENTER[1],
            longitude: MAPBOX_START_CENTER[0],
            radius: 999999999, // all stages, I hope
          }
        );
        console.log(stages);
        mapboxgl.accessToken = MAPBOX_API_TOKEN;
        map.on("load", () => {
          if (map.getSource("stages")) {
            map.getSource("stages").setData(stages);
          } else {
            map.addSource("stages", {
              type: "geojson",
              data: {
                type: "FeatureCollection",
                features: stages.map((stage) => ({
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [stage.stageLon, stage.stageLat],
                  },
                  properties: {
                    title: stage.stageName,
                    coordinates: `${stage.stageLon},${stage.stageLat}`, // workaround for click
                    stageId: stage.stageId,
                    stageDetails: stage,
                  },
                })),
              },
            });
            map.loadImage(
              process.env.PUBLIC_URL + "/warehouse-marker.webp",
              (err, image) => {
                if (err) {
                  throw err;
                }
                map.addImage("warehouse-marker", image, { pixelRatio: 9 });
                map.addLayer({
                  id: "stages",
                  source: "stages",
                  type: "symbol",
                  source: "stages",
                  layout: {
                    "icon-image": "warehouse-marker",
                    "icon-allow-overlap": true,
                    "text-allow-overlap": true,
                    // get the title name from the source's "title" property
                    "text-field": ["get", "title"],
                    "text-font": [
                      "Open Sans Semibold",
                      "Arial Unicode MS Bold",
                    ],
                    "text-offset": [0, 1.25],
                    "text-anchor": "top",
                  },
                });

                map.on("click", "stages", (e) => {
                  console.log(e.features[0]);
                  setSelectedStage(
                    JSON.parse(e.features[0].properties.stageDetails)
                  );
                });

                map.on("mouseenter", "stages", function () {
                  map.getCanvas().style.cursor = "pointer";
                });

                // Change it back to a pointer when it leaves.
                map.on("mouseleave", "stages", function () {
                  map.getCanvas().style.cursor = "";
                });
              }
            );
          }
          setMap(map);
        });
      } catch (error) {
        M.toast({ html: "Error" });
        console.log(error);
      }
    };
    getStages();
    return () => map.remove();
  }, []);

  useEffect(() => {
    if (!selectedStage) return;
    const getProducts = async () => {
      // Get all products for this stage
      try {
        let res = await axios.get(
          API_URL + `/api/stage/${selectedStage.stageId}/products`
        );
        setProducts(res.data);
      } catch (error) {
        console.log(error);
        // M.toast({html: "Error occured"});
      }
      
    };
    getProducts();
  }, [selectedStage]);

  return (
    <div className="row">
      <div
        id="map"
        className="col s12 m10 l9 center-align"
        style={{ height: "90vh" }}
      ></div>
      <div className="col s12 m2 l3">
        {selectedStage ? (
          <div>
            <h5 className="center-align">{selectedStage.stageName}</h5>
            <p>Email: {selectedStage.stageEmail}</p>
            <p>Address: {selectedStage.stageAdd}</p>
            <h5>Inventory</h5>
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
        ) : (
          "Select a storage center to view its details"
        )}
      </div>
    </div>
  );
}
