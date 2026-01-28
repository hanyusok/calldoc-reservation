const soap = require('soap'); // https://www.npmjs.com/package/soap

(async () => {

	const client = await soap.createClientAsync('https://testws.baroservice.com/FAX.asmx?WSDL') // 테스트서버
	// const client = await soap.createClientAsync("https://ws.baroservice.com/FAX.asmx?WSDL") // 운영서버

	// ---------------------------------------------------------------------------------------------------
	// API 레퍼런스 : https://dev.barobill.co.kr/docs/references/팩스전송-API#GetFaxMessagesEx2
	// ---------------------------------------------------------------------------------------------------
	const certKey     = ''
	const corpNum     = ''
	const sendKeyList = ['', '', '']

	const response = await client.GetFaxMessagesEx2Async({
		CERTKEY    : certKey,
		CorpNum    : corpNum,
		SendKeyList: {'string': sendKeyList},
	})

	const result = response[0].GetFaxMessagesEx2Result.FaxMessageEx2

	if (result.length === 1 && result[0].SendKey === '' && result[0].SendState < 0) { // 호출 실패
		console.log(result[0].SendState)
	} else { // 호출 성공
		for (const faxMessage of result) {
			// 필드정보는 레퍼런스를 참고해주세요.
			console.log(faxMessage)
		}
	}

})()
