<?php
include "db.php";

/* TOTAL SALES */
$totalSales = $conn->query("
SELECT COALESCE(SUM(total_amount),0) AS total
FROM sales
WHERE DATE(date) = CURDATE()
")->fetch_assoc();

/* TOTAL QUANTITY SOLD */
$totalQty = $conn->query("
SELECT COALESCE(SUM(sold_qty),0) AS total_qty
FROM sales
WHERE DATE(date) = CURDATE()
")->fetch_assoc();

/* TOP SELLING BREAD */
$topBread = $conn->query("
SELECT 
    b.bread_name,
    SUM(s.sold_qty) AS qty
FROM sales s
JOIN bread b ON s.bread_id = b.bread_id
WHERE DATE(s.date) = CURDATE()
GROUP BY s.bread_id
ORDER BY qty DESC
LIMIT 1
")->fetch_assoc();

/* LOW STOCK */
$lowStockLimit = 10;

$lowStockQuery = $conn->query("
SELECT 
    b.bread_name,
    SUM(p.lot_qty) AS stock
FROM production p
JOIN bread b ON p.bread_id = b.bread_id
WHERE DATE(p.date) = CURDATE()
GROUP BY b.bread_id
HAVING stock <= $lowStockLimit
");

$lowStock = [];

while($row = $lowStockQuery->fetch_assoc()){
    $lowStock[] = $row;
}

/* RESPONSE */
echo json_encode([
    "total_sales" => $totalSales["total"],
    "total_qty" => $totalQty["total_qty"],
    "top_bread" => $topBread["bread_name"] ?? "None",
    "top_qty" => $topBread["qty"] ?? 0,
    "low_stock" => $lowStock
]);
?>