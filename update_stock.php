<?php

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$breadName = $conn->real_escape_string($data['bread']);
$lot = (int)$data['lot'];

$conn->query("
UPDATE production p
JOIN bread b ON p.bread_id = b.bread_id
SET p.lot_qty = $lot
WHERE b.bread_name = '$breadName'
AND p.date = CURDATE()
");

echo "Stock updated";

?>