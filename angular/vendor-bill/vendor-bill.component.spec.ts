import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VendorBillComponent } from './vendor-bill.component';

describe('VendorBillComponent', () => {
  let component: VendorBillComponent;
  let fixture: ComponentFixture<VendorBillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorBillComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct bill details', () => {
    component.vendorName = 'Test Vendor';
    expect(component.getBillDetails()).toBe('Showing bill details for Test Vendor');
  });
});
