<?php
include "db.php";

$conn->query("DELETE FROM sales");

echo "History cleared";
?>