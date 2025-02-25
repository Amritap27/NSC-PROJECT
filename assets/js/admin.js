// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, getDoc, addDoc, setDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// old unpaid
const firebaseConfig = {
  apiKey: "AIzaSyDdBer8FpN4VBvyFaGXuuZWPsgnov7Yb9Q",
  authDomain: "nsc-project-95e23.firebaseapp.com",
  databaseURL: "https://nsc-project-95e23-default-rtdb.firebaseio.com",
  projectId: "nsc-project-95e23",
  storageBucket: "nsc-project-95e23.firebasestorage.app",
  messagingSenderId: "96525728452",
  appId: "1:96525728452:web:018809632318722637e791"
};

// new paid
const firebaseConfig1 = {
  apiKey: "AIzaSyAKg9FA7txJeEegbJQq-FkfBO8Vwy6TbTI",
  authDomain: "nsc-project-b2648.firebaseapp.com",
  projectId: "nsc-project-b2648",
  storageBucket: "nsc-project-b2648.firebasestorage.com",
  messagingSenderId: "208868373512",
  appId: "1:208868373512:web:b4b1c9922dcd9ef8e2cdbd",
  measurementId: "G-7TXJZD0N70"
};

// new unpaid
const firebaseConfig2 = {
  apiKey: "AIzaSyCoPer3AlsOUO2zVmym11TRbsGTwRTe90k",
  authDomain: "fir-8dbaa.firebaseapp.com",
  projectId: "fir-8dbaa",
  storageBucket: "fir-8dbaa.firebasestorage.app",
  messagingSenderId: "362967685119",
  appId: "1:362967685119:web:5d8e2b0814a25ef64cf9ca",
  measurementId: "G-B1KDG3MCP4"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// Initialize Firestore
let db;
try {
  db = getFirestore(app, { experimentalForceLongPolling: true });
} catch (error) {
  console.error(" Firestore initialization error:", error);
}
const storage = getStorage(app);

// // reference to the storage service
// const storage = firebase.storage();

// ----------------------------------------------------------
// open funcitons
// ----------------------------------------------------------



//Fetching all products
async function getAllProducts() {
  console.log('fetching all products')
  let allProducts = []
  try {
    const prodRef = collection(db, "NSC-products");
    const q = query(prodRef);
    const snapshot = await getDocs(q);

    snapshot.forEach(doc => allProducts.push({ ...doc.data(), pid: doc.id }))
    console.log(allProducts)
    return allProducts;
  } catch (error) {
    console.log("Error fetching products: ", error)
  }
}

//fetching cart inquiries
async function getCartInquiries() {
  console.log('fetching cart inquiries')
  let cartInquries = [];
  try {
    let resInq = [];
    const cartInqRef = collection(db, "NSC-cartInquiries");
    const q = query(cartInqRef);
    const snapshot = await getDocs(q);

    snapshot.forEach(doc => resInq.push(doc.data()))
    const carts = await getAllCart();

    resInq.forEach((item) => {
      const cart = carts.filter((c) => c.cartId == item.cart_id)
      cartInquries.push({
        cart: cart,
        ...item
      })
    })

    return cartInquries;
  } catch (error) {
    console.log('Error fetching cart inquries: ', error);
  }
}

// Fetching dealer inquiries
async function getDealerInquiries(id) {
  console.log('Fetching dealer inquiries');
  let dealerInquiries = [];
  try {
    const prodRef = collection(db, "NSC-inquiries");

    let snapshot;
    if (id === undefined) {
      snapshot = await getDocs(query(prodRef));
    } else {
      const docRef = doc(db, "NSC-inquiries", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        dealerInquiries.push({ ...docSnap.data(), deal_id: docSnap.id });
        return dealerInquiries;
      } else {
        console.log("No such document!");
        return [];
      }
    }

    // Process the snapshot for multiple documents
    snapshot.forEach(doc => dealerInquiries.push({ ...doc.data(), deal_id: doc.id }));
    return dealerInquiries;
    
  } catch (error) {
    console.log('Error fetching dealer inquiries: ', error);
  }
}

async function getAllCart() {
  console.log('fetching all carts!!')
  let carts = [];
  try {
    console.log('here')
    const prodRef = collection(db, "carts");
    const q = query(prodRef);
    const snapshot = await getDocs(q);

    snapshot.forEach(doc => carts.push(doc.data()))
    console.log(carts)

    return carts;
  } catch (error) {
    console.log('Error fetching cart:', error)
  }
}

// ----------------------------------------------------------
// for admin page
// ----------------------------------------------------------

// Add product form submision
$(document).ready(function () {
  $("#product-form").submit(async function (e) {
    e.preventDefault();

    let name = $("#productName").val().trim();
    let price = $("#productPrice").val().trim();
    let description = $("#productDesc").val().trim();
    let type = $("#productType").val().trim();
    let imageFile = $("#productImage").val().trim(); // Ensures an image is selected
    // let imageFile = $("#productImage")[0].files;

    // Validate that no fields are empty
    if (!name || !price || !description || !type || !imageFile) {
      alert("All fields are required. Please fill in all fields.");
      return;
    }

    // if (imageFile.length > 1) {
    //   alert("Please select only one image");
    //   return;
    // }

    try {
      // // Step 1: Upload Image to Firebase Storage
      // const storageRef = ref(storage, `product-images/${imageFile.name}`);
      // const uploadTask = await uploadBytes(storageRef, imageFile);

      // // Step 2: Get Image URL
      // const imageUrl = await getDownloadURL(uploadTask.ref);
      // console.log(imageUrl);

      // Step 3: Store Product Data in Firestore
      const docRef = await addDoc(collection(db, "NSC-products"), {
        name: name,
        price: price,
        description: description,
        type: type,
        imageUrl: imageFile, // Store image URL
        createdAt: new Date(),
      });

      alert("Product added successfully! ID: " + docRef.id);
      $("#product-form")[0].reset(); // Reset form
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error adding product!");
    }
  })

  const adminUL = document.getElementById('adminSectionList')
  console.log(adminUL)
  let listItems = [];
  if (adminUL) {
    listItems = [...adminUL.getElementsByTagName("li")];
  }
  // calling respective function on section change
  listItems.forEach(element => {
    element.addEventListener("click", () => {
      if (element.innerText.trim() === "All Products") {
        showProducts();
      } else if (element.innerText.trim() === "Dealer Inquiries/ Contact us") {
        showDealInq();
      } else if (element.innerText.trim() === "Cart Inquiries") {
        showCartInq();
      }
    });
  });
})



// ----------------------------------------------------------
// for frontend
// ----------------------------------------------------------

// ----------------------------------------------------------
// for All Products
// ----------------------------------------------------------

async function showProducts() {
  // getting all products
  const allProducts = await getAllProducts();

  // selecting type from dropdown
  const dropdownUL = document.getElementById('dropdown');

  [...dropdownUL.getElementsByTagName("li")].forEach((element) => {
    element.addEventListener('click', () => {
      const filteredProducts = allProducts.filter((item) => item.type == element.innerText.trim())

      printProducts(filteredProducts, element.innerText.trim());
    })
  })

  const physicsProducts = allProducts.filter((item) => item.type.toLowerCase() == 'Physics Lab Equipment'.toLowerCase())

  printProducts(physicsProducts, 'Physics Lab Equipment')
}

function printProducts(products, type) {
  console.log(products)
  const sectionContainer = document.getElementById('all-products')
  const typeContainer = `
    <div id="physics-lab-section" class="product-category" style='position: relative;'>
      <h2>${type}</h2>
      <div class="product-list-item" id='prodContainer'>
      </div>
    </div>
  `;

  sectionContainer.innerHTML += typeContainer;

  const prodContainer = document.getElementById('prodContainer')
  products.forEach((item) => {
    const productCard = `
      <div class="product-list-content">
      <div class="product-img">
        <img src="" alt="" />
      </div>
      <div class="product-desc">
        <p><span>Name:</span>${item.name}</p>
        <p><span>Price:</span>${item.price}</p>
        <p><span>Type:</span>${item.type}</p>
        <p><span>Description:</span>${item.description}</p>
      </div>
    </div>
    <div class="product-buttons">
      <button pid='${item.pid}'>Edit</button>
      <button pid='${item.pid}'>Delete</button>
    </div>
    `;
    prodContainer.innerHTML += productCard;
  });

  console.log(sectionContainer)
}


// ----------------------------------------------------------
// for Dealer inq
// ----------------------------------------------------------

async function showDealInq() {
  const dealInq = await getDealerInquiries();
  console.log(dealInq)

  const dealContainer = document.getElementById('dealContainer');


  dealInq.forEach((item) => {
    dealContainer.innerHTML += `
    <div>
      <p><span>Deaaler's name:</span>${item.person_name}</p>
      <p><span>Deaaler's inquiry:</span>${item.inquiry}</p>
      <p><span>Deaaler's phone:</span>${item.phone}</p>
      <p><span>Deaaler's company:</span>${item.company_name}</p>
      <p><span>Company's name:</span>${item.company_email}</p>
      <p><span>Company's business:</span>${item.business}</p>
      <p><span>Company's address:</span>${item.company_address}</p>
      <p><span>Company's country:</span>${item.country}</p>

      
      <div>
        <button id='deal-${item.deal_id}' class='dealReceiptBtn'>
          Make receipt
        </button>
      </div>
    </div>
  `
  })

  const dealReceiptBtn = document.querySelectorAll('.dealReceiptBtn')

  dealReceiptBtn.forEach((btn)=>{
    btn.addEventListener('click',()=>{
      // console.log(btn.id)
      makeReceipt(btn.id.trim());
    })
  })
}

async function makeReceipt (itemId){
  const itemType = itemId.split('-')[0];
  const id = itemId.split('-')[1];
  let doc;

  if(itemType === 'deal'){
    doc = await getDealerInquiries(id);
    getInquiryPDF(doc[0])
  }
  else if(itemType === 'cart'){
    doc = await getCartInquiries(id);
    getCartInquiryPDF(doc)

  }
  console.log(doc)

}

async function getInquiryPDF(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Logo URL or base64 data
  const logoUrl = "https://images.unsplash.com/photo-1717328728300-a077e51e7a14?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fE4lMjBzeW1ib2x8ZW58MHx8MHx8fDA%3D"; // Replace with your logo URL
  const logoWidth = 50;  // Adjust as necessary
  const logoHeight = 20; // Adjust as necessary

  // Receipt Data (dynamically fetched)
  const receiptData = {
    businessName: "Niharika Scientific Center",
    tagline: "An Authorized Supplier for Science and Music Equipment",
    companyAddress: "Janakpur, Nepal",
    contact: {
      phone: "9804813946",
      email: "info@niharka.com",
    },
    inquiryDetails: data
  };

  // Add logo image to the PDF
  const img = new Image();
  img.src = logoUrl;

  img.onload = function() {
    // Insert logo image at the top
    // doc.addImage(img, 'PNG', 20, 10, logoWidth, logoHeight); // Adjust X, Y, width, height accordingly

    // Add header text
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 116, 166);  // Dark blue color
    doc.text(receiptData.businessName, 105, 20, null, null, 'center');

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);  // Black color
    doc.text(receiptData.tagline, 105, 30, null, null, 'center');

    // Add company address and contact details
    doc.setFontSize(10);
    doc.text(`Company Address: ${receiptData.companyAddress}`, 105, 40, null, null, 'center');
    doc.text(`Phone: ${receiptData.contact.phone} | Email: ${receiptData.contact.email}`, 105, 50, null, null, 'center');

    // Draw a line separator after the header
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);  // Black color
    doc.line(20, 55, 190, 55);  // Draw line from (20, 55) to (190, 55)

    // Inquiry details section
    doc.setFontSize(12);

    // Center-align "Receipt for Inquiry"
    doc.text("Receipt for Inquiry", 105, 65, null, null, 'center');
    
    // Set fixed X coordinates for the key (labels) and the values
    const keyX = 20;      // X coordinate for the "key" (label)
    const valueX = 70;    // X coordinate for the "value" (data)
    let currentY = 85;    // Y coordinate for positioning (starts at 75 and increases)
    
    doc.setFont("helvetica", "bold");
    doc.text("Business:", keyX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(receiptData.inquiryDetails.business, valueX, currentY);
    
    currentY += 10;  // Move Y coordinate down for the next line
    doc.setFont("helvetica", "bold");
    doc.text("Company Name:", keyX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(receiptData.inquiryDetails.company_name, valueX, currentY);
    
    currentY += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Company Address:", keyX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(receiptData.inquiryDetails.company_address, valueX, currentY);
    
    currentY += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Company Email:", keyX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(receiptData.inquiryDetails.company_email, valueX, currentY);
    
    currentY += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Country:", keyX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(receiptData.inquiryDetails.country, valueX, currentY);
    
    currentY += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Deal ID:", keyX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(receiptData.inquiryDetails.deal_id, valueX, currentY);
    
    currentY += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Inquiry:", keyX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(receiptData.inquiryDetails.inquiry, valueX, currentY);
    
    currentY += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Person Name:", keyX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(receiptData.inquiryDetails.person_name, valueX, currentY);
    
    currentY += 10;
    doc.setFont("helvetica", "bold");
    doc.text("Phone:", keyX, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(receiptData.inquiryDetails.phone.toString(), valueX, currentY);
    
    
    // Add thank you note
    currentY += 30;
    doc.setFontSize(12);
    doc.text("Thank you for your business!", 105, 170, null, null, 'center');

    // Save the PDF
    doc.save('receipt.pdf');
  };

  // Handle image loading errors
  img.onerror = function() {
    alert("Failed to load the logo image.");
  };
}





// ----------------------------------------------------------
// for cart inq
// ----------------------------------------------------------

async function showCartInq() {
  const cartInq = await getCartInquiries();
  console.log(cartInq);

  const cartContainer = document.getElementById('cartContainer');
  cartContainer.innerHTML = ''; // Clear the container before appending new content

  cartInq.forEach((item) => {
    const productList = item.cart[0].products.map(product => `
      <li>
        <img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px;">
        <p>Name: ${product.name}</p>
        <p>Description: ${product.description}</p>
        <p>Price: ${product.price}</p>
      </li>
    `).join('');

    cartContainer.innerHTML += `
      <div class="cart-item">
        <h4>Cart ID: ${item.cart_id}</h2>
        <p>Created At: ${new Date(item.createdAt.seconds * 1000).toLocaleString()}</p>
        <h5>Products:</h5>
        <ul>${productList}</ul>

        <h4>Customer Details:</h4>
        <p>Name: ${item.first_address.fname1} ${item.first_address.lname1}</p>
        <p>Email: ${item.first_address.email1}</p>
        <p>Phone: ${item.first_address.phone1}</p>
        <p>Address: ${item.first_address.address1}, ${item.first_address.city1}, ${item.first_address.country1}</p>
        <p>Post: ${item.first_address.post1}</p>

        <h4>Order Note:</h4>
        <p>${item.order_note}</p>
        <div>
          <button id='cart-${item.deal_id}' class='dealReceiptBtn'>
            Make receipt
          </button>
        </div>
      </div>
      
    `;
  });


  const dealReceiptBtn = document.querySelectorAll('.dealReceiptBtn')

  dealReceiptBtn.forEach((btn)=>{
    btn.addEventListener('click',()=>{
      // console.log(btn.id)
      makeReceipt(btn.id.trim());
    })
  })
}


async function getCartInquiryPDF(receiptData) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // console.log(receiptData[0].cart[0])

  // Example data structure from the second image (replace it with your actual prop data)
  const {cart_id,first_address,second_address , is_address2,order_note,createdAt} = receiptData[0]
  const products = receiptData[0].cart[0].products;



  // Company Header Section
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 116, 166);  // Dark blue color
  doc.text("Neha Music Science Center", 105, 20, null, null, 'center');  // Business Name
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);  // Black color
  doc.text("NEHA SANGIT VIGYAN KENDRA", 105, 28, null, null, 'center');
  doc.text("Vyayampath Chowk, Janakpurdham", 105, 36, null, null, 'center');

  // Fields for Invoice Number, Date, etc.
  const leftAlignX = 20;
  const rightAlignX = 150;
  let counterY = 45;

  doc.line(20, counterY, 190, counterY);
  counterY+=7

  doc.setFontSize(10);
  doc.text(`Invoice No: ${cart_id || '..................'}`, leftAlignX, counterY);
  doc.text(`Date: ${new Date(createdAt.seconds * 1000).toLocaleDateString() || '..................'}`, rightAlignX, counterY);

  // Customer details (First Address)
  counterY+=7
  doc.text(`Customer Name: ${first_address.fname1 + first_address.lname1 || '..................'}`, leftAlignX, counterY);
  doc.text(`Phone: ${first_address.phone1 || '..................'}`, rightAlignX, counterY);
  counterY+=7
  doc.text(`Customer Address: ${first_address.address1 || '..................'}`, leftAlignX, counterY);
  doc.text(`Email: ${first_address.email || '..................'}`, rightAlignX, counterY);
  
  // Add Line for Separation
  counterY+=5
  doc.line(20, counterY, 190, counterY);
  
  // Table Header for Products
  counterY+=10
  doc.text("S.No", 20, counterY);
  doc.text("Description", 40, counterY);
  doc.text("Quantity", 120, counterY);
  doc.text("Unit Price", 140, counterY);
  doc.text("Total Price", 160, counterY);
  
  counterY+=10
  // Table Content - Products List
  products.forEach((product, index) => {
    doc.text(`${index + 1}`, 20, counterY);
    doc.text(`${product.description || '..............'}`, 40, counterY);
    doc.text(`${product.quantity || '........'}`, 120, counterY);
    doc.text(`${product.price || '........'}`, 140, counterY);
    doc.text(`${(product.quantity * product.price) || '........'}`, 160, counterY);
    counterY += 5;
  });
  
  // Total Price
  doc.line(20, counterY, 190, counterY);
  counterY += 10;
  doc.setFontSize(12);
  const totalPrice = products.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Amount: ${totalPrice || '........'}`, 140, counterY);
  doc.setFont("helvetica", "normal");
  counterY += 5;
  doc.line(20, counterY, 190, counterY);
  
  // Add Order Notes if Available
  if (order_note) {
    counterY += 20;
    doc.text(`Order Note: ${order_note}`, 20, counterY);
  }
  
  // Add signature area
  counterY += 30;
  doc.text("Authorized Signature", 150, counterY);
  
  // Save the PDF
  doc.save('receipt.pdf');
}
