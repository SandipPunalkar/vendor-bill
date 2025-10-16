CREATE TABLE VendorBill
(
    VendorBillId INT IDENTITY(1,1) PRIMARY KEY,
    VendorBillCode NVARCHAR(100) NULL,
    BillDate DATETIME NULL,
    ReceiptNumber INT NULL, -- FK to POReceiptHeader.POReceiptHeaderId
    PONumber NVARCHAR(100) NULL,
    VendorId INT NULL,
    ChallenNo NVARCHAR(100) NULL,
    ChallenDate DATETIME NULL,
    TermsCode NVARCHAR(50) NULL,
    DueDate DATETIME NULL,
    ChequeNo NVARCHAR(50) NULL,
    ChequeDate DATETIME NULL,
    DepartmentId INT NULL,
    ReceiptAmount DECIMAL(18, 2) NOT NULL,
    TotalGst DECIMAL(18, 2) NOT NULL,
    OtherCharges DECIMAL(18, 2) NULL,
    Discount DECIMAL(18, 2) NULL,
    TotalReceiptAmount DECIMAL(18, 2) NOT NULL,
    Comments NVARCHAR(MAX) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedBy NVARCHAR(100) NULL,
    UpdatedBy NVARCHAR(100) NULL,
    CreatedDate DATETIME NULL,
    UpdatedDate DATETIME NULL,

    -- Foreign keys
    CONSTRAINT FK_VendorBill_POReceiptHeader FOREIGN KEY (ReceiptNumber) REFERENCES POReceiptHeader(POReceiptHeaderId),
    CONSTRAINT FK_VendorBill_Vendor FOREIGN KEY (VendorId) REFERENCES Vendor(VendorId),
    CONSTRAINT FK_VendorBill_Department FOREIGN KEY (DepartmentId) REFERENCES Department(DepartmentId)
);
