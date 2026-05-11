    let breads = [];

    const tableBody = document.getElementById("reportTableTop");
    const lastSaved = document.getElementById("lastSaved");

    function loadData(){

    fetch("load.php")

    .then(res => res.json())
    .then(data => {

    breads = data;
    updateDropdown();
    renderTable();
    renderHistory();

})

.catch(error => {

    console.error("Load error:", error);

});

}
    window.onload = function(){
    loadData();
    loadDashboardStats();
};

    function addBreadStock(){

    const breadType =
    document.getElementById("breadType").value.trim();
    const pieces =
    Number(document.getElementById("pieces").value) || 0;
    const price =
    Number(document.getElementById("price").value) || 0;
    const kilos =
    Number(document.getElementById("kilos").value) || 0;
    const purchase =
    Number(document.getElementById("purchase").value) || 0;
    const lop =
    Number(document.getElementById("lop").value) || 0;

    if(!breadType){
    alert("Enter bread name!");
    return;
}

    fetch("add_stock.php", {

    method: "POST",

    headers:{
    "Content-Type":"application/json"
},

    body: JSON.stringify({

    breadType,
    pieces,
    price,
    kilos,
    purchase,
    lop

    })

    })
    .then(res => res.text())
    .then(msg => {

    alert(msg);

    loadData();

    document.querySelectorAll("input").forEach(i=>i.value="");

    });

}

    function updateDropdown(){

    const select = document.getElementById("saleBread");
    const currentValue = select.value; 
    select.innerHTML = "";

    breads.forEach(b=>{
        const option = document.createElement("option");
        option.value = b.breadType;
        option.textContent = b.breadType;
        select.appendChild(option);
    });

    select.value = currentValue;

}

    function recordSale(){

    const breadName =
    document.getElementById("saleBread").value;

    const qty =
    Number(document.getElementById("saleQty").value);

    if(!breadName || qty <= 0){
    alert("Invalid input");
    return;
}

    fetch("process_sale.php", {
    method: "POST",
    headers: {
    "Content-Type": "application/json"
},
    body: JSON.stringify({
    bread: breadName,
    qty: qty
    })
})
    .then(res => res.text())
    .then(msg => {

    console.log(msg);

    loadData(); 
    loadDashboardStats();

    document.getElementById("saleQty").value = "";

})
    .catch(err => {
    console.error(err);
    alert("Error processing sale");
    });

}

    function renderTable(){

    let dashboardSales = 0;
    let dashboardSold = 0;
    let dashboardRemaining = 0;
    let dashboardPullouts = 0;

    tableBody.innerHTML = "";

    let totalSoldAmount = 0;

    breads.forEach((b,index)=>{

        const pieces = b.pieces || 0;
        const lop = b.lop || 0;
        const purchase = b.purchase || 0;
        const price = b.price || 0;
        const lot = b.lot || 0;

        const sold = b.sold || 0; 

        const piecesAmount = pieces * price;
        const lopAmount = lop * price;
        const pullOutAmount = purchase * price;
        const lotAmount = lot * price;

        const soldAmount = sold * price;

        dashboardSales += soldAmount;
        dashboardSold += sold;
        dashboardRemaining += lot;
        dashboardPullouts += purchase;

        totalSoldAmount += soldAmount;

        const row = document.createElement("tr");

            const lowStockLimit =
            Number(localStorage.getItem("lowStockAlert")) || 10;
            const currentLot = Number(b.lot) || 0;
            if(currentLot <= lowStockLimit){
            row.classList.add("lowstock");

}

        row.innerHTML = `
        <td>${b.breadType}</td>
        <td>${b.kilos}</td>
        <td>${price}</td>
        <td>${pieces}</td>
        <td>${piecesAmount}</td>
        <td>${lop}</td>
        <td>${lopAmount}</td>
        <td>${purchase}</td>
        <td>${pullOutAmount}</td>
        <td>${lot}</td>
        <td>${lotAmount}</td>
        <td>${sold}</td>
        <td>${soldAmount}</td>
        <td>
        <button onclick="editRow(${index})">Edit</button>
        <button onclick="deleteRow(${index})">Delete</button>
        </td>
        `;

        tableBody.appendChild(row);

    });

    const totalRow = document.createElement("tr");

    totalRow.innerHTML = `
    <td colspan="12" style="text-align:right;">
    Total Sold Amount:
    </td>

    <td colspan="2">
    ${totalSoldAmount}
    </td>
    `;

    tableBody.appendChild(totalRow);

    document.getElementById("totalBreadSold").innerText =
    dashboardSold + " pcs";

    document.getElementById("remainingStock").innerText =
    dashboardRemaining + " pcs";

    document.getElementById("pullOuts").innerText =
    dashboardPullouts + " pcs";

}

function renderHistory(){

fetch("load_history.php")
.then(res => res.json())
.then(data => {

const search =
document.getElementById("historySearch").value.toLowerCase();

const historyTable =
document.getElementById("historyTable");

historyTable.innerHTML = "";

data
.filter(sale =>
(sale.bread_name || "").toLowerCase().includes(search)
)
.forEach(sale => {

const row = document.createElement("tr");

row.innerHTML = `
<td>${sale.date}</td>
<td>${sale.bread_name}</td>
<td>${sale.sold_qty}</td>
<td>₱${sale.total_amount}</td>
`;

historyTable.appendChild(row);

});

});

}

    // EDIT ROW
    function editRow(index){
        const row = tableBody.rows[index];
        const editable=[0,1,2,3,5,7];
        editable.forEach(i=>{
            row.cells[i].contentEditable=true;
            row.cells[i].style.background="#fff3cd";
        });
        row.cells[13].innerHTML=`
    <button onclick="saveEdit(${index})">Save</button>
    <button onclick="renderTable()">Cancel</button>
    `;
    }

    function saveEdit(index){

    const row = tableBody.rows[index];

    breads[index].breadType =
    row.cells[0].innerText;

    breads[index].kilos =
    Number(row.cells[1].innerText) || 0;

    breads[index].price =
    Number(row.cells[2].innerText) || 0;

    breads[index].pieces =
    Number(row.cells[3].innerText) || 0;

    breads[index].lop =
    Number(row.cells[5].innerText) || 0;

    breads[index].purchase =
    Number(row.cells[7].innerText) || 0;

    // RECALCULATE LOT
    breads[index].lot =
    breads[index].pieces +
    breads[index].lop -
    breads[index].purchase -
    breads[index].sold;

    saveData();

    updateDropdown();

    renderTable();

}

    function deleteRow(index){

        if(confirm("Delete this bread permanently?")){

        const breadName = breads[index].breadType;

        fetch("delete.php", {

        method: "POST",

        headers:{
        "Content-Type":"application/json"
        },

        body: JSON.stringify({
        bread: breadName
        })

    })

        .then(res => res.text())

        .then(msg => {

        alert(msg);

        // CLEAR OLD ARRAY
        breads = [];

        // RELOAD FROM DATABASE
        loadData();

        })

        .catch(err => {

        console.error(err);

        alert("Delete failed");

        });

    }

}

    function saveData(){

    fetch("save.php", {
    method: "POST",
    headers:{
    "Content-Type":"application/json"
},

    body: JSON.stringify(breads)

})

    .then(res => res.text())
    .then(msg => {
    console.log(msg);
    loadData();

})

    .catch(err => {
    console.error(err);
    alert("Failed to save");

});

}

    function printReport(){
        window.print();
    }

    function downloadCSV(){
        let csv = "Bread,Kilos,Price,Pieces,Pieces Amount,L.O.P,L.O.P Amount,Pull Out,Pull Out Amount,L.O.T,L.O.T Amount,Sold,Sold Amount\n";
        let total = 0;

        breads.forEach(b => {
            const pieces = b.pieces || 0;
            const price = b.price || 0;
            const lop = b.lop || 0;
            const purchase = b.purchase || 0;
            const lot = b.lot || 0; 

            const sold = b.sold || 0;

            const piecesAmount = pieces * price;
            const lopAmount = lop * price;
            const pullOutAmount = purchase * price;
            const lotAmount = lot * price;

            const soldAmount = sold * price;

            total += soldAmount;

            csv += `${b.breadType || 0},${b.kilos || 0},${price},${pieces},${piecesAmount},${lop},${lopAmount},${purchase},${pullOutAmount},${lot},${lotAmount},${sold},${soldAmount}\n`;
        });

        csv += `,,,,,,,,,,,Total,${total}`;

        const blob = new Blob([csv], {type:"text/csv"});
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Bakery_Report.csv";
        link.click();
    }

    function quickAdd(num){

        const qtyInput = document.getElementById("saleQty");

        qtyInput.value = Number(qtyInput.value || 0) + num;

    }   

    function showPage(pageId, element){

document.querySelectorAll(".page").forEach(page=>{
page.style.display = "none";
});

document.getElementById(pageId).style.display = "block";

document.querySelectorAll(".menu-item").forEach(item=>{
item.classList.remove("active");
});

element.classList.add("active");

document.getElementById("pageTitle").innerText =
element.innerText;

document.querySelector(".sidebar").classList.remove("show");

if(window.innerWidth <= 1000){
document.querySelector(".menu-toggle").style.display = "block";
}

}

    // ===== THEME =====

function setTheme(mode){

if(mode === "dark"){
document.body.classList.add("dark-mode");
localStorage.setItem("theme","dark");
}else{
document.body.classList.remove("dark-mode");
localStorage.setItem("theme","light");
}

}

// LOAD THEME

window.addEventListener("load",()=>{

const savedTheme = localStorage.getItem("theme");

if(savedTheme === "dark"){
document.body.classList.add("dark-mode");
}

});

// ===== SAVE BAKERY INFO =====

function saveBakeryInfo(){

const bakeryName =
document.getElementById("bakeryName").value;

const ownerName =
document.getElementById("ownerName").value;

const contactNumber =
document.getElementById("contactNumber").value;

localStorage.setItem("bakeryName", bakeryName);
localStorage.setItem("ownerName", ownerName);
localStorage.setItem("contactNumber", contactNumber);

alert("Bakery information saved!");

}

// ===== SAVE LOW STOCK =====

function saveLowStock(){

const lowStock =
document.getElementById("lowStockAlert").value;

localStorage.setItem("lowStockAlert", lowStock);

alert("Low stock alert saved!");

}

// ===== CLEAR HISTORY =====

function clearHistory(){

if(confirm("Clear all history?")){

fetch("clear_history.php")
.then(res => res.text())
.then(msg => {

alert(msg);

renderHistory();

});

}

}

// ===== RESET SYSTEM =====

function resetSystem(){

if(confirm("Reset entire system?")){

fetch("reset.php")
.then(res => res.text())
.then(msg => {

alert(msg);

breads = [];

renderTable();

renderHistory();

});

}

}

function toggleSidebar(){

const sidebar = document.querySelector(".sidebar");
const button = document.querySelector(".menu-toggle");

sidebar.classList.toggle("show");

// MOBILE ONLY
if(window.innerWidth <= 1000){

if(sidebar.classList.contains("show")){
button.style.display = "none";
}else{
button.style.display = "block";
}

}

}

function loadDashboardStats(){

fetch("dashboard_stats.php")
.then(res => res.json())
.then(data => {

    // Revenue
    document.getElementById("todaySales").innerText =
    "₱" + data.total_sales;

    // Top bread
    document.getElementById("topBread").innerText =
    data.top_bread;

    document.getElementById("topQty").innerText =
    data.top_qty + " pcs";

    document.getElementById("lowStockCount").innerText =
    data.low_stock.length + " items";

    // Low stock list
    const list = document.getElementById("lowStockList");
    list.innerHTML = "";

    if(data.low_stock.length === 0){
        list.innerHTML = "<li>All stocks are sufficient</li>";
    } else {
        data.low_stock.forEach(item => {
            const li = document.createElement("li");
            li.innerText = `${item.bread_name} - ${item.stock} pcs left`;
            list.appendChild(li);
        });
    }

});

}

setInterval(() => {

    loadData();
    loadDashboardStats();
}, 3000);