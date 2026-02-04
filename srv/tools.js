const cds = require('@sap/cds');
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const { z } = require("zod");
// const { v4: uuidv4 } =  import('uuid');
z.string().des
const {
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
} = require("./validate");

module.exports = cds.service.impl(async function () {

    async function runAllValidations(data) {
        var validations = [];
        const type = data.type;
        if (type === 'quotation') {
            validations = [
               await validateRequesterId(data.requesterId),
                validateProductName(data.productName),
                validateDescription(data.description),
                validateQuantity(data.quantity),
                validatePrice(data.price),
                validateCurrency(data.currency),
                validateSupplierId(data.supplierId),
                validateNeedByDate(data.needByDate),
                validateCompanyCode(data.companyCode),
                validateGLAccount(data.glAccount),
                validateCostCenter(data.costCenter),
                validateIsSourcingPr(data.isSourcingPr)
            ];

        }

        if (type === 'contract') {
            validations = [
               await validateRequesterId(data.requesterId),
                validateContractId(data.contractId),
                validateDescription(data.description),
                validateQuantity(data.quantity),
                validateNeedByDate(data.needByDate),
                validateCompanyCode(data.companyCode),
                validateGLAccount(data.glAccount),
                validateCostCenter(data.costCenter),
                validateIsSourcingPr(data.isSourcingPr)
            ];

        }

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


    /*
    this.on('createAribaPurchaseRequisition', async (req) => {
        // try {

        //     await runAllValidations(req.data);

        //     return {
        //         success: true,
        //         requisitionId: crypto.randomUUID(),
        //         status: "Created",
        //         messages: ["Purchase Requisition Created"]
        //     };

        // } catch (error) {
        //     return {
        //         success: false,
        //         requisitionId: null,
        //         status: "Failed",
        //         messages: [error.message || "Validation Failed"]
        //     };
        // }
        try {
                const valid = await runAllValidations(data, "contract");

                if (!valid.success) {
                    throw new Error(valid.errors.map(v => v.message).join("; "));
                }

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            requisitionId: crypto.randomUUID(),
                            status: "Created",
                            messages: ["Purchase Requisition created successfully using Contract"]
                        }, null, 2)
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
    });
*/

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

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            requisitionId: crypto.randomUUID(),
                            status: "Created",
                            messages: ["Purchase Requisition created successfully using Contract"]
                        }, null, 2)
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

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            requisitionId: crypto.randomUUID(),
                            status: "Created",
                            messages: ["Purchase Requisition created successfully using Quotation"]
                        }, null, 2)
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


  


    const transport = new StreamableHTTPServerTransport({});
    await server.connect(transport);

    app.get("/mcp/health", (req, res) =>
        res.json({ status: "MCP Healthy", tool: "hello_World" })
    );

    app.post("/mcp", (req, res) =>
        transport.handleRequest(req, res, req.body)
    );
})