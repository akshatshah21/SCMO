import React, { useEffect, useState } from 'react'
import axios from "axios";
import M from "materialize-css";

export default function SendShipment({ history }) {
  const [recipients, setRecipients] = useState([]);
  const [products, setProducts] = useState([]);
  // TODO: Change formData to two state objects: recipient and products [{productId, quantity}]
  const [formData, setFormData] = useState({});
  const [code, setCode] = useState("");

  useEffect(() => {
    const selectEffect = async () => {
      // get list of recipients, products and then set state
      let { data: stages } = await axios("/api/stage");
      let { data: products } = await axios("/api/product");
      setRecipients(() =>
        stages.map((stage) => ({
          name: stage.stageName,
          id: Number(stage.stage_id),
        }))
      );
      setProducts(() =>
        products.map((product) => ({
          name: product.productName,
          id: product.productId,
        }))
      );

      var selects = document.querySelectorAll("select");
      M.FormSelect.init(selects);
    }
    selectEffect();
  }, []);

  useEffect(() => {
    var elems = document.querySelectorAll('.modal');
    console.log(elems);
    var [instance] = M.Modal.init(elems, {
      onCloseEnd: () => {
        // display done and redirect to storage center?
        M.toast({html: 'Shipment created'});
        history.push("/storage-center");
      }
    });
    if(instance) instance.open();
  }, [code, history]);

  const handleSubmit = (e) => {
    e.preventDefault();
    formData.timestamp = new Date().toISOString();
    
    // TODO: formData to be sent to backend api
    // attach senderId
    axios.post("/api/transfer/initiate", formData)
      .then(res => {
        console.log(res.data);
        setCode(res.data);
      });
  }

  const handleChange = (e) => {
    setFormData(prevData => ({
      ...prevData,
      [e.target.name]: e.target.value
    }));
  }

  return (
    <div className="row">
      <h2 className="center-align">Send a shipment</h2>
      <form className="offset-s2 col s8">
      <div className="row">
          <div className="input-field">
            <select onChange={handleChange} defaultValue="" name="recipientId">
              <option value="" disabled selected>Choose recipient</option>
              { recipients.map(recipient => <option key={recipient.id} value={recipient.id}>{recipient.name}</option>) }
            </select>
            <label>Send to</label>
          </div>
        </div>
        <div className="row">
          <div className="input-field">
            <select onChange={handleChange} defaultValue="" name="productId">
              <option value="" disabled selected>Choose product</option>
              { products.map(product => <option key={product.id} value={product.id}>{product.name}</option>) }
            </select>
            <label>Select Product</label>
          </div>
        </div>
        <div className="row">
          <div className="input-field">
            <input type="number" name="quantity" id="quantity" onChange={handleChange} />
            <label htmlFor="quantity">Quantity</label>
          </div>
        </div>
        {/* TODO: Display date and time */}
        <div className="row">
          <button type="submit" className="btn btn-large blue waves-effect waves-light col s8 offset-s2" onClick={handleSubmit}>Create Shipment</button>
        </div>
        
      </form>
      {code !== "" ? <div id="modal1" className="modal">
        <div className="modal-content">
          <h4>Shipment Created</h4>
          <h5>To start the shipment, give this code to the person in charge of moving the products to the destination</h5>
          <h2 className="center-align">{code}</h2>
        </div>
        <div className="modal-footer">
          <a href="#!" className="modal-close waves-effect waves-green btn-flat">Done</a>
        </div>
      </div> : null}
    </div>
  )
}
