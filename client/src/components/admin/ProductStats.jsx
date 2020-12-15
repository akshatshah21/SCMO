import React, { useState, useEffect } from "react";
import axios from "axios";
import M from "materialize-css";

import { API_URL } from "../../config/options";

export default function ProductStats() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        let { data } = await axios.get(API_URL + "/api/product");
        let products = [];
        data.forEach(async (product) => {
          let { data: mostQuantityStages } = await axios.post(
            API_URL + "/api/stage/stagesHavingMostQuantity",
            { productId: product.productId }
          );
          product.mostQuantityStages = mostQuantityStages;
          // console.log(product.productName);
          // console.log(product.mostQuantityStages);
          products.push(product);
        });

        setProducts(products);
      } catch (error) {
        console.log(error);
        M.toast({ html: "Error occured while fetching products" });
      }
    };
    getProducts();
  }, []);

  return (
    <div className="container">
      <div className="row">
        <div className="col s8 offset-s3 row">
          {products.map((product) => (
            <div
              key={product.productId}
              className="card blue-grey darken-1 col s12"
              style={{ marginRight: "10%" }}
            >
              <div className="card-content white-text">
                <span className="card-title">{product.productName}</span>
                <p>MRP: {product.mrp}</p>
                {product.mostQuantityStages && (
                  <p>
                    Stage having most quantity:{" "}
                    <strong>{product.mostQuantityStages[0].stageName}</strong>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
