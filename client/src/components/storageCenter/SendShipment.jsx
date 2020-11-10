import React, { useEffect, useState } from 'react'
import axios from "axios";
import M from "materialize-css";

export default function SendShipment() {
  const [recipients, setRecipients] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({});
  useEffect(() => {
    const effect = async () => {
    // get list of recipients, products and then set state
    
    // Dummy data
    let { data: recipientList } = await axios("https://jsonplaceholder.typicode.com/users");
    let { data: productList } = await axios("https://jsonplaceholder.typicode.com/todos");
    setRecipients(() => recipientList.map(recipient => ({name: recipient.name, id: recipient.id}) ));
    setProducts(() => productList.map(product => ({name: product.title, id: product.id }) ));
    
    var selects = document.querySelectorAll('select');
    M.FormSelect.init(selects);
    }
    effect();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    // TODO: formData to be sent to backend api
  }

  const handleChange = (e) => {
    setFormData(prevData => ({
      ...prevData,
      [e.target.name]: e.target.value
    }));
  }

  return (
    <div className="row">
      <h2>Send a shipment</h2>
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
    </div>
  )
}
