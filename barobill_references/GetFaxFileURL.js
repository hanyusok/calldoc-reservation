const soap = require('soap'); // https://www.npmjs.com/package/soap

(async () => {

	const client = await soap.createClientAsync('https://testws.baroservice.com/FAX.asmx?WSDL') // 테스트서버
	// const client = await soap.createClientAsync("https://ws.baroservice.com/FAX.asmx?WSDL") // 운영서버

	// ---------------------------------------------------------------------------------------------------
	// API 레퍼런스 : https://dev.barobill.co.kr/docs/references/팩스전송-API#GetFaxFileURL
	// ---------------------------------------------------------------------------------------------------
	const certKey  = ''
	const corpNum  = ''
	const sendKey  = ''
	const fileType = 1

	const response = await client.GetFaxFileURLAsync({
		CERTKEY : certKey,
		CorpNum : corpNum,
		SendKey : sendKey,
		FileType: fileType,
	})

	const result = response[0].GetFaxFileURLResult.string

	if (/^-[0-9]{5}$/.test(result[0])) { // 호출 실패
		console.log(result[0])
	} else { // 호출 성공
		for (const url of result) {
			console.log(url)
		}
	}

})()
