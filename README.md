<h3>
    About The Project
</h3>

---
A walmart style grocery story web application that supports all the typical things you would want to do as a customer or manager. For customers this means searching or filtering for items and checking out after adding them to cart. Managers will be able to add new items or modify existing ones all while having a preview of the changes on the side.

### Prerequisites
In order to run a local copy of this web app you will need a MongoDB atlas database and a S3 bucket set up.

## Installation

1. Clone this repository
    ```sh
    git clone https://github.com/Jeffery-Fang/ShopMart.git
    ```

2. Install NPM packages
    ```sh
    npm install
    ```

3. Create a .env filed in the Server folder and add the following
    ```sh
    BUCKET_NAME = 'your bucket name'
    BUCKET_REGION = 'your bucket region'
    ACCESS_KEY = 'your bucket access key'
    SECRET_ACCESS_KEY = 'Your secret access key'

    CONNECTION_URL = 'ConnectionURL to your database'

    ```

4. Now just run the server and go to localhost:3000 to start using the application
    ```sh
    node server.js
    ```

## Gallery & Demonstrations

![Screenshot 2024-05-19 175546](https://github.com/Jeffery-Fang/ShopMart/assets/126544955/04622297-44a2-41de-ad18-812f9cbadf8c)
*User Page*

![Screenshot 2024-05-19 175629](https://github.com/Jeffery-Fang/ShopMart/assets/126544955/341738e4-cea6-4231-81b5-f7097d588db6)
*Admin Page*

![Screenshot 2024-05-19 175646](https://github.com/Jeffery-Fang/ShopMart/assets/126544955/98985900-396e-46c8-832d-a1e57ea159af)
*Product Page*

## Tools & Technologies

- MongoDB Atlas
- Express
- React
- Node
- S3
- Vite
- Jest







