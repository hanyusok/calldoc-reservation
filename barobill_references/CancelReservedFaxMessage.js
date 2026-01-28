const soap = require('soap'); // https://www.npmjs.com/package/soap

(async () => {

	const client = await soap.createClientAsync('https://testws.baroservice.com/FAX.asmx?WSDL') // 테스트서버
	// const client = await soap.createClientAsync("https://ws.baroservice.com/FAX.asmx?WSDL") // 운영서버

	// ---------------------------------------------------------------------------------------------------
	// API 레퍼런스 : https://dev.barobill.co.kr/docs/references/팩스전송-API#CancelReservedFaxMessage
	// ---------------------------------------------------------------------------------------------------
	const certKey = ''
	const corpNum = ''
	const sendKey = ''

	const response = await client.CancelReservedFaxMessageAsync({
		CERTKEY: certKey,
		CorpNum: corpNum,
		SendKey: sendKey,
	})

	const result = response[0].CancelReservedFaxMessageResult

	if (result < 0) { // 호출 실패
		console.log(result);
	} else { // 호출 성공
		console.log(result);
	}

})()
