<?php

header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");
    
include "db.php";

$result = $conn->query("
SELECT 
    b.bread_name,
    b.price,
    SUM(p.produced_qty) AS pieces,
    SUM(p.kilos) AS kilos,
    SUM(p.lop_qty) AS lop,
    SUM(p.pull_out) AS purchase,
    SUM(p.lot_qty) AS lot,

    SUM((p.produced_qty + p.lop_qty) - p.pull_out - p.lot_qty) AS sold

    FROM production p
    JOIN bread b ON p.bread_id = b.bread_id
    WHERE DATE(p.date) = CURDATE()
    GROUP BY b.bread_id
");

$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = [
        "breadType" => $row["bread_name"],
        "price" => (float)$row["price"],
        "kilos" => (float)$row["kilos"],
        "pieces" => (int)$row["pieces"],
        "lop" => (int)$row["lop"],
        "purchase" => (int)$row["purchase"],
        "lot" => (int)$row["lot"],
        "sold" => (int)$row["sold"]
    ];
}

echo json_encode($data);
?>