<?php

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$breadName = $conn->real_escape_string($data['bread']);

$getBread = $conn->query("
SELECT bread_id
FROM bread
WHERE bread_name='$breadName'
");

if($getBread->num_rows > 0){

    $row = $getBread->fetch_assoc();

    $bread_id = $row['bread_id'];

    // DELETE SALES
    $conn->query("
    DELETE FROM sales
    WHERE bread_id = $bread_id
    ");

    // DELETE PRODUCTION
    $conn->query("
    DELETE FROM production
    WHERE bread_id = $bread_id
    ");

    // DELETE BREAD
    $conn->query("
    DELETE FROM bread
    WHERE bread_id = $bread_id
    ");

    echo "Deleted successfully";

}else{

    echo "Bread not found";

}

?>