const soap = require('soap'); // https://www.npmjs.com/package/soap

(async () => {

	const client = await soap.createClientAsync('https://testws.baroservice.com/FAX.asmx?WSDL') // 테스트서버
	// const client = await soap.createClientAsync("https://ws.baroservice.com/FAX.asmx?WSDL") // 운영서버

	// ---------------------------------------------------------------------------------------------------
	// https://dev.barobill.co.kr/docs/guides/바로빌-API-개발준비#FTP 를 참고하여 FTP에 파일을 업로드하신 후 API를 실행해주세요.
	// ---------------------------------------------------------------------------------------------------

	// ---------------------------------------------------------------------------------------------------
	// API 레퍼런스 : https://dev.barobill.co.kr/docs/references/팩스전송-API#SendFaxFromFTP
	// ---------------------------------------------------------------------------------------------------
	const certKey     = ''
	const corpNum     = ''
	const senderId    = ''
	const fileName    = ''
	const fromNumber  = ''
	const toNumber    = ''
	const receiveCorp = ''
	const receiveName = ''
	const sendDT      = ''
	const refKey      = ''

	const response = await client.SendFaxFromFTPAsync({
		CERTKEY    : certKey,
		CorpNum    : corpNum,
		SenderID   : senderId,
		FileName   : fileName,
		FromNumber : fromNumber,
		ToNumber   : toNumber,
		ReceiveCorp: receiveCorp,
		ReceiveName: receiveName,
		SendDT     : sendDT,
		RefKey     : refKey,
	})

	const result = response[0].SendFaxFromFTPResult

	if (/^-[0-9]{5}$/.test(result)) { // 호출 실패
		console.log(result);
	} else { // 호출 성공
		console.log(result);
	}

})()
