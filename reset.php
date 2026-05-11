<?php
include "db.php";

$conn->query("DELETE FROM sales");
$conn->query("DELETE FROM production");
$conn->query("DELETE FROM bread");

echo "System reset complete";
?>  