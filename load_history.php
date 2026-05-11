<?php
include "db.php";

$sql = "
SELECT 
    s.date,
    b.bread_name,
    s.sold_qty,
    s.total_amount
FROM sales s
JOIN bread b ON s.bread_id = b.bread_id
ORDER BY s.date DESC
";

$result = $conn->query($sql);

$data = [];

while($row = $result->fetch_assoc()){
    $data[] = $row;
}

echo json_encode($data);
?>