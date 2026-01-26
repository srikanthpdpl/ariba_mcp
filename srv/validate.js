const cds = require('@sap/cds');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');


// validate.js

// ---------- Hardcoded data ----------
const allowedRequesterEmails = [
  "harish.yarra@aarini.com",
  "akulapoornasasank@gmail.com"
];

const allowedProducts = [
  "Laptop",
  "Desktop",
  "Monitor",
  "Keyboard",
  "Mouse",
  "Printer",
  "Scanner",
  "Router",
  "Switch",
  "UPS"
];

const productQuantityMap = {
  Laptop: 10,
  Desktop: 8,
  Monitor: 25,
  Keyboard: 100,
  Mouse: 150,
  Printer: 5,
  Scanner: 7,
  Router: 12,
  Switch: 20,
  UPS: 6
};

const allowedCurrencies = ["USD", "INR"];
const allowedSuppliers = ["SUPP_1001", "SUPP_1002", "SUPP_2001", "SUPP_3005"];
const allowedCompanyCodes = ["1000", "2000", "3000", "4000"];
const allowedGLAccounts = ["500000", "500100", "500200", "600000"];
const allowedCostCenters = ["CC100", "CC200", "CC300", "CC400"];

// ---------- Validators ----------
function validateRequesterId(value) {
  if (!value) return { success: false, message: "Requester ID is mandatory" };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return { success: false, message: "Requester ID must be a valid email address" };
  }

  if (!allowedRequesterEmails.includes(value)) {
    return { success: false, message: "Requester ID is not authorized" };
  }

  return { success: true, message: "Requester ID is valid" };
}

function validateProductName(value) {
  if (!value) {
    return {
      success: false,
      expectedValues: allowedProducts,
      message: "Product name is mandatory"
    };
  }

  if (!allowedProducts.includes(value)) {
    return {
      success: false,
      expectedValues: allowedProducts,
      message: "Product name is not supported"
    };
  }

  return { success: true, message: "Product name is valid" };
}

function validateDescription(value) {
  if (!value) return { success: false, message: "Description is mandatory" };
  if (value.trim().length < 10) {
    return { success: false, message: "Description must contain at least 10 characters" };
  }
  return { success: true, message: "Description is valid" };
}

function validateQuantity(value, context = {}) {
  if (value === null || value === undefined) {
    return { success: false, message: "Quantity is mandatory" };
  }

  if (typeof value !== "number") {
    return { success: false, message: "Quantity must be a number" };
  }

  if (value <= 0) {
    return { success: false, message: "Quantity must be greater than zero" };
  }

  const maxQty = productQuantityMap[context.productName];
  if (maxQty !== undefined && value > maxQty) {
    return { success: false, message: "Requested quantity exceeds available stock" };
  }

  return { success: true, message: "Quantity is valid" };
}

function validatePrice(value) {
  if (value === null || value === undefined) {
    return { success: false, message: "Price is mandatory" };
  }

  if (typeof value !== "number") {
    return { success: false, message: "Price must be a numeric value" };
  }

  if (value <= 0) {
    return { success: false, message: "Price must be greater than zero" };
  }

  return { success: true, message: "Price is valid" };
}

function validateCurrency(value) {
  if (!value) {
    return {
      success: false,
      expectedValues: allowedCurrencies,
      message: "Currency is mandatory"
    };
  }

  if (!/^[A-Z]{3}$/.test(value)) {
    return {
      success: false,
      expectedValues: allowedCurrencies,
      message: "Currency must be a valid ISO currency code"
    };
  }

  if (!allowedCurrencies.includes(value)) {
    return {
      success: false,
      expectedValues: allowedCurrencies,
      message: "Currency is not supported"
    };
  }

  return { success: true, message: "Currency is valid" };
}

function validateSupplierId(value) {
  if (!value) {
    return {
      success: false,
      expectedValues: allowedSuppliers,
      message: "Supplier ID is mandatory"
    };
  }

  if (!allowedSuppliers.includes(value)) {
    return {
      success: false,
      expectedValues: allowedSuppliers,
      message: "Supplier ID is not valid"
    };
  }

  return { success: true, message: "Supplier ID is valid" };
}

function validateNeedByDate(value) {
  if (!value) return { success: false, message: "Need-by date is mandatory" };

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { success: false, message: "Need-by date must be a valid ISO date (YYYY-MM-DD)" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today) {
    return { success: false, message: "Need-by date cannot be in the past" };
  }

  return { success: true, message: "Need-by date is valid" };
}

function validateCompanyCode(value) {
  if (!value) {
    return {
      success: false,
      expectedValues: allowedCompanyCodes,
      message: "Company code is mandatory"
    };
  }

  if (!allowedCompanyCodes.includes(value)) {
    return {
      success: false,
      expectedValues: allowedCompanyCodes,
      message: "Company code is not valid"
    };
  }

  return { success: true, message: "Company code is valid" };
}

function validateGLAccount(value) {
  if (!value) {
    return {
      success: false,
      expectedValues: allowedGLAccounts,
      message: "GL account is mandatory"
    };
  }

  if (!allowedGLAccounts.includes(value)) {
    return {
      success: false,
      expectedValues: allowedGLAccounts,
      message: "GL account is not valid"
    };
  }

  return { success: true, message: "GL account is valid" };
}

function validateCostCenter(value) {
  if (!value) {
    return {
      success: false,
      expectedValues: allowedCostCenters,
      message: "Cost center is mandatory"
    };
  }

  if (!allowedCostCenters.includes(value)) {
    return {
      success: false,
      expectedValues: allowedCostCenters,
      message: "Cost center is not valid"
    };
  }

  return { success: true, message: "Cost center is valid" };
}

function validateIsSourcingPr(value) {
  if (value === undefined || value === null) {
    return { success: true, message: "Sourcing flag is valid" };
  }

  if (typeof value !== "boolean") {
    return { success: false, message: "Sourcing flag must be a boolean value" };
  }

  return { success: true, message: "Sourcing flag is valid" };
}








function buildRequisitionImportPullEnvelope(input) {
  const uniqueReqId = uuidv4();
  const sourcingFlag = input.isSourcingPr ? 'true' : 'false';

  return `
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:urn="urn:Ariba:Buyer:vsap">
<soapenv:Header/>
<soapenv:Body>
<urn:RequisitionImportPullRequest partition="${escapeXml(ARIBA_REALM)}" variant="vrealm">
<urn:Requisition_RequisitionImportPull>
<urn:Requisition>
<urn:UniqueName>${uniqueReqId}</urn:UniqueName>
<urn:CreatorUserId>${escapeXml(input.requesterId)}</urn:CreatorUserId>
<urn:NeedByDate>${escapeXml(input.needByDate)}</urn:NeedByDate>
<urn:CompanyCode>${escapeXml(input.companyCode)}</urn:CompanyCode>
 
          <urn:LineItems>
<urn:item>
<urn:LineType>Material</urn:LineType>
<urn:Description>
<urn:Description>${escapeXml(input.productName)}</urn:Description>
<urn:LongDescription>${escapeXml(input.description)}</urn:LongDescription>
</urn:Description>
<urn:Quantity>${input.quantity}</urn:Quantity>
<urn:NeedByDate>${escapeXml(input.needByDate)}</urn:NeedByDate>
<urn:Price>
<urn:Amount>${input.price}</urn:Amount>
<urn:Currency>
<urn:UniqueName>${escapeXml(input.currency)}</urn:UniqueName>
</urn:Currency>
</urn:Price>
<urn:Supplier>
<urn:UniqueName>${escapeXml(input.supplierId)}</urn:UniqueName>
</urn:Supplier>
<urn:Accountings>
<urn:item>
<urn:GeneralLedger>
<urn:UniqueName>${escapeXml(input.glAccount)}</urn:UniqueName>
</urn:GeneralLedger>
<urn:CostCenter>
<urn:UniqueName>${escapeXml(input.costCenter)}</urn:UniqueName>
</urn:CostCenter>
</urn:item>
</urn:Accountings>
<urn:IsSourcingRequisition>${sourcingFlag}</urn:IsSourcingRequisition>
</urn:item>
</urn:LineItems>
</urn:Requisition>
</urn:Requisition_RequisitionImportPull>
</urn:RequisitionImportPullRequest>
</soapenv:Body>
</soapenv:Envelope>
`;
}

function escapeXml(v) {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;');
}

// ===== Call Ariba =====
async function callAribaRequisitionImportPull(soapEnvelope) {
  const auth = Buffer.from(`${ARIBA_USERNAME}:${ARIBA_PASSWORD}`).toString('base64');

  const resp = await fetch(ARIBA_REQUISITION_IMPORT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      Authorization: `Basic ${auth}`,
    },
    body: soapEnvelope,
  });

  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`Ariba RequisitionImportPull error HTTP ${resp.status}: ${text}`);
  }
  return text;
}

// ===== Parse SOAP response (simplified) =====
function parseRequisitionImportPullResponse(xml) {
  const messages = [];

  const faultMatch = xml.match(/<faultstring>(.*?)<\/faultstring>/);
  if (faultMatch) {
    messages.push(faultMatch[1]);
    return { success: false, messages };
  }

  const idMatch = xml.match(/<UniqueName>(.*?)<\/UniqueName>/);
  const statusMatch = xml.match(/<StatusString>(.*?)<\/StatusString>/);

  if (!idMatch) {
    messages.push('No requisition ID returned from Ariba');
    return { success: false, messages };
  }

  return {
    success: true,
    requisitionId: idMatch[1],
    status: statusMatch ? statusMatch[1] : 'UNKNOWN',
    messages,
  };
}

// ---------- Exports ----------
module.exports = {
  validateRequesterId,
  validateProductName,
  validateDescription,
  validateQuantity,
  validatePrice,
  validateCurrency,
  validateSupplierId,
  validateNeedByDate,
  validateCompanyCode,
  validateGLAccount,
  validateCostCenter,
  validateIsSourcingPr
};


