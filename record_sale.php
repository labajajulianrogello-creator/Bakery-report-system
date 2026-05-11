<?php

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$breadName = $conn->real_escape_string($data['bread']);
$qty = (int)$data['qty'];

if($qty <= 0){
    echo "Invalid quantity";
    exit;
}

$breadQuery = $conn->query("
SELECT bread_id, price
FROM bread
WHERE bread_name='$breadName'
");

if($breadQuery->num_rows == 0){
    echo "Bread not found";
    exit;
}

$bread = $breadQuery->fetch_assoc();

$bread_id = $bread['bread_id'];
$price = $bread['price'];

$total = $qty * $price;

$conn->query("
INSERT INTO sales
(bread_id, sold_qty, total_amount, date)
VALUES
($bread_id, $qty, $total, NOW())
");

echo "Sale recorded successfully";

?>