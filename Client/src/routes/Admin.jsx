import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../App.css'

let serverURL = 'http://localhost:3000'

function ItemForm({handleFormChange, handleSubmit, handleClear}){
  /**
   * Form component that allows the user to add new items or edit existing ones
   */

  return (
    <>
      <div className = "p-5 border rounded">
        <div className = "h1 d-flex justify-content-center">
          Add New Item
        </div>
        <form>
          <div className = "p-1">
            <label htmlFor = "formItemName">
              Item Name
            </label>
            <input className = "form-control" type = "text" id = "formItemName" onChange = {handleFormChange}>
            </input>
          </div>
          <div className = "p-1">
            <label htmlFor = "formDescription">
              Description
            </label>
            <textarea className = "form-control" id = "formDescription" onChange = {handleFormChange} rows = "5">
            </textarea>
          </div>
          <div className = "row p-1">
            <div className = "col">
              <label htmlFor = "formStock">
                Stock
              </label>
              <input className = "form-control" type = "text" id = "formStock" onChange = {handleFormChange}>
              </input>
            </div>
            <div className = "col">
              <label htmlFor = "formPrice">
                Price
              </label>
              <input className = "form-control" type = "text" id = "formPrice" onChange = {handleFormChange}>
              </input>
            </div>
            <div className = "col">
              <label htmlFor = "formCategory">
                Category
              </label>
              <input className = "form-control" type = "text" id = "formCategory" onChange = {handleFormChange}>
              </input>
            </div>
          </div>
          <div className = "input-group p-1">
            <span className = "input-group-text">
              ID:
            </span>
            <input className = "form-control" type = "text" id = "formID" disabled = {true}>
            </input>
          </div>
          <div className = "p-1">
            <input className = "form-control" type = "file" id = "formFile" onChange = {handleFormChange} name = 'file' accept = "image/*">
            </input>
            <div className = "pt-3 d-flex gap-2">
              <button className = "btn btn-primary col-2" onClick = {handleSubmit}> 
                Add 
              </button>
              <button className = "btn btn-primary col-2" onClick = {handleClear}> 
                Clear 
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

function ItemList({items, handleSelect, handleSearch, handleEdit, handleDelete}){
  /**
   * List component that displays existing items and allows the user to search through them with regex
   */

  let entries = items.map((item) => {
    return (
      <option value = {item.id} key = {item.id}>
        {item.itemName}
      </option>
    );
  });

  return (
    <>
      <div className = "p-5 border rounded">
        <div className = "h1 d-flex justify-content-center">
          Current Items
        </div>
        <div className = "d-flex justify-content-center form-floating mb-3">
          <input className = "form-control" type = "text" onChange = {handleSearch} id = "searchBar" placeholder = "placeholder">
          </input>
          <label htmlFor = "searchBar">
            Search
          </label>
        </div>
        <select className = "form-control" size = "8" onChange = {handleSelect}>
          {entries}
        </select>
        <div className = "pt-3 d-flex gap-2">
          <button className = "btn btn-primary col-2" onClick = {handleEdit}>
            Edit
          </button>
          <button className = "btn btn-primary col-2" onClick = {handleDelete}>
            Delete
          </button>
        </div>
      </div>
    </>
  );
}

function PreviewPage({itemName, description, stock, price, imageURL}){
  /**
   * Preview component that shows the user what the product page would look like with the current form information
   */

  return (
    <>
      <div className = "border rounded">
        <div className = "v-stack gap-1">
          <nav className = "navbar navbar-light bg-primary">
            <div className = "navbar-brand p-3 miniLogo text-warning">
              &#128722; ShopMart
            </div>
            <div className = "d-flex gap-4 p-3">
              <a className = "miniLinks ">
                Home
              </a>
              <a className = "miniLinks">
                Admin
              </a>
            </div>
          </nav>
          <div className = "container-fluid p-3">
            <div className = "row">
              <div className = "col">
                <img className = "img-fluid border" src = {imageURL} alt = "No Image Selected">
                </img>
              </div>
              <div className = "col border bg-light rounded">
                <div className = "miniItemName">
                  {itemName}
                </div>
                <div className = "miniDescription">
                  {description}
                </div>
                <div className = "row pt-2 gap-2 d-flex">
                  <div className = "miniPrice col-2">
                    Price: $ {price}
                  </div>
                  <div className = "miniStock col-2">
                    Stock: {stock}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> 
      </div>
    </>
  );
}

function App(){
  /**
   * Top level component that manages the state of the form, list and preview component and also makes any API 
   * calls required to add, remove or edit items
   */

  //state related to the form and preview components
  const [formItemName, setFormItemName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formStock, setFormStock] = useState(0);
  const [formPrice, setFormPrice] = useState(0);
  const [formFile, setFormFile] = useState(undefined);
  const [formCategory, setFormCategory] = useState(undefined);
  const [formID, setFormID] = useState(undefined);

  //state related to the list component
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(undefined);
  const [searchedItems, setSearchedItems] = useState([]);

  //additional state related to the preview component
  const [previewImage, setPreviewImage] = useState(undefined);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [items]);

  /**
   * Function that initializes the page by settings the starting items
   */
  async function init(){
    let startingItems = await (await fetch(serverURL + '/items', {
      method: 'GET',
      mode: 'cors'
    })).json();

    setItems(startingItems);
    setSearchedItems(startingItems);
  }

  /**
   * Function that clears the fields of the form component and resets associated state 
   */
  function clearForm(e){
    if(e){
      e.preventDefault();
    }

    let itemNameTextBox = document.getElementById("formItemName");
    let itemDescription = document.getElementById("formDescription");
    let itemStock = document.getElementById("formStock");
    let itemPrice = document.getElementById("formPrice");
    let itemCategory = document.getElementById("formCategory");
    let itemFile = document.getElementById("formFile");
    let itemID = document.getElementById("formID");

    itemNameTextBox.value = "";
    itemDescription.value = "";
    itemStock.value = "";
    itemPrice.value = "";
    itemCategory.value = "";
    itemID.value = "";

    setFormItemName("");
    setFormDescription("");
    setFormStock(0);
    setFormPrice(0);
    setFormCategory(undefined);
    setFormFile(undefined);
    setFormID(undefined);
    setPreviewImage(undefined);
  }

  /**
   * Function that updates state based on what part of the form has changed
   */
  function handleFormChange(e){
    let source = e.target.id;

    if(source == "formItemName"){
      setFormItemName(e.target.value);

    }else if(source == "formDescription"){
      setFormDescription(e.target.value);

    }else if(source == "formStock"){
      setFormStock(Number(e.target.value));

    }else if(source == "formPrice"){
      setFormPrice(Number(e.target.value));

    }else if(source == "formCategory"){
      setFormCategory(e.target.value);

    }else if(source == "formFile"){
      if(e.target.files != undefined && e.target.files.length){
        setFormFile(e.target.files[0]);

        let fr = new FileReader();

        fr.onload = () => {
          setPreviewImage(fr.result);
        };

        fr.readAsDataURL(e.target.files[0]);
      }
    }
  }

  /**
   * Function that either adds a new item or edits an existing one based on whether an ID is present or not
   */
  async function handleSubmit(e){
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("itemName", formItemName);
    formData.append("description", formDescription);
    formData.append("stock", formStock);
    formData.append("price", formPrice);
    formData.append("category", formCategory);
    formData.append("file", formFile);

    if(formID == undefined){
      let options = {
        method: 'POST',
        mode: 'cors',
        body: formData
      };
      
      let modURL = serverURL + '/items';
      let results = await (await fetch(modURL, options)).json();

      setItems(results);
    }else{
      formData.append("id", formID);

      let options = {
        method: 'PUT',
        mode: 'cors',
        body: formData
      }
      
      let modURL = serverURL + '/items/' + formID;
      let results = await (await fetch(modURL, options)).json();

      setItems(results);
    }
    
    clearForm();
  }

  /**
   * Function that updates state for the list component
   */
  function handleSelect(e){
    setSelected(e.target.value);
  }

  /**
   * Function that searches the existing items with regex
   */
  function handleSearch(){
    let searchInput = document.getElementById("searchBar");
    let searchQ = new RegExp(searchInput.value, 'i');

    let filteredResults = items.filter((item) => {
      return (item.itemName.search(searchQ) != -1);
    });

    setSearchedItems(filteredResults);
  }

  /**
   * Function that populates the form with information from the currently selected item
   */
  async function handleEdit(e){
    let item = items.filter((item) =>{
      return (item.id == selected);
    })[0];

    let itemNameTextBox = document.getElementById("formItemName");
    let itemDescription = document.getElementById("formDescription");
    let itemStock = document.getElementById("formStock");
    let itemPrice = document.getElementById("formPrice");
    let itemCategory = document.getElementById("formCategory");
    let itemFile = document.getElementById("formFiled");
    let itemID = document.getElementById("formID");

    itemNameTextBox.value = item.itemName;
    itemDescription.value = item.description;
    itemStock.value = item.stock;
    itemPrice.value = item.price;
    itemCategory.value = item.category;
    itemID.value = item.id;

    setFormItemName(item.itemName);
    setFormDescription(item.description);
    setFormStock(item.stock);
    setFormPrice(item.price);
    setFormCategory(item.category);
    setFormID(item.id);

    let options = {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    let modURL = serverURL + '/items/' + item.id;
    let imageURL = await (await fetch(modURL, options)).json();
    
    setPreviewImage(imageURL)
  }

  /**
   * Function that deletes the selected item
   */
  async function handleDelete(e){
    let options = {
      method: 'DELETE',
      mode: 'cors'
    }

    let modURL = serverURL + "/items/" + selected;
    let results = await (await fetch(modURL , options)).json();

    setItems(results);
  }

  return (
    <>
      <div className = "vstack gap-1">
        <div>
          <nav className = "navbar navbar-light bg-primary">
            <div className = "navbar-brand p-3 logo text-warning">
              &#128722; ShopMart
            </div>
            <div className = "d-flex gap-5 p-5">
              <Link className = "links" to = {'/'}>
                Home
              </Link>
              <Link className = "links selected">
                Admin
              </Link>
            </div>
          </nav>
        </div>
        <div>
          <div className = "container-fluid p-3">
            <div className = "row">
              <div className = "col p-2">
                <ItemForm 
                  handleFormChange = {handleFormChange} 
                  handleSubmit = {handleSubmit} 
                  handleClear = {clearForm}
                />
              </div>
              <div className = "col p-2">
                <ItemList className = "col" 
                  items = {searchedItems} 
                  handleSelect = {handleSelect} 
                  handleSearch = {handleSearch} 
                  handleEdit = {handleEdit} 
                  handleDelete = {handleDelete}
                />
              </div>
              <div className = "col p-2">
                <PreviewPage 
                  className = "col" 
                  itemName = {formItemName} 
                  description = {formDescription} 
                  stock = {formStock} 
                  price = {formPrice} 
                  imageURL = {previewImage}
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
