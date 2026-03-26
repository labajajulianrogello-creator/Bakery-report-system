let breads = [];
let salesHistory = []; 

const tableBody = document.querySelector("#reportTable tbody");
const lastSaved = document.getElementById("lastSaved");

function saveData(){
    localStorage.setItem("bakeryData", JSON.stringify(breads));
    lastSaved.innerText = "Last saved: " + new Date().toLocaleString();
}

function checkNewDay(){
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem("bakeryDate");
    if(savedDate !== today){
        localStorage.removeItem("bakeryData");
        localStorage.setItem("bakeryDate", today);
        breads = [];
    }
}

function loadData(){
    checkNewDay();
    const data = localStorage.getItem("bakeryData");
    if(data){
        breads = JSON.parse(data);
        updateDropdown();
        renderTable();
    }
}
window.onload = loadData;

function addBreadStock(){
    const breadType = document.getElementById("breadType").value.trim();
    const pieces = Number(document.getElementById("pieces").value) || 0;
    const price = Number(document.getElementById("price").value) || 0;
    const kilos = Number(document.getElementById("kilos").value) || 0;
    const purchase = Number(document.getElementById("purchase").value) || 0;
    const lop = Number(document.getElementById("lop").value) || 0;

    if(!breadType){
        alert("Enter bread name!");
        return;
    }

    breads.push({
    breadType,
    pieces,
    price,
    kilos,
    purchase,
    lop,
    lot: pieces, 
});

    saveData();
    updateDropdown();
    renderTable();

    document.querySelectorAll("input").forEach(i => i.value = "");
}

function updateDropdown(){
    const select = document.getElementById("saleBread");
    select.innerHTML="";
    breads.forEach(b=>{
        const option=document.createElement("option");
        option.value=b.breadType;
        option.textContent=b.breadType;
        select.appendChild(option);
    });
}

function recordSale(){
    const breadName = document.getElementById("saleBread").value;
    const qty = Number(document.getElementById("saleQty").value);

    const bread = breads.find(b => b.breadType === breadName);

    if(!bread || qty <= 0){
        alert("Enter valid quantity!");
        return;
    }

    const availableStock = bread.lot + bread.lop - bread.purchase;

    if(qty > availableStock){
        alert("Not enough stock!");
        return;
    }

    if(bread.lot >= qty){
        bread.lot -= qty;
    } else {
        const remaining = qty - bread.lot;
        bread.lot = 0;
        bread.lop -= remaining;
    }

    saveData();
    renderTable();

    document.getElementById("saleQty").value = "";
}

function renderTable(){
    tableBody.innerHTML="";
    let totalSoldAmount = 0;

    breads.forEach((b,index)=>{
       const pieces = b.pieces || 0;
const lop = b.lop || 0;
const purchase = b.purchase || 0;
const price = b.price || 0;
const lot = b.lot || 0; 

const sold = pieces + lop - purchase - lot;

const piecesAmount = pieces * price;
const lopAmount = lop * price;
const pullOutAmount = purchase * price;
const lotAmount = lot * price;

const soldAmount = sold * price;

totalSoldAmount += soldAmount;

        const row = document.createElement("tr");
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
<td>${lot}</td>              <!-- L.O.T -->
<td>${lotAmount}</td>        <!-- L.O.T Amount -->
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
<td colspan="12" style="text-align:right;">Total Sold Amount:</td>
<td colspan="2">${totalSoldAmount}</td>
`;
    tableBody.appendChild(totalRow);
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

// SAVE EDIT
function saveEdit(index){
    const row = tableBody.rows[index];
    breads[index].breadType=row.cells[0].innerText;
    breads[index].kilos=Number(row.cells[1].innerText)||0;
    breads[index].price=Number(row.cells[2].innerText)||0;
    breads[index].pieces=Number(row.cells[3].innerText)||0;
    breads[index].lop=Number(row.cells[5].innerText)||0;
    breads[index].purchase=Number(row.cells[7].innerText)||0;
    breads[index].sold=Number(row.cells[11].innerText)||0;
    saveData();
    updateDropdown();
    renderTable();
}

function deleteRow(index){
    if(confirm("Delete this?")){
        breads.splice(index,1);
        saveData();
        updateDropdown();
        renderTable();
    }
}

function finishDay(){
    if(confirm("Download report?")){
        downloadCSV();
    }
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

        const sold = pieces + lop - purchase - lot;

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