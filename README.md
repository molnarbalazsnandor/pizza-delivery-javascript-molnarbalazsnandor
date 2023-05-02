This was a team project during our frontend developer course at Codecool.

The task was to build a pizza ordering website in vanilla JavaScript, that manages the orders via a functioning backend, and also has an "admin mode", in which the menu becomes modifiable, and the submitted orders can be viewed and managed.

On the frontend side, first the pizza menu is displayed, and an order card is opened once a choice has been made, requesting all the usual further information of the customer. Once the order is submitted, a fetch to the backend is initialized.

The backend saves the pizza orders in json format, and gives them a timestamp, and later the status of the order can be overwritten via the order editor mode. New types of pizzas can also be uploaded, including their profile pictures.
