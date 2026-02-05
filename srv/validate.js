const cds = require('@sap/cds');
const fetch = import('node-fetch');
// const { v4: uuidv4 } = import('uuid');
const { getUser, getContractIds, getCommodityCodes, getIncoTerms, getProducts, getCurrency,
  getCompanyCodes, getSuppliers, getCostCenters, getPurchaseGroups, getAccountTypes,
  getWBSElement, getGeneralLedgers, getUOMs, getAccounts, getPaymentTerms } = require('./apicalls');
const { success } = require('zod');

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
// const allowedContractIds = [
//   "CTR-1001",
//   "CTR-1002",
//   "CTR-1003",
//   "CTR-2001"
// ];

// ---------- Validators ----------

async function validateContractId(value) {

  console.log("...ValidateContract....")
  var contractId = await getContractIds()
// Step 2: Extract level-1 UniqueName into array
const allowedContractIds = Array.isArray(contractId.value)
  ? contractId.value
      .map(item => item.UniqueName)
      .filter(Boolean) // removes undefined/null just in case
  : [];

  if (!value) {
    return {
      success: false,
      expectedValues: allowedContractIds,
      message: "Contract ID is mandatory"
    };
  }
  // const allowedContractIds = 
  if (!allowedContractIds.includes(value)) {
    return {
      success: false,
      expectedValues: allowedContractIds,
      message: "Contract ID is not valid"
    };
  }

  return {
    success: true,
    message: "Contract ID is valid"
  };
}

async function validateRequesterId(value) {

  if (!value) {
    return { success: false, message: "Requester ID is mandatory" };
  }

  const userdata = await getUser(value);

  // Validate user existence
  if (!userdata || !Array.isArray(userdata.Resources) || userdata.Resources.length === 0) {
    return { success: false, message: "Requester ID does not exist" };
  }

  const user = userdata.Resources[0];
  // console.log(user);
  // Validate groups existence
  if (!Array.isArray(user.groups) || user.groups.length === 0) {
    return { success: false, message: "Requester ID has no group assigned" };
  }

  // Check if user belongs to required group
  const REQUIRED_GROUP = "ZEP_ARB_BUYER_DOWNSTREAM";

  const hasRequiredGroup =
    Array.isArray(user.groups) &&
    user.groups.some(group => group.value === REQUIRED_GROUP);

  if (!hasRequiredGroup) {
    console.log(
      `User ${user.userName} does NOT belong to required group: ${REQUIRED_GROUP}`
    );
    return { success: false, message: `User ${user.userName} does NOT belong to required group: ${REQUIRED_GROUP}` }
    // throw error / return response / notify user
  } else {
    console.log(
      `User ${user.userName} belongs to required group: ${REQUIRED_GROUP}`
    );
    return { success: true, message: `User ${user.userName} belongs to required group: ${REQUIRED_GROUP}` }
  }


  // // Optional: Email authorization check
  // if (!allowedRequesterEmails.includes(value)) {
  //   return { success: false, message: "Requester ID is not authorized" };
  // }

  // return { success: true, message: "Requester ID is valid" };
}


async function validateCompanyCode(value) {

  if (!value) {
    return { success: false, message: "Company Code is mandatory" };
  }

  const companyCodes = await getCompanyCodes(value);

  if(companyCodes.length>0){
    return { success: true, message: "Company code is valid" };
  } else{
    return {success: false, message: "Company code is not valid" }
  }
  // return { success: true, message: "Company code is valid" };
}

async function validateSupplierId(value) {
    if (!value) {
      return { success: false, message: "Supplier ID is mandatory" };
    }

    const supplier = await getSuppliers(value);

    if(supplier.length>0){
      return { success: true, message: "Supplier ID is valid" };
    } else{
      return {success: false, message: "Supplier is not valid" }
    }
  // if (!allowedSuppliers.includes(value)) {
  //   return {
  //     success: false,
  //     expectedValues: allowedSuppliers,
  //     message: "Supplier ID is not valid"
  //   };
  // }

  // return { success: true, message: "Supplier ID is valid" };
}

function validateProductName(value) {

  if (!value) {
    return {
      success: false,
      expectedValues: allowedProducts,
      message: "Product name is mandatory"
    };
  }

  const normalizedValue = value.toString().trim().toLowerCase();
  const normalizedAllowed = allowedProducts.map(p =>
    p.toString().trim().toLowerCase()
  );

  if (!normalizedAllowed.includes(normalizedValue)) {
    return {
      success: false,
      expectedValues: allowedProducts,
      message: "Product name is not supported"
    };
  }

  return {
    success: true,
    message: "Product name is valid"
  };
}

function validateDescription(value) {
  if (!value) return { success: false, message: "Description is mandatory" };
  if (value.trim().length < 10) {
    return { success: false, message: "Description must contain at least 10 characters" };
  }
  return { success: true, message: "Description is valid" };
}

function validateQuantity(value) {
  if (value === null || value === undefined || value === "") {
    return { success: false, message: "Quantity is mandatory" };
  }

  const quantity = Number(value);

  if (Number.isNaN(quantity)) {
    return { success: false, message: "Quantity must be a number" };
  }

  if (quantity <= 0) {
    return { success: false, message: "Quantity must be greater than zero" };
  }
    ////// What will be the MAx Quantity ???
  const maxQty = 100;
  if (quantity > maxQty) {
    return {
      success: false,
      message: "Requested quantity exceeds available stock"
    };
  }

  return { success: true, message: "Quantity is valid", value: quantity };
}

function validatePrice(value) {
  if (value === null || value === undefined || value === "") {
    return { success: false, message: "Price is mandatory" };
  }

  const price = Number(value);

  if (Number.isNaN(price)) {
    return { success: false, message: "Price must be a numeric value" };
  }

  if (price <= 0) {
    return { success: false, message: "Price must be greater than zero" };
  }

  return { success: true, message: "Price is valid", value: price };
}

async function validateCurrency(value) {
  value = value ? value.toUpperCase() : value;
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

    const currency = await getCurrency(value);

    if(currency.length>0){
      return { success: true, message: "Currency code is valid" };
    } else{
      return {success: false, message: "Currency code is not valid" }
    }

  // if (!allowedCurrencies.includes(value)) {
  //   return {
  //     success: false,
  //     expectedValues: allowedCurrencies,
  //     message: "Currency is not supported"
  //   };
  // }

  // return { success: true, message: "Currency is valid" };
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


async function validateGLAccount(value,companyCode) {
  if (!value) {
    return {
      success: false,
      message: "GL account is mandatory"
    };
  }

    const glaccount = await getGeneralLedgers(value,companyCode);
    console.log(glaccount)
    if(glaccount.length>0){
      return { success: true, message: "GL account is valid" };
    } else{
      return {success: false, message: `There is no GL accounts ${value} associated with the companycode ${companyCode}` }
    }
  // if (!allowedGLAccounts.includes(value)) {
  //   return {
  //     success: false,
  //     expectedValues: allowedGLAccounts,
  //     message: "GL account is not valid"
  //   };
  // }

  // return { success: true, message: "GL account is valid" };
}

async function validateCostCenter(value,companyCode) {
  if (!value) {
    return {
      success: false,
      message: "Cost center is mandatory"
    };
  }

    const costcenter = await getCostCenters(value,companyCode);
    console.log(costcenter)
    if(costcenter.length>0){
      return { success: true, message: "Cost Center is valid" };
    } else{
      return {success: false, message: `There is no CostCenter ${value} associated with the companycode ${companyCode}` }
    }

  // if (!allowedCostCenters.includes(value)) {
  //   return {
  //     success: false,
  //     expectedValues: allowedCostCenters,
  //     message: "Cost center is not valid"
  //   };
  // }

  // return { success: true, message: "Cost center is valid" };
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
  // const uniqueReqId = uuidv4();
  const uniqueReqId = crypto.randomUUID();
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
  validateIsSourcingPr,
  validateContractId
};


