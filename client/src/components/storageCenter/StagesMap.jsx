import axios from "axios";
import React, { useState, useEffect } from "react";
import M from "materialize-css";
import { connect } from "react-redux";
import mapboxgl from "mapbox-gl";

import {
  MAPBOX_STYLESHEET_LOCATION,
  MAPBOX_START_ZOOM,
  MAPBOX_START_CENTER,
  API_URL,
} from "../../config/options";
import { MAPBOX_API_TOKEN } from "../../config/keys";

function StagesMap({ user }) {
  const [map, setMap] = useState(null);
  const [numStages, setNumStages] = useState(0);
  const [buffer, setBuffer] = useState(0);
  const [stages, setStages] = useState([]);
  const handleNumChange = (e) => {
    setNumStages(Number(e.target.value));
  };
  const handleBufferChange = (e) => {
    setBuffer(Number(e.target.value));
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
  }, [numStages, user.stage.stageLat, user.stage.stageLon]);

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
  }, [buffer, user.stage.stageLat, user.stage.stageLon]);

  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_API_TOKEN;
    const map = new mapboxgl.Map({
      container: "map",
      style: MAPBOX_STYLESHEET_LOCATION,
      center: MAPBOX_START_CENTER,
      zoom: MAPBOX_START_ZOOM,
    });

    map.loadImage(
      process.env.PUBLIC_URL + "/warehouse-marker.webp",
      (err, image) => {
        if (err) {
          throw err;
        }
        map.addImage("warehouse-marker", image, { pixelRatio: 9 });
        let geoJsonData = {
          type: "FeatureCollection",
          features: stages.map((stage) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [stage.stageLon, stage.stageLat],
            },
            properties: {
              title: stage.stageName,
              address: stage.stageAdd,
              coordinates: `${stage.stageLon},${stage.stageLat}` // workaround for click
            },
          })),
        };
        map.on("load", () => {
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
              "icon-allow-overlap": true,
              "text-allow-overlap": true,
              // get the title name from the source's "title" property
              "text-field": ["get", "title"],
              "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
              "text-offset": [0, 1.25],
              "text-anchor": "top",
            },
          });

          map.on("click", "stages", (e) => {
            console.log(e.features[0]);
            let coordinates = e.features[0].properties.coordinates.split(',').map(str => Number(str));
            let description = `${e.features[0].properties.title}\n${e.features[0].properties.address}`;

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

          setMap(map);
        });
      }
    );

    return () => {
      map.remove();
    };
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
          title: stage.stageName,
          address: stage.stageAdd,
          coordinates: `${stage.stageLon},${stage.stageLat}` // workaround for click
        },
      })),
    };
    if (map) {
      if (map.getSource("stages")) {
        map.getSource("stages").setData(geoJsonData);
      } else {
        map.addSource("stages", {
          type: "geojson",
          data: geoJsonData,
        });
      }
    }

    console.log(geoJsonData);
  }, [map, stages]);

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
            <span className="helper-text" dataerror="wrong" datasuccess="right">
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
            <span className="helper-text" dataerror="wrong" datasuccess="right">
              For example, enter 3 to see the stages within 3km
            </span>
          </div>
        </div>
      </div>
      <div id="map" className="col s12 m10 l9" style={{ height: "80vh" }}></div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps, null)(StagesMap);
