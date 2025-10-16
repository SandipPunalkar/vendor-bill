import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AdministratorService } from '../../../services/administrator.service';
import { InventoryService } from '../../../services/inventory.service';
import _ from 'lodash';
import { Department, gridPageRequest, Product, ProjectPhase, VendorBill } from '../../../model/common/common.model';
import { Warehouse } from '../../../model/administration.model';
import { VendorLookupComponent } from '../../Lookup/vendor-lookup/vendor-lookup.component';
import { PurchaseorderService } from '../../../services/purchaseorder.service';
import { TermscodeLookupComponent } from '../../Lookup/termscode-lookup/termscode-lookup.component';
import { PurchaseOrderReceiptLookupComponent } from '../../Lookup/purchase-order-receipt-lookup/purchase-order-receipt-lookup.component';

@Component({
    selector: 'app-vendor-bill',
    standalone: true,
    imports: [SharedModule, CommonModule],
    templateUrl: './vendor-bill.component.html',
    styleUrls: ['./vendor-bill.component.css']
})
export class VendorBillComponent implements OnInit {

    constructor(public dialogService: DialogService, public ref: DynamicDialogRef, private warehouseService: AdministratorService, private porderservice: PurchaseorderService, private administratorService: AdministratorService, private confirmationService: ConfirmationService, private inventoryService: InventoryService, private cdRef: ChangeDetectorRef, private messageService: MessageService, private router: Router, private routers: ActivatedRoute) { }
    // Example property
    //vendorName: string = 'Acme Corp';
    loader: boolean = false;
    submitted: boolean = false;
    isEditMode: boolean = false;
    isManual: boolean = false;
    disablePo: boolean = false;
    vendorBill: VendorBill[] = [];
    PurchaseOrderNumber: any;
    vendorState: string | undefined;
    warehouseState: string | undefined;
    POTotal: number = 0;
    warehouseDropdown: any[] = [];
    departmentDropdown: any[] = [];
    filtewarehouse: Warehouse[] = [];
    filterDepartments: Department[] = [];
    products: Product[] = [];
    DeptLabel: string = '';
    VendorName: any;
    ReceiptList: any[] = [];
    selectedCustomerName: string | null = null;
    unitLabel: string = '';

    createVendorBillForm = new FormGroup({
        vendorBillId: new FormControl(null),
        // vendorBillCode: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]*$/)]),
        vendorBillCode: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]*$/)]),
        //receiptNumber: new FormControl(''),
        POReceiptHeaderId: new FormControl(null),
        POReceiptNumber: new FormControl(''),
        PurchaseOrderNumber: new FormControl(''),

        billDate: new FormControl('', Validators.required),
        departments: new FormControl(),
        departmentId: new FormControl(),
        departmentCode: new FormControl(),
        departmentName: new FormControl('', Validators.required),
        warehouseId: new FormControl(),
        warehouseCode: new FormControl(),
        warehouseName: new FormControl(),
        warehouseAddress: new FormControl(''),
        vendor: new FormControl(),
        vendorName: new FormControl('', Validators.required),
        vendorId: new FormControl(),
        vendorCode: new FormControl('', Validators.required),
        termsCode: new FormControl('', Validators.required),
        add: new FormControl(),
        challenNo: new FormControl(''),
        challenDate: new FormControl<Date | null>(null),
        chequeNo: new FormControl(''),
        chequeDate: new FormControl(''),
        receiptAmount: new FormControl('', Validators.required),
        totalGst: new FormControl('', Validators.required),
        otherCharges: new FormControl(),
        discount: new FormControl(),
        totalReceiptAmount: new FormControl('', Validators.required),

        poNumber: new FormControl(),

        dueDate: new FormControl('', Validators.required),
        //endDate: new FormControl('', Validators.required),
        comments: new FormControl(''),

        IsActive: new FormControl(true),
        CreatedBy: new FormControl(''),
        manualEntry: new FormControl(false),
        createdDate: new FormControl()
    });


    pageRequest: gridPageRequest = {
        pageIndex: 0,
        pageSize: 20,
        id: 0
    }

    ngOnInit(): void {
        document.title = 'Create Vendor Bill';

        this.getWarehouse();
        this.getDepartment();
        this.createVendorBillForm.controls.CreatedBy.setValue(localStorage.getItem('username'));
        this.getGroupIdFromQuery();
        this.manualEntry();
        // this.editPOReceiptHeader();
        const currentDate = new Date();
        this.createVendorBillForm.controls.createdDate.setValue(currentDate);
        // this.getnextPoReceiptNumber();
        // this.getReceipt();
        // this.getSystemConfigData();
        this.getDeptLabel();
        this.getUnitLabel();
    }



    showPO() {
        if (this.createVendorBillForm.controls.POReceiptNumber.value) {
            return;
        }

        // this.ref = this.dialogService.open(POListLookupComponent, {
        //   header: 'Purchase Order List',
        //   width: '60%',
        // });

        this.ref.onClose.subscribe((data: any) => {
            if (data) {
                this.loader = true;
                this.createVendorBillForm.controls.PurchaseOrderNumber.setValue(data.purchaseOrderNumber);
                this.PurchaseOrderNumber = data.purchaseOrderNumber;

                // this.porderservice.getPurchaseOrderById(data.purchaseOrderId).subscribe(
                //   (poData: any) => {
                //     this.createVendorBillForm.patchValue({
                //       'PurchaseOrderId': poData.purchaseOrderId,
                //       'ProjectBoMCode': poData.projectBoMCode,
                //       'departments': poData.department.departmentCode,
                //       'departmentName': poData.department.departmentName,
                //       'departmentCode': poData.department.departmentCode,
                //       'departmentId': poData.department.departmentId,
                //       'warehouses': poData.warehouse.warehouseCode,
                //       'warehouseName': poData.warehouse.warehouseName,
                //       'productSpecification': poData.productSpecification,
                //       'warehouseCode': poData.warehouse.warehouseCode,
                //       'warehouseId': poData.warehouse.warehouseId,
                //       'vendorName': poData.vendor.vendorName,
                //       'vendorCode': poData.vendor.vendorCode,
                //       'vendorId': poData.vendor.vendorId,
                //       'RequestedDate': new Date(poData.requestedDate),
                //       'createdDate': new Date(poData.createdDate),
                //       'ReceiveDate': new Date(),
                //       'shipViaCode': poData.shipViaCode,
                //       'termsCode': poData.termsCode,
                //       'specialInstruction': poData.specialInstruction,
                //       'OrderComment': poData.purchaseOrderComment,
                //       'add': `${poData.vendor.address.addressLine1},${poData.vendor.address.city}, ${poData.vendor.address.state},${poData.vendor.address.country},${poData.vendor.address.zip}`,
                //       'warehouseAddress': `${poData.warehouse.address.city} , ${poData.warehouse.address.state} , ${poData.warehouse.address.country} , ${poData.warehouse.address.zip}`,
                //       'Taxes': poData.taxes,
                //       'ProjectNo': poData.projectName,
                //       'wbs': poData.wbs,
                //       'Delivery': poData.delivery,
                //       'Transport': poData.transport,
                //       'Validity': poData.validity,
                //     });

                //     this.warehouseState = poData.warehouse.address.state;
                //     this.vendorState = poData.vendor.address.state;
                //     this.POTotal = poData.poTotal;

                //     const bomCode = poData.projectBoMCode;
                //     if (bomCode) {
                //       this.inventoryService.getProjectBomCode(bomCode).subscribe(
                //         (projectData: any) => {
                //           this.createVendorBillForm.patchValue({
                //             'projectDescription': projectData.projectBoMDescription
                //           });
                //         },
                //         (err: any) => {
                //           console.error('Error fetching project description:', err);
                //         }
                //       );
                //     }

                //     // this.getLineItemByPoNo();
                //     // this.getLinkedFileList(this.PurchaseOrderNumber);
                //   },
                //   (error: any) => {
                //     console.error(error);
                //     this.loader = false;
                //   }
                // );
            }
        });
    }

    save(data: any, action: string) {
        this.submitted = true;

        const isValid = this.validateForm();
        if (!isValid) {
            return;
        }

        // if (action == 'save') {
        //     //data.ClosedTime = null;
        // }

        this.loader = true;
        if (data.vendorBillId) {
            this.updateVendorBill(data, action);
        } else {
            delete data.vendorBillId;
            this.createVendorBill(data);
        }
    }

    // save(data: any, action: string) {
    //     this.submitted = true;

    //     const isValid = this.validateForm();
    //     if (!isValid) {
    //         return;
    //     }

    //     console.log('Save method called with action:', action);
    //     console.log('Form Data:', data);

    //     this.loader = true;

    //     if (data.vendorBillId != null && data.vendorBillId !== '') {
    //         this.updateVendorBill(data, action);
    //     } else {
    //         delete data.vendorBillId; // just in case
    //         this.createVendorBill(data);
    //     }
    // }


    // createProjectPhase(data: any) {
    //     console.log("Saved");
    //     if (data.startDate) {
    //         const currentTime = new Date();
    //         data.startDate.setHours(currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds());
    //     }
    //     if (data.endDate) {
    //         const currentTime = new Date();
    //         data.endDate.setHours(currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds());
    //     }

    //     if (data.closedTime) {
    //         data.closedTime = this.formatLocalTime(data.closedTime);
    //     }
    //     //  data.reminder = this.formatLocalTime(data.reminder);

    //     this.inventoryService.createVendorBill(data).subscribe({
    //         next: (data: any) => {
    //             console.log(data);
    //             if (data.success == true) {
    //                 this.loader = false;
    //                 this.messageService.add({ severity: 'success', summary: 'Success', detail: data.message });
    //                 setTimeout(() => {
    //                     // this.router.navigate(['/home/listprojectphase']);
    //                     this.router.navigate(['/home/listvendorbill']).then(() => {
    //                         window.location.reload();
    //                     });
    //                 }, 1000);
    //             } else {
    //                 this.loader = false;
    //                 this.messageService.add({ severity: 'error', summary: 'Failed', detail: data.message })
    //             }
    //         },
    //         error: error => {
    //             this.loader = false;
    //             console.error(error);
    //             this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Error While Creating Vendor Bill.' });
    //         }
    //     });
    // }

    // save(data: any, action: string): void {
    //     this.submitted = true;

    //     console.log('🔹 Save clicked. Form data:', data);

    //     // if (!this.validateForm()) {
    //     //     console.warn('⚠️ Form is invalid, exiting save.');
    //     //     return;
    //     // }

    //     this.loader = true;

    //     const vendorBillPayload = { ...data };

    //     console.log('🔹 vendorBillId =', vendorBillPayload.vendorBillId);

    //     if (!vendorBillPayload.vendorBillId) {
    //         console.log('🟢 Calling createVendorBill()...');
    //         delete vendorBillPayload.vendorBillId;
    //         this.createVendorBill(vendorBillPayload);
    //     } else {
    //         console.log('🟡 Calling updateVendorBill()...');
    //         this.updateVendorBill(vendorBillPayload, action);
    //     }
    // }




// createVendorBill(data: any): void {
//     console.log('Sending to API:', data);

//     const now = new Date();

//     if (data.billDate instanceof Date) {
//         data.billDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
//     }

//     if (data.challenDate instanceof Date) {
//         data.challenDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
//     }

//      if (data.dueDate instanceof Date) {
//         data.dueDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
//     }

//     if (data.chequeDate) {
//         data.chequeDate = this.formatLocalTime(data.closedTime);
//     }

//     this.inventoryService.createVendorBill(data).subscribe({
//         next: (res: any) => {
//             this.loader = false;

//             if (res.success === true) {
//                 this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
//                 setTimeout(() => {
//                     this.router.navigate(['/home/listvendorbill']).then(() => window.location.reload());
//                 }, 1000);
//             } else {
//                 this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
//             }
//         },
//         error: (error) => {
//             this.loader = false;
//             console.error('Error while creating vendor bill:', error);
//             this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Error While Creating Vendor Bill.' });
//         }
//     });
// }

createVendorBill(data: any): void {
  console.log('Sending to API:', data);

  // Clone data to avoid mutating the original object
  const payload = { ...data };

  const now = new Date();

  // Helper to set time part to current time if date exists
  function setTimeToNow(dateValue: any): string | null {
    if (!dateValue) return null;

    // Convert to Date object if string
    const dateObj = dateValue instanceof Date ? dateValue : new Date(dateValue);
    if (isNaN(dateObj.getTime())) return null;

    dateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    return dateObj.toISOString();
  }

  // Fix all date fields, convert to ISO string or null
  payload.billDate = setTimeToNow(payload.billDate);
  payload.challenDate = setTimeToNow(payload.challenDate);
  payload.dueDate = setTimeToNow(payload.dueDate);
  payload.chequeDate = setTimeToNow(payload.chequeDate);

  // Fix numeric fields - convert empty strings to null
  function fixNullableNumber(value: any): number | null {
    if (value === '' || value === undefined || value === null) {
      return null;
    }
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  payload.receiptNumber = fixNullableNumber(payload.receiptNumber);
  // Add other numeric fields if needed similarly:
  // payload.POReceiptNumber = fixNullableNumber(payload.POReceiptNumber);
  // payload.PurchaseOrderNumber = fixNullableNumber(payload.PurchaseOrderNumber);

  // Now send the cleaned-up payload to the API
  console.log(payload);
  
  this.inventoryService.createVendorBill(payload).subscribe({
    next: (res: any) => {
      this.loader = false;
      if (res.success === true) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message });
        setTimeout(() => {
          this.router.navigate(['/home/listvendorbill']).then(() => window.location.reload());
        }, 1000);
      } else {
        this.messageService.add({ severity: 'error', summary: 'Failed', detail: res.message });
      }
    },
    error: (error) => {
      this.loader = false;
      console.error('Error while creating vendor bill:', error);
      this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Error While Creating Vendor Bill.' });
    }
  });
}


    updateVendorBill(data: any, action: string) {
        data.UpdatedBy = localStorage.getItem('username');
        if (data.startDate) {
            const currentTime = new Date();
            data.startDate.setHours(currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds());
        }
        if (data.endDate) {
            const currentTime = new Date();
            data.endDate.setHours(currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds());
        }
        if (data.closedTime) {
            data.closedTime = this.formatLocalTime(data.closedTime);
        }
        //data.reminder = this.formatLocalTime(data.reminder);

        this.inventoryService.updateVendorBill(data).subscribe({
            next: (data: any) => {
                // if (action == 'close') {
                //     this.onSuccess('Project Phase close successfully.');
                // } else {
                //     this.onSuccess('Project Phase updated successfully.');
                // }
                this.loader = false;
                setTimeout(() => {
                    this.router.navigate(['/home/listvendorbill']).then(() => {
                        window.location.reload();
                    });
                }, 700);
            },
            error: error => {
                this.loader = false;
                this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Error While Updating Vendor Bill.' });
                console.error(error);
            }
        });
    }
    getGroupIdFromQuery() {
        this.routers.queryParams.subscribe(params => {
            const id = _.toNumber(params['vendorBillId']);
            this.createVendorBillForm.controls.vendorBillId.setValue(params['vendorBillId']);
            if (id) {
                document.title = 'Update Vendor Bill';
                this.isEditMode = true;
                this.inventoryService.getVendorBillById(id).subscribe({
                    next: (data: any) => {
                        //console.log("Vendor Bill", data);
                        this.createVendorBillForm.patchValue({
                            ...data,

                              billDate:new Date(data.billDate),
                            POReceiptHeaderId:data.poReceiptHeaderId,
                            vendorName:data.vendor.vendorName,
                            //add:data.vendor.address.addressLine1,
                            add: `${data.vendor.address.addressLine1},${data.vendor.address.city
                 }, ${data.vendor.address.state},${data.vendor.address.country},${data.vendor.address.zip}`,

                            challenDate:new Date(data.challenDate),
                            chequeDate:new Date(data.chequeDate),
                            dueDate:new Date(data.dueDate),
                            departmentName:data.department.departmentName

                //                             'PurchaseOrderNumber': data.purchaseOrderNumber,
                // 'PurchaseOrderId': data.purchaseOrderId,
                // 'POReceiptNumber': data.poReceiptNumber,
                // 'POReceiptStatus': data.poReceiptStatus,
                // 'departments': data.department.departmentCode,
                // 'departmentName': data.department.departmentName,
                // 'departmentCode': data.department.departmentCode,
                // 'departmentId': data.department.departmentId,
                // 'warehouses': data.warehouse.warehouseCode,
                // 'warehouseName': data.warehouse.warehouseName,
                // 'warehouseCode': data.warehouse.warehouseCode,
                // 'warehouseId': data.warehouse.warehouseId,
                // 'vendorName': data.vendor.vendorName,
                // 'vendorCode': data.vendor.vendorCode,
                // 'vendorId': data.vendor.vendorId,
                // 'ReceiveDate': data,
                // 'RequestedDate': new Date(data.requestedDate),
                // 'createdDate': new Date(data.createdDate),
                // 'OrderComment': data.comment,
                // 'add': `${data.vendor.address.addressLine1},${data.vendor.address.city
                //   }, ${data.vendor.address.state},${data.vendor.address.country},${data.vendor.address.zip}`,
                // 'warehouseAddress': `${data.warehouse.address.city} , ${data.warehouse.address.state} , ${data.warehouse.address.country} , ${data.warehouse.address.zip}`,

                // 'ChallenNo': data.challenNo,
                // 'ChallenDate': data.challenDate,
                        })

                        if (data.isClosed) {
                            this.createVendorBillForm.disable();
                        }
                        if (data == null) {
                            this.router.navigate(['/home/listvendorbill']);
                        }
                    },
                    error: error => {
                        console.error(error);
                    }
                });
            } else {
                console.warn('Edit Mode Off');
            }
        });
    }

    // validateForm() {
    //     let isValid = true;
    //     if (this.createVendorBillForm.invalid) {
    //         this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill Required field' })
    //         isValid = false;
    //     }
    //     return isValid;
    // }

    validateForm() {
    let isValid = true;
    if (this.createVendorBillForm.invalid) {
        console.warn('Form is invalid:', this.createVendorBillForm);
        console.warn('Form errors:', this.createVendorBillForm.errors);

        Object.keys(this.createVendorBillForm.controls).forEach(controlName => {
            const control = this.createVendorBillForm.get(controlName);
            if (control && control.invalid) {
                console.warn(`Invalid field: ${controlName}`, control.errors);
            }
        });

        this.messageService.add({ 
            severity: 'warn', 
            summary: 'Warning', 
            detail: 'Please fill Required field' 
        });

        isValid = false;
    }
    return isValid;
}



    get formControls() {
        return this.createVendorBillForm.controls;
    }


    focusNextInput(event: Event): void {
        const keyboardEvent = event as KeyboardEvent;
        keyboardEvent.preventDefault();

        const target = keyboardEvent.target as HTMLElement;
        const formElements = Array.from((target.closest('form') as HTMLFormElement).elements) as HTMLElement[];
        const index = formElements.indexOf(target);

        if (index > -1 && index < formElements.length - 1) {
            const nextElement = formElements[index + 1];
            nextElement.focus();
        }
    }

    private formatLocalTime(data: Date): string {
        const date = new Date(data)
        let year = date.getFullYear();
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let day = date.getDate().toString().padStart(2, '0');
        let hours = date.getHours().toString().padStart(2, '0');
        let minutes = date.getMinutes().toString().padStart(2, '0');
        let seconds = date.getSeconds().toString().padStart(2, '0');

        let timezoneOffset = date.getTimezoneOffset();
        let sign = timezoneOffset > 0 ? "-" : "+";
        let offsetHours = Math.floor(Math.abs(timezoneOffset) / 60).toString().padStart(2, '0');
        let offsetMinutes = Math.abs(timezoneOffset) % 60;
        let formattedOffset = `${sign}${offsetHours}:${offsetMinutes.toString().padStart(2, '0')}`;

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${formattedOffset}`;
    }

    onKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.moveToNextField(event);
        }
    }

    moveToNextField(event: KeyboardEvent) {
        const inputs = Array.from(document.querySelectorAll('input')) as HTMLInputElement[];
        const index = inputs.indexOf(event.target as HTMLInputElement);
        if (index > -1 && index < inputs.length - 1) {
            (inputs[index + 1] as HTMLInputElement).focus();
        }
    }

    //   onDateSelect() {
    //     this.isClosedTime = false;
    //   }

    private onSuccess(msg: string) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: msg });
    }


    manualEntry() {
        const manualEntryValue = this.createVendorBillForm.controls.manualEntry.value;
        if (manualEntryValue === true) {
            this.createVendorBillForm.controls.vendorBillCode.setValue('');
            this.isManual = false;
        } else {
            if (!this.isEditMode) {
                this.isManual = true
                this.getVendorBillCode();
            }
        }
    }

    getVendorBillCode() {
        this.loader = true;
        this.inventoryService.autogenerateVendorBillCode().subscribe({
            next: (data: any) => {
                const alphanumericCode = 'B';
                const projectTaskCode = alphanumericCode + data;
                this.createVendorBillForm.controls.vendorBillCode.setValue(projectTaskCode);
                this.loader = false;
            },
            error: error => {
                console.log(error);
                this.loader = false;
            }
        });
    }

    checkVendorBillCode() {
        if (!this.createVendorBillForm.controls.vendorBillCode.value) {
            this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Please enter Vendor bill Code' });
            return;
        }
        if (!this.isEditMode) {
            this.inventoryService.checkVendorBillCode(this.createVendorBillForm.controls.vendorBillCode.value).subscribe(
                (data: any) => {
                    if (data.success == true) {
                        // console.log(data);
                    } else {
                        this.createVendorBillForm.controls.vendorBillCode.setValue('');
                        this.messageService.add({ severity: 'error', summary: 'Failed', detail: data.message });
                        this.createVendorBillForm.controls.manualEntry.setValue(true);
                    }
                },
                (error: any) => {
                    console.log(error);
                }
            );
        }
    }



    getVendor() {
        if (this.products.length > 0) {
            return;
        }

        this.ref = this.dialogService.open(VendorLookupComponent, {
            header: 'Vendor List',
            width: '60%',
        });
        this.ref.onClose.subscribe((data: any) => {
            if (data) {
                this.createVendorBillForm.patchValue({
                    vendorName: data.vendorName,
                    vendorId: data.vendorId,
                    vendorCode: data.vendorCode,
                    termsCode: data.termsCode,
                    add: `${data.address.addressLine1},${data.address.city} ${data.address.state}, ${data.address.country},${data.address.zip}`
                });
                this.vendorState = data.address.state;
            }
        });
    }

    getWarehouse() {
        this.warehouseService.getAllWarehouse(this.pageRequest).subscribe({
            next: (data: any) => {
                this.warehouseDropdown = data.warehouses;
            }
        });
    }

    checkwarehouse() {
        if (!this.createVendorBillForm.controls.warehouseCode.value) {
            this.createVendorBillForm.controls['warehouseName'].setValue('');
        }
    }


    filteWarehouse(event: any) {
        let filtered: any[] = [];
        let query = event.query;

        for (let i = 0; i < (this.warehouseDropdown as any[]).length; i++) {
            let warehouses = (this.warehouseDropdown as any[])[i];
            if (warehouses.warehouseCode.toLowerCase().indexOf(query.toLowerCase()) == 0 ||
                warehouses.warehouseName.toLowerCase().indexOf(query.toLowerCase()) === 0) {
                filtered.push(warehouses);
            }
        }
        this.filtewarehouse = filtered;
    }

    SelectedWarehouse(event: any) {
        if (event && event.value) {
            const selectedWarehouse = event.value;
            this.createVendorBillForm.controls['warehouseCode'].setValue(selectedWarehouse.warehouseCode);
            this.createVendorBillForm.controls['warehouseId'].setValue(selectedWarehouse.warehouseId);
            this.createVendorBillForm.controls['warehouseName'].setValue(selectedWarehouse.warehouseName);
            const address = `${selectedWarehouse.address.addressLine1} ,${selectedWarehouse.address.city} , ${selectedWarehouse.address.state} , ${selectedWarehouse.address.country} , ${selectedWarehouse.address.zip}`;
            this.createVendorBillForm.controls.warehouseAddress.setValue(address);
            this.warehouseState = selectedWarehouse.address.state;

        }
    }


    getDepartment() {
        this.porderservice.getDepartment(this.pageRequest).subscribe({
            next: (data: any) => {
                this.departmentDropdown = data.department;

                if (this.departmentDropdown.length > 0) {
                    this.formControls.departmentName.setValue(this.departmentDropdown[0]);
                }
            }
        });
    }

    filterDepartment(event: any) {
        let filtered: any[] = [];
        let query = event.query;
        for (let i = 0; i < (this.departmentDropdown as any[]).length; i++) {
            let departments = (this.departmentDropdown as any[])[i];
            if (departments.departmentCode.toLowerCase().indexOf(query.toLowerCase()) == 0 ||
                departments.departmentName.toLowerCase().indexOf(query.toLowerCase()) === 0) {
                filtered.push(departments);
            }
        }
        this.filterDepartments = filtered;
    }

    SelectedDepartment(event: any) {
        if (event && event.value) {
            const SelectedDepartment = event.value;
            this.createVendorBillForm.controls['departmentCode'].setValue(SelectedDepartment.departmentCode);
            this.createVendorBillForm.controls['departmentId'].setValue(SelectedDepartment.departmentId);
            this.createVendorBillForm.controls['departmentName'].setValue(SelectedDepartment.departmentName);
        }
    }

    getTermsCode() {
        this.ref = this.dialogService.open(TermscodeLookupComponent, {
            header: 'Terms Code',
            width: '80%',
        })
        this.ref.onClose.subscribe((data: any) => {
            if (data) {
                this.createVendorBillForm.patchValue({
                    termsCode: data.paymentTermsDescription
                })
            }
        })
    }


    autosearchReceipts(event: any) {
        this.porderservice.searchPOReceiptReturnPO(event.query).subscribe(
            (data: any) => {
                if (data) {
                    let filteredList = data.filter(
                        (receipt: any) => receipt.poReceiptStatus === 'Close'
                    );
                    if (this.VendorName) {
                        filteredList = filteredList.filter(
                            (receipt: any) => receipt.vendor.vendorName === this.VendorName
                        );
                    }
                    this.ReceiptList = filteredList;
                }
            },
            (error: any) => {
                this.messageService.add({ severity: 'error', summary: 'Failed', detail: 'Failed to search receipts' });
                console.error(error);
            }
        );
    }

    setReceiptNumber(event: any) {
        if (event && event.value) {
            const selectedReceipt = event.value;
            // console.log('Setting PO Number:', selectedReceipt.purchaseOrderNumber);

            this.createVendorBillForm.controls['POReceiptHeaderId'].setValue(selectedReceipt.poReceiptNumber);
            this.createVendorBillForm.controls['POReceiptHeaderId'].markAsTouched();
            this.createVendorBillForm.controls['POReceiptHeaderId'].markAsDirty();
            this.createVendorBillForm.controls['POReceiptHeaderId'].updateValueAndValidity();

            const receiveDate = selectedReceipt.receiveDate ? new Date(selectedReceipt.receiveDate) : null;
            //this.createVendorBillForm.controls['receiveDate'].setValue(receiveDate);

            let challanDate: Date | null = null;
            if (selectedReceipt.challenDate) {
                const parsedDate = new Date(selectedReceipt.challenDate);
                challanDate = isNaN(parsedDate.getTime()) ? null : parsedDate;
            }

            this.createVendorBillForm.controls['challenDate'].setValue(challanDate);

            this.createVendorBillForm.controls['challenNo'].setValue(selectedReceipt.challenNo);
            this.createVendorBillForm.controls['poNumber'].setValue(selectedReceipt.purchaseOrderNumber);

            if (selectedReceipt.warehouse) {
                this.createVendorBillForm.patchValue({
                    warehouseName: selectedReceipt.warehouse.warehouseName,
                    warehouseId: selectedReceipt.warehouse.warehouseId,
                    warehouseAddress: selectedReceipt.warehouse.address
                        ? `${selectedReceipt.warehouse.address.addressLine1}, ${selectedReceipt.warehouse.address.city} ${selectedReceipt.warehouse.address.state}, ${selectedReceipt.warehouse.address.country}, ${selectedReceipt.warehouse.address.zip}`
                        : ''
                });

                const warehouseNameControl = this.createVendorBillForm.get('warehouseName');
                if (warehouseNameControl) {
                    warehouseNameControl.markAsTouched();
                    warehouseNameControl.markAsDirty();
                    warehouseNameControl.updateValueAndValidity();
                }
            }

            if (selectedReceipt.department) {
                this.createVendorBillForm.patchValue({
                    departmentId: selectedReceipt.department.departmentId,
                    departmentName: selectedReceipt.department.departmentName
                });

                const departmentIdControl = this.createVendorBillForm.get('departmentId');
                if (departmentIdControl) {
                    departmentIdControl.markAsTouched();
                    departmentIdControl.markAsDirty();
                    departmentIdControl.updateValueAndValidity();
                }

                const departmentNameControl = this.createVendorBillForm.get('departmentName');
                if (departmentNameControl) {
                    departmentNameControl.markAsTouched();
                    departmentNameControl.markAsDirty();
                    departmentNameControl.updateValueAndValidity();
                }
            }

            if (selectedReceipt.vendor) {
                this.createVendorBillForm.patchValue({
                    vendorName: selectedReceipt.vendor.vendorName,
                    vendorId: selectedReceipt.vendor.vendorId,
                    vendorCode: selectedReceipt.vendor.vendorCode,
                    add: selectedReceipt.vendor.address
                        ? `${selectedReceipt.vendor.address.addressLine1},${selectedReceipt.vendor.address.city} ${selectedReceipt.vendor.address.state}, ${selectedReceipt.vendor.address.country},${selectedReceipt.vendor.address.zip}`
                        : '',
                    termsCode: selectedReceipt.vendor.termsCode
                });

                this.vendorState = selectedReceipt.vendor.address?.state ?? '';
                // this.selectedCustomerEmail = selectedReceipt.vendor.email;
                // this.selectedCustomerName = selectedReceipt.vendor.vendorName;
            }

            //   this.purchaseOrderForm.updateValueAndValidity();

            //   const data = selectedReceipt.poReceiptNumber;
            //   this.porderservice.getPOReceiptLineitem(data).subscribe(
            //     (lineItemsData: any) => {
            //       this.products = this.loadProducts(lineItemsData);
            //       this.allProductData = this.products;
            //       this.calculateOrderTotal();
            //     },
            //     (error: any) => {
            //       console.log('Error fetching purchase order lineitems:', error);
            //     }
            //   );
        }
    }

    openPOListLookup() {
        const ref = this.dialogService.open(PurchaseOrderReceiptLookupComponent, {
            header: 'Purchase Receipt List',
            width: '80%',
            data: { selectedCustomerName: this.selectedCustomerName, isReturnPO: true }
        });

        ref.onClose.subscribe((selectedCustomer: any) => {
            let challanDate: Date | null = null;
            if (selectedCustomer.challenDate) {
                const parsedDate = new Date(selectedCustomer.challenDate);
                challanDate = isNaN(parsedDate.getTime()) ? null : parsedDate;
            }
            if (selectedCustomer) {
                const receiveDate = selectedCustomer.receiveDate ? new Date(selectedCustomer.receiveDate) : null;
                this.createVendorBillForm.controls.POReceiptHeaderId.setValue(selectedCustomer.poReceiptNumber);
                //this.createVendorBillForm.controls.receiveDate.setValue(receiveDate);
                this.createVendorBillForm.controls.challenDate.setValue(challanDate);
                this.createVendorBillForm.controls.challenNo.setValue(selectedCustomer.challenNo);
                this.createVendorBillForm.controls.poNumber.setValue(selectedCustomer.purchaseOrderNumber);

                if (selectedCustomer.warehouse) {
                    this.createVendorBillForm.patchValue({
                        warehouseName: selectedCustomer.warehouse.warehouseName,
                        warehouseId: selectedCustomer.warehouse.warehouseId,
                        warehouseAddress: selectedCustomer.warehouse.address
                            ? `${selectedCustomer.warehouse.address.addressLine1}, ${selectedCustomer.warehouse.address.city} ${selectedCustomer.warehouse.address.state}, ${selectedCustomer.warehouse.address.country}, ${selectedCustomer.warehouse.address.zip}`
                            : ''
                    });

                    const warehouseNameControl = this.createVendorBillForm.get('warehouseName');
                    if (warehouseNameControl) {
                        warehouseNameControl.markAsTouched();
                        warehouseNameControl.markAsDirty();
                        warehouseNameControl.updateValueAndValidity();
                    }
                }

                if (selectedCustomer.department) {
                    this.createVendorBillForm.patchValue({
                        departmentId: selectedCustomer.department.departmentId,
                        departmentName: selectedCustomer.department.departmentName
                    });

                    const departmentIdControl = this.createVendorBillForm.get('departmentId');
                    if (departmentIdControl) {
                        departmentIdControl.markAsTouched();
                        departmentIdControl.markAsDirty();
                        departmentIdControl.updateValueAndValidity();
                    }

                    const departmentNameControl = this.createVendorBillForm.get('departmentName');
                    if (departmentNameControl) {
                        departmentNameControl.markAsTouched();
                        departmentNameControl.markAsDirty();
                        departmentNameControl.updateValueAndValidity();
                    }
                }

                if (selectedCustomer.vendor) {
                    this.createVendorBillForm.patchValue({
                        vendorName: selectedCustomer.vendor.vendorName,
                        vendorId: selectedCustomer.vendor.vendorId,
                        vendorCode: selectedCustomer.vendor.vendorCode,
                        add: `${selectedCustomer.vendor.address.addressLine1},${selectedCustomer.vendor.address.city} ${selectedCustomer.vendor.address.state}, ${selectedCustomer.vendor.address.country},${selectedCustomer.vendor.address.zip}`,
                        termsCode: selectedCustomer.vendor.termsCode,
                    });
                    this.vendorState = selectedCustomer.vendor.address.state;
                    // this.selectedCustomerEmail = selectedCustomer.vendor.email;
                    // this.selectedCustomerName = selectedCustomer.vendor.vendorName;

                }

                //   this.purchaseOrderForm.updateValueAndValidity();

                //   const data = selectedCustomer.poReceiptNumber;
                //   this.porderservice.getPOReceiptLineitem(data).subscribe(
                //     (lineItemsData: any) => {
                //       this.products = this.loadProducts(lineItemsData);
                //       this.allProductData = this.products;
                //       this.calculateOrderTotal();
                //     },
                //     (error: any) => {
                //       console.log('Error fetching purchase order lineitems:', error);
                //     }
                //   );
            }
        });
    }

    getUnitLabel(): void {
        this.loader = true;
        const appKey = 'unitNameLabel';

        this.inventoryService.getUnitByAppKey(appKey).subscribe({
            next: (response: any) => {
                this.loader = false;
                if (response?.appKeycode === appKey) {
                    this.unitLabel = response?.data;
                } else {
                    this.unitLabel = 'Unit';
                }
            },
            error: error => {
                console.error('Error fetching Unit Label:', error);
                this.unitLabel = 'Unit';
                this.loader = false;
            }
        });
    }


    getDeptLabel(): void {
        this.loader = true;
        const appKey = 'DeptLabel';

        this.inventoryService.getDeptByAppKey(appKey).subscribe({
            next: (response: any) => {
                this.loader = false;
                if (response?.appKeycode === appKey) {
                    this.DeptLabel = response?.data;
                } else {
                    this.DeptLabel = 'Department';
                }
            },
            error: error => {
                console.error('Error fetching Department Label:', error);
                this.DeptLabel = 'Department';
                this.loader = false;
            }
        });
    }


}
