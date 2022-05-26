const cartBtn = document.querySelector(".cart-btn");
const cart = document.querySelector(".cart");
const backdrop = document.querySelector(".backdrop");
const closeModal = document.querySelector(".cart-confirm-btn");
const clearModal = document.querySelector(".cart-clear-btn");

const productsDOM = document.querySelector(".products-center");
const cartCounter = document.querySelector(".cart-counter");
const cartTotalPrice = document.querySelector(".cart-total-price");
const cartContent = document.querySelector(".cart-content");

import { productsData } from "./products.js";

let shoppingCart = [];
let buttonsDOM = [];

class Products {
  getProducts() {
    return productsData;
  }
}

class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((item) => {
      result += `<section class="product">
        <div class="img-container">
          <img
            class="product-img"
            src=${item.imageUrl}
            alt="p-1"
          />
        </div>
        <div class="product-desc">
          <p class="product-title">${item.title}</p>
          <p class="product-price">$ ${item.price}</p>
        </div>
        <button class="add-to-cart-btn" data-id=${item.id}>
          <i class="fas fa-shopping-cart"></i>Add to cart
        </button>
      </section>`;
    });
    productsDOM.innerHTML = result;
  }

  getAddToCartBtns() {
    const addToCartBtn = [...document.querySelectorAll(".add-to-cart-btn")];
    buttonsDOM = [...addToCartBtn];

    addToCartBtn.forEach((btn) => {
      const id = btn.dataset.id;
      const isInCart = shoppingCart.find((p) => p.id === id);

      if (isInCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      }

      btn.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        const addedProduct = { ...Storage.getProducts(id), quantity: 1 };
        shoppingCart = [...shoppingCart, addedProduct];

        Storage.saveCart(shoppingCart);

        this.setCartValue(shoppingCart);

        this.addCartItem(addedProduct);
      });
    });
  }

  setCartValue(shoppingCart) {
    let tempCartItems = 0;
    const totalPrice = shoppingCart.reduce((acc, curr) => {
      tempCartItems += curr.quantity;
      return acc + curr.quantity * curr.price;
    }, 0);

    cartTotalPrice.innerText = `Total price: ${totalPrice.toFixed(2)}$`;
    cartCounter.innerText = tempCartItems;
  }

  addCartItem(cartItem) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <div class="cart-img-container">
        <img src=${cartItem.imageUrl} />
      </div>
      <div class="cart-item-desc">
        <h4 class="cart-item-title">${cartItem.title}</h4>
        <p class="cart-item-price">${cartItem.price}</p>
      </div>
      <div class="cart-item-controller">
        <i class="fa-solid fa-chevron-up" data-id=${cartItem.id}></i>
        <p>${cartItem.quantity}</p>
        <i class="fa-solid fa-chevron-down" data-id=${cartItem.id}></i>
      </div>
      <i class="fa-solid fa-trash-can" data-id=${cartItem.id}></i></div>`;

    cartContent.appendChild(div);
  }

  setupApp() {
    shoppingCart = Storage.getCart() || [];

    shoppingCart.forEach((cartItem) => this.addCartItem(cartItem));
    this.setCartValue(shoppingCart);
  }

  cartLogic() {
    clearModal.addEventListener("click", () => this.clearCart());

    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("fa-chevron-up")) {
        const addedQuantity = event.target;

        const addedItem = shoppingCart.find(
          (cItem) => cItem.id == addedQuantity.dataset.id
        );

        addedItem.quantity++;
        this.setCartValue(shoppingCart);
        Storage.saveCart(shoppingCart);

        addedQuantity.nextElementSibling.innerText = addedItem.quantity;
      } else if (event.target.classList.contains("fa-trash-can")) {
        const removeItem = event.target;
        const _removedItem = shoppingCart.find(
          (cItem) => cItem.id == removeItem.dataset.id
        );

        this.removeItem(_removedItem.id);
        Storage.saveCart(shoppingCart);
        this.setCartValue(shoppingCart);
        cartContent.removeChild(removeItem.parentElement);
      } else if (event.target.classList.contains("fa-chevron-down")) {
        const subQuantity = event.target;

        const subtractedItem = shoppingCart.find(
          (cItem) => cItem.id == subQuantity.dataset.id
        );

        if (subtractedItem.quantity === 1) {
          this.removeItem(subtractedItem.id);
          cartContent.removeChild(subQuantity.parentElement.parentElement);
          return;
        }
        subtractedItem.quantity--;
        this.setCartValue(shoppingCart);
        Storage.saveCart(shoppingCart);

        subQuantity.previousElementSibling.innerText = subtractedItem.quantity;
      }
    });
  }

  clearCart() {
    shoppingCart.forEach((cItem) => this.removeItem(cItem.id));

    while (cartContent.children.length) {
      cartContent.removeChild(cartContent.children[0]);
    }
    close();
  }

  removeItem(id) {
    shoppingCart = shoppingCart.filter((cItem) => cItem.id !== id);

    this.setCartValue(shoppingCart);
    Storage.saveCart(shoppingCart);

    this.getSingleButton(id);
  }

  getSingleButton(id) {
    const button = buttonsDOM.find(
      (btn) => parseInt(btn.dataset.id) === parseInt(id)
    );
    button.innerText = "Add to cart";
    button.disabled = false;
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProducts(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((p) => p.id === parseInt(id));
  }

  static saveCart(shoppingCart) {
    localStorage.setItem("shoppingCart", JSON.stringify(shoppingCart));
  }

  static getCart() {
    return JSON.parse(localStorage.getItem("shoppingCart"));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const products = new Products();
  const productsData = products.getProducts();

  const ui = new UI();
  ui.setupApp();
  ui.displayProducts(productsData);
  ui.getAddToCartBtns();
  ui.cartLogic();

  //saveProducts is a static method
  Storage.saveProducts(productsData);
});

function showModal() {
  backdrop.style.display = "block";
  cart.style.opacity = "1";
  cart.style.top = "20%";
}

function close() {
  backdrop.style.display = "none";
  cart.style.opacity = "0";
  cart.style.top = "-100%";
}

cartBtn.addEventListener("click", showModal);
closeModal.addEventListener("click", close);
backdrop.addEventListener("click", close);
