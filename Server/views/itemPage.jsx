var React = require('react');

function itemPage({itemName, description, stock, price, imageURL}){

    return (
        <>
          <div className = "vstack gap-1">
            <div>
                <nav className = "navbar navbar-light bg-primary d-flex">
                    <div className = "navbar-brand p-3 logo text-warning">
                        &#128722; ShopMart
                    </div>
                    <div className = "d-flex gap-5 p-5">
                        <a className = "links">
                            Home
                        </a>
                        <a className = "links">
                            Admin
                        </a>
                    </div>
                </nav>
            </div>
            <div>
                <div className = "container-fluid p-5">
                   <div className = "container-fluid row p-0">
                        <div className = "col-4 p-0 border">
                            <img className = "img-fluid" src = {imageURL} alt = "No Image Provided">
                            </img>
                        </div>
                        <div className = "col-1"> 
                        </div>
                        <div className = "col-7 border bg-light rounded p-3">
                            <div className = "itemName">
                                {itemName}
                            </div>
                            <div className = "pt-3 description">
                                {description}
                            </div>
                            <div className = "container-fluid row pt-5 d-flex">
                                <div className = "price col-2 p-0">
                                    <div className = "container">
                                        Price:
                                    </div>
                                    <div className = "container text-start">
                                        $ {price}
                                    </div>
                                </div>
                                <div className = "stock col-2 p-0">
                                    <div className = "container">
                                        Stock:
                                    </div>
                                    <div className = "container text-start">
                                        {stock}
                                    </div>
                                </div>
                            </div>
                        </div>
                   </div>
                </div>
            </div>
      </div>

      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossOrigin="anonymous"/>
      <link rel = "stylesheet" href = "/css/itemPage.css"/>
    </>
    );
}

module.exports = itemPage;