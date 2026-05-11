<?php
include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$bread = $conn->real_escape_string($data['breadType']);
$price = (float)$data['price'];
$pieces = (int)$data['pieces'];
$lop = (int)$data['lop'];
$pull = (int)$data['purchase'];
$kilos = (float)$data['kilos'];
$lot = $pieces + $lop;

$check = $conn->query("
SELECT bread_id
FROM bread
WHERE bread_name='$bread'
");

if($check->num_rows > 0){

$row = $check->fetch_assoc();

$bread_id = $row['bread_id'];

$conn->query("
UPDATE bread
SET price='$price'
WHERE bread_id=$bread_id
");

}else{

$conn->query("
INSERT INTO bread (bread_name, price)
VALUES ('$bread', '$price')
");

$bread_id = $conn->insert_id;
}

$conn->query("
INSERT INTO production
(bread_id, date, produced_qty, lop_qty, pull_out, lot_qty, kilos)
VALUES
($bread_id, CURDATE(), $pieces, $lop, $pull, $lot, $kilos)
");

echo "Stock added";
?>