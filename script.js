const spinner = document.getElementById("spinner");
const cartContainer = document.getElementById("cartContainer");
const sumElement = document.getElementById("sum");

let cartItems = [];
let totalPrice = 0;

// Load categories
const categoryLoad = () => {
  fetch("https://openapi.programming-hero.com/api/categories")
    .then((res) => res.json())
    .then((data) => {
      const allData = [{ id: 0, category_name: "All Trees" }, ...data.categories];
      loadCategories(allData);
    });
};

const loadCategories = (categories) => {
  const catSection = document.getElementById("categories");
  catSection.innerHTML = "";

  for (const category of categories) {
    const newLi = document.createElement("li");
    newLi.innerHTML = `
      <button 
        id="categoryBtn${category.id}" 
        onclick="loadTrees(${category.id})" 
        class="py-1 px-3 text-black rounded-md hover:bg-green-800 hover:text-black-800 w-full border border-transparent focus:outline-none active-category-btn btn"
      >
        ${category.category_name}
      </button>
    `;
    catSection.append(newLi);
  }
};

categoryLoad();

const loadTrees = (id) => {
  const cardContainer = document.getElementById("cardContainer");
  cardContainer.innerHTML = "";
  spinner.classList.remove("hidden");

  const url =
    id === 0
      ? "https://openapi.programming-hero.com/api/plants"
      : `https://openapi.programming-hero.com/api/category/${id}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const categoryBtn = document.getElementById(`categoryBtn${id}`);
      const allBtns = document.getElementsByClassName("active-category-btn");
      

    

      loadPlants(data.plants);
    });
};

const defaultPlants = () => {
  fetch("https://openapi.programming-hero.com/api/plants")
    .then((res) => res.json())
    .then((data) => loadPlants(data.plants));
};

const loadPlants = (plants) => {
  const cardContainer = document.getElementById("cardContainer");
  cardContainer.innerHTML = "";

  for (const plant of plants) {
    const newDiv = document.createElement("div");
    newDiv.innerHTML = `
      <div class="card bg-white p-4 text-start space-y-3 shadow-md rounded-md">
        <img class="mx-auto rounded-lg aspect-video object-cover" src="${plant.image}" alt="Card Image">
        <h1 onclick="cardDetails(${plant.id})" class="font-bold text-start hover:text-green-600 cursor-pointer">${plant.name}</h1>
        <p class="opacity-80 text-sm">${plant.description}</p>
        <div class="price">
          <div class="type flex justify-between">
            <p class="py-1 px-3 font-semibold bg-[#DCFCE7] text-[#15803D] rounded-full">${plant.category}</p>
            <p class="font-semibold"><i class="fa-solid fa-bangladeshi-taka-sign"></i><span>${plant.price}</span></p>
          </div>
        </div>
        <div class="addToCart">
          <button onclick="addToCart(${plant.price},'${plant.name}')" class="bg-[#15803D] btn font-bold text-center rounded-full w-full text-white">Add To Cart</button>
        </div>
      </div>
    `;
    cardContainer.append(newDiv);
    spinner.classList.add("hidden");
  }
};

const cardDetails = async (id) => {
  const url = `https://openapi.programming-hero.com/api/plant/${id}`;
  const res = await fetch(url);
  const details = await res.json();
  detailView(details.plants);
};

const detailView = (card) => {
  const modalBox = document.getElementById("modalBox");
  modalBox.innerHTML = `
    <div class="card bg-white p-4 text-start space-y-3">
      <img class="mx-auto rounded-lg aspect-video object-cover" src="${card.image}" alt="Card Image">
      <h1 class="font-bold text-start">${card.name}</h1>
      <p class="opacity-80 text-sm">${card.description}</p>
      <div class="price">
        <div class="type flex justify-between">
          <p class="py-1 px-3 font-semibold bg-[#DCFCE7] text-[#15803D] rounded-full">${card.category}</p>
          <p class="font-semibold"><i class="fa-solid fa-bangladeshi-taka-sign"></i><span>${card.price}</span></p>
        </div>
      </div>
    </div>
  `;
  my_modal_2.showModal();
};

function renderCart() {
  cartContainer.innerHTML = "";

  cartItems.forEach((cart, index) => {
    const newCart = document.createElement("div");
    newCart.classList.add(
      "cart", "flex", "justify-between", "items-center",
      "bg-[#F0FDF4]", "rounded-lg", "p-2", "my-3"
    );
    newCart.innerHTML = `
      <div class="title">
        <h1 class="font-semibold">${cart.productName}</h1>
        <p><i class="fa-solid fa-bangladeshi-taka-sign"></i> <span class="font-semibold">${cart.productPrice}</span></p>
      </div>
      <button class="close" data-index="${index}">
        <i class="fa-solid fa-xmark"></i>
      </button>         
    `;
    cartContainer.append(newCart);
  });

  totalPrice = cartItems.reduce((sum, item) => sum + item.productPrice, 0);
  sumElement.innerText = totalPrice;
}

const addToCart = (price, name) => {
  cartItems.push({ productName: name, productPrice: price });
  renderCart();
};

cartContainer.addEventListener("click", function (event) {
  if (event.target.closest(".close")) {
    const index = event.target.closest(".close").getAttribute("data-index");
    cartItems.splice(index, 1);
    renderCart();
  }
});

defaultPlants();