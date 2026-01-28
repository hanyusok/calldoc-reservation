const soap = require('soap'); // https://www.npmjs.com/package/soap

(async () => {

	const client = await soap.createClientAsync('https://testws.baroservice.com/FAX.asmx?WSDL') // 테스트서버
	// const client = await soap.createClientAsync("https://ws.baroservice.com/FAX.asmx?WSDL") // 운영서버

	// ---------------------------------------------------------------------------------------------------
	// https://dev.barobill.co.kr/docs/guides/바로빌-API-개발준비#FTP 를 참고하여 FTP에 파일을 업로드하신 후 API를 실행해주세요.
	// ---------------------------------------------------------------------------------------------------

	// ---------------------------------------------------------------------------------------------------
	// API 레퍼런스 : https://dev.barobill.co.kr/docs/references/팩스전송-API#SendFaxesFromFTPEx
	// ---------------------------------------------------------------------------------------------------
	const certKey   = ''
	const corpNum   = ''
	const senderId  = ''
	const fileNames = ['', '', '']
	const messages  = [
		{
			SenderNum   : '',
			ReceiverNum : '',
			ReceiveCorp : '',
			ReceiverName: '',
			RefKey      : ''
		},
		{
			SenderNum   : '',
			ReceiverNum : '',
			ReceiveCorp : '',
			ReceiverName: '',
			RefKey      : ''
		}
	]
	const sendDT    = ''

	const response = await client.SendFaxesFromFTPExAsync({
		CERTKEY  : certKey,
		CorpNum  : corpNum,
		SenderID : senderId,
		FileCount: fileNames.length,
		FileNames: {'string': fileNames},
		SendCount: messages.length,
		Messages : {'FaxMessage': messages},
		SendDT   : sendDT,
	})

	const result = response[0].SendFaxesFromFTPExResult.string

	if (/^-[0-9]{5}$/.test(result[0])) { // 호출 실패
		console.log(result[0])
	} else { // 호출 성공
		for (const sendKey of result) {
			console.log(sendKey)
		}
	}

})()
