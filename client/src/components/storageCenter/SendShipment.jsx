import React, { useEffect, useState } from "react";
import axios from "axios";
import M from "materialize-css";
import { connect } from "react-redux";

function SendShipment({ history, stageId }) {
  const [recipients, setRecipients] = useState([]);
  const [products, setProducts] = useState([]);
  // TODO: Change formData to two state objects: recipient and products [{productId, quantity}]
  const [formData, setFormData] = useState({});
  const [code, setCode] = useState("");
  const [selectedProducts, setSelectedProducts] = useState(new Map());
  const [productQuantities, setProductQuantities] = useState({});
  /* 
    productQuantities = {
      productId: quantity
    }
  */

  useEffect(() => {
    const selectEffect = async () => {
      // get list of recipients, products and then set state
      let { data: stages } = await axios("/api/stage");
      let { data: products } = await axios(`/api/stage/${stageId}/products`);
      setRecipients(() =>
        stages.map((stage) => ({
          name: stage.stageName,
          id: stage.stageId,
        }))
      );
      setProducts(products);
      setProductQuantities(() => {
        let productQuantities = {};
        products.forEach((product) => {
          productQuantities[product.productId] = "";
        });
        return productQuantities;
      });
      setSelectedProducts((prevMap) => {
        products.forEach((product) => prevMap.set(product.productId, false));
        return prevMap;
      });

      var selects = document.querySelectorAll("select");
      M.FormSelect.init(selects);
    };
    selectEffect();
  }, [stageId]);

  useEffect(() => {
    var elems = document.querySelectorAll(".modal");
    var [instance] = M.Modal.init(elems, {
      onCloseEnd: () => {
        // display done and redirect to storage center?
        M.toast({ html: "Shipment created" });
        history.push("/storage-center");
      },
    });
    if (instance) instance.open();
  }, [code, history]);

  const handleSubmit = (e) => {
    e.preventDefault();
    formData.timestamp = new Date().toISOString();

    // TODO: formData to be sent to backend api
    // attach senderId
    axios.post("/api/transfer/initiate", formData).then((res) => {
      setCode(res.data);
    });
  };

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectedProductsChange = (e) => {
    const productId = e.target.name;
    const isChecked = e.target.checked;
    setSelectedProducts(
      (prevMap) => new Map(prevMap.set(productId, isChecked))
    );
  };

  const handleProductQuantityChange = (e) => {
    const productId = e.target.name;
    setProductQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: e.target.value,
    }));
  };

  return (
    <div className="row">
      <h2 className="center-align">Send a shipment</h2>
      <form className="offset-s2 col s8">
        <div className="row">
          <div className="input-field">
            <select onChange={handleChange} defaultValue="" name="recipientId">
              <option value="" disabled>
                Choose recipient
              </option>
              {recipients.map((recipient) => (
                <option key={recipient.id} value={recipient.id}>
                  {recipient.name}
                </option>
              ))}
            </select>
            <label>Send to</label>
          </div>
        </div>

        {products.map((product) => (
          <div key={product.productId} className="row">
            <div className="col s12">
              <label>
                <input
                  name={product.productId}
                  type="checkbox"
                  className="filled-in"
                  onChange={handleSelectedProductsChange}
                  checked={selectedProducts.get(product.productId)}
                />
                <span>{product.productName}</span>
              </label>
              {selectedProducts.get(product.productId) && (
                <div className="input-field inline">
                  <input
                    name={product.productId}
                    id="quantity"
                    type="number"
                    value={productQuantities[product.productId]}
                    onChange={handleProductQuantityChange}
                  />
                  <label htmlFor="quantity">Quantity</label>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* TODO: Display date and time */}
        <div className="row">
          <button
            type="submit"
            className="btn btn-large blue waves-effect waves-light col s8 offset-s2"
            onClick={handleSubmit}
          >
            Create Shipment
          </button>
        </div>
      </form>
      {code !== "" ? (
        <div id="modal1" className="modal">
          <div className="modal-content">
            <h4>Shipment Created</h4>
            <h5>
              To start the shipment, give this code to the person in charge of
              moving the products to the destination
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
  stageId: state.auth.user.stageId,
});

export default connect(mapStateToProps, null)(SendShipment);
