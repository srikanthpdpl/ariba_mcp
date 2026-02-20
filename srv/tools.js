const cds = require('@sap/cds');
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const { z } = require("zod");
// const { v4: uuidv4 } =  import('uuid');
z.string().des
const {
    validateRequesterId,
    validateCompanyCode,
    validateAddress,
    // validateShipTo,
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
} = require("./validate");
const { startAuthorization } = require('@modelcontextprotocol/sdk/client/auth.js');

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
                validateCompanyCode(data.CompanyCode),
                validateAddress("ShipTo",data.ShipTo,data.CompanyCode),
                validateSupplierId(data.Supplier),
                validateAddress("DeliveryTo",data.DeliveryTo,data.CompanyCode),
                validateAddress("BillTo",data.BillingAddress,data.CompanyCode),
                validateAttachments(data.attachments),  //check Attachment is available
                // validateProductName(""),
                validateDescription(data.Description),
                validateCommodityCode(data.CommodityCode),
                validateNeedByDate(data.NeedBy),
                validateCurrency(data.Currency),
                validateQuantity(data.Quantity),
                validatePrice(data.Amount),
                validateItemCategory(data.ItemCategory),
                validateUOM(data.UnitOfMeasure),
                ///WBS Element????
                //validateAccountAssignment(data.ImportedAccountCategoryStaging),  if Account type Costcenter then Costcenter Validation, else WBSElement Validation
                validateCostCenter(data.CostCenter, data.CompanyCode),
                validateWBSElement(data.WBSCode, data.CompanyCode), // Validate WBS Code...
                // validateGLAccount(data.GLAccount, data.CompanyCode),
                // validateIsSourcingPr(data.isSourcingPr),  //?? 

                //// Optional Fields
                validatecontractWSId(data.contractId), // validate contract WorkspaceID
                validateOnBehalf(data.Requester), // validate on Behalf
                validateComments(data.Comments),
                validateSupplierPartNo(data.SupplierPartNo),
                validateSupplierPartAuxId(data.SupplierPartAuxId),
                validateIncoTermCode(data.IncoTermCode),
                validateIncoTermLocation(data.IncoTermLocation),
                validateDelayPurchaseUntil(data.PurchaseUntil),
                validatePurchaseGroup(data.PurchaseGroup),
                validateIsSourcingPr(data.IsSourcingPr)
            ]);

        }

        if (type === 'contract') {
            validations = await Promise.all([
                validateRequesterId(data.requesterId),
                validateCompanyCode(data.CompanyCode),
                validateAddress("ShipTo",data.ShipTo,data.CompanyCode),
                validateSupplierId(data.Supplier),
                validateAddress("DeliveryTo",data.DeliveryTo,data.CompanyCode),
                validateAddress("BillTo",data.BillingAddress,data.CompanyCode),
                validateAttachments(data.attachments),   //check Attachment is available
                // validateProductName(""),
                validateDescription(data.Description),
                validateCommodityCode(data.CommodityCode),
                validateNeedByDate(data.NeedBy),
                validateCurrency(data.Currency),
                validateQuantity(data.Quantity),
                validatePrice(data.Amount),
                validateItemCategory(data.ItemCategory),
                validateUOM(data.UnitOfMeasure),
                ///WBS Element????
                //validateAccountAssignment(data.ImportedAccountCategoryStaging),  if Account type Costcenter then Costcenter Validation, else WBSElement Validation
                validateCostCenter(data.CostCenter, data.CompanyCode),
                validateWBSElement(data.WBSCode, data.CompanyCode), // Validate WBS Code...
                // validateGLAccount(data.GLAccount, data.CompanyCode),
                // validateIsSourcingPr(data.isSourcingPr),  //?? 
                validateServiceName(""),  // Service Name...???
                validateServiceStartDate(data.ServiceStartDate),
                validateServiceEndDate(data.ServiceEndDate),
                validateMaxAmount(data.MaxAmount),
                validateExpectedAmount(data.ExpectedAmount),

                //// Optional Fields
                validatecontractWSId(data.contractId), // validate contract WorkspaceID
                validateOnBehalf(data.Requester), // validate on Behalf
                validateComments(data.Comments),
                validateSupplierPartNo(data.SupplierPartNo),
                validateSupplierPartAuxId(data.SupplierPartAuxId),
                validateIncoTermCode(data.IncoTermCode),
                validateIncoTermLocation(data.IncoTermLocation),
                validateDelayPurchaseUntil(data.PurchaseUntil),
                validatePurchaseGroup(data.PurchaseGroup),
                validateIsSourcingPr(data.IsSourcingPr)

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

    function constructInput(data) {
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
                                        "UniqueName": data.CompanyCode
                                    },
                                    "DefaultLineItem": {
                                        "DeliverTo": data.DeliverTo,
                                        "NeedBy": data.NeedBy
                                    },
                                    "LineItems": {
                                        "item": [
                                            {
                                                "BillingAddress": {
                                                    "UniqueName": data.BillingAddress
                                                },
                                                "CommodityCode": {
                                                    "UniqueName": data.CommodityCode
                                                },
                                                "Description": {
                                                    "CommonCommodityCode": {
                                                        "Domain": "custom",
                                                        "UniqueName": data.CommodityCode
                                                    },
                                                    "Description": data.Description,
                                                    "Price": {
                                                        "Amount": data.Amount,
                                                        "Currency": {
                                                            "UniqueName": data.Currency
                                                        }
                                                    },
                                                    "UnitOfMeasure": {
                                                        "UniqueName": data.UnitOfMeasure
                                                    }
                                                },
                                                "ImportedAccountCategoryStaging": {
                                                    "UniqueName": data.ImportedAccountCategoryStaging
                                                },
                                                "ImportedAccountingsStaging": {
                                                    "SplitAccountings": {
                                                        "item": [
                                                            {
                                                                "Account": {
                                                                    "UniqueName": data.Account
                                                                },
                                                                "CostCenter": {
                                                                    "UniqueName": data.CostCenter
                                                                },
                                                                "GLAccount": {
                                                                    "UniqueName": data.GLAccount
                                                                },
                                                                "NumberInCollection": data.NumberInCollection,
                                                                "Percentage": data.Percentage,
                                                                "ProcurementUnit": {
                                                                    "UniqueName": data.ProcurementUnit
                                                                }
                                                            }
                                                        ]
                                                    }
                                                },
                                                "ItemCategory": {
                                                    "UniqueName": data.ItemCategory
                                                },
                                                "NumberInCollection": data.NumberInCollection,
                                                "OriginatingSystemLineNumber": data.OriginatingSystemLineNumber,
                                                "PurchaseGroup": {
                                                    "UniqueName": data.PurchaseGroup
                                                },
                                                "PurchaseOrg": {
                                                    "UniqueName": data.PurchaseOrg
                                                },
                                                "Quantity": data.Quantity,
                                                "ShipTo": {
                                                    "UniqueName": data.ShipTo
                                                },
                                                "Supplier": {
                                                    "UniqueName": data.Supplier
                                                },
                                                "SupplierLocation": {
                                                    "UniqueName": data.SupplierLocation
                                                },
                                                "ServiceDetails": {
                                                    "ExpectedAmount": data.ExpectedAmount,
                                                    "MaxAmount": data.MaxAmount,
                                                    "ServiceEndDate": data.ServiceEndDate,
                                                    "ServiceStartDate": data.ServiceStartDate
                                                },
                                                "ImportedNeedByStaging": data.ImportedNeedByStaging,
                                                "ImportedDeliverToStaging": data.ImportedDeliverToStaging
                                            }
                                        ]
                                    },
                                    "Name": data.Name,
                                    "OriginatingSystem": data.OriginatingSystem,
                                    "Preparer": {
                                        "PasswordAdapter": data.PasswordAdapter,
                                        "UniqueName": data.Preparer
                                    },
                                    "Requester": {
                                        "PasswordAdapter": data.PasswordAdapter,
                                        "UniqueName": data.Requester
                                    },
                                    "UniqueName": data.UniqueName
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

            const inputjson = constructInput(req.data)
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

                requesterId: z
                    .string()
                    .describe("Validated requester email ID. Must be authorized."),

                CompanyCode: z
                    .string()
                    .describe("Validated Company Code. Must be supported by the system."),

                DeliverTo: z
                    .string()
                    .describe("Validated purchase description. Minimum 3 characters."),

                NeedBy: z
                    .string()
                    .describe("Validated NeedBy. Date format should be ISO 8601 date format"),

                BillingAddress: z
                    .string()
                    .describe("Validated quoted price. Must be a String value."),

                CommodityCode: z
                    .string()
                    .describe("Validated Commodity code. Must be supported."),

                Description: z
                    .string()
                    .describe("Validated Description. Must more than 10 characters."),

                Amount: z
                    .number()
                    .describe("Validated Amount. Must be numeric value"),

                Currency: z
                    .string()
                    .describe("Validated Currency. Must be in ISO 4217 standard"),

                UnitOfMeasure: z
                    .string()
                    .describe("Validated UnitOfMeasure. Must support System."),

                ImportedAccountCategoryStaging: z
                    .string()
                    .describe("Validated ImportedAccountCategoryStaging.").optional(),

                Account: z
                    .string()
                    .describe("Validated Account."),

                CostCenter: z
                    .string()
                    .describe("Validated CostCenter"),

                NumberInCollection: z
                    .string()
                    .describe("Validated NumberInCollection. Must be numeric"),
                Percentage: z
                    .string()
                    .describe("Validated Percentage. Must be numeric"),
                ProcurementUnit: z
                    .string()
                    .describe("Validated ProcurementUnit. Must support system"),
                ItemCategory: z
                    .string()
                    .describe("Validated ItemCategory. Single character like 'M' "),
                OriginatingSystemLineNumber: z
                    .string()
                    .describe("Validated OriginatingSystemLineNumber"),
                PurchaseGroup: z
                    .string()
                    .describe("Validated PurchaseGroup. Must support system"),
                PurchaseOrg: z
                    .string()
                    .describe("Validated PurchaseOrg. Must support system"),
                Quantity: z
                    .string()
                    .describe("Validated Quantity. Must be numeric"),
                ShipTo: z
                    .string()
                    .describe("Validated ShipTo. Must support system"),
                Supplier: z
                    .string()
                    .describe("Validated Supplier. Must support system"),
                SupplierLocation: z
                    .string()
                    .describe("Validated SupplierLocation. Must support system"),
                ImportedNeedByStaging: z
                    .string()
                    .describe("Validated ImportedNeedByStaging. Date format should be ISO 8601 date format"),
                ImportedDeliverToStaging: z
                    .string()
                    .describe("Validated ImportedDeliverToStaging. Must be string"),
                Name: z
                    .string()
                    .describe("Validated Name. Must be string"),
                OriginatingSystem: z
                    .string()
                    .describe("Validated OriginatingSystem. Must support system"),
                PasswordAdapter: z
                    .string()
                    .describe("Validated PasswordAdapter. Must support system"),
                Preparer: z
                    .string()
                    .describe("Validated Preparer. Must support system"),
                Requester: z
                    .string()
                    .describe("Validated Requester. Must support system"),
                UniqueName: z
                    .string()
                    .describe("Validated UniqueName. Must be string"),

                isSourcingPr: z
                    .boolean()
                    .describe("Validated sourcing flag. Boolean value indicating sourcing relevance.")
                    .optional(),

                ServiceStartDate: z
                    .string()
                    .describe("Validated serviceStartDate. Date format should be ISO 8601 date format").optional(),

                ServiceEndDate: z
                    .string()
                    .describe("Validated servcieEndDate. Date format should be ISO 8601 date format").optional(),

                MaxAmount: z
                    .number()
                    .describe("Validated MaxAmount. Must be numeric value").optional(),

                ExpectedAmount: z
                    .number()
                    .describe("Validated ExpectedAmount. Must be numeric value").optional(),
            }
        },
        async (data) => {
            console.log("Data from Create from contract:  --  ", data)
            try {
                const valid = await runAllValidations(data, "contract");

                if (!valid.success) {
                    throw new Error(valid.errors.map(v => v.message).join("; "));
                }

                /// Sample test run ...
                const inputjson = constructInput(data)
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

                CompanyCode: z
                    .string()
                    .describe("Validated Company Code. Must be supported by the system."),

                DeliverTo: z
                    .string()
                    .describe("Validated purchase description. Minimum 3 characters."),

                NeedBy: z
                    .string()
                    .describe("Validated NeedBy. Date format should be ISO 8601 date format"),

                BillingAddress: z
                    .string()
                    .describe("Validated quoted price. Must be a String value."),

                CommodityCode: z
                    .string()
                    .describe("Validated Commodity code. Must be supported."),

                Description: z
                    .string()
                    .describe("Validated Description. Must more than 10 characters."),

                Amount: z
                    .number()
                    .describe("Validated Amount. Must be numeric value"),

                Currency: z
                    .string()
                    .describe("Validated Currency. Must be in ISO 4217 standard"),

                UnitOfMeasure: z
                    .string()
                    .describe("Validated UnitOfMeasure. Must support System."),

                ImportedAccountCategoryStaging: z
                    .string()
                    .describe("Validated ImportedAccountCategoryStaging.").optional(),

                Account: z
                    .string()
                    .describe("Validated Account."),

                CostCenter: z
                    .string()
                    .describe("Validated CostCenter"),

                NumberInCollection: z
                    .string()
                    .describe("Validated NumberInCollection. Must be numeric"),
                Percentage: z
                    .string()
                    .describe("Validated Percentage. Must be numeric"),
                ProcurementUnit: z
                    .string()
                    .describe("Validated ProcurementUnit. Must support system"),
                ItemCategory: z
                    .string()
                    .describe("Validated ItemCategory. Single character like 'M' "),
                OriginatingSystemLineNumber: z
                    .string()
                    .describe("Validated OriginatingSystemLineNumber"),
                PurchaseGroup: z
                    .string()
                    .describe("Validated PurchaseGroup. Must support system"),
                PurchaseOrg: z
                    .string()
                    .describe("Validated PurchaseOrg. Must support system"),
                Quantity: z
                    .string()
                    .describe("Validated Quantity. Must be numeric"),
                ShipTo: z
                    .string()
                    .describe("Validated ShipTo. Must support system"),
                Supplier: z
                    .string()
                    .describe("Validated Supplier. Must support system"),
                SupplierLocation: z
                    .string()
                    .describe("Validated SupplierLocation. Must support system"),
                ImportedNeedByStaging: z
                    .string()
                    .describe("Validated ImportedNeedByStaging. Date format should be ISO 8601 date format"),
                ImportedDeliverToStaging: z
                    .string()
                    .describe("Validated ImportedDeliverToStaging. Must be string"),
                Name: z
                    .string()
                    .describe("Validated Name. Must be string"),
                OriginatingSystem: z
                    .string()
                    .describe("Validated OriginatingSystem. Must support system"),
                PasswordAdapter: z
                    .string()
                    .describe("Validated PasswordAdapter. Must support system"),
                Preparer: z
                    .string()
                    .describe("Validated Preparer. Must support system"),
                Requester: z
                    .string()
                    .describe("Validated Requester. Must support system"),
                UniqueName: z
                    .string()
                    .describe("Validated UniqueName. Must be string"),

                isSourcingPr: z
                    .boolean()
                    .describe("Validated sourcing flag. Boolean value indicating sourcing relevance.")
                    .optional(),

                ServiceStartDate: z
                    .string()
                    .describe("Validated serviceStartDate. Date format should be ISO 8601 date format").optional(),

                ServiceEndDate: z
                    .string()
                    .describe("Validated servcieEndDate. Date format should be ISO 8601 date format").optional(),

                MaxAmount: z
                    .number()
                    .describe("Validated MaxAmount. Must be numeric value").optional(),

                ExpectedAmount: z
                    .number()
                    .describe("Validated ExpectedAmount. Must be numeric value").optional(),
            }
        },
        async (data) => {
            console.log("Data from Create from quotation:  --  ", data)
            try {
                const valid = await runAllValidations(data, "quotation");

                if (!valid.success) {
                    throw new Error(valid.errors.map(v => v.message).join("; "));
                }

                const inputjson = constructInput(data)
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
                console.log("Data from Create from contract:  --  ", data )
                try {
                    const valid = await runAllValidations(data, "contract");
    
                    if (!valid.success) {
                        throw new Error(valid.errors.map(v => v.message).join("; "));
                    }
    
                    /// Sample test run ...
                    const inputjson = constructInput(data)
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
                console.log("Data from Create from quotation:  --  ", data )
                try {
                    const valid = await runAllValidations(data, "quotation");
    
                    if (!valid.success) {
                        throw new Error(valid.errors.map(v => v.message).join("; "));
                    }
    
                    const inputjson = constructInput(data)
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