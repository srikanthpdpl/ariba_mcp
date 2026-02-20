const cds = require('@sap/cds');
const fetch = import('node-fetch');
// const { v4: uuidv4 } = import('uuid');
const { getUser, getContractIds, getCommodityCodes, getIncoTerms, getProducts, getCurrency,
  getCompanyCodes, getSuppliers, getCostCenters, getPurchaseGroups, getAccountTypes, getAddress,
  getWBSElement, getGeneralLedgers, getUOMs, getAccounts, getPaymentTerms, callAribaRequisitionImportPull } = require('./apicalls');
// const { success } = require('zod');

// validate.js


// ---------- Hardcoded data ----------
// const allowedRequesterEmails = [
//   "harish.yarra@aarini.com",
//   "akulapoornasasank@gmail.com"
// ];

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

// ---------- Validators ----------

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
}

async function validateCompanyCode(value) {

  if (!value) {
    return { success: false, message: "Company Code is mandatory" };
  }

  const companyCodes = await getCompanyCodes(value);

  if (companyCodes.length > 0) {
    return { success: true, message: "Company code is valid" };
  } else {
    return { success: false, message: "Company code is not valid" }
  }
  // return { success: true, message: "Company code is valid" };
}


/// Shipto, DeliverTo, BillingAddress. ---- type can be "ShipTo,BillTo,DeliveryTo"
async function validateAddress(type,value, companycode) {
  if (!value) return { success: false, message: type+" is mandatory" };
  const shipto = await getAddress(value, companycode);

  if (shipto.length > 0) {
    return { success: true, message: type+" is valid" };
  } else {
    return { success: false, message: type+" is not valid" }
  }
}



async function validateSupplierId(value) {
  if (!value) {
    return { success: false, message: "Supplier ID is mandatory" };
  }

  const supplier = await getSuppliers(value);

  if (supplier.length > 0) {
    return { success: true, message: "Supplier ID is valid" };
  } else {
    return { success: false, message: "Supplier is not valid" }
  }
}

async function validateDeliverTo(value) {
  if (!value) return { success: false, message: "DeliverTo is mandatory" };
  const shipto = await getAddress(value, companycode);

  if (shipto.length > 0) {
    return { success: true, message: "DeliverTo is valid" };
  } else {
    return { success: false, message: "DeliverTo is not valid" }
  }
}

async function validateAttachments(value) {
  if (!value) {
    return { success: false, message: "Attachments are mandatory" };
  }
  /// Code here for Attachment upload

  return { success: true, message: "Attachments is valid" };
}

/// Need to work on Product Logic.....
// Validate aganist Material number...
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

// Validated against Material Desc 
async function validateDescription(value) {
  if (!value) return { success: false, message: "Description is mandatory" };
  if (value.trim().length < 10) {
    return { success: false, message: "Description must contain at least 10 characters" };
  }
  return { success: true, message: "Description is valid" };
}

async function validateCommodityCode(value) {
  if (!value) {
    return { success: false, message: "CommodityCode is mandatory" };
  }

  const commoditycode = await getCommodityCodes(value);

  if (commoditycode.length > 0) {
    return { success: true, message: "CommodityCode is valid" };
  } else {
    return { success: false, message: "CommodityCode is not valid" }
  }
}

async function validateNeedByDate(value) {
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

async function validateCurrency(value) {

  if (!value) {
    return {
      success: false,
      message: "Currency is mandatory"
    };
  }
  value = value ? value.toUpperCase() : value;
  if (!/^[A-Z]{3}$/.test(value)) {
    return {
      success: false,
      message: "Currency must be a valid ISO currency code"
    };
  }

  const currency = await getCurrency(value);

  if (currency.length > 0) {
    return { success: true, message: "Currency code is valid" };
  } else {
    return { success: false, message: "Currency code is not valid" }
  }
}

/// Need logic to check the MAX Quantity...?  -- No need to check MAX quantity
async function validateQuantity(value) {
  // if (value === null || value === undefined || value === "") {
  if (!value) {
    return { success: false, message: "Quantity is mandatory" };
  }

  const quantity = Number(value);

  if (Number.isNaN(quantity)) {
    return { success: false, message: "Quantity must be a number" };
  }

  if (quantity <= 0) {
    return { success: false, message: "Quantity must be greater than zero" };
  }

  return { success: true, message: "Quantity is valid", value: quantity };
}

async function validatePrice(value) {
  // if (value === null || value === undefined || value === "") {
  if (!value) {
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

// check if Item Category falls in M or D
async function validateItemCategory(value) {
  const cate = ['M', 'D']
  if (!value) {
    return { success: false, message: "Item Category is mandatory" };
  }

  const normalizedValue = value.toString().trim().toLowerCase();
  const normalizedAllowed = cate.map(p =>
    p.toString().trim().toLowerCase()
  );

  if (!normalizedAllowed.includes(normalizedValue)) {
    return {
      success: false,
      expectedValues: allowedProducts,
      message: "Item Category is not supported"
    };
  }

  return { success: true, message: "Item Category is valid" };
}

async function validateUOM(value) {
  if (!value) {
    return { success: false, message: "Unit of Measure is mandatory" };
  }
  const uom = await getUOMs(value);

  if (uom.length > 0) {
    return { success: true, message: "UOM is valid" };
  } else {
    return { success: false, message: "UOM is not valid" }
  }

}

async function validateWBSElement(value, companyCode) {
  if (!value) {
    return { success: false, message: "WBSElement is mandatory" };
  }
  /// code here for 
  const wbselement = await getWBSElement(value, companyCode);

  if (wbselement.length > 0) {
    return { success: true, message: "WBSElement is valid" };
  } else {
    return { success: false, message: "WBSElement is not valid" }
  }
}

async function validateGLAccount(value, companyCode) {
  if (!value) {
    return {
      success: false,
      message: "GL account is mandatory"
    };
  }

  const glaccount = await getGeneralLedgers(value, companyCode);
  console.log(glaccount)
  if (glaccount.length > 0) {
    return { success: true, message: "GL account is valid" };
  } else {
    return { success: false, message: `There is no GL accounts ${value} associated with the companycode ${companyCode}` }
  }
}

async function validateAccountAssignment(value) {
  if (!value) {
    return { success: false, message: "Account Assignment is mandatory" };
  }
  /// code here for Account Assignment Validation

  return { success: true, message: "GL account is valid" };
}

async function validateCostCenter(value, companyCode) {
  if (!value) {
    return {
      success: false,
      message: "Cost center is mandatory"
    };
  }

  const costcenter = await getCostCenters(value, companyCode);
  console.log(costcenter)
  if (costcenter.length > 0) {
    return { success: true, message: "Cost Center is valid" };
  } else {
    return { success: false, message: `There is no CostCenter ${value} associated with the companycode ${companyCode}` }
  }
}


/// Material Optional Fields

async function validatecontractWSId(value) {
  return { success: true, message: "ContractWSId" };
}

async function validateComments(value) {
  return { success: true, message: "Comments" };
}

async function validateOnBehalf(value) {
  /// user exists validation logic...
  return { success: true, message: "onBehalf" };
}

async function validateSupplierPartNo(value) {
  return { success: true, message: "validateSupplierPartNo" };
}

async function validateSupplierPartAuxId(value) {
  return { success: true, message: "validateSupplierPartAuxId" };
}

async function validateIncoTermCode(value) {
  return { success: true, message: "validateIncoTermCode" };
}

async function validateIncoTermLocation(value) {
  return { success: true, message: "validateIncoTermLocation" };
}

async function validateDelayPurchaseUntil(value) {
  return { success: true, message: "validateDelayPurchaseUntil" };
}

async function validatePurchaseGroup(value) {

  /// code here for 
  const purchasegroup = await getPurchaseGroups(value);

  if (purchasegroup.length > 0) {
    return { success: true, message: "Purchase Group is valid" };
  } else {
    return { success: false, message: "Purchase Group is not valid" }
  }
}

async function validateIsSourcingPr(value) {
  // if (value === undefined || value === null) {
  if (!value){
    return { success: true, message: "Sourcing flag is valid" };
  }

  if (typeof value !== "boolean") {
    return { success: false, message: "Sourcing flag must be a boolean value" };
  }

  return { success: true, message: "Sourcing flag is valid" };
}


//// Service Fields Mandatory

async function validateServiceName(value) {
  if (!value) return { success: false, message: "Service Name is mandatory" };
  return { success: true, message: "Service Name is valid" };
}

async function validateServiceStartDate(value) {
  if (!value) return { success: false, message: "Service Start date is mandatory" };

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { success: false, message: "Service Start date must be a valid ISO date (YYYY-MM-DD)" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today) {
    return { success: false, message: "Service Start date cannot be in the past" };
  }

  return { success: true, message: "Service Start date is valid" };
}

async function validateServiceEndDate(value) {
  if (!value) return { success: false, message: "Service End date is mandatory" };

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { success: false, message: "Service End date must be a valid ISO date (YYYY-MM-DD)" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today) {
    return { success: false, message: "Service End date cannot be in the past" };
  }

  return { success: true, message: "Service End date is valid" };
}

async function validateMaxAmount(value) {
  if (!value) return { success: false, message: "MaxAmount is mandatory" };
  return { success: true, message: "MaxAmount is valid" };
}

async function validateExpectedAmount(value) {
  if (!value) return { success: false, message: "Expected Amount is mandatory" };
  return { success: true, message: "Expected Amount is valid" };
}

/*
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
*/

function callCreatePR(input) {
  console.log("calling .... callCreatePR")
  return callAribaRequisitionImportPull(input)
}




// ---------- Exports ----------
module.exports = {
  validateRequesterId,
  validateCompanyCode,
  // validateShipTo,
validateAddress,
  validateSupplierId,
  validateDeliverTo,
  validateAttachments,
  // validateProductName,
  validateDescription,
  validateCommodityCode,
  validateNeedByDate,
  validateCurrency,
  validateQuantity,
  validatePrice,
  validateItemCategory,
  validateUOM,
  validateWBSElement,
  validateGLAccount,
  validateAccountAssignment,
  validateCostCenter,
  validatecontractWSId,
  validateComments,
  validateOnBehalf,
  validateSupplierPartNo,
  validateSupplierPartAuxId,
  validateIncoTermCode,
  validateIncoTermLocation,
  validateDelayPurchaseUntil,
  validatePurchaseGroup,
  validateIsSourcingPr,

  validateServiceName,
  validateServiceStartDate,
  validateServiceEndDate,
  validateMaxAmount,
  validateExpectedAmount,

  callCreatePR

};


