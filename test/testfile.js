// TEST SCRIPT: Try different attachment methods to find what Ariba accepts
// Since the error says "mtom is disabled" but WSDL might define MTOM,
// this is likely a server configuration vs WSDL mismatch

import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const ARIBA_USERNAME = "Santosh.Lokhande@lipton.com";
const ARIBA_PASSWORD = "Danfug-mecso9-ruvrom";
const ARIBA_REQUISITION_IMPORT_URL = "https://s1-eu.ariba.com/Buyer/soap/EKATERRA1-T/RequisitionImportPull";

function escapeXml(v) {
  if (v === null || v === undefined) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;');
}

function fileToBase64(relativeFilePath) {
    const filePath = path.resolve(__dirname, relativeFilePath);
    const fileBuffer = fs.readFileSync(filePath);
    return fileBuffer.toString('base64');
}

// ====================================================================================
// APPROACH 1: Try WITHOUT any attachment (to isolate the issue)
// ====================================================================================
function buildEnvelopeWithoutAttachment(input) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
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
          <urn:CompanyCode>
            <urn:UniqueName>${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].CompanyCode.UniqueName)}</urn:UniqueName>
          </urn:CompanyCode>

          <!-- NO ATTACHMENTS - Comment out to test if PR creation works without attachments -->
          
          <urn:LineItems>
            <!-- Your line items -->
          </urn:LineItems>

          <urn:Name>${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].Name)}</urn:Name>
          <urn:Requester>
            <urn:PasswordAdapter>${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].Requester.PasswordAdapter)}</urn:PasswordAdapter>
            <urn:UniqueName>${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].Requester.UniqueName)}</urn:UniqueName>
          </urn:Requester>
          <urn:UniqueName>${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].UniqueName)}</urn:UniqueName>
        </urn:item>
      </urn:Requisition_RequisitionImportPull_Item>
    </urn:RequisitionImportPullRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}

// ====================================================================================
// APPROACH 2: Empty Attachment element (minimal structure from WSDL)
// ====================================================================================
function buildEnvelopeWithEmptyAttachment(input) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
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
          <urn:CompanyCode>
            <urn:UniqueName>${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].CompanyCode.UniqueName)}</urn:UniqueName>
          </urn:CompanyCode>

          <urn:Attachments>
            <urn:item>
              <urn:Attachment>
                <urn:ContentType>application/pdf</urn:ContentType>
                <urn:Filename>sample.pdf</urn:Filename>
                <!-- Just ContentType and Filename, nothing else -->
              </urn:Attachment>

              <urn:MappedFilename>cid:sample.pdf@ariba.com</urn:MappedFilename>
              <urn:ExternalAttachment>true</urn:ExternalAttachment>
              <urn:URL>http://example.com/sample.pdf</urn:URL>
            </urn:item>
          </urn:Attachments>
          
          <!-- Rest of request -->
        </urn:item>
      </urn:Requisition_RequisitionImportPull_Item>
    </urn:RequisitionImportPullRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}

// ====================================================================================
// SOLUTION: The REAL problem - WSDL expects MTOM but server has it disabled
// ====================================================================================
// Based on your error, the WSDL likely HAS xop:Include defined (that's why you tried it)
// But the SERVER has MTOM disabled (configuration mismatch)
// 
// The solution is to contact Ariba support and ask them to either:
// 1. Enable MTOM on the server to match the WSDL, OR
// 2. Provide an updated WSDL that doesn't use MTOM

async function testApproach(approachName, soapEnvelope) {
    console.log(`\n========================================`);
    console.log(`Testing: ${approachName}`);
    console.log(`========================================`);
    
    const auth = Buffer.from(`${ARIBA_USERNAME}:${ARIBA_PASSWORD}`).toString('base64');

    try {
        const response = await fetch(ARIBA_REQUISITION_IMPORT_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'text/xml; charset=UTF-8',
                'SOAPAction': 'RequisitionImportPull'
            },
            body: soapEnvelope
        });

        const responseText = await response.text();
        
        console.log('Status:', response.status);
        console.log('Response:', responseText.substring(0, 500));
        
        if (response.ok || !responseText.includes('mtom is disabled')) {
            console.log(`✅ SUCCESS or DIFFERENT ERROR - ${approachName} might work!`);
            return { success: true, approach: approachName, response: responseText };
        } else {
            console.log(`❌ Same MTOM error - ${approachName} doesn't work`);
            return { success: false, approach: approachName };
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        return { success: false, approach: approachName, error: error.message };
    }
}

// ====================================================================================
// RUN ALL TESTS
// ====================================================================================
async function runDiagnostics(input) {
    console.log('Starting Ariba Attachment Diagnostics...');
    console.log('This will test different approaches to find what works.\n');

    const results = [];

    // Test 1: No attachments at all
    console.log('TEST 1: Creating PR without attachments (baseline test)');
    const envelope1 = buildEnvelopeWithoutAttachment(input);
    results.push(await testApproach('No Attachments', envelope1));

    // Test 2: External attachment reference
    console.log('\nTEST 2: External attachment URL reference');
    const envelope2 = buildEnvelopeWithEmptyAttachment(input);
    results.push(await testApproach('External Attachment URL', envelope2));

    // Summary
    console.log('\n\n========================================');
    console.log('DIAGNOSTIC SUMMARY');
    console.log('========================================');
    results.forEach(r => {
        console.log(`${r.success ? '✅' : '❌'} ${r.approach}`);
    });

    return results;
}


    function constructInput()
    {
        return {
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

// module.exports = {
//     runDiagnostics,
//     testApproach
// };

await runDiagnostics(constructInput());