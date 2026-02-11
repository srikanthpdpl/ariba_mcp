const cds = require('@sap/cds');
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const { z } = require("zod");
// const { v4: uuidv4 } =  import('uuid');
z.string().des
const {
    validateRequesterId,
    validateCommodityCode,
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
    validateContractId,
    validateAttachments,
    validateAccountAssignment,
    validateWBSElement,
    validateUOM,
    validateDeliverTo,
    validateOnBehalf,
    validatecontractWSId,
    validateShipTo,
    validateShipToAddress,
    validateServiceName,
    validateServiceStartDate,
    validateServiceEndDate,
    validateExpectedAmount,
    callCreatePR
} = require("./validate");

module.exports = cds.service.impl(async function () {

    async function runAllValidations(data, p_type) {
        var validations = [];
        var type;
        if (p_type) {
            type = p_type;
        } else {
            type = data.type;
        }

        if (type === 'quotation') {
            validations = await Promise.all([
                /// Mandatory Fields
                validateRequesterId(data.requesterId),
                // validateProductName(data.productName),  /// Need to embedd logic
                // validateDescription(data.description),
                // validateQuantity(data.quantity), /// Need to embedd logic for product to Quantity
                // validatePrice(data.price),
                // validateCompanyCode(data.companyCode),
                // validateSupplierId(data.supplierId),
                // validateNeedByDate(data.needByDate),
                // validateCommodityCode(data.commoditycode),
                // validateAccountAssignment(data.accountAssignment),  // Validate Account Assignment
                // validateCostCenter(data.costCenter, data.companyCode),
                // validateAttachments(data.attachments),
                // validateIsSourcingPr(data.isSourcingPr),

                // //// Optional Fields
                // validateUOM(data.uom), // validate UOM
                // validateDeliverTo(data.deliveryto), // validate Delivery To
                // validateOnBehalf(data.onbehalf), // validate on Behalf
                // validatecontractWSId(data.contractId), // validate contract WorkspaceID
                // validate Delay purchase until.  --- Not required ???

                // inco terms -- No Validation
                // inco terms location -- No validation

                //// Auto Populated Fields
                // Purchasing Unit
                // Bill To
                // Account Type
                // GL Account 
                // Ship To
                // Material Group
                // Payment Terms
                // Contract
                // validateCurrency(data.currency),  //// ???
                // validateGLAccount(data.glAccount, data.companyCode), //????
            ]);

        }

        if (type === 'contract') {
            validations = await Promise.all([
                /// Mandatory Fields
                validateRequesterId(data.requesterId),
                validateCompanyCode(data.companyCode),
                validateShipTo(data.shipTo), //validate ship to
                validateShipToAddress(data.shipToAddress),//validate ship to address
                validateSupplierId(data.supplierId),
                validateDeliverTo(data.deliveryto), //validate Deliver to
                validateAttachments(data.attachments),  // attachments
                validateServiceName(data.servicename), //validate Service name
                validateDescription(data.description),
                validateCommodityCode(data.commoditycode),
                validateWBSElement(data.wbselement), //validate WBS Code/Element
                validateAccountAssignment(data.accountAssignment),  // Validate Account Assignment
                validateCostCenter(data.costCenter, data.companyCode),
                validateServiceStartDate(data.srvstartdate),//validate Service Start Date
                validateServiceEndDate(data.srvenddate),//validate Service End Date
                validateNeedByDate(data.needByDate),
                validateCurrency(data.currency),
                validateExpectedAmount(data.expectedAmount),// validate Expected amount 
                validateIsSourcingPr(data.isSourcingPr),

                //// Optional Fields
                //validate Max Amount
                validatecontractWSId(data.contractId),//validate Contract WorkspaceID.
                validateOnBehalf(data.onbehalf), // Validate on Behalf

                
                // supplier part number --- No Validation
                // supplier part auxilary ID  --- No validation
                // inco terms code  --- No Validation
                // inco terms location --- No validation

                // validate Delay purchase until.  --- Not required ???

                //// Autopopulated Fields
                // purchasing Organisation
                // payment terms
                // contract
                // GL Account
                // Bill to
                // Account Type

            ]);

        }
        console.log(validations)
        const failed = validations.filter(v => v.success === false);

        if (failed.length > 0) {
            return {
                success: false,
                errors: failed
            };
        }

        return {
            success: true,
            message: "All validations passed"
        };
    }

    function constructInput()
    {
        return input = {
            "Envelope": {
                "Header": {
                    "Headers": {
                        "variant": "Production",
                        "partition": "Realm_3521"
                    }
                },
                "Body": {
                    "RequisitionImportPullRequest": {
                        "variant": "Production",
                        "partition": "Realm_3521",
                        "Requisition_RequisitionImportPull_Item": {
                            "item": [
                                {
                                    "CompanyCode": {
                                        "UniqueName": "3710"
                                    },
                                    "DefaultLineItem": {
                                        "DeliverTo": "Raj",
                                        "NeedBy": "2026-01-30T00:00:00Z"
                                    },
                                    "LineItems": {
                                        "item": [
                                            {
                                                "BillingAddress": {
                                                    "UniqueName": "3710"
                                                },
                                                "CommodityCode": {
                                                    "UniqueName": "3710"
                                                },
                                                "Description": {
                                                    "CommonCommodityCode": {
                                                        "Domain": "custom",
                                                        "UniqueName": "88.20.96.00"
                                                    },
                                                    "Description": "Indirect business services",
                                                    "Price": {
                                                        "Amount": 100,
                                                        "Currency": {
                                                            "UniqueName": "SGD"
                                                        }
                                                    },
                                                    "UnitOfMeasure": {
                                                        "UniqueName": "EA"
                                                    }
                                                },
                                                "ImportedAccountCategoryStaging": {
                                                    "UniqueName": "Opex"
                                                },
                                                "ImportedAccountingsStaging": {
                                                    "SplitAccountings": {
                                                        "item": [
                                                            {
                                                                "Account": {
                                                                    "UniqueName": "0075400000"
                                                                },
                                                                "CostCenter": {
                                                                    "UniqueName": "G370200003"
                                                                },
                                                                "GLAccount":{
                                                                     "UniqueName": "0075400000"
                                                                },
                                                                "NumberInCollection": 1,
                                                                "Percentage": 100,
                                                                "ProcurementUnit": {
                                                                    "UniqueName": "3710"
                                                                }
                                                            }
                                                        ]
                                                    }
                                                },
                                                "ItemCategory": {
                                                    "UniqueName": "M"
                                                },
                                                "NumberInCollection": 1,
                                                "OriginatingSystemLineNumber": "1",
                                                "PurchaseGroup": {
                                                    "UniqueName": "003"
                                                },
                                                "PurchaseOrg": {
                                                    "UniqueName": "3710"
                                                },
                                                "Quantity": 10,
                                                "ShipTo": {
                                                    "UniqueName": "3702"
                                                },
                                                "Supplier": {
                                                    "UniqueName": "2010005421"
                                                },
                                                "SupplierLocation": {
                                                    "UniqueName": "MAIN"
                                                },
                                                "ImportedNeedByStaging": "2026-01-30T00:00:00Z",
                                                "ImportedDeliverToStaging": "Raj"
                                            }
                                        ]
                                    },
                                    "Name": "SOAP Test Ariba PR",
                                    "OriginatingSystem": "EXT_SYSTEM",
                                    "Preparer": {
                                        "PasswordAdapter": "PasswordAdapter1",
                                        "UniqueName": "SRIANTH"
                                    },
                                    "Requester": {
                                        "PasswordAdapter": "PasswordAdapter1",
                                        "UniqueName": "SRIANTH"
                                    },
                                    "UniqueName": "EXT-PR-100002"
                                }
                            ]
                        }
                    }
                }
            }
        }
    }


    this.on('createAribaPurchaseRequisition', async (req) => {

        try {
            const valid = await runAllValidations(req.data, "quotation");
            console.log(valid)
            if (!valid.success) {
                throw new Error(valid.errors.map(v => v.message).join("; "));
            }

            const inputjson = constructInput()
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(await callCreatePR(inputjson))
                }]
            };
        } catch (error) {
            console.log(error)
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        success: false,
                        requisitionId: null,
                        status: "Failed",
                        messages: [error.message || "Validation Failed"]
                    }, null, 2)
                }],
                isError: true
            };
        }
    });


    // Tools
    const app = cds.app;

    const server = new McpServer({
        name: "cap-mcp",
        version: "1.0.0"
    });



    server.registerTool(
        "createPrWithContract",
        {
            title: "Create Purchase Requisition with Contract",
            description: `
Creates a Purchase Requisition using a contract-based process.
All input fields must already be valid. 
Only provide values that satisfy validation rules.
    `,
            inputSchema: {
                requesterId: z
                    .string()
                    .describe("Validated requester email ID. Must be authorized and correctly formatted."),

                contractId: z
                    .string()
                    .describe("Validated contract ID. Must exist and be approved for PR creation."),

                description: z
                    .string()
                    .describe("Validated purchase description. Minimum 10 meaningful characters.")
                    .optional(),

                quantity: z
                    .number()
                    .describe("Validated quantity. Positive number within allowed limits."),

                needByDate: z
                    .string()
                    .describe("Validated need-by date in ISO format (YYYY-MM-DD). Must not be in the past."),

                companyCode: z
                    .string()
                    .describe("Validated company code. Must belong to allowed company codes."),

                glAccount: z
                    .string()
                    .describe("Validated GL account. Must be allowed for posting."),

                costCenter: z
                    .string()
                    .describe("Validated cost center responsible for the expense."),

                isSourcingPr: z
                    .boolean()
                    .describe("Validated sourcing flag. Boolean value indicating sourcing relevance.")
                    .optional()
            }
        },
        async (data) => {
            try {
                const valid = await runAllValidations(data, "contract");

                if (!valid.success) {
                    throw new Error(valid.errors.map(v => v.message).join("; "));
                }

                /// Sample test run ...
                const inputjson = constructInput()
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(await callCreatePR(inputjson))
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            requisitionId: null,
                            status: "Failed",
                            messages: [error.message || "Validation Failed"]
                        }, null, 2)
                    }],
                    isError: true
                };
            }
        }
    );

    server.registerTool(
        "createPrWithQuotation",
        {
            title: "Create Purchase Requisition with Quotation",
            description: `
Creates a Purchase Requisition using a quotation-based process.
All provided fields must already be validated.
Only enter compliant and verified values.
    `,
            inputSchema: {
                requesterId: z
                    .string()
                    .describe("Validated requester email ID. Must be authorized."),

                productName: z
                    .string()
                    .describe("Validated product name. Must be supported by the system."),

                description: z
                    .string()
                    .describe("Validated purchase description. Minimum 10 characters.")
                    .optional(),

                quantity: z
                    .number()
                    .describe("Validated quantity. Positive number within allowed range."),

                price: z
                    .number()
                    .describe("Validated quoted price. Must be a positive numeric value."),

                currency: z
                    .string()
                    .describe("Validated ISO currency code (e.g., USD, INR). Must be supported."),

                supplierId: z
                    .string()
                    .describe("Validated supplier ID. Must be approved and supported."),

                needByDate: z
                    .string()
                    .describe("Validated delivery date in ISO format (YYYY-MM-DD). Cannot be in the past."),

                companyCode: z
                    .string()
                    .describe("Validated company code under which the PR is created."),

                glAccount: z
                    .string()
                    .describe("Validated GL account for financial posting."),

                costCenter: z
                    .string()
                    .describe("Validated cost center responsible for the expense."),

                isSourcingPr: z
                    .boolean()
                    .describe("Validated sourcing flag. Boolean value only.")
                    .optional()
            }
        },
        async (data) => {
            try {
                const valid = await runAllValidations(data, "quotation");

                if (!valid.success) {
                    throw new Error(valid.errors.map(v => v.message).join("; "));
                }

                const inputjson = constructInput()
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify(await callCreatePR(inputjson))
                    }]
                };
            } catch (error) {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            requisitionId: null,
                            status: "Failed",
                            messages: [error.message || "Validation Failed"]
                        }, null, 2)
                    }],
                    isError: true
                };
            }
        }
    );

/*
    server.registerTool(
        "ValidatePrWithQuotation",
        {
            title: "Validate Purchase Requisition with Quotation",
            description: `
Validates a Purchase Requisition using a quotation-based process.
    `,
            inputSchema: {
                requesterId: z
                    .string()
                    .describe("Email ID of the requester. Must be a valid and authorized email address."),

                productName: z
                    .string()
                    .describe("Product name to be procured using a quotation. Must match supported product names."),

                description: z
                    .string()
                    .describe("Detailed description of the purchase requirement. Minimum 10 characters.")
                    .optional(),

                quantity: z
                    .number()
                    .describe("Quantity requested. Must be a positive number within allowed limits."),

                price: z
                    .number()
                    .describe("Quoted unit price of the product. Must be a positive numeric value."),

                currency: z
                    .string()
                    .describe("3-letter ISO currency code used in the quotation (e.g., USD, INR). Must be supported."),

                supplierId: z
                    .string()
                    .describe("Supplier ID providing the quotation. Must be selected from supported suppliers."),

                needByDate: z
                    .string()
                    .describe("Required delivery date in ISO format (YYYY-MM-DD). Cannot be a past date."),

                companyCode: z
                    .string()
                    .describe("Company code under which the PR is created. Must be a valid company code."),

                glAccount: z
                    .string()
                    .describe("GL account for posting the purchase cost. Must be a supported GL account."),

                costCenter: z
                    .string()
                    .describe("Cost center responsible for the expense. Must be a valid cost center."),

                isSourcingPr: z
                    .boolean()
                    .describe("Indicates whether the PR is related to sourcing. Optional boolean flag.")
                    .optional()
            }

        },
        async (data) => {

            const valid = await runAllValidations(data, "quotation");

            if (!valid.success) {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            status: "Failed",
                            messages: valid.errors
                        }, null, 2)
                    }],
                    isError: true
                };
            }
            else {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            status: "Validated",
                            messages: valid?.message
                        }, null, 2)
                    }]
                };

            }
        }
    );

    server.registerTool(
        "ValidatePrWithContract",
        {
            title: "Validate Purchase Requisition with Contract",
            description: `
Validates a Purchase Requisition using a contract-based process.
    `,
            inputSchema: {
                requesterId: z
                    .string()
                    .describe("Email ID of the requester. Must be a valid and authorized email address."),

                contractId: z
                    .string()
                    .describe("Contract ID against which the Purchase Requisition is created. Must be a valid contract identifier."),

                productName: z
                    .string()
                    .describe("Product name to be procured. Must match one of the supported product names."),

                description: z
                    .string()
                    .describe("Detailed description of the purchase requirement. Minimum 10 characters.")
                    .optional(),

                quantity: z
                    .number()
                    .describe("Quantity of the product requested. Must be greater than zero and within allowed limits."),

                price: z
                    .number()
                    .describe("Unit price of the product. Must be a positive numeric value."),

                currency: z
                    .string()
                    .describe("3-letter ISO currency code for the price (e.g., USD, INR). Must be supported."),

                supplierId: z
                    .string()
                    .describe("Supplier identifier. Must be selected from supported suppliers."),

                needByDate: z
                    .string()
                    .describe("Required delivery date in ISO format (YYYY-MM-DD). Cannot be in the past."),

                companyCode: z
                    .string()
                    .describe("Company code under which the PR is created. Must be a valid company code."),

                glAccount: z
                    .string()
                    .describe("GL account for posting the purchase cost. Must be a valid GL account."),

                costCenter: z
                    .string()
                    .describe("Cost center responsible for the expense. Must be a valid cost center."),

                isSourcingPr: z
                    .boolean()
                    .describe("Indicates whether the PR is related to sourcing. Optional boolean flag.")
                    .optional()
            }
        },
        async (data) => {

            const valid = await runAllValidations(data, "contract");

            if (!valid.success) {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            status: "Failed",
                            messages: valid.errors
                        }, null, 2)
                    }],
                    isError: true
                };
            }
            else {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            status: "Validated",
                            messages: valid?.message
                        }, null, 2)
                    }]
                };

            }
        }
    );

*/



    const transport = new StreamableHTTPServerTransport({});
    await server.connect(transport);

    app.get("/mcp/health", (req, res) =>
        res.json({ status: "MCP Healthy", tool: "hello_World" })
    );

    app.post("/mcp", (req, res) =>
        transport.handleRequest(req, res, req.body)
    );
})