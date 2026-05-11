<?php

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

foreach ($data as $b) {

    $breadName = $conn->real_escape_string($b['breadType']);

    $price = (float)$b['price'];

    $kilos = (float)$b['kilos'];

    $pieces = (int)$b['pieces'];

    $lop = (int)$b['lop'];

    $pull = (int)$b['purchase'];

    $lot = (int)$b['lot'];

    // CHECK BREAD
    $check = $conn->query("
    SELECT bread_id
    FROM bread
    WHERE bread_name='$breadName'
    ");

    if ($check->num_rows > 0) {

        $row = $check->fetch_assoc();

        $bread_id = $row['bread_id'];

        // UPDATE PRICE
        $conn->query("
        UPDATE bread
        SET price='$price'
        WHERE bread_id=$bread_id
        ");

    } else {

        $conn->query("
        INSERT INTO bread (bread_name, price)
        VALUES ('$breadName', '$price')
        ");

        $bread_id = $conn->insert_id;
    }

    // UPDATE PRODUCTION
    $checkProduction = $conn->query("
    SELECT *
    FROM production
    WHERE bread_id = $bread_id
    AND date = CURDATE()
    ");

    if($checkProduction->num_rows > 0){

        $conn->query("
        UPDATE production
        SET
            produced_qty = $pieces,
            lop_qty = $lop,
            pull_out = $pull,
            lot_qty = $lot,
            kilos = $kilos
        WHERE bread_id = $bread_id
        AND date = CURDATE()
        ");

    } else {

        $conn->query("
        INSERT INTO production
        (bread_id, date, produced_qty, lop_qty, pull_out, lot_qty, kilos)
        VALUES
        ($bread_id, CURDATE(), $pieces, $lop, $pull, $lot, $kilos)
        ");

    }

}

echo "Saved successfully";

?>