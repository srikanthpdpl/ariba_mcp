const cds = require('@sap/cds');
const axios = require('axios');
// require('dotenv').config();
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand');
const { en } = require('zod/locales');

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

const contract_url = process.env.CONTRACTS_URL

const users_url = process.env.USERS_URL
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

async function getUser(userID){
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
    return await getAPIData(companycodes_url+`?$filter=UniqueName eq '${companycode}'`);
}

async function getSuppliers(supplierId) {
    return await getAPIData(suppliers_url+`?$filter=UniqueName eq '${supplierId}'`);
}

async function getContractIds() {
    return await getAPIData(contract_url);
}
async function getCommodityCodes() {
    return await getAPIData(commoditycodes_url);
}
async function getProducts() {
    return await getAPIData(products_url);
}
async function getCurrency(currencycode) {
    return await getAPIData(currency_url+`?$filter=UniqueName eq '${currencycode}'`);
}


async function getCostCenters(costcenter, companycode) {
    return await getAPIData(costcenters_url+`?$filter=UniqueName eq '${costcenter  }' and CompanyCode eq '${companycode}'`);
}
async function getWBSElement() {
    return await getAPIData(wbselement_url);
}
async function getGeneralLedgers(glaccount, companycode) {
    return await getAPIData(generalledgers_url+`?$filter=UniqueName eq '${glaccount}' and CompanyCode eq '${companycode}'`);
}
async function getUOMs() {
    return await getAPIData(uoms_url);
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

module.exports = {getUser, getContractIds, getCommodityCodes, getIncoTerms, getProducts, getCurrency, 
                getCompanyCodes, getSuppliers, getCostCenters, getPurchaseGroups, getAccountTypes,
                getWBSElement, getGeneralLedgers,getUOMs, getAccounts, getPaymentTerms};

// (async () => {
//   const token = await getAccessToken();
//   console.log("Access Token:", token);
// })();