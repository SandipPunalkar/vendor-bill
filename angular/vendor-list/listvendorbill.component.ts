import { Component, ViewChild, OnInit } from '@angular/core';
import _ from 'lodash';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { InventoryService } from '../../../services/inventory.service';
import { gridPageRequest, VendorBill } from '../../../model/common/common.model';
import { ReportLookupComponent } from '../../Reports/report-lookup/report-lookup.component';


@Component({
    selector: 'app-listvendorbill',
    standalone: true,
    imports: [SharedModule, CommonModule],
    templateUrl: './listvendorbill.component.html',
    styleUrls: ['./listvendorbill.component.scss']
})
export class ListVendorBillComponent implements OnInit {
    constructor(public dialogService: DialogService, public ref: DynamicDialogRef, private inventoryService: InventoryService, private router: Router, private confirmationService: ConfirmationService, private messageService: MessageService, private route: ActivatedRoute) { }

    @ViewChild('dt1') dt1: Table | undefined;


    vendorBill: VendorBill[] = [];
    selectedTask: any[] = [];
    selectedVendorBill: VendorBill[] = [];
    searchKey: string | undefined;
    loader: boolean = false;


    pageRequest: gridPageRequest = {
        pageIndex: 0,
        pageSize: 20,
        id: 0
    }

    ngOnInit(): void {
        document.title = 'Vendor Bill List';
        this.getVendorBill()
    }


    getVendorBill(): void {
        this.loader = true;

        this.inventoryService.getVendorBillList(this.pageRequest).subscribe(
            (response: any) => {
                //console.log('Full response from getVendorBillList:', response);

                const bills = response?.vendorBills; // <-- corrected key

                if (bills && Array.isArray(bills)) {
                    this.vendorBill = bills as VendorBill[];
                    //console.log('Vendor bills loaded:', this.vendorBill);
                } else {
                    this.vendorBill = [];
                    //console.warn('No vendor bills found in response.');
                }

                this.searchKey = undefined;
                this.loader = false;
            },
            (error: any) => {
                console.error('Error fetching vendor bills:', error);
                this.vendorBill = [];
                this.loader = false;
            }
        );
    }


    editVendorBill(data?: any) {
        if (data) {
            this.router.navigate(['/home/createvendorbill'], { queryParams: { 'vendorBillId': data }, skipLocationChange: false },);
        } else {
            console.log(this.selectedVendorBill[0])
            this.router.navigate(['/home/createvendorbill'], { queryParams: { 'vendorBillId': this.selectedVendorBill[0].vendorBillId }, skipLocationChange: false },);
        }
    }


    deleteVendorBill() {
        if (this.selectedVendorBill && this.selectedVendorBill.length > 0) {
            this.confirmationService.confirm({
                header: 'Are you sure?',
                message: 'Please confirm to proceed.',
                accept: () => {
                    var Ids = _.map(this.selectedVendorBill, 'vendorBillId');
                    this.loader = true;
                    this.inventoryService.deleteVendorBill(Ids).subscribe({
                        next: () => {
                            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Vendor Bill deleted successfully.' });
                            this.selectedVendorBill = [];
                            this.getVendorBill();
                            this.loader = false;
                        },
                        error: error => {
                            this.loader = false;
                            //console.error(error);
                        }
                    });
                },
                reject: () => {
                    // User rejected, do nothing
                }
            });
        }
    }



    loadProjectPhase(event: any) {
        if (this.searchKey && this.searchKey.trim() !== '') {
            this.searchVendorBill();
        } else {
            this.pageRequest.pageSize = this.pageRequest.pageSize + event.first + 5;
            this.getVendorBill();
        }
    }

    searchVendorBill() {
        if (!this.searchKey) {
            return;
        }

        this.inventoryService.searchVendorBill(this.searchKey).subscribe(
            (data: any) => {
                if (data) {
                    this.vendorBill = data;
                    if (this.dt1) {
                        this.dt1.first = 0;
                    }
                } else {
                    console.log("No data found for the given search key.");
                }
            },
            (error: any) => {
                console.log(error);
            }
        );
    }




    refreshData(): void {
        if (this.dt1) {
            this.dt1.first = 0;
            this.dt1.clear();
        }
        this.searchKey = '';
        this.pageRequest.pageIndex = 0;
        this.pageRequest.pageSize = 50;
        this.getVendorBill();
    }

    showReport(value: any): void {
        this.ref = this.dialogService.open(ReportLookupComponent, {
            header: `Vendor Bill`,
            width: '100%',
            data: { VendorBill: value.vendorBillCode, ReportName: 'Vendor Bill' }
        });
    }

}
