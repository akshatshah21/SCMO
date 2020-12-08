import React, { useEffect, useState } from "react";
import axios from "axios";
import M from "materialize-css";
import { connect } from "react-redux";

function SendShipment({ history, stageId }) {
  const [stageList, setStageList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(new Map());
  const [productQuantities, setProductQuantities] = useState({});
  const [recipientId, setRecipientId] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    const selectEffect = async () => {
      // get list of stages, products and then set state
      let { data: stages } = await axios("/api/stage");
      let { data: products } = await axios(`/api/stage/${stageId}/products`);
      setStageList(() =>
        stages.map((stage) => ({
          name: stage.stageName,
          id: stage.stageId,
        }))
      );
      setProductList(products);
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
        // display done and redirect to storage center
        M.toast({ html: "Shipment created" });
        history.push("/storage-center");
      },
    });
    if (instance) instance.open();
  }, [code, history]);

  const handleSubmit = (e) => {
    e.preventDefault();
    let products = [];
    let isValid = true;
    Object.keys(productQuantities).forEach(key => {
      if(productQuantities[key] !== "") {
        if(productQuantities[key] < 1) {
          M.toast({html: `Minimum quantity is 1`});
          isValid = false;
          return;
        } else if(productQuantities[key] > productList.find(product => product.productId === key).quantity) {
          M.toast({html: `Quantity specified exceeds current inventory`});
          isValid = false;
          return;
        } else {
          products.push({
            productId: key,
            quantity: productQuantities[key] 
          });
        }
      }
    })
    if(!isValid) return;
    if(recipientId === "") {
      M.toast({html: "Please select a recipient"});
    }
    if(products.length === 0) {
      M.toast({html: "Please select at least one product"});
      return;
    }
    let formData = {
      recipientId: recipientId,
      senderId: stageId,
      products
    };
    formData.timestamp = new Date().toISOString();
    axios.post("/api/transfer/initiate", formData).then((res) => {
      if(res.data.sourceCode) {
        setCode(res.data.sourceCode);
      } else {
        M.toast({html: "An error occured at the server. Please try again later"})
      }
    });
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
            <select
              onChange={(e) => setRecipientId(e.target.value)}
              defaultValue=""
              name="recipientId"
            >
              <option value="" disabled>
                Choose recipient
              </option>
              {stageList.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </select>
            <label>Send to</label>
          </div>
        </div>

        {productList.map((product) => (
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
                    className="validate"
                    name={product.productId}
                    id="quantity"
                    type="number"
                    min="1" max={product.quantity}
                    value={productQuantities[product.productId]}
                    onChange={handleProductQuantityChange}
                  />
                  <label htmlFor="quantity">Quantity</label>
                </div>
              )}
            </div>
          </div>
        ))}
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
