<?php

function postToSession($truc)
{
	if (isset($_POST[$truc])) // on vient du formulaire
  {
    $_SESSION[$truc] = htmlspecialchars($_POST[$truc]);
  }
}

function setInitialValues($truc, $machin)
{
if (!isset($_SESSION[$truc]))
  {
    $_SESSION[$truc] = $machin;
  }
}

function phpToJs($truc)
{
?>
<script type="text/javascript">
	var <?php echo $truc; ?> = <?php echo $_SESSION[$truc]; ?>;
</script>
<?php
}

function createTable() {
    //connexion
    $servername = "prise.o2switch.net";
    $dbname = "kaes5648_ilovepuce";
    $username = "kaes5648";
    $password = "J2RHmufjcnpr"; #       vic34blaps

    try // On se connecte à MySQL
    {
      $db = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
          $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    catch (Exception $e) // En cas d'erreur, on affiche un message et on arrête tout
    {
      die('Erreur : ' . $e->getMessage());
    } // Si tout va bien, on peut continuer

    try
    // limit unsigned int = environ 4 milliard
    // limit unsigned smallint 60 000
    {
        $sql = "CREATE TABLE " . $_SESSION["dbName"] . "(
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          rep SMALLINT UNSIGNED,
          tir SMALLINT UNSIGNED,
          car SMALLINT UNSIGNED,
          score TINYINT UNSIGNED,
          dist INT,
          broken BOOL,
          fAlive SMALLINT UNSIGNED,
          stamp INT UNSIGNED
        )";

        // use exec() because no results are returned
        $db->exec($sql);
    }
    catch (Exception $e)
    {
      die('Erreur : ' . $e->getMessage());
    }

    $db = null;
}

