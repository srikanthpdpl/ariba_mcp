const cds = require('@sap/cds');
const axios = require('axios');
// require('dotenv').config();
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand');
const { en } = require('zod/locales');
const path = require('path');
const fs = require('fs');
const https = require('https');

const { getMaterialReqInputXML } = require('./materialreqxml');
const { getServiceReqInputXML } = require('./servicereqxml');

const env = dotenv.config();
dotenvExpand.expand(env);

const tokenUrl = process.env.OAUTH_URL
const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET

const x_realm = process.env.XREALM
const x_anId = process.env.XANID
const userapikey = process.env.USERAPIKEY
const apikey = process.env.APIKEY

const commoditycodes_url = process.env.COMMODITYCODES_URL
const products_url = process.env.PRODUCTS_URL
const currency_url = process.env.CURRENCY_URL
const companycodes_url = process.env.COMPANYCODES_URL
const suppliers_url = process.env.SUPPLIERS_URL
const costcenters_url = process.env.COSTCENTERS_URL
const wbselement_url = process.env.WBSELEMENT_URL
const generalledgers_url = process.env.GENERALLEDGERS_URL
const uoms_url = process.env.UOMS_URL
const incoterms_url = process.env.INCOTERMS_URL
const purchasegroups_url = process.env.PURCHASEGROUPS_URL
const accounttypes_url = process.env.ACCOUNTTYPES_URL
const accounts_url = process.env.ACCOUNTS_URL
const paymentterms_url = process.env.PAYMENTTERMS_URL
const uom_url = process.env.UOMS_URL
const address_url = process.env.ADDRESS_URL

const contract_url = process.env.CONTRACTS_URL

const users_url = process.env.USERS_URL

const ARIBA_USERNAME = process.env.ARIBA_USERNAME
const ARIBA_PASSWORD = process.env.ARIBA_PASSWORD
const ARIBA_REQUISITION_IMPORT_URL = process.env.ARIBA_REQUISITION_IMPORT_URL

const ARIBA_HOSTNAME = process.env.ARIBA_HOSTNAME
const ARIBA_SOAPPATH = process.env.ARIBA_SOAPPATH

async function getAPIData(apiurl) {
  console.log(apiurl)
  const accessToken = await getAccessToken(); if (!accessToken) {
    throw new Error("Access token is undefined");
  }
  else {
    const response = await axios.get(apiurl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Realm": x_realm,
        apiKey: apikey,
        "Accept-Language": "en"
      }
    });
    return response.data;
  }
}

async function getUser(userID) {
  const apiurl = `${users_url}?filter=emails.value eq "${userID}"`
  console.log(apiurl)
  const accessToken = await getAccessToken();
  console.log(accessToken)
  if (!accessToken) {
    throw new Error("Access token is undefined");
  }
  else {
    const response = await axios.get(apiurl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-anId": x_anId,
        apiKey: userapikey
      }
    });
    return response.data;
  }
}

async function getCompanyCodes(companycode) {
  return await getAPIData(companycodes_url + `?$filter=UniqueName eq '${companycode}'`);
}

async function getSuppliers(supplierId) {
  return await getAPIData(suppliers_url + `?$filter=UniqueName eq '${supplierId}'`);
}

async function getContractIds() {
  return await getAPIData(contract_url);
}
async function getCommodityCodes(commoditycode) {
  return await getAPIData(commoditycodes_url + `?$filter=UniqueName eq '${commoditycode}'`);
}
async function getProducts() {
  return await getAPIData(products_url);
}
async function getCurrency(currencycode) {
  return await getAPIData(currency_url + `?$filter=UniqueName eq '${currencycode}'`);
}

async function getAddress(address,companycode){
  return await getAPIData(address_url + `?$filter=UniqueName eq '${address}' and CompanyCode.UniqueName eq '${companycode}'`)
}

async function getCostCenters(costcenter, companycode) {
  return await getAPIData(costcenters_url + `?$filter=UniqueName eq '${costcenter}' and CompanyCode eq '${companycode}'`);
}
async function getWBSElement(wbselement, companycode) {
  return await getAPIData(wbselement_url + `?$filter=UniqueName eq '${wbselement}' and CompanyCode eq '${companycode}'`);
}
async function getGeneralLedgers(glaccount, companycode) {
  return await getAPIData(generalledgers_url + `?$filter=UniqueName eq '${glaccount}' and CompanyCode eq '${companycode}'`);
}

async function getIncoTerms() {
  return await getAPIData(incoterms_url);
}
async function getPurchaseGroups() {
  return await getAPIData(purchasegroups_url);
}
async function getAccountTypes() {
  return await getAPIData(accounttypes_url);
}
async function getAccounts() {
  return await getAPIData(accounts_url);
}
async function getPaymentTerms() {
  return await getAPIData(paymentterms_url);
}

async function getUOMs(uom) {
  return await getAPIData(uom_url + `?$filter=UniqueName eq '${uom}'`);
}

async function getAccessToken() {

  try {
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: "client_credentials"
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        auth: {
          username: clientId,
          password: clientSecret
        }
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching access token:", {
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
}


async function buildRequisitionImportPullEnvelope(input) {
  console.log(input)
  const regType = input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].ItemCategory.UniqueName

  if (regType.toLowerCase() === 'm') {
    console.log("Material Request")
    return await getMaterialReqInputXML(input)
  }
  else if (regType.toLowerCase() === 'd') {
    console.log("Service Request")
    return await getServiceReqInputXML(input)
  }
  else { return '' }

}


const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

async function buildMTOMMessage(soapBody, filePath, filename, contentType) {
  // Read file content as raw buffer (NOT base64)
  const fileContent = fs.readFileSync(filePath);

  // Build the multipart message
  const parts = [];

  // Part 1: SOAP Envelope (XOP+XML)
  parts.push(
    `--${boundary}\r\n` +
    `Content-Type: application/xop+xml; charset=UTF-8; type="text/xml"\r\n` +
    `Content-Transfer-Encoding: 8bit\r\n` +
    `Content-ID: <rootpart@soapui.org>\r\n` +
    `\r\n` +
    `${soapBody}\r\n`
  );

  // Part 2: File Attachment (binary content)
  parts.push(
    `--${boundary}\r\n` +
    `Content-Type: ${contentType}\r\n` +
    `Content-Transfer-Encoding: binary\r\n` +
    `Content-ID: <${filename}>\r\n` +
    `\r\n`
  );

  // Convert parts to buffer
  const headerBuffer = Buffer.from(parts.join(''), 'utf8');
  const footerBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');

  // Combine all parts: header + file content + footer
  return Buffer.concat([headerBuffer, fileContent, footerBuffer]);
}


/**
 * Send the MTOM SOAP request
 */
async function callAribaRequisitionImportPull(input) {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if file exists
      const filename = 'sample.pdf'
      const contentType = 'application/pdf'
      const filePath = path.resolve(__dirname, './files/' + filename);
      const soapEnvelope = await buildRequisitionImportPullEnvelope(input);
      console.log(soapEnvelope)
      // Build the complete MTOM message
      const messageBody = await buildMTOMMessage(
        soapEnvelope.trim(),
        filePath,
        filename,
        contentType
      );

      // Prepare Basic Auth
      const auth = Buffer.from(`${ARIBA_USERNAME}:${ARIBA_PASSWORD}`).toString('base64');

      // Request options
      const options = {
        hostname: ARIBA_HOSTNAME,
        path: ARIBA_SOAPPATH,
        method: 'POST',
        headers: {
          'Content-Type': `multipart/related; type="application/xop+xml"; start="<rootpart@soapui.org>"; start-info="text/xml"; boundary="${boundary}"`,
          'Content-Length': messageBody.length,
          'Authorization': `Basic ${auth}`,
          'SOAPAction': '', // Add if required by your service
          'Accept': '*/*',
          'User-Agent': 'Node.js MTOM Client'
        }
      };

      console.log('Sending MTOM SOAP Request...');
      console.log('URL:', `https://${options.hostname}${options.path}`);
      console.log('File:', filePath);
      console.log('File size:', fs.statSync(filePath).size, 'bytes');
      console.log('Total message size:', messageBody.length, 'bytes');
      console.log('---');

      // Make the request
      const req = https.request(options, (res) => {
        let data = '';

        console.log('Status Code:', res.statusCode);
        console.log('Headers:', JSON.stringify(res.headers, null, 2));
        console.log('---');

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', async () => {
          console.log('Response received:');
          console.log(data);
          try {
            const result = await parseRequisitionImportPullResponse(data);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        console.error('Error:', error.message);
        reject(error);
      });

      // Write the message body
      req.write(messageBody);
      req.end();
    }
    catch (error) {
      reject(error);
    }
  });
}


// ===== Parse SOAP response (simplified) =====
async function parseRequisitionImportPullResponse(xml) {

  if (xml.includes('<soapenv:Fault>')) {
    const fault = xml.match(/<faultstring>(.*?)<\/faultstring>/s);
    return {
      success: false,
      messages: [fault ? fault[1] : 'Unknown SOAP Fault']
    };
  }

  const reqId = xml.match(/<UniqueName>(.*?)<\/UniqueName>/s);
  const status = xml.match(/<StatusString>(.*?)<\/StatusString>/s);

  if (!reqId) {
    console.log("No Requisition ID")
    return {
      success: false,
      messages: ['Requisition ID not returned by Ariba']
    };
  } else {
    console.log("Requsition ID Generated: ", reqId, reqId[1], status[1])
    return {
      success: true,
      requisitionId: reqId[1],
      status: status ? status[1] : 'Unknown',
      submitted: true,
      messages: ['Purchase Requisition submitted successfully']
    };

  }


}


module.exports = {
  getUser, getContractIds, getCommodityCodes, getIncoTerms, getProducts, getCurrency,
  getCompanyCodes, getSuppliers, getCostCenters, getPurchaseGroups, getAccountTypes,getAddress,
  getWBSElement, getGeneralLedgers, getUOMs, getAccounts, getPaymentTerms, callAribaRequisitionImportPull
};

// (async () => {
//   const token = await getAccessToken();
//   console.log("Access Token:", token);
// })();







/*

function fileToBase64(relativeFilePath) {
  const filePath = path.resolve(__dirname, relativeFilePath);
  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer.toString('base64');
}


// ===== Call Ariba =====
async function callAribaRequisitionImportPull(input) {
  const soapEnvelope = buildRequisitionImportPullEnvelope(input)
  console.log(soapEnvelope)
  const auth = Buffer
    .from(`${ARIBA_USERNAME}:${ARIBA_PASSWORD}`)
    .toString('base64');

  const response = await fetch(ARIBA_REQUISITION_IMPORT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=UTF-8',
      'Authorization': `Basic ${auth}`,
      'SOAPAction': 'RequisitionImportPull'
    },
    body: soapEnvelope
  });

  const responseText = await response.text();
  console.log(responseText)
  if (!response.ok) {
    throw new Error(
      `Ariba SOAP HTTP ${response.status}\n${responseText}`
    );
  } else {
    return parseRequisitionImportPullResponse(responseText)
  }

  //   return responseText;
}

*/



/*
const FormData = require('form-data');
const crypto = require('crypto');

async function callAribaRequisitionImportPull(input) {
    const auth = Buffer.from(`${ARIBA_USERNAME}:${ARIBA_PASSWORD}`).toString('base64');
    
    // 1. Generate a unique Boundary and Content-ID
    const boundary = "MIMEBoundary_" + crypto.randomBytes(16).toString('hex');
    // console.log(boundary)
    // const contentId = "sample.pdf";
    const contentId = "sample.pdf";
    
    // 2. Build the MTOM-compliant XML Envelope
    // NOTICE: We replace the Base64 string with an <xop:Include> reference
    const soapEnvelope = buildRequisitionImportPullEnvelope(input).trim();

    // 3. Construct the Multipart Body manually or via FormData
    const filePath = path.resolve(__dirname, './files/sample.pdf');
    const fileBuffer = fs.readFileSync(filePath);

    // This is the raw HTTP body construction for MTOM
    let body = `--${boundary}\r\n`;
    body += `Content-Type: application/xop+xml; charset=UTF-8; type="text/xml"\r\n`;
    body += `Content-Transfer-Encoding: 8bit\r\n`;
    body += `Content-ID: <root.message@cxf.apache.org>\r\n\r\n`;
    body += soapEnvelope + `\r\n`;
    body += `--${boundary}\r\n`;
    body += `Content-Type: application/pdf; name="sample.pdf"\r\n`;
    body += `Content-Transfer-Encoding: binary\r\n`;
    body += `Content-ID: <${contentId}>\r\n\r\n`;
    body += `Content-Disposition: attachment; name="sample.pdf"; filename="sample.pdf"\r\n\r\n`
    
    const footer = `\r\n--${boundary}--`;

    // const finalBody = Buffer.concat([Buffer.from(body), fileBuffer, Buffer.from(footer)]);
    const finalBody = body + `\r\n\r\n` + fileBuffer.toString('base64'); + footer

    console.log(finalBody)

    // const base64Content = fileToBase64('./files/sample.pdf'); ///need to remove 
    // console.log(body, '\r\n\n', base64Content, '\r\n\n', footer )
    const response = await fetch(ARIBA_REQUISITION_IMPORT_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': `multipart/related; boundary="${boundary}"; type="application/xop+xml"; start="<root.message@cxf.apache.org>"; start-info="text/xml"`,
            'SOAPAction': '/Process Definition'
        },
        body: finalBody
    });

  const responseText = await response.text();
  console.log(responseText)
  if (!response.ok) {
    throw new Error(
      `Ariba SOAP HTTP ${response.status}\n${responseText}`
    );
  } else {
    return parseRequisitionImportPullResponse(responseText)
  }
    // ... rest of your parsing logic
}
*/
