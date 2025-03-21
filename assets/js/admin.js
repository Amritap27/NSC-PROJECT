// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';

// new paid
const firebaseConfig = {
  apiKey: 'AIzaSyAKg9FA7txJeEegbJQq-FkfBO8Vwy6TbTI',
  authDomain: 'nsc-project-b2648.firebaseapp.com',
  databaseURL:
    'https://nsc-project-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'nsc-project-b2648',
  storageBucket: 'nsc-project-b2648.firebasestorage.app',
  messagingSenderId: '208868373512',
  appId: '1:208868373512:web:b4b1c9922dcd9ef8e2cdbd',
  measurementId: 'G-7TXJZD0N70',
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Initialize Firestore
let db;
try {
  db = getFirestore(app, { experimentalForceLongPolling: true });
} catch (error) {
  console.error(' Firestore initialization error:', error);
}
const storage = getStorage(app);

// // reference to the storage service
// const storage = firebase.storage();

// ----------------------------------------------------------
// open funcitons
// ----------------------------------------------------------

class Popup {
  constructor(popupId, overlayId) {
    this.popup = document.getElementById(popupId);
    this.overlay = document.getElementById(overlayId);
    this.closeButton = document.getElementById('closePopup');

    this.closeButton.addEventListener('click', () => this.hide());
    this.overlay.addEventListener('click', () => this.hide());
  }

  show(message) {
    this.popup.style.display = 'block';
    this.overlay.style.display = 'block';
    this.setContent(message);
  }

  hide() {
    this.popup.style.display = 'none';
    this.overlay.style.display = 'none';
  }

  setContent(message) {
    const contentDiv = document.getElementById('popupContent');
    contentDiv.innerText = message;
  }
}

//Fetching all products
async function getAllProducts() {
  console.log('fetching all products');
  let allProducts = [];
  try {
    const prodRef = collection(db, 'products');
    const q = query(prodRef);
    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => allProducts.push({ ...doc.data(), pid: doc.id }));
    console.log(allProducts);
    return allProducts;
  } catch (error) {
    console.log('Error fetching products: ', error);
  }
}

async function getSearchedProducts(term, allProdOfType) {
  if (term === '') {
    const myPopup = new Popup('popup', 'popupOverlay');
    myPopup.show('There is nothing to search for!');
    // alert('There is nothing to search for');
    return allProdOfType;// Return empty array if no search term
  }

  // Convert term to lowercase for case-insensitive search
  const searchTerm = term.toLowerCase();

  // Filter products whose name contains the search term
  const filteredProducts = allProdOfType.filter((product) =>
    product.name.toLowerCase().includes(searchTerm)
  );

  console.log(filteredProducts);
  return filteredProducts;
}

//fetching cart inquiries
async function getCartInquiries(id) {
  console.log('Fetching cart inquiries');
  let cartInquiries = [];
  try {
    const prodRef = collection(db, 'cartInquiries');
    let snapshot;

    if (id === undefined) {
      // Fetch all documents if id is not provided
      snapshot = await getDocs(query(prodRef));

      // Add each document's data to cartInquiries array
      snapshot.forEach((doc) => {
        cartInquiries.push({ ...doc.data(), cart_inq_id: doc.id });
      });
    } else {
      // Fetch a single document if id is provided
      console.log(id);
      const docRef = doc(db, 'cartInquiries', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        cartInquiries.push({ ...docSnap.data(), cart_inq_id: docSnap.id });
      } else {
        console.log('No such document!');
        return [];
      }
    }

    cartInquiries.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
    console.log(cartInquiries);
    return cartInquiries;
  } catch (error) {
    console.error('Error fetching cart inquiries: ', error);
    return [];
  }
}

//fetching dealer inquiries
async function getDealerInquiries(id) {
  console.log('Fetching dealer inquiries');
  let dealerInquiries = [];
  try {
    const prodRef = collection(db, 'dealerInquiries');
    let snapshot;
    if (id === undefined) {
      snapshot = await getDocs(query(prodRef));
    } else {
      const docRef = doc(db, 'dealerInquiries', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        dealerInquiries.push({ ...docSnap.data(), deal_id: docSnap.id });
        return dealerInquiries;
      } else {
        console.log('No such document!');
        return [];
      }
    }

    // Process the snapshot for multiple documents
    snapshot.forEach((doc) =>
      dealerInquiries.push({ ...doc.data(), deal_id: doc.id })
    );

    dealerInquiries.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

    return dealerInquiries;
  } catch (error) {
    console.log('Error fetching dealer inquiries: ', error);
  }
}

async function getAllCart() {
  console.log('fetching all carts!!');
  let carts = [];
  try {
    const prodRef = collection(db, 'carts');
    const q = query(prodRef);
    const snapshot = await getDocs(q);

    snapshot.forEach((doc) => carts.push(doc.data()));
    console.log(carts);

    return carts;
  } catch (error) {
    console.log('Error fetching cart:', error);
  }
}

//Fetching cart from db
async function getCart(id) {
  console.log('Fetching cart', id);
  let cart = [];
  try {
    const cartInqRef = collection(db, 'carts');
    const q = query(cartInqRef, where('cartId', '==', id));
    const snapshot = await getDocs(q);

    // console.log(snapshot.doc.data())
    // snapshot.forEach((doc) => cart.push(doc.data()));
    snapshot.forEach((doc) => {
      const cartData = doc.data();
      if (cartData.products) {
        cartData.products.forEach((product) => {
          cart.push(product);
        });
      }
    });

    return cart;
  } catch (error) {
    console.log('Error fetching carts: ', error);
  }
}

// Getting url of image
async function uploadImageToStorage(file) {
  const storageRef = ref(storage, `product-images/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const url = await getDownloadURL(snapshot.ref);
  return url;
}

$(document).ready(() => {
  let isAuth = localStorage.getItem('isAuth');
  console.log(isAuth);
  if (isAuth === 'false') {
    window.location.href = 'login.html';
  }

  const logOutBtn = document.getElementById('logoutBtn');

  logOutBtn.addEventListener('click', () => {
    // localStorage.removeItem('admin');
    localStorage.setItem('isAuth', false);
    localStorage.removeItem('admin')
    window.location.href = 'login.html';
  });
});

// ----------------------------------------------------------
// for admin page
// ----------------------------------------------------------

// Add product form submision
$(document).ready(function () {
  $('#product-form').submit(async function (e) {
    e.preventDefault();

    let name = $('#productName').val().trim();
    let price = $('#productPrice').val().trim();
    let description = $('#productDesc').val().trim();
    let type = $('#productType').val().trim();
    // let imageFile = $('#productImage').val().trim(); // Ensures an image is selected
    let imageFile = $('#productImage')[0].files;

    // Validate that no fields are empty
    if (!name || !price || !description || !type || !imageFile) {
      const myPopup = new Popup('popup', 'popupOverlay');
      myPopup.show('All fields are required. Please fill in all fields.');
      // alert('All fields are required. Please fill in all fields.');
      return;
    }

    if (imageFile.length > 1) {
      const myPopup = new Popup('popup', 'popupOverlay');
      myPopup.show('Please select only one image.');
      // alert('Please select only one image');
      return;
    }

    try {
      // Step 1: Upload Image to Firebase Storage
      let file = imageFile[0]; // Get the first file from the list
      const storageRef = ref(storage, `product-images/${file.name}`);
      const uploadTask = await uploadBytes(storageRef, file);
      // Step 2: Get Image URL
      const imageUrl = await getDownloadURL(uploadTask.ref);
      console.log(imageUrl);

      // Step 3: Store Product Data in Firestore
      const docRef = await addDoc(collection(db, 'products'), {
        name: name,
        price: price,
        description: description,
        type: type,
        imageUrl: imageUrl, // Store image URL
        createdAt: new Date(),
      });
      const myPopup = new Popup('popup', 'popupOverlay');
      myPopup.show('Product added successfully!');
      // alert('Product added successfully! ID: ' + docRef.id);
      $('#product-form')[0].reset(); // Reset form
    } catch (error) {
      console.error('Error adding document: ', error);
      const myPopup = new Popup('popup', 'popupOverlay');
      myPopup.show('Error adding Product!');
      // alert('Error adding product!');
    }
  });

  const adminUL = document.getElementById('adminSectionList');
  console.log(adminUL);
  let listItems = [];
  if (adminUL) {
    listItems = [...adminUL.getElementsByTagName('li')];
  }
  // calling respective function on section change
  listItems.forEach((element) => {
    element.addEventListener('click', () => {
      if (element.innerText.trim() === 'All Products') {
        showProducts();
      } else if (element.innerText.trim() === 'Dealer Inquiries/ Contact us') {
        showDealInq();
      } else if (element.innerText.trim() === 'Cart Inquiries') {
        showCartInq();
      } else if (element.innerText.trim() === 'Announcements') {
        showCurrentAnnouncement();
      }
    });
  });
});

// ----------------------------------------------------------
// for frontend
// ----------------------------------------------------------

// ----------------------------------------------------------
// for All Products
// ----------------------------------------------------------

let selectedProducts = [];

async function showProducts() {
  // getting all products
  const allProducts = await getAllProducts();

  // selecting type from dropdown
  const dropdownUL = document.getElementById('dropdown');

  [...dropdownUL.getElementsByTagName('li')].forEach((element) => {
    element.addEventListener('click', () => {
      const filteredProducts = allProducts.filter(
        (item) => item.type == element.innerText.trim()
      );

      printProducts(filteredProducts, element.innerText.trim());
    });
  });

  const physicsProducts = allProducts.filter(
    (item) => item.type.toLowerCase() == 'Physics Lab Equipment'.toLowerCase()
  );

  printProducts(physicsProducts, 'Physics Lab Equipment');
}

function printProducts(products, type) {
  console.log('filtered', products);
  const sectionContainer = document.getElementById('product-list-table');
  sectionContainer.innerHTML = '';

  const typeContainer = `
    <div id="physics-lab-section" class="product-category" style='position: relative;'>
      <div class="product-section-heading">
        <h3>${type}</h3>
        <div class="download-buttons">
          <button id="selectAllbtn">Select All</button>
          <button id="generateReceipt">Receipt <i class="fa fa-download"></i></button>
          <button id="generateExcel">Excel <i class="fa fa-download"></i></button>
        </div>
      </div>
      <div class="search-form-admin">
        <form id="SearchFormAdmin">
          <div class="search-form-container">
            <input
              type="text"
              class="form-control"
              placeholder="Search product name..."
              id="searchInput"
            />
            <button class="search-toggle-btn-admin" style="padding-bottom: 30px" type="submit">
              <i class="fi flaticon-search"></i>
            </button>
            <button class="show-all-btn-admin" type="button" style="display: none;">
              Show All
            </button>
          </div>
        </form>
      </div>
      <table class="product-list">
        <thead>
          <tr>
            <th class="s1">Select</th>
            <th class="s1">Sr. No.</th>
            <th class="s1">Name</th>
            <th class="s1">Price</th>
            <th class="s2">Description</th>
            <th class="s3">Edit/Delete</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  `;

  sectionContainer.innerHTML += typeContainer;

  const prodContainer = document.querySelector('.product-list tbody');
  products.forEach((item, index) => {
    const isChecked = selectedProducts.includes(item.pid) ? 'checked' : ''; // Check if product is selected
    const productCard = document.createElement('tr');
    productCard.classList.add('productRow');
    productCard.setAttribute('pid', item.pid)
    productCard.innerHTML = `
      <td class="s1" ><input type="checkbox" class="row-checkbox selectProdBox" pid='${item.pid
      }' ${isChecked}></td>
      <td class="s1">${index + 1}</td>
      <td class="s1">${item.name}</td>
      <td class="s1">${item.price}</td>
      <td class="s2">${item.description}</td>
      <td class="product-buttons s3">
        <button pid='${item.pid}' class='editProduct'>Edit</button>
        <button pid='${item.pid}' class='deleteProduct'>Delete</button>
      </td>
    `;
    prodContainer.appendChild(productCard);
  });

  console.log(sectionContainer);

  $(document).ready(() => {
    const editProductBtns = document.querySelectorAll('.editProduct');
    const deleteProductBtns = document.querySelectorAll('.deleteProduct');
    const generateProductsReceiptBtn =
      document.querySelectorAll('#generateReceipt');
    const generateProductsExcelBtn =
      document.querySelectorAll('#generateExcel');
    const selectProdBox = document.querySelectorAll('.selectProdBox');
    const selectAllbtn = document.querySelector('#selectAllbtn');
    const searchProductFormAdmin = document.getElementById('SearchFormAdmin');

    $(searchProductFormAdmin).submit(async (e) => {
      e.preventDefault();

      const searchTerm =
        searchProductFormAdmin.childNodes[1].childNodes[1].value;
      const showAllProdbtn = searchProductFormAdmin.childNodes[1].childNodes[5];
      console.log(showAllProdbtn);

      showAllProdbtn.addEventListener('click', () => {
        showProducts(products, type);
        showAllProdbtn.style.display = 'none';
      });

      showAllProdbtn.style.display = 'block';

      const searchedPrducts = await getSearchedProducts(searchTerm, products);
      let productRows = document.querySelectorAll('.productRow');

      console.log(productRows)
      productRows.forEach((row) => {
        row.style.display = 'none';
        searchedPrducts.forEach((p) => {
          if (p.pid === row.getAttribute('pid'))
            row.style.display = 'flex';
        })
      })

    });

    editProductBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        console.log(btn.getAttribute('pid')); // Logs the individual button clicked
        let clickedProduct = btn.getAttribute('pid');
        editProducts(clickedProduct);
      });
    });

    deleteProductBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        console.log(btn.getAttribute('pid')); // Logs the individual button clicked
        let clickedProduct = btn.getAttribute('pid');
        deleteProduct(clickedProduct);
      });
    });

    generateProductsReceiptBtn.forEach((btn) => {
      btn.addEventListener('click', () => {
        generateProductsReceipt(selectedProducts);
      });
    });

    generateProductsExcelBtn.forEach((btn) => {
      btn.addEventListener('click', () => {
        generateProductsExcel(selectedProducts);
      });
    });

    selectProdBox.forEach((box) => {
      box.addEventListener('change', () => {
        let clickedProduct = box.getAttribute('pid');
        if (box.checked) {
          selectedProducts.push(clickedProduct);
        } else {
          let checkValue;
          selectProdBox.forEach((b) => {
            checkValue = b.checked;
          });
          if (checkValue) {
            selectAllbtn.innerText = 'Select All';
          }
          selectedProducts = selectedProducts.filter(
            (product) => product !== clickedProduct
          );
        }
      });
    });

    let allBoxChecked = true;
    selectAllbtn.addEventListener('click', async () => {
      selectedProducts = [];
      console.log(allBoxChecked);
      if (allBoxChecked) {
        selectAllbtn.innerText = 'Unselect All';
        selectProdBox.forEach((box) => {
          box.checked = true;
        });
        const allProds = await getAllProducts();

        allProds.forEach((prod) => {
          selectedProducts.push(prod.pid);
        });
        allBoxChecked = false;
      } else {
        selectAllbtn.innerText = 'Select All';
        selectProdBox.forEach((box) => {
          box.checked = false;
        });
        selectedProducts = [];
        allBoxChecked = true;
      }
      console.log(selectedProducts);
    });
  });
}

async function editProducts(id) {
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const productData = docSnap.data();
      console.log(productData)
      let editFormHtml = ``;
      //form to edit the product details
      editFormHtml = `
        <div id="editProductModal" class="modal">
          <div class="modal-content">
            <div class="modal-content-heading">
              <h2>Edit Product</h2>
              <span class="close-button">&times;</span>
            </div>
            <form id="editProductForm">
              <div>
                <label for="productName">Name:</label>
                <input type="text" id="editProductName" value="${productData.name}" required>
              </div>
              <div>
                <label for="productPrice">Price:</label>
                <input type="number" id="editProductPrice" value="${productData.price}" required>
              </div>
              <div>
                <label for="productImage">Image:</label>
                <input type="file" id="editProductImage">
                <img src='${productData.imageUrl}' alt='productImage' />
              <div>
              <div>
                <label for="productDescription">Description:</label>
                <textarea id="editProductDescription" required>${productData.description}</textarea>
              </div>
              <div class="modal-save-changes-btn">
                <button type="submit" id='editFormSubmit'>Save Changes</button>
              <div>
            </form>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', editFormHtml);

      const modal = document.getElementById('editProductModal');
      const closeButton = document.querySelector('.close-button');

      // Show the modal
      modal.style.display = 'block';

      // Close the modal when the close button is clicked
      closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
        modal.remove();
      });

      let editFormSubmitbtn = document.getElementById('editFormSubmit');
      editFormSubmitbtn.addEventListener('click', async (e) => {
        await updateProduct(e, productData, docRef);
        modal.style.display = 'none';
        showProducts();
        modal.remove();
      });
    } else {
      console.log('No such document!');
      const myPopup = new Popup('popup', 'popupOverlay');
      myPopup.show('Product not found.');
      // alert('Product not found.');
    }
  } catch (error) {
    console.error('Error editing product:', error);
    const myPopup = new Popup('popup', 'popupOverlay');
    myPopup.show('Failed to edit product. Please try again.');
    // alert('Failed to edit product. Please try again.');
  }
}

async function updateProduct(e, productData, docRef) {
  e.preventDefault();

  // Get the updated input values from the form using plain JS
  const updatedName = document.getElementById('editProductName').value.trim();
  const updatedPrice = document.getElementById('editProductPrice').value.trim();
  const updatedDescription = document
    .getElementById('editProductDescription')
    .value.trim();
  const updatedImageFile = document.getElementById('editProductImage').files;

  console.log(
    updatedName,
    '-',
    updatedDescription,
    '-',
    updatedPrice,
    '-',
    updatedImageFile
  );

  let updatedData = {};
  let needsUpdate = false;

  // Check if any of the fields have been changed
  if (updatedName !== productData.name) {
    updatedData.name = updatedName;
    needsUpdate = true;
  }

  if (updatedPrice !== productData.price) {
    updatedData.price = updatedPrice; // ensure price is a number
    needsUpdate = true;
  }

  if (updatedDescription !== productData.description) {
    updatedData.description = updatedDescription;
    needsUpdate = true;
  }

  if (updatedImageFile && updatedImageFile.length > 0) {
    const newImageUrl = await uploadImageToStorage(updatedImageFile[0]); // Pass the first file in the FileList
    updatedData.imageUrl = newImageUrl;
    needsUpdate = true;
  }

  if (needsUpdate) {
    // Update the product document in Firestore
    await updateDoc(docRef, updatedData);
  } else {
    const myPopup = new Popup('popup', 'popupOverlay');
    myPopup.show('No changes detected.');
    // alert('No changes detected.');
  }
}

async function deleteProduct(id) {
  try {
    const docRef = doc(db, 'products', id); // Direct reference to the document by id
    await deleteDoc(docRef); // Delete the document
    showProducts();
    const myPopup = new Popup('popup', 'popupOverlay');
    myPopup.show('Product successfully deleted!');
    // alert('Product successfully deleted!');
  } catch (error) {
    console.error('Error deleting product:', error);
    const myPopup = new Popup('popup', 'popupOverlay');
    myPopup.show('Failed to delete product. Please try again.');
    // alert('Failed to delete product. Please try again.');
  }
}

async function generateProductsReceipt() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Logo URL or base64 data (use any logo URL or base64 image you want)
  const logoUrl =
    'https://images.unsplash.com/photo-1717328728300-a077e51e7a14?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fE4lMjBzeW1ib2x8ZW58MHx8MHx8fDA%3D';
  const logoWidth = 50;
  const logoHeight = 20;

  // Fetching all products (assuming getAllProducts is an async function)
  const allProducts = await getAllProducts();
  const productsToPrint = [];

  if (selectedProducts.length > 0) {
    // If selectedProducts is not empty, add matching products
    selectedProducts.forEach((selectedProd) => {
      const matchedProduct = allProducts.find(
        (product) => product.pid === selectedProd
      );
      if (matchedProduct) {
        console.log(matchedProduct);
        productsToPrint.push(matchedProduct);
      }
    });
    console.log(productsToPrint);
  } else {
    const myPopup = new Popup('popup', 'popupOverlay');
    myPopup.show('Select atleast one Product!');
    // alert('Select atleast one product!!');
    return;
  }

  // Sorting products by type
  const sortedProducts = productsToPrint.reduce((acc, product) => {
    if (!acc[product.type]) {
      acc[product.type] = [];
    }
    acc[product.type].push(product);
    return acc;
  }, {});

  // Header part (only for the first page)
  const headerPart = () => {
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 116, 166);
    doc.text('Niharika Scientific Center', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(
      'An Authorized Supplier for Science and Music Equipment',
      105,
      30,
      { align: 'center' }
    );

    doc.setFontSize(10);
    doc.text('Company Address: Janakpur, Nepal', 105, 40, { align: 'center' });
    doc.text('Phone: 9804813946 | Email: info@niharka.com', 105, 50, {
      align: 'center',
    });

    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(20, 55, 190, 55);

    doc.setFontSize(12);
    doc.text('Products Receipt', 105, 65, { align: 'center' });
  };

  // Add logo and header to the PDF
  const img = new Image();
  img.src = logoUrl;
  img.onload = function () {
    headerPart();

    let currentY = 85; // Starting Y position for table content

    // Loop through sorted products by type and create a new page for each type (without repeating the header)
    Object.keys(sortedProducts).forEach((type, index) => {
      if (index !== 0) {
        doc.addPage(); // Start a new page for each type after the first
        currentY = 20; // Reset Y position on new page without repeating the header
      }

      // Table heading for product type and total number of products
      const totalProducts = sortedProducts[type].length;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`${type}`, 20, currentY);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Products: ${totalProducts}`, 160, currentY);

      currentY += 10; // Move Y for the table header

      // Table header (Sr. No., Name, Price, Description)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Sr. No.', 20, currentY);
      doc.text('Name', 40, currentY);
      doc.text('Price', 150, currentY); // Adjusting the position to give more room to "Description"
      // doc.text('Description', 100, currentY); // Starting "Description" earlier for wider space

      currentY += 10; // Move Y for the table content

      // Iterate over each product in the current type category and print the details
      sortedProducts[type].forEach((product, idx) => {
        const srNo = (idx + 1).toString(); // Serial number for each product
        const name = product.name || 'N/A';
        const price = product.price?.toString() || 'N/A';
        // const description = product.description || 'N/A';

        // Wrap name and price if necessary, with column width constraints
        const nameText = doc.splitTextToSize(name, 80); // Narrow width for Name
        const priceText = doc.splitTextToSize(price, 40); // Narrow width for Price
        // const descriptionText = doc.splitTextToSize(description, 90); // Widened description area

        doc.setFont('helvetica', 'normal');
        doc.text(srNo, 25, currentY);
        doc.text(nameText, 40, currentY);
        doc.text(priceText, 152, currentY);
        // doc.text(descriptionText, 100, currentY);

        currentY += 10; // Move Y for the next product row, adjust for wrapped text
        // const descriptionHeight = descriptionText.length * 5;
        // currentY += descriptionHeight - 10; // Account for wrapped text height

        // Handle page break if needed
        if (currentY > 280) {
          doc.addPage();
          currentY = 20; // Reset Y for the new page without header
        }
      });
    });

    // Final thank you message
    doc.setFontSize(12);
    doc.text('Thank you for your business!', 105, currentY + 20, {
      align: 'center',
    });

    // Save the PDF
    doc.save('products_receipt.pdf');
  };

  // Handle image loading errors
  img.onerror = function () {
    const myPopup = new Popup('popup', 'popupOverlay');
    myPopup.show('Failed to load the logo image.');
    // alert('Failed to load the logo image.');
  };
}

async function generateProductsExcel() {
  // Sample product data (replace with your actual product data)
  const allProducts = await getAllProducts();
  const productsToPrint = [];

  if (selectedProducts.length > 0) {
    // If selectedProducts is not empty, add matching products
    console.log(selectedProducts);
    selectedProducts.forEach((selectedProd) => {
      const matchedProduct = allProducts.find(
        (product) => product.pid === selectedProd
      );
      if (matchedProduct) {
        productsToPrint.push(matchedProduct);
      }
    });
  } else {
    // If selectedProducts is empty, add all products
    const myPopup = new Popup('popup', 'popupOverlay');
    myPopup.show('No product selected, select atleast one product!');
    // alert('There is nothing selected');
    return;
  }

  console.log(productsToPrint);

  // Sort products by type
  const sortedProducts = productsToPrint.reduce((acc, product) => {
    if (!acc[product.type]) {
      acc[product.type] = [];
    }
    acc[product.type].push(product);
    return acc;
  }, {});

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Iterate over each product type to create a separate sheet for each
  Object.keys(sortedProducts).forEach((type) => {
    const products = sortedProducts[type];

    // Create a sheet data with headers
    const sheetData = [
      ['Sr. No.', 'Name', 'Price'], // Header row
      ...products.map((product, idx) => [
        idx + 1, // Sr. No.
        product.name || 'N/A', // Product name
        product.price?.toString() || 'N/A', // Price
        // product.description || 'N/A', // Description
      ]),
    ];

    // Create a new worksheet from data
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Add the worksheet to the workbook with the product type as sheet name
    XLSX.utils.book_append_sheet(workbook, worksheet, type);
  });

  // Write the workbook to an Excel file and download it
  XLSX.writeFile(workbook, 'products_receipt.xlsx');
}

// ----------------------------------------------------------
// for Dealer inq
// ----------------------------------------------------------

let dealInq = await getDealerInquiries();
async function showDealInq(page = 1) {
  console.log(dealInq);
  const itemsPerPage = 10;
  const totalItems = dealInq.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // start and end index for the current page
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  console.log(page)

  const dealContainer = document.getElementById('dealContainer');
  dealContainer.innerHTML = ''; // Clear the container before appending new content

  const summaryTable = `
  <div class="admin-dealer-inquiry-summary-table">
    <table>
      <thead>
        <tr>
          <th>Sr. No.</th>
          <th>Dealer's Name</th>
          <th>Company Name</th>
          <th>Dealer's Phone</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${dealInq
      .slice(startIndex, endIndex)
      .map(
        (item, index) => `
          <tr data-deal-id="${item.deal_id}" class="dealer-row">
            <td>${startIndex + index + 1}</td>
            <td>${item.person_name}</td>
            <td>${item.company_name}</td>
            <td>${item.phone}</td>
            <td><i class="fa fa-arrow-right" aria-hidden="true"></i></td>
          </tr>
        `
      )
      .join('')}
      </tbody>
    </table>
  </div>
  `;

  dealContainer.innerHTML = summaryTable;

  const paginationControls = document.createElement('div');
  paginationControls.className = 'pagination-controls';

  if (page > 1) {
    const prevButton = document.createElement('button');
    prevButton.innerHTML =
      '<i class="fa fa-chevron-circle-left" aria-hidden="true"></i>';
    prevButton.onclick = () => showDealInq(page - 1);
    paginationControls.appendChild(prevButton);
  }
  const pagebtn = document.createElement('div');
  pagebtn.innerText = 'Page ' + page + ' of ' + totalPages;
  paginationControls.appendChild(pagebtn);

  if (page < totalPages) {
    const nextButton = document.createElement('button');
    nextButton.innerHTML =
      '<i class="fa fa-chevron-circle-right" aria-hidden="true"></i>';
    nextButton.onclick = () => showDealInq(page + 1);
    paginationControls.appendChild(nextButton);
  }

  dealContainer.appendChild(paginationControls);

  const dealerRows = document.querySelectorAll('.dealer-row');
  dealerRows.forEach((row) => {
    row.addEventListener('click', async () => {
      const dealId = row.getAttribute('data-deal-id');
      await showDealerDetails(dealId, dealInq);
    });
  });

  $('#SearchFormDealer').submit(async (e) => {
    e.preventDefault();
    const dealerInqSearchTerm = document.getElementById('SearchFormDealer').lastElementChild.getElementsByTagName('input')[0].value;
    const dealerInqShowAll = document.getElementById('SearchFormDealer').lastElementChild.getElementsByTagName('button')[1];
    dealInq = await getSearchedDealerInq(dealerInqSearchTerm, dealInq);
    dealerInqShowAll.style.display = 'block'

    showDealInq();
    console.log(dealInq)

    dealerInqShowAll.addEventListener('click', async () => {
      dealInq = await getDealerInquiries();
      document.getElementById('SearchFormDealer').reset();
      dealerInqShowAll.style.display = 'none'
      showDealInq();
    })
  })
}

function getSearchedDealerInq(searchTerm, inq) {
  if (searchTerm === '') {
    const myPopup = new Popup('popup', 'popupOverlay');
    myPopup.show('There is nothing to search for!');
    return inq;
  }

  searchTerm = searchTerm.toLowerCase();

  const filteredInq = inq.filter((i) =>
    i.person_name.toLowerCase().includes(searchTerm)
  );

  console.log(filteredInq);
  return filteredInq;
}

async function showDealerDetails(dealId, dealInq) {
  const dealContainer = document.getElementById('dealContainer');
  dealContainer.innerHTML = ''; // Clear previous content

  const selectedDealInq = dealInq.find((item) => item.deal_id === dealId);
  if (!selectedDealInq) {
    console.error('Dealer inquiry not found');
    return;
  }

  // Create a back button
  const backButton = `<button id="backButton"><i class="fa fa-arrow-left" aria-hidden="true"></i> Back</button>`;

  // Display the details of the selected dealer inquiry
  dealContainer.innerHTML = `
    ${backButton}
    <div class="each-dealer-inquiry">
      <div class="dealer-details">
        <div>
          <p><span>Dealer's name:</span> ${selectedDealInq.person_name}</p> 
          <p><span>Dealer's phone:</span> ${selectedDealInq.phone}</p>
          <p><span>Company's address:</span> ${selectedDealInq.company_address}</p>
        </div>
        <div>
          <p><span>Company's Name:</span> ${selectedDealInq.company_name}</p>
          <p><span>Company's Email:</span> ${selectedDealInq.company_email}</p>  
          <p><span>Company's country:</span> ${selectedDealInq.country}</p>
        </div>
      </div>
      <div class="dealer-inquiry">
        <p><span>Company's business:</span> ${selectedDealInq.business}</p>
        <p><span>Dealer's inquiry:</span> ${selectedDealInq.inquiry}</p>
      </div>
    </div>
  `;

  // Add event listener for the back button
  document.getElementById('backButton').addEventListener('click', () => showDealInq(1));
}

async function makeReceipt(itemId, company) {
  console.log(itemId);
  const itemType = itemId.split('-')[0];
  const id = itemId.split('-')[1];
  let doc;

  if (itemType === 'deal') {
    doc = await getDealerInquiries(id);
    getInquiryPDF(doc[0]);
  } else if (itemType === 'cart') {
    doc = await getCartInquiries(id);
    getCartInquiryPDF(doc, company);
  }
  console.log(doc);
}

async function getInquiryPDF(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Logo URL or base64 data
  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/nsc-project-b2648.firebasestorage.app/o/logo.png?alt=media&token=b4959a79-bd37-4953-a76a-0ab486bf264c';
  const logoWidth = 50; // Adjust as necessary
  const logoHeight = 20; // Adjust as necessary

  // Receipt Data (dynamically fetched)
  const receiptData = {
    businessName: 'Niharika Scientific Center',
    tagline: 'An Authorized Supplier for Science and Music Equipment',
    companyAddress: 'Janakpur, Nepal',
    contact: {
      phone: '9804813946',
      email: 'info@niharka.com',
    },
    inquiryDetails: data,
  };

  // Add logo image to the PDF
  const img = new Image();
  img.src = logoUrl;

  img.onload = function () {
    // Insert logo image at the top
    doc.addImage(img, 'PNG', 20, 10, logoWidth, logoHeight); // Adjust X, Y, width, height accordingly

    // Add header text
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 116, 166); // Dark blue color
    doc.text(receiptData.businessName, 105, 20, null, null, 'center');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0); // Black color
    doc.text(receiptData.tagline, 105, 30, null, null, 'center');

    // Add company address and contact details
    doc.setFontSize(10);
    doc.text(
      `Company Address: ${receiptData.companyAddress}`,
      105,
      40,
      null,
      null,
      'center'
    );
    doc.text(
      `Phone: ${receiptData.contact.phone} | Email: ${receiptData.contact.email}`,
      105,
      50,
      null,
      null,
      'center'
    );

    // Draw a line separator after the header
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0); // Black color
    doc.line(20, 55, 190, 55); // Draw line from (20, 55) to (190, 55)

    // Inquiry details section
    doc.setFontSize(12);

    // Center-align "Receipt for Inquiry"
    doc.text('Receipt for Inquiry', 105, 65, null, null, 'center');

    // Set fixed X coordinates for the key (labels) and the values
    const keyX = 20; // X coordinate for the "key" (label)
    const valueX = 70; // X coordinate for the "value" (data)
    let currentY = 85; // Y coordinate for positioning (starts at 75 and increases)

    doc.setFont('helvetica', 'bold');
    doc.text('Business:', keyX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptData.inquiryDetails.business, valueX, currentY);

    currentY += 10; // Move Y coordinate down for the next line
    doc.setFont('helvetica', 'bold');
    doc.text('Company Name:', keyX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptData.inquiryDetails.company_name, valueX, currentY);

    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Company Address:', keyX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptData.inquiryDetails.company_address, valueX, currentY);

    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Company Email:', keyX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptData.inquiryDetails.company_email, valueX, currentY);

    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Country:', keyX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptData.inquiryDetails.country, valueX, currentY);

    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Deal ID:', keyX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptData.inquiryDetails.deal_id, valueX, currentY);

    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Inquiry:', keyX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptData.inquiryDetails.inquiry, valueX, currentY);

    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Person Name:', keyX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptData.inquiryDetails.person_name, valueX, currentY);

    currentY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Phone:', keyX, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(receiptData.inquiryDetails.phone.toString(), valueX, currentY);

    // Add thank you note
    currentY += 30;
    doc.setFontSize(12);
    doc.text('Thank you for your business!', 105, 170, null, null, 'center');

    // Save the PDF
    doc.save('receipt.pdf');
  };

}

// ----------------------------------------------------------
// for cart inq
// ----------------------------------------------------------

let cartInq = await getCartInquiries();
async function showCartInq(page = 1) {
  const itemsPerPage = 10;
  const totalItems = cartInq.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // start and end index for the current page
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const cartContainer = document.getElementById('cartContainer');
  cartContainer.innerHTML = '';

  const summaryTable = `
  <div class="admin-cart-inquiry-summary-table">
    <table>
      <thead>
        <tr>
          <th>Sr. No.</th>
          <th>Cart ID</th>
          <th>Name</th>
          <th>Created At</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
      ${cartInq.slice(startIndex, endIndex).map(
    (item, index) => `
          <tr data-cart-id="${item.cart_inq_id}" class="cart-row">
            <td>${startIndex + index + 1}</td>
            <td>${item.cart_inq_id}</td>
            <td>${item.first_address.fname1} ${item.first_address.lname1}</td>
            <td>${new Date(item.createdAt.seconds * 1000).toLocaleString()}</td>
            <td><i class="fa fa-arrow-right" aria-hidden="true"></i></td>
          </tr>
        `
  )
      .join('')}
      </tbody>
    </table>
  </div>
  `;

  cartContainer.innerHTML = summaryTable;

  const paginationControls = document.createElement('div');
  paginationControls.className = 'pagination-controls';

  if (page > 1) {
    const prevButton = document.createElement('button');
    prevButton.innerHTML =
      '<i class="fa fa-chevron-circle-left" aria-hidden="true"></i>';
    prevButton.onclick = () => showCartInq(page - 1);
    paginationControls.appendChild(prevButton);
  }
  const pagebtn = document.createElement('div');
  pagebtn.innerText = 'page ' + page + ' of ' + totalPages;
  paginationControls.appendChild(pagebtn);

  if (page < totalPages) {
    const nextButton = document.createElement('button');
    nextButton.innerHTML =
      '<i class="fa fa-chevron-circle-right" aria-hidden="true"></i>';
    nextButton.onclick = () => showCartInq(page + 1);
    paginationControls.appendChild(nextButton);
  }

  cartContainer.appendChild(paginationControls);

  const cartRows = document.querySelectorAll('.cart-row');
  cartRows.forEach((row) => {
    row.addEventListener('click', async () => {
      const cartInqId = row.getAttribute('data-cart-id');
      await showCartDetails(cartInqId, cartInq);
    });
  });


  $('#SearchFormCart').submit(async (e) => {
    e.preventDefault();
    const cartInqSearchTerm = document.getElementById('SearchFormCart').lastElementChild.getElementsByTagName('input')[0].value;
    const cartInqShowAll = document.getElementById('SearchFormCart').lastElementChild.getElementsByTagName('button')[1];
    cartInq = await getSearchedCartInq(cartInqSearchTerm, cartInq);
    cartInqShowAll.style.display = 'block'

    showCartInq();
    console.log(cartInq)

    cartInqShowAll.addEventListener('click', async () => {
      cartInq = await getCartInquiries();
      document.getElementById('SearchFormCart').reset();
      cartInqShowAll.style.display = 'none'
      showCartInq();
    })
  })
}

function getSearchedCartInq(searchTerm, inq) {
  if (searchTerm === '') {
    const myPopup = new Popup('popup', 'popupOverlay');
    myPopup.show('There is nothing to search for!');
    return inq;
  }

  searchTerm = searchTerm.toLowerCase();

  const filteredInq = inq.filter((i) =>
    (i.first_address.fname1 + ' ' + i.first_address.lname1).toLowerCase().includes(searchTerm)
  );

  console.log(filteredInq);
  return filteredInq;
}

async function showCartDetails(cartInqId, cartInq) {
  console.log(cartInq, cartInqId);
  const cartContainer = document.getElementById('cartContainer');
  cartContainer.innerHTML = '';

  const selectedCartInq = cartInq.find(
    (item) => item.cart_inq_id === cartInqId
  );
  if (!selectedCartInq) {
    console.error('Cart inquiry not found');
    return;
  }

  // Fetch the product list for the selected cart
  let productList = await getCart(selectedCartInq.cartId);
  console.log('Product List:', productList);

  const tableProducts = productList
    .map(
      (product) => `
      <tr>
        <td class="cart-item-table-image"><img src=${product.imageUrl} alt="${product.name}" style="width: 50px; height: 50px;"></td>
        <td>${product.name}</td>
        <td>${product.quantity}</td>
        <td>${product.price}</td>
      </tr>
    `
    )
    .join('');

  const backButton = `<button id="backButton"><i class="fa fa-arrow-left" aria-hidden="true"></i> Back</button>`;

  cartContainer.innerHTML = `
    ${backButton}
    <div class="cart-item">
      <div class="cart-item-top">
        <h6>Cart ID: ${selectedCartInq.cart_inq_id}</h6>
        <p style="font-size: 0.7rem;">Created At: ${new Date(
    selectedCartInq.createdAt.seconds * 1000
  ).toLocaleString()}</p>
      </div>
      <div class="cart-item-table">
        <h4>Products:</h4>
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>${tableProducts}</tbody>
        </table>
      </div>
      <div class="cart-item-cust-details">
        <h4>Customer Details:</h4>
        <p><span>Name :</span>${selectedCartInq.first_address.fname1} ${selectedCartInq.first_address.lname1
    }</p>
        <p><span>Email :</span>${selectedCartInq.first_address.email1}</p>
        <p><span>Phone :</span>${selectedCartInq.first_address.phone1}</p>
        <p><span>Address :</span>${selectedCartInq.first_address.address1}, ${selectedCartInq.first_address.city1
    }, ${selectedCartInq.first_address.country1}</p>
        <p><span>Post Code :</span>${selectedCartInq.first_address.post1}</p>
      </div> 
      <div class="cart-item-note">
        <h4>Order Note:&nbsp;&nbsp;&nbsp;&nbsp;</h4>
        <p style="font-size: 0.9rem;">${selectedCartInq.order_note}</p>
      </div>
      <div class="cart-inquiry-button">
        <button id='cart-${selectedCartInq.cart_inq_id
    }' class='dealExcelReceiptBtn'>
          Excel <i class="fa fa-download"></i>
        </button>
        <button id='cart-${selectedCartInq.cart_inq_id}' class='dealReceiptBtn'>
          receipt <i class="fa fa-download"></i>
        </button>
        <div id="companyModal" class="modal2">
          <div class="modal-content2">
            <div> 
              <span class="close2">&times;</span>
              <h2>Select a Company</h2>
            <div>
            <div class="modal-content2-options">
              <select id="companySelect2">
                <option value="neha-sangeet-vigyan-kendra">Neha Sangeet Vigyan Kendra</option>
                <option value="niharika-scientific-center">Niharika Scientific Center</option>
              </select>
            <button class="confirmSelection">Confirm</button>
            <div>
          </div>
        </div>
      </div>
    </div>
  `;

  let modal2 = document.getElementById('companyModal');
  let span2 = document.getElementsByClassName('close2')[0];
  let confirmButton = document.querySelector('.confirmSelection');

  span2.onclick = function () {
    modal2.style.display = 'none';
  };

  window.onclick = function (event) {
    if (event.target == modal2) {
      modal2.style.display = 'none';
    }
  };

  const dealReceiptBtn = document.querySelectorAll('.dealReceiptBtn');
  const dealExcelReceiptBtn = document.querySelectorAll('.dealExcelReceiptBtn');

  dealReceiptBtn.forEach((btn) => {
    btn.addEventListener('click', () => {
      // console.log(btn.id)
      modal2.style.display = 'block';
      confirmButton.onclick = function () {
        let selectedCompany = document
          .getElementById('companySelect2')
          .value.split('-')[0];
        console.log(selectedCompany);
        makeReceipt(btn.id.trim(), selectedCompany);
      };
    });
  });

  dealExcelReceiptBtn.forEach((btn) => {
    btn.addEventListener('click', () => {
      // console.log(btn.id)
      modal2.style.display = 'block';
      confirmButton.onclick = function () {
        let selectedCompany = document
          .getElementById('companySelect2')
          .value.split('-')[0];
        console.log(btn);
        generateCartInqExcel(btn.id, selectedCompany);
      };
    });
  });

  document.getElementById('backButton').addEventListener('click', () => showCartInq());
}

async function fetchImageAsFile(url) {
  // Fetch the image as a blob
  const response = await fetch(url);
  const blob = await response.blob();

  // Convert the blob to a file (name it as you prefer)
  const file = new File([blob], 'logo.png', { type: blob.type });

  return file;
}

async function getCartInquiryPDF(receiptData, company) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  console.log(receiptData, company);

  const {
    cart_id,
    first_address,
    second_address,
    is_address2,
    order_note,
    createdAt,
  } = receiptData[0];

  const products = await getCart(receiptData[0].cartId);
  console.log(products);

  // Correct URL for Firebase storage (ensure it's a public URL)
  // const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/nsc-project-b2648.firebasestorage.app/o/logo.png?alt=media&token=b4959a79-bd37-4953-a76a-0ab486bf264c';
  
  // Get the base64 encoded image from URL
  // const logoImage = await fetchImageAsFile(logoUrl); 

  try {
    // Company Header Section
    // doc.addImage(logoImage, 'PNG', 20, 10, 50, 20); // Adjust X, Y, width, height accordingly

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 116, 166); // Dark blue color
    if (company.toLowerCase() === 'neha') {
      doc.text('Neha Music Science Center', 105, 20, null, null, 'center'); // Business Name
    } else {
      doc.text('Niharika Scientific Center', 105, 20, null, null, 'center'); // Business Name
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0); // Black color
    if (company.toLowerCase() === 'neha') {
      doc.text('Vyayampath Chowk, Janakpurdham', 105, 30, null, null, 'center');
    } else {
      doc.text('(An authorized supplier for science & music equipment)', 105, 30, null, null, 'center');
      doc.text('Kyampas Chowk, Janakpurdham', 105, 35, null, null, 'center');
    }

    // Rest of your PDF generation logic here...
    const leftAlignX = 20;
    const rightAlignX = 150;
    let counterY = 45;

    doc.line(20, counterY, 190, counterY);
    counterY += 7;

    doc.setFontSize(10);
    doc.text(`Invoice No: ${cart_id || '..................'}`, leftAlignX, counterY);
    doc.text(`Date: ${new Date(createdAt.seconds * 1000).toLocaleDateString() || '..................'}`, rightAlignX, counterY);

    counterY += 7;
    doc.text(`Customer Name: ${first_address.fname1 + first_address.lname1 || '..................'}`, leftAlignX, counterY);
    doc.text(`Phone: ${first_address.phone1 || '..................'}`, rightAlignX, counterY);

    counterY += 7;
    doc.text(`Customer Address: ${first_address.address1 || '..................'}`, leftAlignX, counterY);
    doc.text(`Email: ${first_address.email || '..................'}`, rightAlignX, counterY);

    // Add Line for Separation
    counterY += 5;
    doc.line(20, counterY, 190, counterY);

    // Table Header for Products
    counterY += 10;
    doc.text('S.No', 20, counterY);
    doc.text('Name', 40, counterY);
    doc.text('Quantity', 120, counterY);
    doc.text('Unit Price', 140, counterY);
    doc.text('Total Price', 160, counterY);

    counterY += 10;
    products.forEach((product, index) => {
      doc.text(`${index + 1}`, 20, counterY);
      doc.text(`${product.name || '..............'}`, 40, counterY);
      doc.text(`${product.quantity || '........'}`, 120, counterY);
      doc.text(`${product.price || '........'}`, 140, counterY);
      doc.text(`${product.quantity * product.price || '........'}`, 160, counterY);
      counterY += 5;
    });

    // Total Price
    doc.line(20, counterY, 190, counterY);
    counterY += 10;
    doc.setFontSize(12);
    const totalPrice = products.reduce((acc, item) => acc + item.price * item.quantity, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Amount: ${totalPrice || '........'}`, 140, counterY);

    // Order Notes
    if (order_note) {
      counterY += 20;
      doc.text(`Order Note: ${order_note}`, 20, counterY);
    }

    // Signature Area
    counterY += 30;
    doc.text('Authorized Signature', 150, counterY);

    // Save the PDF
    doc.save('receipt.pdf');
  } catch (error) {
    console.error('Error loading image or generating PDF: ', error);
  }
}

async function generateCartInqExcel(inqid, company) {
  const inqData = await getCartInquiries(inqid.split('-')[1]);
  const {
    cartId,
    dateTime,
    first_address,
    order_note,
    second_address,
    is_address2,
  } = inqData[0];
  const products = await getCart(cartId);
  let companyName = '';
  let total = 0;

  products.forEach((p) => (total = total + p.quantity * p.price));
  console.log(total);

  if (company.toLowerCase() == 'neha') {
    companyName = 'Neha Music Science Center';
  } else {
    companyName = 'Niharika Scientific Center';
  }

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Prepare data for a single sheet
  const sheetData = [
    ['Order Summary'],
    ['Cart ID:', cartId || 'N/A'],
    ['Company:', companyName || 'N/A'],
    [], // Blank row for separation

    ['Products'],
    ['Name', 'Quantity', 'Price'], // Header row for products
    ...products.map((product) => [
      product.name || 'N/A',
      product.quantity || 'N/A',
      product.price || 'N/A',
    ]),
    [], // Blank row for separation

    ['', 'Total', total],

    // ['Customer Details'],
    // ['Name:', first_address.fname1 + ' ' + first_address.lname1 || 'N/A'],
    // ['Email:', first_address.email1 || 'N/A'],
    // ['Phone:', first_address.phone1 || 'N/A'],
    // ['Address:', first_address.address1 || 'N/A'],
    // ['Post:', first_address.post1 || 'N/A'],
    // ['City:', first_address.city1 || 'N/A'],
    // ['Country:', first_address.country1 || 'N/A'],
  ];

  // Conditionally add second address if is_address2 is true
  // if (is_address2 && second_address) {
  //   sheetData.push([], ['Secondary Address']);
  //   sheetData.push(
  //     ['Name:', second_address.fname2 + ' ' + second_address.lname2 || 'N/A'],
  //     ['Email:', second_address.email2 || 'N/A'],
  //     ['Phone:', second_address.phone2 || 'N/A'],
  //     ['Address:', second_address.address2 || 'N/A'],
  //     ['Post:', second_address.post2 || 'N/A'],
  //     ['City:', second_address.city2 || 'N/A'],
  //     ['Country:', second_address.country2 || 'N/A']
  //   );
  // }

  // Add the order note at the end
  // sheetData.push([], ['Order Note'], [order_note || 'N/A']);

  // Create a worksheet from the sheetData
  let worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Beautify the sheet by setting styles
  const range = XLSX.utils.decode_range(worksheet['!ref']); // Get the range of the sheet

  // Merging the "Order Summary" and "Company Name" cells
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // Merging "Order Summary" title
    { s: { r: 2, c: 1 }, e: { r: 2, c: 3 } }, // Merging "Company Name"
  ];

  // Apply basic styles (bold headers, colors, alignment)
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      if (!worksheet[cellRef]) continue;

      const cell = worksheet[cellRef];

      // Apply specific styling for headers
      if (R === 0) {
        // "Order Summary" styling
        cell.s = {
          font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } }, // Bold, larger, white text
          alignment: { horizontal: 'center' }, // Center alignment
          fill: { fgColor: { rgb: '4F81BD' } }, // Blue background
        };
      } else if (R === 2) {
        // "Company Name" styling
        cell.s = {
          font: { bold: true, sz: 12 }, // Bold, slightly larger text
          alignment: { horizontal: 'center' }, // Center alignment
        };
      } else if (
        R === 4 ||
        R === 10 ||
        (R === 16 && is_address2) ||
        R === range.e.r
      ) {
        // Section headers: "Products", "Customer Details", "Secondary Address"
        cell.s = {
          font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' } }, // Bold, white text
          alignment: { horizontal: 'left' }, // Left-aligned
          fill: { fgColor: { rgb: '4F81BD' } }, // Blue background
        };
      } else {
        // Apply borders to all cells
        cell.s = {
          alignment: { horizontal: 'left' },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' },
          },
        };
      }
    }
  }

  // Append the sheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cart Inquiry');

  // Write the workbook to an Excel file and download it
  XLSX.writeFile(workbook, `cart_inquiry_${inqid.split('-')[1]}.xlsx`);
}

// ----------------------------------------------------------
// for announcement
// ----------------------------------------------------------

async function getAnnouncement() {
  try {
    const collectionRef = collection(db, 'announcements'); // Reference to the 'announcement' collection
    const snapshot = await getDocs(collectionRef); // Use getDocs to retrieve all documents in the collection

    if (!snapshot.empty) {
      const firstDoc = snapshot.docs[0]; // Access the first document (if available)
      console.log('Announcement data:', firstDoc.data()); // Log the data of the first document
      return firstDoc.data();
    } else {
      console.log('No announcements found.');
    }
    return;
  } catch (error) {
    console.log('Error fetching announcement:', error);
  }
}

// Function to update the first announcement document in the collection
async function updateAnnouncement(newAnn) {
  try {
    // Reference to the 'announcement' collection
    const collectionRef = collection(db, 'announcements');
    const snapshot = await getDocs(collectionRef); // Retrieve all documents in the collection

    if (!snapshot.empty) {
      const firstDoc = snapshot.docs[0]; // Access the first document (if available)
      const docRef = doc(db, 'announcements', firstDoc.id); // Get the document reference by ID

      // Update the document with the new announcement data
      await updateDoc(docRef, { announcement: newAnn });

      showCurrentAnnouncement();
      const inputAnnouncement = document.querySelector('#admin-announcement');
      inputAnnouncement.value = '';
      console.log('Announcement updated successfully.');
    } else {
      console.log('No announcements found to update.');
    }
  } catch (error) {
    console.log('Error updating announcement:', error);
  }
}

async function showCurrentAnnouncement() {
  const currentAnnouncement = document.getElementById('curremtAnnouncement');
  const inputAnnouncement = document.querySelector('#admin-announcement');
  const updateAnnouncementBtn = document.getElementById('updateAnnouncement');
  const currentPassword = document.getElementById('curremtPassword');
  const inputPassword = document.querySelector('#admin-password');
  const updatePasswordBtn = document.getElementById('updatePassword');
  const adminId = localStorage.getItem('admin');

  const curAnn = await getAnnouncement();
  const admin = await getAdmin(adminId);
  console.log(admin)
  currentAnnouncement.innerText = curAnn.announcement;
  currentPassword.innerText = admin.password;

  updateAnnouncementBtn.addEventListener('click', async () => {
    if (inputAnnouncement.value !== '') {
      await updateAnnouncement(inputAnnouncement.value);
      const myPopup = new Popup('popup', 'popupOverlay');
      myPopup.show('Announcement updated successfully!');
    } else {
      const myPopup = new Popup('popup', 'popupOverlay');
      myPopup.show('Enter new announcement.');
      // alert('Enter new annoucement');
    }
  });

  updatePasswordBtn.addEventListener('click', async () => {
    if (inputPassword.value !== '') {
      await updatePassword(inputPassword.value, adminId);
      const myPopup = new Popup('popup', 'popupOverlay');
      myPopup.show('Password changed successfully!');
    }
    else {
      const myPopup = new Popup('popup', 'popupOverlay');
      myPopup.show('Enter new password.');
      // alert('Enter new annoucement');
    }
  });


}

// for admin
async function getAdmin(aid) {
  try {
    console.log(aid);
    const docRef = doc(db, 'admin', aid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log('No such document!');
      return {};
    }
  } catch (error) {
    console.log("Error fetching admin: ", error);
  }
}

async function updatePassword(newPassword, docId) {
  try {
    const docRef = doc(db, 'admin', docId);
    await updateDoc(docRef, {
      password: newPassword
    });
    showCurrentAnnouncement();
    const inputPassword = document.querySelector('#admin-password');
    inputPassword.value = '';
    console.log('Password updated successfully');
  } catch (error) {
    console.error('Error updating password:', error);
  }
}
