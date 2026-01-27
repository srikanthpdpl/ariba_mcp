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
    validateIsSourcingPr
} = require("./validate");

module.exports = cds.service.impl(async function () {

    function runAllValidations(data) {
        const validations = [
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

        const failed = validations.find(v => v.success === false);

        if (failed) {
            throw new Error(failed.message);
        }
    }


    this.on('createAribaPurchaseRequisition', async (req) => {
        try {

            runAllValidations(req.data);

            return {
                success: true,
                requisitionId: crypto.randomUUID(),
                status: "Created",
                messages: ["Purchase Requisition Created"]
            };

        } catch (error) {
            return {
                success: false,
                requisitionId: null,
                status: "Failed",
                messages: [error.message || "Validation Failed"]
            };
        }
    });


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
                value: z.any()
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

            const result = validator(value)

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