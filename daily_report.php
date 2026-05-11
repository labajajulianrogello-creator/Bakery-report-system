<?php
include "db.php";

$date = isset($_GET['date']) ? $_GET['date'] : date("Y-m-d");

$sql = "
SELECT 
    b.bread_name,
    b.price,
    SUM(s.sold_qty) AS total_sold,
    SUM(s.total_amount) AS total_amount
FROM sales s
JOIN bread b ON s.bread_id = b.bread_id
WHERE DATE(s.date) = '$date'
GROUP BY b.bread_id
ORDER BY b.bread_name ASC
";

$result = $conn->query($sql);

$data = [];

while($row = $result->fetch_assoc()){
    $data[] = $row;
}

echo json_encode($data);
?>