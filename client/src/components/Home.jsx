import React, { useEffect } from "react";
import M from "materialize-css";

export default function Home() {
  useEffect(() => {
    M.Parallax.init(document.querySelector(".parallax"), {});
  }, []);

  return (
    <>
      <div className="parallax-container">
        <div className="parallax">
          <img src="scm.png" alt="home_doc" className="responsive-img" />
        </div>
      </div>

      <section className="section scrollspy" id="photos">
        <div className="row">
          <div className="col s12 l5">
            <img
              src="map_truck.png"
              alt=""
              className="responsive-img materialboxed"
            />
          </div>
          <div className="col s12 l6 offset-l1">
            <h4 className="indigo-text text-darken-4">
              Never lose your medical records
            </h4>
            <p>
              Store your medical records on this platform, and have them with
              you anytime, anywhere.
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col s12 l6 push-l5 offset-l1">
            <img
              src="1.png"
              alt=""
              className="responsive-img materialboxed"
              style={{ width: "120%" }}
            />
          </div>
          <div className="col s12 l4 pull-l8 offset-l1 right-align">
            <h4 className="indigo-text text-darken-4">
              Heathcare at your fingertips
            </h4>
            <p>
              Consult your doctors within seconds, and they can view your entire
              medical history effortlessly.
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col s12 l5">
            <img src="3.jpg" alt="" className="responsive-img materialboxed" />
          </div>
          <div className="col s12 l6 offset-l1">
            <h4 className="indigo-text text-darken-4">
              Never lose your medical records
            </h4>
            <p>
              Store your medical records on this platform, and have them with
              you anytime, anywhere.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
