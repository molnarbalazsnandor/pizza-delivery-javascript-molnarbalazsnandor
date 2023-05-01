const rootElement = document.querySelector("#root");
rootElement.insertAdjacentHTML(
  "beforeend",
  `
  <div class="main-pizza-container">
    <div class="logo">
        <h1>DON CODELERONE</h1>
    </div>
  </div>
    <div class="cart-container">
        <button id="edit-mode">Edit mode</button>
        <button id="order-editor">Order editor</button>
        <div class="order-edit-container away-position">
        <button class="status-open">Filter status: Open</button>
        <button class="status-closed">Filter status: Closed</button>
        <button class="status-off">Status filter off</button>
        <div class="orders-container"></div>
        </div>
        <div class="cart away-position">
        <form id="form">
        <input type="text" name="name" placeholder="Név" >
        <input type="number" name="zipcode" placeholder="Irányítószám" >
        <input type="text" name="city" placeholder="Város" >
        <input type="text" name="street" placeholder="Utca" > 
        <input type="text" name="house-number" placeholder="Házszám" >
        <input type="text" name="number" placeholder="Telefonszám" >
        <input type="text" name="email" placeholder="E-mail cím" >


        <button id="order">Megrendelem</button>
        <div class="thank-you hidden"></div>
        </form>
        <p class="total-price"></p>
        </div>
    </div>

    `
);
const cartContainer = document.querySelector(".cart-container");
const orderEditContainer = document.querySelector(".order-edit-container");
const ordersContainer = document.querySelector(".orders-container");
const cart = document.querySelector(".cart");
const orderEditorButton = document.querySelector("#order-editor");
const pizzaContainer = document.querySelector(".main-pizza-container");
let orderArray = [];

const pizzaComponent = (id, name, price, ingredients, image) =>
  `<div class="pizza ${id} pizza-container">
    <div class="img-container">
        <img src="${image}">
    </div>

    <div class="pizza-box">
        <h2 class="${id} pizza-name">${name}</h2>
        <h3 class="pizza-price ${name}">${price} Ft</h3>
        <p class="pizza-ingredients">${ingredients}</p>
        <input type="number" class="number-input ${name}" />
        <button class="add-pizza-button ${name}">Kosárba</button>
        </div>
</div>
`;

const fetchPizzas = async () => {
  return fetch("/pizza")
    .then((res) => res.json())
    .then((pizzas) => pizzas);
};

async function loadEvent() {
  setTimeout(() => {
    document.body.style.backgroundImage =
      "url(https://scontent-vie1-1.xx.fbcdn.net/v/t39.30808-6/293988667_5263689750382741_4134938323243311915_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=09cbfe&_nc_ohc=vQ3dxqAFb-QAX9zco6y&_nc_ht=scontent-vie1-1.xx&oh=00_AfBH2R6jWJhSgcZEwo6bZu5iOXveSMawkeVw2qDyBilAFA&oe=638561B9)";
  }, 24000);
  setTimeout(() => {
    document.body.style.backgroundImage =
      "url(https://github.com/gyulaidavid/img_folder/blob/main/serjan-midili--9LB0GKPF0o-unsplash.jpg?raw=true)";
  }, 27000);
  const pizzas = await fetchPizzas();
  // console.log(pizzas);

  pizzas.forEach((pizza) => {
    if (pizza.isAvailable)
      pizzaContainer.insertAdjacentHTML(
        "beforeend",
        pizzaComponent(
          pizza.id,
          pizza.name,
          pizza.price,
          pizza.ingredients,
          pizza.image
        )
      );
  });

  const inputs = document.querySelectorAll(".number-input");
  const orderButtons = document.querySelectorAll(".add-pizza-button");
  const prices = document.querySelectorAll(".pizza-price");
  const thankYou = document.querySelector(".thank-you");
  const totalPriceElement = document.querySelector(".total-price");
  const editModeButton = document.querySelector("#edit-mode");

  const pizzaNames = document.querySelectorAll(".pizza-name");

  let totalPrice = 0;

  //Edit MODE
  editModeButton.addEventListener("click", (event) => {
    let adminModeData =
      `<form id="adminModeContainer">` +
      pizzas
        .map((pizzaElement, index) => {
          return `
            <div class="adminModePizzaCard">
                <button type="button" class="removePizza"><h2>x</h2></button> 
                <label class="adminLabelName">Name:</label>
                <input class="adminModeName" type="text" name="adminModeName" value="${
                  pizzaElement.name
                }">
                <img src="${pizzaElement.image}" name="adminModeImage">
                <input type="file" name="pizza${index + 1}">
                <label class="adminLabelName">Ingredients:</label>
                <textarea>${pizzaElement.ingredients}</textarea>
                <label class="price" for="price-input">Price: </label>
                <input type="number" class="price-input" name="price-input" value="${
                  pizzaElement.price
                }" />
                <div class="adminModeDisable">
                    <label class="adminAvailable">Available?</label>
                    <input type="checkbox" name="available" ${
                      pizzaElement.isAvailable ? "checked" : ""
                    }>
                </div>
            </div>
        `;
        })
        .join("") +
      `
            <div class="newPizza">
                <p>Add new pizza</p>
                <button id="newPizzaButton" class="adminModeBigPlus">+</button>
            </div>
            <div class="adminModeSavePizza">
            <p>Save changes</p>
            <button id="adminModeSaveButton">Update menu</button>
            </div>
        </form>`;

    rootElement.innerHTML = adminModeData;

    const adminModePizzaCardList = document.querySelectorAll(
      "div.adminModePizzaCard"
    );
    adminModePizzaCardList.forEach((pizzaCard) => {
      pizzaCard
        .querySelector(".removePizza")
        .addEventListener("click", (event) => {
          console.dir(
            event.target.parentElement.parentElement.querySelector(
              'input[type="file"]'
            ).name
          );
          fetch("/delete", {
            method: "DELETE",
            headers: {
              "Content-type": "application/json",
            },
            body: JSON.stringify({
              name: event.target.parentElement.parentElement.querySelector(
                'input[type="file"]'
              ).name,
            }),
          }).then(async (data) => {
            if (data.status === 200) {
              const res = await data.json();
              console.log(res.response);
            }
          });

          pizzaCard.remove();
        });
    });

    document
      .getElementById("newPizzaButton")
      .addEventListener("click", (event) => {
        event.preventDefault();
        const newPizzaCardElement = document.querySelector("div.newPizza");
        newPizzaCardElement.innerHTML = `
            <label class="adminLabelName">Name:</label>
            <input class="adminModeName" type="text" name="adminModeName" value="">Price:
            <input type="number" class="priceInput" name="price-input" /> 
            <input type="file" name="pizza${
              document.querySelectorAll("div.adminModePizzaCard").length + 1
            }" id="pictureUpload" />
            <label class="adminLabelName">Ingredients:</label>
            <textarea></textarea>
            <div class="adminModeDisable">
                <label class="adminAvailable">Available?</label>
                <input type="checkbox" name="available">
            </div>
        `;
        newPizzaCardElement.classList.add("adminModePizzaCard");
      });
    const adminImageFormData = new FormData();
    const adminModeContainer = document.getElementById("adminModeContainer");
    adminModeContainer.addEventListener("submit", (event) => {
      event.preventDefault();
      const adminModePizzaList = document.querySelectorAll(
        ".adminModePizzaCard"
      );

      const adminModePizzaListData = [];
      let index = 1;

      adminModePizzaList.forEach((element) => {
        adminModePizzaListData.push({
          id: index,
          name: element.querySelector('input[name="adminModeName"]').value,
          price: parseInt(
            element.querySelector('input[name="price-input"]').value
          ),
          ingredients: element.querySelector("textarea").value.split(", "),
          image: "/images/pizza" + index + ".png",
          isAvailable: element.querySelector('input[type="checkbox"]').checked
            ? true
            : false,
        });
        index++;

        if (element.querySelector('input[type="file"]').files.length != 0) {
          adminImageFormData.append(
            element.querySelector('input[type="file"]').name,
            element.querySelector('input[type="file"]').files[0],
            element.querySelector('input[type="file"]').name
          );
        }
      });
      console.dir(adminImageFormData);

      fetch("/adminMode/image/", {
        method: "POST",
        body: adminImageFormData,
      })
        .then((res) => res.json())
        .then(async (data) => {
          if (data.status === 200) {
            const res = await data.json();
            console.log(res.response);
          }
        })

        .catch((err) => {
          console.log(err);
        });

      const fetchSettings = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adminModePizzaListData),
      };

      fetch("/adminMode/", fetchSettings)
        .then(async (data) => {
          if (data.status === 200) {
            const res = await data.json();
            console.log(res.response);
          }
        })

        .then(setTimeout((_) => pizzaSpinner(), 200))
        .then(setTimeout((_) => window.location.reload(), 2200))
        .catch((err) => {
          console.log(err);
        });
    });
  });

  orderviewButtonElement = document.getElementById("orderView");

  //EDIT MODE VÉGE

  //Order buttons
  orderButtons.forEach((orderButton) => {
    orderButton.addEventListener("click", (e) => {
      cart.classList.remove("away-position");
      orderEditContainer.classList.add("away-position");
      for (let i = 0; i < inputs.length; i++) {
        if (
          inputs[i].value > 0 &&
          e.target.classList[1] === inputs[i].classList[1]
        ) {
          cart.insertAdjacentHTML(
            "beforeend",
            `<p class="pizzaItem">${e.target.classList[1]} - ${inputs[i].value}</p>
                        `
          );
          for (let j = 0; j < prices.length; j++) {
            if (prices[j].classList[1] === e.target.classList[1]) {
              totalPrice += parseInt(prices[j].textContent) * inputs[i].value;
              totalPriceElement.innerHTML =
                "Összesen: " +
                totalPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") +
                " HUF";
              orderArray.push({
                price: parseInt(prices[j].textContent),
                total_price: parseInt(prices[j].textContent) * inputs[i].value,
                pizzaName: e.target.classList[1],
                amount: inputs[i].value,
              });
            }
          }
          console.log(orderArray);
        }
      }
    });
  });

  //Form
  const formElement = document.getElementById("form");
  formElement.addEventListener("submit", (event) => {
    event.preventDefault();
    const finalPrices = document.querySelectorAll(".pizzaItem");
    thankYou.classList.toggle("hidden");
    thankYou.insertAdjacentHTML(
      "beforeend",
      `
        <div class="spinner">
        <img src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/kr7ormd6xl1ymkb501sv.png" class="pizza-part pizza-part-1" />
        <img src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/kr7ormd6xl1ymkb501sv.png" class="pizza-part pizza-part-2" />
        <img src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/kr7ormd6xl1ymkb501sv.png" class="pizza-part pizza-part-3" />
        <img src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/kr7ormd6xl1ymkb501sv.png" class="pizza-part pizza-part-4" />
        </div>
        <span>Köszönjük Rendelésed!</span>
            `
    );
    finalPrices.forEach((e) => {
      e.classList.add("hidden");
    });
    const today = new Date();
    const todayDate =
      today.getFullYear() +
      " " +
      (today.getMonth() + 1) +
      " " +
      today.getDate() +
      "-" +
      today.getHours() +
      ":" +
      today.getMinutes();
    let string = "";
    // const formData = new FormData(formElement);
    for (let order of orderArray) {
      if (orderArray.length > 0) {
        string += order.amount + "-" + order.pizzaName + " & ";
      }
    }

    const currentTime = new Date();
    const timeId = currentTime.getMinutes() + currentTime.getUTCSeconds();
    const data = {
      customerName: event.target.querySelector(`input[name="name"]`).value,
      zipCode: event.target.querySelector(`input[name="zipcode"]`).value,
      city: event.target.querySelector(`input[name="city"]`).value,
      street: event.target.querySelector(`input[name="street"]`).value,
      number: event.target.querySelector(`input[name="number"]`).value,
      "house-number": event.target.querySelector(`input[name="house-number"]`)
        .value,
      email: event.target.querySelector(`input[name="email"]`).value,
      pizza: string.slice(0, -3),
      time: todayDate,
      status: "open",
      id: `${timeId}`,
    };

    console.log(data);

    fetch("/", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    }).then(async (data) => {
      const res = await data.json();
      console.log(res.response);
    });
    setTimeout(() => {
      location.reload();
    }, 3000);
  });

  //Order editor
  let fetchedOrders = "";
  let fetchedOpenOrders = "";
  let fetchedClosedOrders = "";
  await fetch("/orders")
    .then((res) => res.json())
    .then((data) => {
      fetchedOrders = data;
    });

  async function fetchAllOrders() {
    await fetch("/orders")
      .then((res) => res.json())
      .then((data) => {
        fetchedOrders = data;
      });
    return fetchedOrders;
  }

  async function fetchOpenOrders() {
    await fetch("/status/open")
      .then((res) => res.json())
      .then((data) => {
        fetchedOpenOrders = data;
      });
    return fetchedOpenOrders;
  }

  async function fetchClosedOrders() {
    fetchedOrders = "";
    await fetch("/status/closed")
      .then((res) => res.json())
      .then((data) => {
        fetchedClosedOrders = data;
      });
    return fetchedClosedOrders;
  }

  function makeOrderComponent() {
    fetchedOrders.map((order, i) => {
      ordersContainer.insertAdjacentHTML(
        "beforeend",
        `
            <div class="order-${order.id} order-card">
            <h1 class="order-nr-${order.id}">Order number ${order.id}</h1>
            <h2 class="order-name">Customer's name: ${order.customerName}</h2>
            <h2>Zip Code: ${order.zipCode}</h2>
            <h2>City: ${order.city}</h2>
            <h3>Street: ${order.street}</h3>
            <h3>House Number: ${order.house_number}</h3>
            <h4>Phone number: ${order.number}</h4>
            <h4>E-mail address: ${order.email}</h4>
            <h4>Order time: ${order.time}</h4>
            <h2>Ordered pizzas: ${order.pizza}</h2>
            <h2 class="status-text-${i + 1}">Status: ${order.status}</h2>
            <button class="status-change ${order.status} id=${
          order.id
        }">Change status</button>
        </div>
          `
      );
    });
  }

  makeOrderComponent();

  const openStatusBtn = document.querySelector(".status-open");
  const closedStatusBtn = document.querySelector(".status-closed");
  const offStatusBtn = document.querySelector(".status-off");

  //    fetch('/status/open')
  //    .then((res) => res.json())
  //    .then((opened) => {})
  openStatusBtn.addEventListener("click", (e) => {
    ordersContainer.innerHTML = "";
    fetchedOrders.map((order, i) => {
      if (order.status === "open") {
        ordersContainer.insertAdjacentHTML(
          "beforeend",
          `
          <div class="order-${order.id} order-card order-card-green">
                <h1 class="order-nr-${order.id}">Order number ${order.id}</h1>
                <h2 class="order-name">Customer's name: ${
                  order.customerName
                }</h2>
                <h2>Zip Code: ${order.zipCode}</h2>
                <h2>City: ${order.city}</h2>
                <h3>Street: ${order.street}</h3>
                <h3>House Number: ${order.house_number}</h3>
                <h4>Phone number: ${order.number}</h4>
                <h4>E-mail address: ${order.email}</h4>
                <h4>Order time: ${order.time}</h4>
                <h2>Ordered pizzas: ${order.pizza}</h2>
                <h2 class="status-text-${i + 1}">Status: ${order.status}</h2>
            </div>
                `
        );
      }
    });
  });

  closedStatusBtn.addEventListener("click", (e) => {
    ordersContainer.innerHTML = "";
    fetchedOrders.map((order, i) => {
      if (order.status === "closed") {
        ordersContainer.insertAdjacentHTML(
          "beforeend",
          `
          <div class="order-${order.id} order-card order-card-red">
                <h1 class="order-nr-${order.id}">Order number ${order.id}</h1>
                <h2 class="order-name">Customer's name: ${
                  order.customerName
                }</h2>
                <h2>Zip Code: ${order.zipCode}</h2>
                <h2>City: ${order.city}</h2>
                <h3>Street: ${order.street}</h3>
                <h3>House Number: ${order.house_number}</h3>
                <h4>Phone number: ${order.number}</h4>
                <h4>E-mail address: ${order.email}</h4>
                <h4>Order time: ${order.time}</h4>
                <h2>Ordered pizzas: ${order.pizza}</h2>
                <h2 class="status-text-${i + 1}">Status: ${order.status}</h2>
            </div>
                `
        );
      }
    });
  });
  function letStatusButton() {
    let statusChangeButton = document.querySelectorAll(".status-change");
    statusChangeButton.forEach((button, i) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        if (
          document.querySelector(`.status-text-${i + 1}`).textContent ===
          "Status: closed"
        ) {
          fetchedOrders[i].status = "open";
          document.querySelector(`.status-text-${i + 1}`).textContent =
            "Status: open";
          button.textContent = "Open";
          button.style.backgroundColor = "green";
        } else if (
          document.querySelector(`.status-text-${i + 1}`).textContent ===
          "Status: open"
        ) {
          fetchedOrders[i].status = "closed";
          document.querySelector(`.status-text-${i + 1}`).textContent =
            "Status: closed";
          button.textContent = "Closed";
          button.style.backgroundColor = "red";
        }
        /*       console.log(fetchedOrders);
    
          console.log(e.target); */

        let data = { status: fetchedOrders[i].status };

        const orderId = fetchedOrders[i].id;
        fetch(`/order/${orderId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then((res) => res.json())
          .then((resJson) => console.log(resJson));
      });
    });
  }
  letStatusButton();

  offStatusBtn.addEventListener("click", (e) => {
    ordersContainer.innerHTML = "";
    makeOrderComponent();
    letStatusButton();
  });

  /* 
    const orderBox = document.querySelector(".orderbox")
    const orderEditorButton = document.querySelector("#order-editor")



    let z =1
   
    const orderComponent = (customerName,zipCode,city,street,number,houseNumber,email,pizza,time,id) =>
        `<div class="ordercard">
            <h1>Order ${z++}</h1>
            <h3 class="customerName">${customerName}</h3>
            <h4 class="zipCode">${zipCode}</h4>
            <h4 class="street">${street}</h4>
            <h4 class="city">${city}</h4>
            <h4 class="number">${number}</h4>
            <h4 class="houseNumber">${houseNumber} </h4>
            <h4 class="email">${email}</h4>
            <h4 class="pizzaa">${pizza}</h4>
            <h4 class="time">${time}</h4>
           <button class="statusbutton" id="${id}">OPEN</button>
            </div>
            `

    

    orderEditorButton.addEventListener("click", () => {
        fetch("/orders")
            .then(data => data.json())
            .then(orders => {
                console.log(orders)
                orders.forEach(order => orderBox.insertAdjacentHTML("beforeend", orderComponent(order.customerName,order.zipCode,order.city,order.street,order.number,order.houseNumber,order.email,order.pizza,order.time,order.id)))

                const statusB = document.querySelectorAll(".statusbutton")
                console.log(statusB.length)
                statusB.forEach(button =>{
                       button.addEventListener("click",(e)=>{
                        e.preventDefault()
                        console.log(e.target)
                        const orderId = e.target.id

                          fetch(`/order/${orderId}`, {
                            method: "POST",

                          })
                            .then(res => res.json())
                            .then(resJson => console.log(resJson))

                            button.classList.add('green')
                            button.textContent="CLOSED"
                      })


                      
              }) 
                
            })
     

        }) */
}
const pizzaSpinner = () => {
  rootElement.classList.add("spinner-root");
  rootElement.innerHTML = `
<div class="spinner">
<img src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/kr7ormd6xl1ymkb501sv.png" class="pizza-part pizza-part-1" />
<img src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/kr7ormd6xl1ymkb501sv.png" class="pizza-part pizza-part-2" />
<img src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/kr7ormd6xl1ymkb501sv.png" class="pizza-part pizza-part-3" />
<img src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/kr7ormd6xl1ymkb501sv.png" class="pizza-part pizza-part-4" />
</div>
    `;
};

orderEditorButton.addEventListener("click", () => {
  cart.classList.add("away-position");
  orderEditContainer.classList.toggle("away-position");
});

window.addEventListener("load", loadEvent);
