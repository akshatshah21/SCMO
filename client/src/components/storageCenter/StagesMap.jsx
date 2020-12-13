import axios from "axios";
import React, { useState, useEffect } from "react";
import M from "materialize-css";
import { connect } from "socket.io-client";

import { API_URL } from "../../config/options";

var map;

function StagesMap({ user }) {
  const [numStages, setNumStages] = useState(0);
  const [buffer, setBuffer] = useState(0);
  const [stages, setStages] = useState([]);
  const handleNumChange = (e) => {
    if (Number.isInteger(e.target.value)) {
      setNumStages(e.target.value);
    }
  };
  const handleBufferChange = (e) => {
    if (Number.isFinite(e.target.value)) {
      setBuffer(e.target.value);
    }
  };

  useEffect(() => {
    let getClosestStages = async () => {
      try {
        let { data: stageList } = await axios.post(
          API_URL + "/api/stage/closestStages",
          {
            latitude: user.stage.stageLat,
            longitude: user.stage.stageLon,
            limit: numStages + 1,
          }
        );
        setStages(stageList);
      } catch (error) {
        console.log(error);
        M.toast({ html: "Error occured" });
      }
    };
    getClosestStages();
  }, [numStages]);

  useEffect(() => {
    let getStagesInBuffer = async () => {
      try {
        let { data: stageList } = await axios.post(
          API_URL + "/api/stage/stagesInBuffer",
          {
            latitude: user.stage.stageLat,
            longitude: user.stage.stageLon,
            radius: buffer,
          }
        );
        setStages(stageList);
      } catch (error) {
        console.log(error);
        M.toast({ html: "Error occured" });
      }
    };
    getStagesInBuffer();
  }, [buffer]);

  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_API_TOKEN;
    map = new mapboxgl.Map({
      container: "map",
      style: MAPBOX_STYLESHEET_LOCATION,
      center: MAPBOX_START_CENTER, // starting position [lng, lat]
      zoom: MAPBOX_START_ZOOM, // starting zoom
    });

    map.getSource();
  }, []);

  useEffect(() => {
    let geoJsonData = {
      type: "FeatureCollection",
      features: stages.map((stage) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [stage.stageLon, stage.stageLat],
        },
        properties: {
          title: `<h6 class="center-align">${stage.stageName}</h6>`,
          address: stage.stageAdd,
        },
      })),
    };

    map.on("load", () => {
      map.loadImage("warehouse-marker.webp", (err, image) => {
        if (err) {
          throw err;
        }
        map.addImage("warehouse-marker", image);
        if (map.getSource("stages")) {
          map.getSource("stages").setData(geoJsonData);
        } else {
          map.addSource("stages", {
            type: "geojson",
            data: geoJsonData,
          });
        }

        map.addLayer({
          id: "stages",
          type: "symbol",
          source: "stages",
          layout: {
            "icon-image": "warehouse-marker",
            // get the title name from the source's "title" property
            "text-field": ["get", "title"],
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 1.25],
            "text-anchor": "top",
          },
        });

        map.on("click", "stages", (e) => {
          let coordinates = e.features[0].coordinates.slice();
          let description = `${e.features[0].properties}${e.features[0].properties.address}`;

          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
        });

        map.on("mouseenter", "stages", function () {
          map.getCanvas().style.cursor = "pointer";
        });

        // Change it back to a pointer when it leaves.
        map.on("mouseleave", "stages", function () {
          map.getCanvas().style.cursor = "";
        });
      });
    });
  }, [stages]);

  return (
    <div>
      <div className="row">
        <div className="col s6">
          <div className="input-field inline">
            <input
              id="num-stages"
              type="number"
              className="validate"
              value={numStages}
              onChange={handleNumChange}
            />
            <label htmlFor="num-stages">Number of closest stages</label>
            <span className="helper-text" dataError="wrong" dataSuccess="right">
              For example, enter 3 to see the 3 closest stages
            </span>
          </div>
        </div>
        <div className="col s6">
          <div className="input-field inline">
            <input
              type="number"
              id="buffer"
              className="validate"
              value={buffer}
              onChange={handleBufferChange}
            />
            <label htmlFor="buffer">Buffer</label>
            <span className="helper-text" dataError="wrong" dataSuccess="right">
              For example, enter 3 to see the stages within 3km
            </span>
          </div>
        </div>
      </div>
      <div id="map" className="col s12 m10 l9" style={{ height: "100%" }}></div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, null)(StagesMap);
