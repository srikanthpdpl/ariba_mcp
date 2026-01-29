const cds = require('@sap/cds');
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const { z } = require("zod");
// const { v4: uuidv4 } =  import('uuid');
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

    function runAllValidations(data, type) {
        var validations = [];

        if (type === 'quotation') {
            validations = [
                validateRequesterId(data.requesterId),
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
                validateRequesterId(data.requesterId),
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

        const failed = validations.find(v => v.success === false);

        if (failed) {
            throw new Error(failed.message);
        }
    }





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
Executes only after all required input fields are successfully validated.
    `,
            inputSchema: {
                requesterId: z.string(),
                contractId: z.string(),
                description: z.string().optional(),
                quantity: z.number(),
                needByDate: z.string(),
                companyCode: z.string(),
                glAccount: z.string(),
                costCenter: z.string(),
                isSourcingPr: z.boolean()
            }
        },
        async (data) => {
            try {

                runAllValidations(data);

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            requisitionId: crypto.randomUUID(),
                            status: "Created",
                            messages: ["Purchase Requisition Created using Contract"]
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
Executes only after all required input fields are successfully validated.
    `,
            inputSchema: {
                requesterId: z.string(),
                productName: z.string(),
                description: z.string().optional(),
                quantity: z.number(),
                price: z.number(),
                currency: z.string(),
                supplierId: z.string(),
                needByDate: z.string(),
                companyCode: z.string(),
                glAccount: z.string(),
                costCenter: z.string(),
                isSourcingPr: z.boolean()
            }
        },
        async (data) => {
            try {

                runAllValidations(data);

                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            requisitionId: crypto.randomUUID(),
                            status: "Created",
                            messages: ["Purchase Requisition Created using Quotation"]
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


    const fieldValidators = {
        requesterId: {
            title: "Validate Requester ID",
            description: "Validate requester ID for Purchase Requisition",
            schema: z.string(),
            fn: validateRequesterId
        },
        productName: {
            title: "Validate Product Name",
            description: "Validate product name for Purchase Requisition",
            schema: z.string(),
            fn: validateProductName
        },
        description: {
            title: "Validate Description",
            description: "Validate PR description",
            schema: z.string().optional(),
            fn: validateDescription
        },
        quantity: {
            title: "Validate Quantity",
            description: "Validate requested quantity",
            schema: z.number(),
            fn: validateQuantity
        },
        price: {
            title: "Validate Price",
            description: "Validate unit price",
            schema: z.number(),
            fn: validatePrice
        },
        currency: {
            title: "Validate Currency",
            description: "Validate currency code",
            schema: z.string(),
            fn: validateCurrency
        },
        supplierId: {
            title: "Validate Supplier ID",
            description: "Validate supplier ID",
            schema: z.string(),
            fn: validateSupplierId
        },
        needByDate: {
            title: "Validate Need By Date",
            description: "Validate need-by date",
            schema: z.string(),
            fn: validateNeedByDate
        },
        companyCode: {
            title: "Validate Company Code",
            description: "Validate company code",
            schema: z.string(),
            fn: validateCompanyCode
        },
        glAccount: {
            title: "Validate GL Account",
            description: "Validate GL account",
            schema: z.string(),
            fn: validateGLAccount
        },
        costCenter: {
            title: "Validate Cost Center",
            description: "Validate cost center",
            schema: z.string(),
            fn: validateCostCenter
        },
        isSourcingPr: {
            title: "Validate Sourcing Flag",
            description: "Validate sourcing PR flag",
            schema: z.boolean(),
            fn: validateIsSourcingPr
        },
        contractId: {
            title: "Validate Contract ID",
            description: "Validate contract ID",
            schema: z.string(),
            fn: validateContractId
        }
    };


    Object.entries(fieldValidators).forEach(
        ([field, config]) => {
            server.registerTool(
                `validate${field.charAt(0).toUpperCase()}${field.slice(1)}`,
                {
                    title: config.title,
                    description: config.description,
                    inputSchema: {
                        value: config.schema
                    }
                },
                async ({ value }) => {
                    const result = config.fn(value);

                    return {
                        content: [{
                            type: "text",
                            text: JSON.stringify({
                                field,
                                value,
                                ...result
                            }, null, 2)
                        }],
                        isError: result.success === false
                    };
                }
            );
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