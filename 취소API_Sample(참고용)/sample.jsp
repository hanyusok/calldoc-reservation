<%@ page language="java" contentType="text/html;charset=euc-kr" pageEncoding="euc-kr"%>
<%@ page import="java.io.*,java.net.*" %>
<%@ page import="org.json.simple.*" %>
<%@ page import="org.json.simple.parser.*" %>


<%!

	public static boolean isEmptyString(String InStr) {
		if (InStr == null || "".equals(InStr.trim()))
			return true;
		else
			return false;
	}

	public static String nullCheck(String InStr) {
		if (isEmptyString(InStr))
			return "";
		else
			return InStr;
	}
	public static String checkObjNull(Object InStr) {
		String str = String.valueOf(InStr);
		if ("null".equals(str))
			return "";
		else
			return str;
	}
%>
<%
	String AUTHKEY			= nullCheck(request.getParameter("AUTHKEY")); 
	String CPID				= nullCheck(request.getParameter("CPID")); 
	String PAYMETHOD		= nullCheck(request.getParameter("PAYMETHOD")); 
	String AMOUNT			= nullCheck(request.getParameter("AMOUNT")); 
	String CANCELREQ		= nullCheck(request.getParameter("CANCELREQ"));
	String TRXID			= nullCheck(request.getParameter("TRXID"));
	String CANCELREASON		= nullCheck(request.getParameter("CANCELREASON"));
	String TAXFREEAMT		= nullCheck(request.getParameter("TAXFREEAMT"));
	
	/* 응답결과 */
	String resultcode  		= "";
	String errormessage		= "";
	String daoutrx			= "";
	String amount			= "";
	String canceldate			= "";
	String cpname			= "";
	String cpurl			= "";
	String cptelno			= "";

	JSONObject jsonObj = new JSONObject();
	jsonObj.put("CPID", CPID);
	jsonObj.put("PAYMETHOD", PAYMETHOD);
	jsonObj.put("AMOUNT",AMOUNT);
	jsonObj.put("CANCELREQ",CANCELREQ);
	jsonObj.put("TRXID",TRXID);
	jsonObj.put("CANCELREASON",CANCELREASON);
	jsonObj.put("TAXFREEAMT",TAXFREEAMT);

	String url = "https://apitest.kiwoompay.co.kr/pay/ready";    //개발서버
	//String url = "https://api.kiwoompay.co.kr/pay/ready";    //운영서버
	URL goUrl = new URL(url);

	HttpURLConnection con = (HttpURLConnection) goUrl.openConnection();
	con.setRequestMethod("POST");
	con.setRequestProperty("Content-Type", "application/json");
	con.setRequestProperty("Authorization", AUTHKEY);
	con.setUseCaches(false);
	con.setDoOutput(true);
	con.setDoInput(true);

	OutputStream os = con.getOutputStream();
	BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(os));
	
	writer.write("");
	os.write((jsonObj.toString()).getBytes("euc-kr"));
	writer.flush();
	writer.close();
	os.close();
	con.connect();

	//호출 결과 값
	int responseCode = con.getResponseCode();
	String responseMsg = con.getResponseMessage();
	
	String token = "";
	String returnUrl = "";
	
	//정상 수신 했을경우 (응답코드:200)
	if(responseCode == 200){
		BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
		String inputLine = null;
		StringBuffer response1 = new StringBuffer();
		
		while((inputLine = in.readLine()) != null){
			response1.append(inputLine);
		}
		
		in.close();
		
		//응답 데이터 처리
		String responseBody = response1.toString();
		JSONObject jObj = (JSONObject)JSONValue.parse(responseBody);
		token = jObj.get("TOKEN").toString();			
		returnUrl = jObj.get("RETURNURL").toString();		
	}
	//disconnect
	con.disconnect();
	
	
	url = returnUrl;
	goUrl = new URL(url);

	con = (HttpURLConnection) goUrl.openConnection();
	con.setRequestMethod("POST");
	con.setRequestProperty("Content-Type", "application/json");
	con.setRequestProperty("Authorization", AUTHKEY);
	con.setRequestProperty("TOKEN", token);//TOKEN
	con.setUseCaches(false);
	con.setDoOutput(true);
	con.setDoInput(true);
	os = con.getOutputStream();
	writer = new BufferedWriter(new OutputStreamWriter(os));
	
	writer.write("");
	os.write((jsonObj.toString()).getBytes("euc-kr"));
	writer.flush();
	writer.close();
	os.close();
	con.connect();

	//호출 결과 값
	responseCode = con.getResponseCode();
	responseMsg = con.getResponseMessage();
	
	//정상 수신 했을경우 (응답코드:200)
	if(responseCode == 200){
		BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
		String inputLine = null;
		StringBuffer response1 = new StringBuffer();
		
		while((inputLine = in.readLine()) != null){
			response1.append(inputLine);
		}
		
		in.close();
		
		//응답 데이터 처리
		String responseBody = response1.toString();
		
		JSONObject jObj = (JSONObject)JSONValue.parse(responseBody);
		resultcode	= checkObjNull(jObj.get("RESULTCODE")).toString();
		errormessage= checkObjNull(jObj.get("ERRORMESSAGE")).toString();

		if(resultcode.equals("0000")){
			daoutrx     = checkObjNull(jObj.get("DAOUTRX")).toString();
			amount      = checkObjNull(jObj.get("AMOUNT")).toString();
			orderno     = checkObjNull(jObj.get("ORDERNO")).toString();
			canceldate    = checkObjNull(jObj.get("CANCELDATE")).toString();
			cpname      = checkObjNull(jObj.get("CPNAME")).toString();
			cpurl       = checkObjNull(jObj.get("CPURL")).toString();
			cptelno     = checkObjNull(jObj.get("CPTELNO")).toString();
		}
	}
	//disconnect
	con.disconnect();
		
		
		    
%>

<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="X-UA-Compatible" content="IE=edge, chrome=1"/>
	<meta http-equiv="Cache-Control" content="no-cache"/> 
	<meta http-equiv="Expires" content="0"/> 
	<meta http-equiv="Pragma" content="no-cache"/>
</head>
 	
<body>
<form name="orderForm">
	<div>
		<div>
			<div>
			<h1>ready단계(결제호출 URL, 토큰)와 과금 단계를 하나의 페이지로 처리하는 예제페이지</h1>
				<div>
					returnUrl	: <input type="text" id="returnUrl"		name="returnUrl"	value="<%=returnUrl%>"/><br> 
					token		: <input type="text" id="token" 		name="token"		value="<%=token%>"/><br> 
					<br>
					resultcode	: <input type="text" id="resultcode"	name="resultcode"	value="<%=resultcode%>"/><br> 
					errormessage: <input type="text" id="errormessage"	name="errormessage"	value="<%=errormessage%>"/><br> 
					daoutrx		: <input type="text" id="daoutrx"		name="daoutrx"		value="<%=daoutrx%>"/><br> 
					amount		: <input type="text" id="amount"		name="amount"		value="<%=amount%>"/><br> 
					orderno		: <input type="text" id="orderno"		name="orderno"		value="<%=orderno%>"/><br> 
					canceldate	: <input type="text" id="canceldate"		name="canceldate"		value="<%=canceldate%>"/><br> 
					cpname		: <input type="text" id="cpname"		name="cpname"		value="<%=cpname%>"/><br> 
					cpurl		: <input type="text" id="cpurl"			name="cpurl"		value="<%=cpurl%>"/><br> 
					cptelno		: <input type="text" id="cptelno"		name="cptelno"		value="<%=cptelno%>"/><br> 
				</div>
				<div id="divbutton" >
					<a href="javascript:self.close();">닫기</a>
				</div>
			</div>
		</div>
		

	</div>
</form>
</body>
</html>