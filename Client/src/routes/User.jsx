import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

let serverURL = 'http://localhost:3000';

function Entry({itemName, stock, price, imageURL, id, handleAdd, handleRemove}){
  /**
   * Entry component that contains information and controls for a single item
   */

  return (
    <>
      <div className = "container-fluid bg-light border p-2 rounded-3">
        <div className = "row">
          <div className = "col-3">
            <img className = "img-fluid border rounded" src = {imageURL}>
            </img>
          </div>
          <div className = "col">
          </div>
          <div className = "col-8 vstack gap-1">
            <a className = "h5" href = {serverURL + '/items/' + id}>
              {itemName}
            </a>
            <div>
              Stock: {stock}
            </div>
            <div>
              Price: $ {price}
            </div>
            <div className = "d-flex gap-2 pb-2 pt-5">
              <button className = "btn btn-primary" onClick = {() => {handleAdd(id)}}>
                Add to cart
              </button>
              <button className = "btn btn-primary" onClick = {() => {handleRemove(id)}}>
                Remove from cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SideBar({categories, updateDisplayed, updateFilter}){
  /**
   * SideBar component that contains a search bar and a column of filters
   */

  let entries = categories.map((category) => {
    return (
      <tr key = {category}>
        <td className = "container btn btn-light text-start border-top border-bottom" onClick = {updateFilter}> 
          {category} 
        </td>
      </tr>
    );
  });

  return (
    <>
      <div className = "vstack gap-1 sticky-top">
        <div className = "p-0">
          <div className = "form-floating pt-3">
            <input className = "form-control" type = "text" id = "searchBar" placeholder = "DummyText" onChange = {updateDisplayed}>
            </input>
            <label htmlFor = "searchBar">
              Search
            </label>
          </div>
        </div>
        <div>
          <table className = "table">
            <thead>
              <tr>
                <th className = "h4 border-bottom pt-3">
                  Filters
                </th>
              </tr>
            </thead>
            <tbody>
              {entries}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Cart({cart, total, handleCheckout}){
  /**
   * Cart component that shows what items are currently in the cart
   */

  let keys = Object.keys(cart);
  let entries = keys.map((key) => {
    return (
      <div className = "row p-3" key = {key}>
        <div className = "col text-start h5">
          {cart[key][2]}
        </div>
        <div className = "col text-end h5">
          ${cart[key][1]} x {cart[key][0]}
        </div>        
      </div>
    );
  });

  return (
    <>
      <div className = "vstack gap-3 sticky-top">
        <div className = "h2 pt-2 text-center">
          Cart
        </div>
        <div className = "border-top border-bottom">
          {entries}
        </div>
        <div className = "row pt-0">
          <div className = "col h4 p-4">
            Total: 
          </div>
          <div className = "col h5 text-end p-4">
            $ {total}
          </div>
        </div>
        <div className = "border">
          <button className = "container btn btn-dark" onClick = {handleCheckout}>
            Checkout
          </button>
        </div>
      </div>
    </>
  );
}

function App(){
  /*
    Top level component that maintains state for the SideBar, Cart and Entry components
  */

  //state representing overall items and categories
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);

  //state representing the currently selected filter and currently displayed items
  const [filter, setFilter] = useState(undefined);
  const [displayedItems, setDisplayedItems] = useState([]);

  //state representing the shopping cart and total cost
  const [cart, setCart] = useState({});
  const [total, setTotal] = useState(0);

  let entries = displayedItems.map((item) => {
    return (
      <Entry 
        itemName = {item.itemName} 
        stock = {item.stock} 
        price = {item.price} 
        imageURL = {item.imageURL} 
        id = {item.id} 
        key = {item.id} 
        handleAdd = {handleAdd} 
        handleRemove = {handleRemove}
      />
    );
  });

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    updateDisplayed();
  }, [filter, items]);
  
  /**
   * Function that initializes the page by retrieving all starting items and determining all the categories
   */
  async function init(){
    let startingItems = await (await fetch(serverURL + '/items', {
      method: 'GET',
      mode: 'cors'
    })).json();
  
    let startingCategories = ["All"];
  
    for(let item of startingItems){
      if(!startingCategories.includes(item.category)){
        startingCategories.push(item.category);
      }
  
      let options = {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      };
  
      let modURL = serverURL + '/items/' + item.id;
      let imageURL = await (await fetch(modURL, options)).json();
  
      item.imageURL = imageURL;
    }

    setItems(startingItems);
    setCategories(startingCategories);
    setDisplayedItems(startingItems);
  }

  /**
   * Ffunction that updates state for the filter and recalculates the displayed items
   */
  function updateFilter(e){
    let text = String(e.target.innerHTML).trim();

    if(text != "All"){
      setFilter(text);
    }else{
      setFilter(undefined);
    }

    updateDisplayed();
  }

  /**
   * Function that filters the displayed items with regex and the selected filter as well as hiding items with 0 stock
   */
  function updateDisplayed(e){
    let searchInput = document.getElementById("searchBar");
    let searchQ = new RegExp(searchInput.value, 'i');

    let filteredResults = items.filter((item) => {
      return (item.itemName.search(searchQ) != -1 && item.stock > 0);
    });

    if(filter != undefined && filter != "All"){
      filteredResults = filteredResults.filter((item) => {
        return (item.category == filter);
      });
    }

    setDisplayedItems(filteredResults);
  }

  /**
   * Function that deals with adding items to the cart
   */
  function handleAdd(id){
    let keys = Object.keys(cart);
    let temp = undefined;

    for(let item of items){
      if(item.id == id){
        temp = item;
        break;
      }
    }

    //key value pairs in cart are as follows:
    //  item.id: [numberInCart, Price, itemName]
    if(keys.includes(id)){
      if(temp != undefined && cart[id][0] < temp.stock){
        let newCart = structuredClone(cart);
        let newTotal = total + temp.price;

        newCart[id] = [newCart[id][0] + 1, temp.price, temp.itemName]

        setCart(newCart);
        setTotal(newTotal);
      }
    }else{
      let newCart = structuredClone(cart);
      let newTotal = total + temp.price;

      newCart[id] = [1, temp.price, temp.itemName];

      setCart(newCart);
      setTotal(newTotal);
    }
  }

  /**
   * Function that deals with removing items from the cart
   */
  function handleRemove(id){
    let keys = Object.keys(cart);
    let temp = undefined;

    for(let item of items){
      if(item.id == id){
        temp = item;
        break;
      }
    }

    if(keys.includes(id)){
      if(temp != undefined && cart[id][0] > 0){
        let newCart = structuredClone(cart);
        let newTotal = total - temp.price;
        
        if(cart[id][0] - 1 == 0){
          delete newCart[id];
        }else{
          newCart[id] = [newCart[id][0] - 1, temp.price, temp.itemName];
        }

        setCart(newCart);
        setTotal(newTotal);
      }
    }
  }

  /**
   * Function that updates the database and updates the application state
   */
  async function handleCheckout(){
    let options = {
      method: 'PUT',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cart)
    }

    let modURL = serverURL + "/items";
    let results = await (await fetch(modURL, options)).json();
    
    for(let item of results){
      options = {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      };
    
      modURL = serverURL + '/items/' + item.id;
      let imageURL = await (await fetch(modURL, options)).json();
    
      item.imageURL = imageURL;
    }

    setCart({});
    setTotal(0);
    setItems(results);
  }

  return (
    <>
      <div className = "vstack gap-3">
        <div>
          <nav className = "navbar navbar-light bg-primary">
            <div className = "navbar-brand p-3 logo text-warning">
              &#128722; ShopMart
            </div>
            <div className = "d-flex gap-5 p-5">
              <Link className = "links selected">
                Home
              </Link>
              <Link className = "links" to = {'/Admin'}>
                Admin
              </Link>
            </div>
          </nav>
        </div>
        <div>
          <div className = "container-fluid pl-3">
            <div className = "row">
              <div className = "col-3 pl-3">
                <SideBar 
                  categories = {categories} 
                  updateDisplayed = {updateDisplayed} 
                  updateFilter = {updateFilter}
                />
              </div>
              <div className = "col-6 p-0">
               {entries}
              </div>
              <div className = "col p-0">
                <Cart 
                  cart = {cart} 
                  total = {total} 
                  handleCheckout = {handleCheckout}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
