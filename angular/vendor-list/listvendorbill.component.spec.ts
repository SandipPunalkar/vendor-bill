// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { ListVendorBillComponent } from './listvendorbill.component';
// // import { ListVendorBillService } from '../../services/listvendorbill.service';
// import { of } from 'rxjs';
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { DebugElement } from '@angular/core';
// import { By } from '@angular/platform-browser';

// describe('ListVendorBillComponent', () => {
//   let component: ListVendorBillComponent;
//   let fixture: ComponentFixture<ListVendorBillComponent>;
// //   let service: ListVendorBillService;
//   let mockVendorBills = [
//     { id: 1, vendorName: 'Vendor A', amount: 1000, date: '2025-01-01', status: 'paid' },
//     { id: 2, vendorName: 'Vendor B', amount: 500, date: '2025-02-15', status: 'unpaid' }
//   ];

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       declarations: [ListVendorBillComponent],
//       imports: [HttpClientTestingModule],
//       providers: []
//     }).compileComponents();
//   });

//   beforeEach(() => {
//     fixture = TestBed.createComponent(ListVendorBillComponent);
//     component = fixture.componentInstance;
//     service = null;

//     // Mock the service method
//     spyOn(service, 'getVendorBills').and.returnValue(of(mockVendorBills));

//     fixture.detectChanges(); // triggers ngOnInit
//   });

//   it('should create the component', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should call getVendorBills and load data on init', () => {
//     expect(service.getVendorBills).toHaveBeenCalled();
//     // Add a way to store the bills in the component to test properly
//     // Example:
//     // expect(component.vendorBills.length).toBe(2);
//   });

//   it('should render the heading', () => {
//     const debugElement: DebugElement = fixture.debugElement;
//     const h2 = debugElement.query(By.css('h2')).nativeElement;
//     expect(h2.textContent).toContain('Vendor Bills');
//   });
// });
