<?php

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$breadName = $conn->real_escape_string($data['bread']);
$qty = (int)$data['qty'];

$bread = $conn->query("
SELECT bread_id, price
FROM bread
WHERE bread_name='$breadName'
")->fetch_assoc();

$bread_id = $bread['bread_id'];
$price = $bread['price'];

$total = $qty * $price;

/* STEP 1: insert sale */
$conn->query("
INSERT INTO sales
(bread_id, sold_qty, total_amount, date)
VALUES
($bread_id, $qty, $total, NOW())
");

/* STEP 2: reduce stock */
$conn->query("
UPDATE production
SET lot_qty = lot_qty - $qty
WHERE bread_id = $bread_id
AND date = CURDATE()
");

echo "Sale processed successfully";

?>