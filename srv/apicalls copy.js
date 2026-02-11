const cds = require('@sap/cds');
const axios = require('axios');
// require('dotenv').config();
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand');
const { en } = require('zod/locales');
const path = require('path');
const fs = require('fs');

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
const uom_url = process.env.UOM_URL

const contract_url = process.env.CONTRACTS_URL

const users_url = process.env.USERS_URL

const ARIBA_USERNAME = process.env.ARIBA_USERNAME
const ARIBA_PASSWORD = process.env.ARIBA_PASSWORD
const ARIBA_REQUISITION_IMPORT_URL = process.env.ARIBA_REQUISITION_IMPORT_URL

// const tokenUrl = cds.env.OAUTH_URL;
// const clientId = cds.env.CLIENT_ID;
// const clientSecret = cds.env.CLIENT_SECRET;

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


async function getCostCenters(costcenter, companycode) {
  return await getAPIData(costcenters_url + `?$filter=UniqueName eq '${costcenter}' and CompanyCode eq '${companycode}'`);
}
async function getWBSElement(wbselement) {
  return await getAPIData(wbselement_url + `?$filter=UniqueName eq '${wbselement}'`);
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
  // console.log(tokenUrl)
  // console.log(clientId)
  // console.log(clientSecret)
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


function fileToBase64(relativeFilePath) {
    const filePath = path.resolve(__dirname, relativeFilePath);
    const fileBuffer = fs.readFileSync(filePath);
    return fileBuffer.toString('base64');
}

function buildRequisitionImportPullEnvelope(input) {
  const uniqueReqId = crypto.randomUUID();
  const sourcingFlag = input.isSourcingPr ? 'true' : 'false';
  const base64Content = fileToBase64('./files/sample.pdf');
  console.log('Running from:', __dirname);

  //   return `
  // <?xml version="1.0" encoding="UTF-8"?>
  // <!DOCTYPE soapenv:Envelope SYSTEM "http://schemas.xmlsoap.org/soap/envelope/">
  // <soapenv:Envelope
  //   xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  //   xmlns:urn="urn:Ariba:Buyer:vsap">

  //     <soapenv:Header>
  //     <urn:Headers>
  //       <urn:variant>Production</urn:variant>
  //       <urn:partition>Realm_3521</urn:partition>
  //     </urn:Headers>
  //   </soapenv:Header>

  //   ${escapeXml(ARIBA_REALM)} // for Strings
  // ${uniqueReqId} // for numbers


  // <soapenv:Body>
  //     <urn:RequisitionImportPullRequest variant="Production" partition="Realm_3521">
  //       <urn:Requisition_RequisitionImportPull_Item>
  //         <urn:item>
  //           <!-- Header level fields in schema order -->
  //           <urn:CompanyCode>
  //             <urn:UniqueName>3710</urn:UniqueName>
  //           </urn:CompanyCode>

  //           <urn:DefaultLineItem>
  //             <urn:DeliverTo>Raj</urn:DeliverTo>
  //             <urn:NeedBy>2026-01-30T00:00:00Z</urn:NeedBy>
  //           </urn:DefaultLineItem>

  //           <!-- Optional header comments can go here -->

  //           <urn:LineItems>
  //             <urn:item>
  //               <!-- Line item fields (ReqLineItemDetails) -->
  //               <urn:BillingAddress>
  //                 <urn:UniqueName>3710</urn:UniqueName>
  //               </urn:BillingAddress>

  //               <urn:CommodityCode>
  //                 <urn:UniqueName>3710</urn:UniqueName>
  //               </urn:CommodityCode>

  //               <urn:Description>
  //                 <urn:CommonCommodityCode>
  //                   <urn:Domain>custom</urn:Domain>
  //                   <urn:UniqueName>88.20.96.00</urn:UniqueName>
  //                 </urn:CommonCommodityCode>
  //                 <urn:Description>Indirect business services</urn:Description>
  //                 <urn:Price>
  //                   <urn:Amount>100</urn:Amount>
  //                   <urn:Currency>
  //                     <urn:UniqueName>SGD</urn:UniqueName>
  //                   </urn:Currency>
  //                 </urn:Price>
  //                 <urn:UnitOfMeasure>
  //                   <urn:UniqueName>C2</urn:UniqueName>
  //                 </urn:UnitOfMeasure>
  //               </urn:Description>

  //               <urn:ImportedAccountCategoryStaging>
  //                 <urn:UniqueName>Opex</urn:UniqueName>
  //               </urn:ImportedAccountCategoryStaging>

  //               <urn:ImportedAccountingsStaging>
  //                 <urn:SplitAccountings>
  //                   <urn:item>
  //                     <urn:Account>
  //                       <urn:UniqueName>0075400000</urn:UniqueName>
  //                     </urn:Account>
  //                     <urn:CostCenter>
  //                       <urn:UniqueName>G370200003</urn:UniqueName>
  //                     </urn:CostCenter>
  //                     <urn:NumberInCollection>1</urn:NumberInCollection>
  //                     <urn:Percentage>100</urn:Percentage>
  //                     <urn:ProcurementUnit>
  //                       <urn:UniqueName>3710</urn:UniqueName>
  //                     </urn:ProcurementUnit>
  //                   </urn:item>
  //                 </urn:SplitAccountings>
  //               </urn:ImportedAccountingsStaging>

  //               <urn:ItemCategory>
  //                 <urn:UniqueName>Material</urn:UniqueName>
  //               </urn:ItemCategory>

  //               <urn:NumberInCollection>1</urn:NumberInCollection>
  //               <urn:OriginatingSystemLineNumber>1</urn:OriginatingSystemLineNumber>

  //               <urn:PurchaseGroup>
  //                 <urn:UniqueName>003</urn:UniqueName>
  //               </urn:PurchaseGroup>

  //               <urn:PurchaseOrg>
  //                 <urn:UniqueName>3710</urn:UniqueName>
  //               </urn:PurchaseOrg>

  //               <urn:Quantity>10</urn:Quantity>

  //               <urn:ShipTo>
  //                 <urn:UniqueName>3702</urn:UniqueName>
  //               </urn:ShipTo>

  //               <urn:Supplier>
  //                 <urn:UniqueName>SU_INTERNAL86052967</urn:UniqueName>
  //               </urn:Supplier>

  //               <urn:SupplierLocation>
  //                 <urn:UniqueName>MAIN</urn:UniqueName>
  //               </urn:SupplierLocation>
  //             <urn:ImportedNeedByStaging>2026-01-30T00:00:00Z</urn:ImportedNeedByStaging>
  //             <urn:ImportedDeliverToStaging>Raj</urn:ImportedDeliverToStaging>

  //             </urn:item>
  //           </urn:LineItems>

  //           <urn:Name>SOAP Test Ariba PR</urn:Name>

  //           <urn:OriginatingSystem>EXT_SYSTEM</urn:OriginatingSystem>

  //           <urn:Preparer>
  //                         <!--You may enter the following 2 items in any order-->
  //                         <urn:PasswordAdapter>PasswordAdapter1</urn:PasswordAdapter>
  //                         <urn:UniqueName>${escapeXml(input.userID)}</urn:UniqueName>
  //           </urn:Preparer>
  //           <urn:Requester>
  //                     <urn:PasswordAdapter>PasswordAdapter1</urn:PasswordAdapter>
  //                     <urn:UniqueName>${escapeXml(input.userID)}</urn:UniqueName>
  //           </urn:Requester>


  //           <urn:UniqueName>${escapeXml(input.extPRID)}</urn:UniqueName>
  //         </urn:item>
  //       </urn:Requisition_RequisitionImportPull_Item>
  //     </urn:RequisitionImportPullRequest>
  //   </soapenv:Body>

  //   <soapenv:Body>
  //     <urn:RequisitionImportPullRequest
  //         partition="${escapeXml(ARIBA_REALM)}"
  //         variant="partition">

  //       <urn:Requisition>
  //         <urn:UniqueName>${uniqueReqId}</urn:UniqueName>
  //         <urn:CreatorUserId>${escapeXml(input.requesterId)}</urn:CreatorUserId>
  //         <urn:NeedByDate>${escapeXml(input.needByDate)}</urn:NeedByDate>
  //         <urn:CompanyCode>
  //           <urn:UniqueName>${escapeXml(input.companyCode)}</urn:UniqueName>
  //         </urn:CompanyCode>

  //         <urn:LineItems>
  //           <urn:item>
  //             <urn:LineType>Material</urn:LineType>

  //             <urn:Description>
  //               <urn:Description>${escapeXml(input.productName)}</urn:Description>
  //               <urn:LongDescription>${escapeXml(input.description)}</urn:LongDescription>
  //             </urn:Description>

  //             <urn:Quantity>${input.quantity}</urn:Quantity>
  //             <urn:NeedByDate>${escapeXml(input.needByDate)}</urn:NeedByDate>

  //             <urn:Price>
  //               <urn:Amount>${input.price}</urn:Amount>
  //               <urn:Currency>
  //                 <urn:UniqueName>${escapeXml(input.currency)}</urn:UniqueName>
  //               </urn:Currency>
  //             </urn:Price>

  //             <urn:Supplier>
  //               <urn:UniqueName>${escapeXml(input.supplierId)}</urn:UniqueName>
  //             </urn:Supplier>

  //             <urn:Accountings>
  //               <urn:item>
  //                 <urn:GeneralLedger>
  //                   <urn:UniqueName>${escapeXml(input.glAccount)}</urn:UniqueName>
  //                 </urn:GeneralLedger>
  //                 <urn:CostCenter>
  //                   <urn:UniqueName>${escapeXml(input.costCenter)}</urn:UniqueName>
  //                 </urn:CostCenter>
  //               </urn:item>
  //             </urn:Accountings>

  //             <urn:IsSourcingRequisition>${sourcingFlag}</urn:IsSourcingRequisition>
  //           </urn:item>
  //         </urn:LineItems>

  //       </urn:Requisition>
  //     </urn:RequisitionImportPullRequest>
  //   </soapenv:Body>
  // </soapenv:Envelope>
  // `;

  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:urn="urn:Ariba:Buyer:vsap">
  <soapenv:Header>
    <urn:Headers>
      <urn:variant>${escapeXml(input.Envelope.Header.Headers.variant)}</urn:variant>
      <urn:partition>${escapeXml(input.Envelope.Header.Headers.partition)}</urn:partition>
    </urn:Headers>
  </soapenv:Header>

  <soapenv:Body>
    <urn:RequisitionImportPullRequest 
        variant="${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.variant)}" 
        partition="${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.partition)}">

      <urn:Requisition_RequisitionImportPull_Item>
        <urn:item>

          <!-- Company Code -->
          <urn:CompanyCode>
            <urn:UniqueName>${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].CompanyCode.UniqueName)}</urn:UniqueName>
          </urn:CompanyCode>

          <!-- Default Line -->
          <urn:DefaultLineItem>
            <urn:DeliverTo>${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].DefaultLineItem.DeliverTo)}</urn:DeliverTo>
            <urn:NeedBy>${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].DefaultLineItem.NeedBy)}</urn:NeedBy>
          </urn:DefaultLineItem>

          <urn:Attachments>

          <urn:item>
            <urn:Attachment>
              <urn:ContentType>text/plain</urn:ContentType>
              <urn:Filename>HeaderAttach.txt</urn:Filename>
              <urn:Content>${base64Content}</urn:Content>
            </urn:Attachment>
            <urn:Date>2021-06-16T07:39:46Z</urn:Date>
            <urn:ExternalAttachment>false</urn:ExternalAttachment>
            <urn:MappedFilename>cid:sample.pdf</urn:MappedFilename>
            <urn:User>
              <urn:PasswordAdapter>PasswordAdapter1</urn:PasswordAdapter>
              <urn:UniqueName>smith</urn:UniqueName>
            </urn:User>
          </urn:item>

          </urn:Attachments>

          
          <!-- Line Items -->
          <urn:LineItems>
            <urn:item>

              <urn:BillingAddress>
                <urn:UniqueName>${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].BillingAddress.UniqueName)}</urn:UniqueName>
              </urn:BillingAddress>

              <urn:CommodityCode>
                <urn:UniqueName>${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].CommodityCode.UniqueName)}</urn:UniqueName>
              </urn:CommodityCode>

              <urn:Description>
                <urn:CommonCommodityCode>
                  <urn:Domain>${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].Description.CommonCommodityCode.Domain)}</urn:Domain>
                  <urn:UniqueName>${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].Description.CommonCommodityCode.UniqueName)}</urn:UniqueName>
                </urn:CommonCommodityCode>

                <urn:Description>
                  ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].Description.Description)}
                </urn:Description>

                <urn:Price>
                  <urn:Amount>
                    ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].Description.Price.Amount)}
                  </urn:Amount>
                  <urn:Currency>
                    <urn:UniqueName>
                      ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].Description.Price.Currency.UniqueName)}
                    </urn:UniqueName>
                  </urn:Currency>
                </urn:Price>

                <urn:UnitOfMeasure>
                  <urn:UniqueName>
                    ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].Description.UnitOfMeasure.UniqueName)}
                  </urn:UniqueName>
                </urn:UnitOfMeasure>
              </urn:Description>

              <urn:ImportedAccountCategoryStaging>
                <urn:UniqueName>
                  ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].ImportedAccountCategoryStaging.UniqueName)}
                </urn:UniqueName>
              </urn:ImportedAccountCategoryStaging>

              <urn:ImportedAccountingsStaging>
                <urn:SplitAccountings>
                  <urn:item>
                    <urn:Account>
                      <urn:UniqueName>
                        ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].ImportedAccountingsStaging.SplitAccountings.item[0].Account.UniqueName)}
                      </urn:UniqueName>
                    </urn:Account>

                    <urn:GeneralLedger>
                        <urn:CompanyCode>
                            <urn:UniqueName>${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].CompanyCode.UniqueName)}</urn:UniqueName>
                        </urn:CompanyCode>
                      <urn:UniqueName>
                        ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].ImportedAccountingsStaging.SplitAccountings.item[0].GLAccount.UniqueName)}
                      </urn:UniqueName>
                    </urn:GeneralLedger>

                    <urn:CostCenter>
                        <urn:CompanyCode>
                            <urn:UniqueName>${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].CompanyCode.UniqueName)}</urn:UniqueName>
                        </urn:CompanyCode>
                      <urn:UniqueName>
                        ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].ImportedAccountingsStaging.SplitAccountings.item[0].CostCenter.UniqueName)}
                      </urn:UniqueName>
                    </urn:CostCenter>

                    <urn:NumberInCollection>
                      ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].ImportedAccountingsStaging.SplitAccountings.item[0].NumberInCollection)}
                    </urn:NumberInCollection>

                    <urn:Percentage>
                      ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].ImportedAccountingsStaging.SplitAccountings.item[0].Percentage)}
                    </urn:Percentage>

                    <urn:ProcurementUnit>
                      <urn:UniqueName>
                        ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].ImportedAccountingsStaging.SplitAccountings.item[0].ProcurementUnit.UniqueName)}
                      </urn:UniqueName>
                    </urn:ProcurementUnit>
                  </urn:item>
                </urn:SplitAccountings>
              </urn:ImportedAccountingsStaging>

              <urn:ItemCategory>
                <urn:UniqueName>
                  ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].ItemCategory.UniqueName)}
                </urn:UniqueName>
              </urn:ItemCategory>

              <urn:NumberInCollection>
                ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].NumberInCollection)}
              </urn:NumberInCollection>

              <urn:OriginatingSystemLineNumber>
                ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].OriginatingSystemLineNumber)}
              </urn:OriginatingSystemLineNumber>

              <urn:PurchaseGroup>
                <urn:UniqueName>
                  ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].PurchaseGroup.UniqueName)}
                </urn:UniqueName>
              </urn:PurchaseGroup>

              <urn:PurchaseOrg>
                <urn:UniqueName>
                  ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].PurchaseOrg.UniqueName)}
                </urn:UniqueName>
              </urn:PurchaseOrg>

              <urn:Quantity>
                ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].Quantity)}
              </urn:Quantity>

              <urn:ShipTo>
                <urn:UniqueName>
                  ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].ShipTo.UniqueName)}
                </urn:UniqueName>
              </urn:ShipTo>

              <urn:Supplier>
                <urn:UniqueName>
                  ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].Supplier.UniqueName)}
                </urn:UniqueName>
              </urn:Supplier>

              <urn:SupplierLocation>
                <urn:UniqueName>
                  ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].SupplierLocation.UniqueName)}
                </urn:UniqueName>
              </urn:SupplierLocation>

              <urn:ImportedNeedByStaging>
                ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].ImportedNeedByStaging)}
              </urn:ImportedNeedByStaging>

              <urn:ImportedDeliverToStaging>
                ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].ImportedDeliverToStaging)}
              </urn:ImportedDeliverToStaging>

            </urn:item>
          </urn:LineItems>

          <!-- Header Info -->
          <urn:Name>
            ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].Name)}
          </urn:Name>

          <urn:OriginatingSystem>
            ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].OriginatingSystem)}
          </urn:OriginatingSystem>

          <urn:Preparer>
            <urn:PasswordAdapter>
              ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].Preparer.PasswordAdapter)}
            </urn:PasswordAdapter>
            <urn:UniqueName>
              ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].Preparer.UniqueName)}
            </urn:UniqueName>
          </urn:Preparer>

          <urn:Requester>
            <urn:PasswordAdapter>
              ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].Requester.PasswordAdapter)}
            </urn:PasswordAdapter>
            <urn:UniqueName>
              ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].Requester.UniqueName)}
            </urn:UniqueName>
          </urn:Requester>

          <urn:UniqueName>
            ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].UniqueName)}
          </urn:UniqueName>

        </urn:item>
      </urn:Requisition_RequisitionImportPull_Item>

    </urn:RequisitionImportPullRequest>
  </soapenv:Body>
</soapenv:Envelope>
`;
}


function escapeXml(v) {
  if (v === null || v === undefined) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;');
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


// ===== Parse SOAP response (simplified) =====
function parseRequisitionImportPullResponse(xml) {

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
      status: status[1],
      submitted: status[1] !== 'Composing',
      messages: status[1] === 'Composing'
        ? ['PR created as Draft. Check missing mandatory fields or AutoSubmit setting']
        : ['Purchase Requisition submitted successfully']
    };

  }


}


module.exports = {
  getUser, getContractIds, getCommodityCodes, getIncoTerms, getProducts, getCurrency,
  getCompanyCodes, getSuppliers, getCostCenters, getPurchaseGroups, getAccountTypes,
  getWBSElement, getGeneralLedgers, getUOMs, getAccounts, getPaymentTerms, callAribaRequisitionImportPull
};

// (async () => {
//   const token = await getAccessToken();
//   console.log("Access Token:", token);
// })();