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
            <h3 className="indigo-text text-darken-4">
              Follow shipments!
            </h3>
            <h5>
              Track your shipments in real time
            </h5>
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
            <h3 className="indigo-text text-darken-4">
              Manage your inventory
            </h3>
            <h5>
              Effortlessly view your inventory, and manage incoming and outgoing shipments!
            </h5>
          </div>
        </div>
        <div className="row">
          <div className="col s12 l5">
            <img src="3.jpg" alt="" className="responsive-img materialboxed" />
          </div>
          <div className="col s12 l6 offset-l1">
            <h3 className="indigo-text text-darken-4">
              Dashboard for management
            </h3>
            <h5>
              Visualize and optimize your supply chain!
            </h5>
          </div>
        </div>
      </section>
    </>
  );
}
