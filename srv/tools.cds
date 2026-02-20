 service McpService  @(path:'/mcps') {
  
  // action createAribaPurchaseRequisition(
  //   requesterId : String,
  //   productName : String,
  //   description : String,
  //   quantity    : Integer,
  //   price       : Decimal(13,3),
  //   currency    : String,
  //   supplierId  : String,
  //   needByDate  : String, // ISO yyyy-MM-dd
  //   companyCode : String,
  //   glAccount   : String,
  //   costCenter  : String,
  //   isSourcingPr: Boolean,
  //   type        : String,
  // ) returns {
  //   success       : Boolean;
  //   requisitionId : String;
  //   status        : String;
  //   messages      : many String;
  // };

  action createAribaPurchaseRequisition(
    CompanyCode : String,
    DeliverTo : String,
    NeedBy : String,
    BillingAddress    : String,
    CommodityCode       : String,
    Description: String,
    Amount:Integer,
    Currency: String,
    UnitOfMeasure: String,
    ImportedAccountCategoryStaging: String,
    Account: String,
    CostCenter: String,
    GLAccount: String,
    NumberInCollection: Integer,
    Percentage: Integer,
    ProcurementUnit: String,
    ItemCategory: String,
    OriginatingSystemLineNumber: String,
    PurchaseGroup: String,
    PurchaseOrg: String,
    Quantity: Integer,
    ShipTo: String,
    Supplier: String,
    SupplierLocation: String,
    ImportedNeedByStaging: String,
    ImportedDeliverToStaging: String,
    Name: String,
    OriginatingSystem: String,
    PasswordAdapter: String,
    Preparer: String,
    Requester: String,
    UniqueName: String,
    requesterId: String,

    ServiceStartDate: String,
    ServiceEndDate: String,
    MaxAmount: Integer,
    ExpectedAmount: Integer

  ) returns {
    success       : Boolean;
    requisitionId : String;
    status        : String;
    messages      : many String;
  };
}

