const cds = require('@sap/cds');
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
// const { z } = require("zod");
const { v4: uuidv4 } = require('uuid');
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
    validateIsSourcingPr
} = require("./validate");

module.exports = cds.service.impl(async function () {

    this.on('createAribaPurchaseRequisition', async (req) => {
        try {
            validateAccounting();
            validateBuyerAccess();
            validateVendor();
            return {
                success: true,
                requisitionId: uuidv4(),
                status: "Created",
                messages: ["Purchase Requisition Created"]
            }

        } catch (error) {
            return {
                success: false,
                requisitionId: uuidv4(),
                status: "Failed",
                messages: ["Validation Failed"]
            }

        }


    })


    // Tools
    const app = cds.app;

    const server = new McpServer({
        name: "cap-mcp",
        version: "1.0.0"
    });



    const validators = {
        requesterId: validateRequesterId,
        productName: validateProductName,
        description: validateDescription,
        quantity: validateQuantity,
        price: validatePrice,
        currency: validateCurrency,
        supplierId: validateSupplierId,
        needByDate: validateNeedByDate,
        companyCode: validateCompanyCode,
        glAccount: validateGLAccount,
        costCenter: validateCostCenter,
        isSourcingPr: validateIsSourcingPr
    };

    server.registerTool(
        "validate_field",
        {
            title: "Validate Purchase Requisition Field",
            description: `
Validate a single Purchase Requisition field.
Use this tool before creating a Purchase Requisition.
Validate each field independently.
Proceed only when all validations succeed.
    `,
            inputSchema: {
                field: z.enum(Object.keys(validators)),
                value: z.any(),
                context: z.optional(z.object({
                    productName: z.string().optional()
                }))
            }
        },
        async ({ field, value, context }) => {
            const validator = validators[field];

            if (!validator) {
                return {
                    content: [{
                        type: "text",
                        text: JSON.stringify({
                            field,
                            value,
                            success: false,
                            message: `No validator found for field ${field}`
                        }, null, 2)
                    }],
                    isError: true
                };
            }

            const result = validator(value, context);

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify({
                        field,
                        value,
                        ...result
                    }, null, 2)
                }]
            };
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