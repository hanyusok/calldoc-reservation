<!DOCTYPE html>
<head>
	<meta http-equiv="Content-Type" content="text/html" charset="EUC-KR" />
	<title>PHP Syntax</title>
</head>

<body>

<?php
	$cpidParameter = $_POST["CPID"];
	echo($cpidParameter);
	
	$ready_array = array (
		'CPID' => $_POST["CPID"],
		'PAYMETHOD' => $_POST["PAYMETHOD"],
		'CANCELREQ' => $_POST["CANCELREQ"]
	);
	
	$request_array = array (
    'CPID' => strval($_POST["CPID"]),
	'TRXID' => strval($_POST["TRXID"]),
	'AMOUNT' => strval($_POST["AMOUNT"]),
	'CANCELREASON' => strval($_POST["CANCELREASON"]),
	'TAXFREEAMT' => strval($_POST["TAXFREEAMT"]),
	'BANKCODE' => strval($_POST["BANKCODE"]),
	'ACCOUNTNO' => strval($_POST["ACCOUNTNO"])
	);
	
	echo($parameter['Authorization']);

	$ready_data = json_encode($ready_array);
	$apiRequest_data = json_encode($request_array);
	
	//$url = 'https://api.kiwoompay.co.kr/pay/ready'; // 운영서버
	$url = 'https://apitest.kiwoompay.co.kr/pay/ready'; // 개발서버
	
	$header_data = array(
		'Content-Type: application/json; charset=EUC-KR',
		"Authorization: " . $_POST["Authorization"]
	);
	
	$ch = curl_init($url);
	curl_setopt_array($ch, array(
		CURLOPT_POST => TRUE,
		CURLOPT_RETURNTRANSFER => TRUE,
		CURLOPT_HTTPHEADER => $header_data,
		CURLOPT_POSTFIELDS => $ready_data,
		CURLOPT_SSL_VERIFYHOST => '0',
		CURLOPT_SSL_VERIFYPEER => '0'
	));

	$response = curl_exec($ch);
	$sResponse = json_decode($response , true);	
	$status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);	
	$error = curl_error($ch);	
	
	curl_close ($ch);

	print_r($sResponse);		
	print_r($status_code);
	print_r($error);
	
	echo($sResponse['RETURNURL']);
	echo($sResponse['TOKEN']);
	
	array_push($header_data, "TOKEN: " . $sResponse['TOKEN']);
	
	$returnUrl = $sResponse['RETURNURL'];
	$ch = curl_init($returnUrl);
	curl_setopt_array($ch, array(
		CURLOPT_POST => TRUE,
		CURLOPT_RETURNTRANSFER => TRUE,
		CURLOPT_HTTPHEADER => $header_data,
		CURLOPT_POSTFIELDS => $apiRequest_data,
		CURLOPT_SSL_VERIFYHOST => '0',
		CURLOPT_SSL_VERIFYPEER => '0'
	));

	$response = curl_exec($ch);
	$sResponse = json_decode($response , true);		
	$status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);	
	$error = curl_error($ch);	

	print_r($sResponse);	
	print_r($status_code);
	print_r($error);
	
	curl_close ($ch);
?>

</body>

</html>