

async function getServiceReqInputXML(input) {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:urn="urn:Ariba:Buyer:vsap"
                  xmlns:xop="http://www.w3.org/2004/08/xop/include">
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


              <urn:ServiceDetails>
                        <urn:ExpectedAmount>
                           <urn:Amount> ${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].ServiceDetails.ExpectedAmount)}
                           </urn:Amount>
                           <urn:Currency>
                              <urn:UniqueName>${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].Description.Price.Currency.UniqueName)}
                              </urn:UniqueName>
                           </urn:Currency>
                        </urn:ExpectedAmount>
                        <urn:MaxAmount>
                           <urn:Amount>${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].ServiceDetails.MaxAmount)}
                           </urn:Amount>
                           <urn:Currency>
                              <urn:UniqueName>${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].Description.Price.Currency.UniqueName)}
                              </urn:UniqueName>
                           </urn:Currency>
                        </urn:MaxAmount>
                        <urn:ServiceEndDate>${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].ServiceDetails.ServiceEndDate)}
                        </urn:ServiceEndDate>
                        <urn:ServiceStartDate>${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].LineItems.item[0].ServiceDetails.ServiceStartDate)}
                        </urn:ServiceStartDate>                 
                </urn:ServiceDetails>


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

          <urn:Attachments>

          <urn:item>
            <urn:Attachment>
              <urn:ContentType>application/pdf</urn:ContentType>
              <urn:Filename>sample.pdf</urn:Filename>
            </urn:Attachment>
            <urn:Date>2021-06-16T07:39:46Z</urn:Date>
            <urn:ExternalAttachment>false</urn:ExternalAttachment>
            <urn:MappedFilename><inc:Include href="cid:sample.pdf" xmlns:inc="http://www.w3.org/2004/08/xop/include"/></urn:MappedFilename>
              <urn:User>
              <urn:PasswordAdapter>${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].Requester.PasswordAdapter)}</urn:PasswordAdapter>
              <urn:UniqueName>${escapeXml(input.Envelope.Body.RequisitionImportPullRequest.Requisition_RequisitionImportPull_Item.item[0].Requester.UniqueName)}</urn:UniqueName>
            </urn:User>
          </urn:item>

          </urn:Attachments>

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
module.exports = {getServiceReqInputXML}