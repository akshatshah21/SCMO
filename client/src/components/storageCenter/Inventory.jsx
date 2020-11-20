import axios from 'axios';
import React, { useEffect, useState } from 'react'
import {connect} from "react-redux";

function Inventory({stageId}) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getProducts = async () => {
      // Get all products for this stage
      let res = await axios.get(`/api/stage/${stageId}/products`); // something like this, also specify stage id
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