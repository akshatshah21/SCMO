import axios from 'axios';
import React, { useEffect, useState } from 'react'
import {connect} from "react-redux";

import { API_URL } from "../../config/options";

function Inventory({stageId}) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getProducts = async () => {
      // Get all products for this stage
      let res = await axios.get(API_URL + `/api/stage/${stageId}/products`);
      setProducts(
        res.data.map((product) => ({
          id: product.productId,
          name: product.productName,
          quantity: product.quantity,
        }))
      );
    };
    getProducts();
  }, [stageId]);

  return (
    <div>
      <h2 className="center-align">Inventory</h2>
      <div className="row">
      { products.map(product => (
        <div key={product.id} className="card-panel col s3">
          <h5 className="center-align">{product.name}</h5>
          <p className="center-align">{product.quantity}</p>
        </div>
      )) }
      </div>
    </div>
  )
}

const mapStateToProps = state => ({
  stageId: state.auth.user.stageId
});

export default connect(mapStateToProps, null) (Inventory);