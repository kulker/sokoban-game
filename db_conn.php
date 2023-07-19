<?php 
$mysqli = new mysqli("localhost", "admin2", "3230972", $dbname="depocu");

if (mysqli_connect_errno()) {
    printf("Connect failed: %s\n", mysqli_connect_error());
    exit();
}
