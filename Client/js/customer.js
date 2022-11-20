class CustomerPage {

  constructor() {
    this.state = {
      customerId: "",
      customer: null,
      states: []
    };

    // instance variables that the app needs but are not part of the "state" of the application
    this.server = "https://localhost:5001/api"
    this.url = this.server + "/customers";

    // instance variables related to ui elements simplifies code in other places
    this.$form = document.querySelector('#customerForm');
    this.$customerId = document.querySelector('#customerId');
    this.$customerName = document.querySelector('#name');
    this.$customerAddress = document.querySelector('#address');
    this.$customerCity = document.querySelector('#city');
    this.$customerState = document.querySelector('#state');
    this.$customerZipcode = document.querySelector('#zipcode');
    this.$findButton = document.querySelector('#findBtn');
    this.$addButton = document.querySelector('#addBtn');
    this.$deleteButton = document.querySelector('#deleteBtn');
    this.$editButton = document.querySelector('#editBtn');
    this.$saveButton = document.querySelector('#saveBtn');
    this.$cancelButton = document.querySelector('#cancelBtn');

    // call these methods to set up the page

    /* call these methods to set up the page*/

    this.bindAllMethods();
    this.fetchStates();
    this.makeFieldsReadOnly(true);
    this.makeFieldsRequired(false);
    this.enableButtons("pageLoad");

  }
    //set up binding for all methods - very important step!
    //in other labs binding a method to an event handler happened in one line
    //with so many methods and buttons, it makes sense to have
    //the actions put into separate methods

  // any method that is used as part of an event handler must bind this to the class
  // not all of these methods need to be bound but it was easier to do them all as I wrote them
  bindAllMethods() {
    this.onFindCustomer = this.onFindCustomer.bind(this);
    this.onEditCustomer = this.onEditCustomer.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onDeleteCustomer = this.onDeleteCustomer.bind(this);
    this.onSaveCustomer = this.onSaveCustomer.bind(this);
    this.onAddCustomer = this.onAddCustomer.bind(this);

    this.fetchStates = this.fetchStates.bind(this);
    this.loadStates = this.loadStates.bind(this);
    this.makeFieldsReadOnly = this.makeFieldsReadOnly.bind(this);
    this.makeFieldsRequired = this.makeFieldsRequired.bind(this);
    this.fillCustomerFields = this.fillCustomerFields.bind(this);
    this.clearCustomerFields = this.clearCustomerFields.bind(this);
    this.disableButtons = this.disableButtons.bind(this);
    this.disableButton = this.disableButton.bind(this);
    this.enableButtons = this.enableButtons.bind(this);
  }

    //this calls a function that makes all the geographic states available to
    //populate the dropdown menu for adding/ retrieving a customer 

  // makes an api call to /api/states to get the list of states
  // populates the combo box on the page with the state information
  fetchStates() {
    fetch(`${this.server}/states`)
    .then(response => response.json())
    .then(data => { 
      if (data.length == 0) {
        alert("Can't load states.  Can not add or edit customers without state inforamtion.");
      }
      else {
        this.state.states = data;
        this.loadStates();
      }
    })
    .catch(error => {
      alert('There was a problem getting customer info!'); 
    });
  }

   //this method makes a fetch request that makes a get request on the states endpoint
  //the get method has no parameters, so it gets all the states

  // creates an option for each of the states returned from the api call
  loadStates() {
    let defaultOption = `<option value="" ${(!this.state.customer)?"selected":""}></option>`;
    let stateHtml = this.state.states.reduce(
      (html, state, index) => html += this.loadState(state, index), defaultOption
    );
    this.$customerState.innerHTML = stateHtml;
  }
  //this method is called on each state in the sates array by the arrow function
  //in loadStates() and creates the option for one state

  // creates the option for one state
  loadState(state, index) {
    return `<option value=${state.stateCode} ${(this.state.customer && this.state.customer.stateCode == state.stateCode)?"selected":""}>${state.stateName}</option>`;
  }

    /* this method starts by preventing the default action for the button
  it checks if there is a value in the customerid field
  if there is an id number there, it uses fetch to send a get request*/


  // makes an api call to /api/customer/# where # is the primary key of the customer
  // finds a customer based on customer id.  in a future version it would be better to search by name
  onFindCustomer(event) {
    event.preventDefault();
    if (this.$customerId.value != "") {
      this.state.customerId = this.$customerId.value;
      fetch(`${this.url}/${this.state.customerId}`)
      .then(response => response.json())
      .then(data => { 
        if (data.status == 404) {
          alert('That customer does not exist in our database'); 
        }
        else {
          this.state.customer = data;
          this.fillCustomerFields();
          this.enableButtons("found");
        }
      })
      .catch(error => {
        alert('There was a problem getting customer info!'); 
      });
    }
    else {
      this.clearCustomerFields();
    }
  }
/*I ran into the bug on this method and puzzled over it before remembering there
is a forum post with a bug fix. because the bug fix changed the evalution criteria for
the if statement to checking for the correct repsonse it now executes the code inside the if
statement. Before that, it was looking for a returned customer object, which wasn't there. 
The customer did get deleted, but the error message came up and the fields were not cleared*/ 

  // makes a delete request to /api/customer/# where # is the primary key of the customer
  // deletes the customer displayed on the screen from the database
  onDeleteCustomer(event) {
    event.preventDefault();
    if (this.state.customerId != "") {
      fetch(`${this.url}/${this.state.customerId}`, {method: 'DELETE'})
      .then(response => { 
        // doesn't return a body just a status code of 204 
      if (response.status == 204)
      {
          this.state.customerId = "";
          this.state.customer = null;
          this.$customerId.value = "";
          this.clearCustomerFields();
          this.enableButtons("pageLoad");
          alert("Customer was deleted.")
      }
        else{
          alert('This is the first else statement. This is not the catch block. There was a problem deleting customer info!'); 
        }
      })
      .catch(error => {
        alert('This is the catch block. There was a problem deleting customer info!'); 
      });
    }
    else {
      // this should never happen if the right buttons are enabled
    }
  }

  /*using the client, I didn't realize this was the structure of this method.
  It makes sense because in adding and updating, you making a 
  set of customer data and saving it. In the method, the if statement checks 
  the condition -does the customer have an existing id or not. for adding
  it looks like it makes a body {} object that has the info pulled from the 
  input fields. With the update, the code makes a new customer object to
  store the new values. that gets passed as the body when making the call
  to the PUT endpoint*/

  // makes either a post or a put request to /api/customers
  // either adds a new customer or updates an existing customer in the database
  // based on the customer information in the form
  onSaveCustomer(event) {
    event.preventDefault();
    // adding
    if (this.state.customerId == "") {
      fetch(`${this.url}`, {
        method: 'POST', 
        body: JSON.stringify({
          customerId: 0, 
          name: this.$customerName.value,
          address: this.$customerAddress.value,
          city: this.$customerCity.value,
          stateCode: this.$customerState.value,
          zipCode: this.$customerZipcode.value,
          invoices: [], 
          state: null
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => { 
        // returns the record that we added so the ids should be there 
        if (data.customerId)
        {
          this.state.customerId = data.customerId;
          this.state.customer = data;
          this.$customerId.value = this.state.customerId;
          this.fillCustomerFields();
          this.$customerId.readOnly = false;
          this.enableButtons("found");
          alert("Customer was added.")
        }
        else{
          alert('There was a problem adding customer info!'); 
        }
      })
      .catch(error => {
        alert('There was a problem adding customer info!'); 
      });
    }
    // updating
    else {
      // the format of the body has to match the original object exactly 
      // so make a copy of it and copy the values from the form
      let customer = Object.assign(this.state.customer);
      customer.name = this.$customerName.value;
      customer.address = this.$customerAddress.value;
      customer.city = this.$customerCity.value;
      customer.stateCode = this.$customerState.value;
      customer.zipCode = this.$customerZipcode.value;
      fetch(`${this.url}/${this.state.customerId}`, {
        method: 'PUT', 
        body: JSON.stringify(customer),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        // doesn't return a body just a status code of 204 
        if (response.status == 204)
        {
          this.state.customer = Object.assign(customer);
          this.fillCustomerFields();
          this.$customerId.readOnly = false;
          this.enableButtons("found");
          alert("Customer was updated.")
        }
        else{
          alert('There was a problem updating customer info!'); 
        }
      })
      .catch(error => {
        alert('There was a problem adding customer info!'); 
      });
    }
  }
/*I notice that this is the method that sets up for 
what happens when a user hits save*/
  // makes the fields editable
  onEditCustomer(event) {
    event.preventDefault();
    // can't edit the customer id
    this.$customerId.readOnly = true;
    this.makeFieldsReadOnly(false);
    this.makeFieldsRequired(true);
    this.enableButtons("editing");
  }

  // clears the form for input of a new customer
  onAddCustomer(event) {
    event.preventDefault();
    // can't edit the customer id
    this.state.customerId = ""
    this.state.customer = null;
    this.$customerId.value = "";
    this.$customerId.readOnly = true;
    this.clearCustomerFields();
    this.makeFieldsReadOnly(false);
    this.makeFieldsRequired(true);
    this.enableButtons("editing");
  }

  // cancels the editing for either a new customer or an existing customer
  onCancel(event) {
    event.preventDefault();
    if (this.state.customerId == "") {
      this.clearCustomerFields();
      this.makeFieldsReadOnly();
      this.makeFieldsRequired(false);
      this.$customerId.readOnly = false;
      this.enableButtons("pageLoad");
    }
    else {
      this.fillCustomerFields();
      this.$customerId.readOnly = false;
      this.enableButtons("found");
    }
  }

  // fills the form with data based on the customer
  fillCustomerFields() {
    // fill the fields
    this.$customerName.value = this.state.customer.name;
    this.$customerAddress.value = this.state.customer.address;
    this.$customerCity.value = this.state.customer.city;
    this.loadStates();
    this.$customerZipcode.value = this.state.customer.zipCode;
    this.makeFieldsReadOnly();
  }

  // clears the ui
  clearCustomerFields() {
    this.$customerName.value = "";
    this.$customerAddress.value = "";
    this.$customerCity.value = "";
    this.loadStates();
    this.$customerZipcode.value = "";
  }

  // enables or disables ui elements
  makeFieldsReadOnly(readOnly=true) {
    this.$customerName.readOnly = readOnly;
    this.$customerAddress.readOnly = readOnly;
    this.$customerCity.readOnly = readOnly;
    this.$customerState.readOnly = readOnly;
    this.$customerZipcode.readOnly = readOnly;
  }

  // makes ui elements required when editing
  makeFieldsRequired(required=true) {
    this.$customerName.required = required;
    this.$customerAddress.required = required;
    this.$customerCity.required = required;
    //this.$customerState.required = required;
    this.$customerZipcode.required = required;
  }

  // disables an array of buttons
  disableButtons(buttons) {
    buttons.forEach(b => b.onclick = this.disableButton); 
    buttons.forEach(b => b.classList.add("disabled"));
  }

  // disables one button
  disableButton(event) {
    event.preventDefault();
  }

  // enables ui elements based on the editing state of the page
  enableButtons(state) {
    switch (state){
      case "pageLoad":
        this.disableButtons([this.$deleteButton, this.$editButton, this.$saveButton, this.$cancelButton]);
        this.$findButton.onclick = this.onFindCustomer;
        this.$findButton.classList.remove("disabled");
        this.$addButton.onclick = this.onAddCustomer;
        this.$addButton.classList.remove("disabled");
        break;
      case "editing": case "adding":
        this.disableButtons([this.$deleteButton, this.$editButton, this.$addButton]);
        this.$saveButton.onclick = this.onSaveCustomer;
        this.$cancelButton.onclick = this.onCancel;
        [this.$saveButton, this.$cancelButton].forEach(b => b.classList.remove("disabled"));
        break;
      case "found":
        this.disableButtons([this.$saveButton, this.$cancelButton]);
        this.$findButton.onclick = this.onFindCustomer;
        this.$editButton.onclick = this.onEditCustomer;
        this.$deleteButton.onclick = this.onDeleteCustomer;
        this.$addButton.onclick = this.onAddCustomer;
        [this.$findButton, this.$editButton, this.$deleteButton, this.$addButton].forEach(b => b.classList.remove("disabled"));
        break;
      default:
    }
  }
}

// instantiate the js app when the html page has finished loading
window.addEventListener("load", () => new CustomerPage());
