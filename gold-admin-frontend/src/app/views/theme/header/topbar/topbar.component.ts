// Angular
import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import { Location } from "@angular/common";
import { CustomerManagementService } from "../../../../core/customer-management/services/customer-management.service";
import { LoanSettingsService } from "../.././../../core/loan-setting";
import { PartnerService } from "../.././../../core/user-management/partner/services/partner.service";
import { BranchService } from "../.././../../core/user-management/branch/services/branch.service";
import { WalletPriceService } from "../.././../../core/emi-management/config-details/wallet-price/services/wallet-price.service";
import { RolesService } from "../.././../../core/user-management/roles";
import { BrokerService } from "../../../../core/user-management/broker";
import {
	CategoryService,
	SubCategoryService,
	ProductService,
} from "../../../../core/emi-management/product";
import { InternalUserService } from "../.././../../core/user-management/internal-user";
import { AppraiserService } from "../../../../core/user-management/appraiser";
import { InternalUserBranchService } from "../../../../core/user-management/internal-user-branch";
import { Breadcrumb } from "../../../../core/_base/layout/services/subheader.service";
import { Subject, Subscription, from } from "rxjs";
import { SharedService } from "../../../../core/shared/services/shared.service";
import { SubheaderService } from "../../../../core/_base/layout";
import { takeUntil } from "rxjs/operators";
import { PacketsService, AppliedLoanService } from "../../../../core/loan-management";
import { StoreService } from "../../../../core/user-management/store/service/store.service";
import { LogisticPartnerService } from "../../../../core/emi-management/logistic-partner/service/logistic-partner.service";
import { KaratDetailsService } from "../../../../core/loan-setting/karat-details/services/karat-details.service";
import {
	CancelOrderDetailsService,
	OrderDetailsService,
	DepositDetailsService,
	EmiDetailsService,
} from "../../../../core/emi-management/order-management";
import { MonthlyService } from "../../../../core/repayment/services/monthly.service";
import { CustomerDetailsService } from "../../../../core/emi-management/customer-details";
import { LeadService } from "../../../../core/lead-management/services/lead.service";
import { EmailAlertService } from '../../../../core/notification-setting/services/email-alert.service';
import { SMSAlertService } from '../../../../core/notification-setting/services/sms-alert.service';
import { HolidayService } from '../../../../core/holidays/services/holiday.service';
import { PacketLocationService } from '../../../../core/masters/packet-location/service/packet-location.service';
import { OrnamentsService } from '../../../../core/masters/ornaments/services/ornaments.service';
import { PurposeService } from '../../../../core/masters/purposes/service/purpose.service';
import { ReasonsService } from '../../../../core/masters/reasons/services/reasons.service';
import { AppliedKycService } from '../../../../core/applied-kyc/services/applied-kyc.service';
import { LeadSourceService } from '../../../../core/masters/lead-source/services/lead-source.service';
import { PacketTrackingService } from '../../../../core/loan-management';
import { LoanRepaymentService } from '../../../../core/account/loan-repayment/services/loan-repayment.service';
import { LoanDisbursementService } from '../../../../core/account/loan-disbursement/services/loan-disbursement.service';
import { ShopService, ShoppingCartService, OrdersService } from '../../../../core/broker';
import { OccupationService } from '../../../../core/masters/occupation/services/occupation.service';

@Component({
	selector: "kt-topbar",
	templateUrl: "./topbar.component.html",
	styleUrls: ["./topbar.component.scss"],
})
export class TopbarComponent implements OnInit {
	// Public properties
	@Input() fluid: boolean;
	today: number = Date.now();
	title: string = "";
	desc: string = "";
	totalRecords: number = 0;
	breadcrumbs: Breadcrumb[] = [];
	destroy$ = new Subject();
	// Private properties
	private subscriptions: Subscription[] = [];

	rightButton: boolean = false;
	showfilter: boolean = false;
	type1: string;
	value1: string;
	type2: string;
	value2: string;
	value3: string;
	type4: string;
	value4: string;
	type5: string;
	value5: string;
	showInput: boolean;
	toogle: boolean;
	toogler: string;
	path: string;
	filterName = "";
	listType = "";
	filterWidth = "";
	downloadbtn: boolean = false;
	showBackButton = false;
	permissionType = "";
	showDropdown = false;
	isDisabled = false;
	button: boolean = false;
	clear: boolean;
	dropdownValue = [];
	dropdownTitle: string;
	sortImg = "../../../../../assets/media/icons/sort.svg";
	sortType: number = 1;
	sortFlag: boolean = false;

	constructor(
		public sharedService: SharedService,
		public subheaderService: SubheaderService,
		private router: Router,
		private location: Location,
		private customerManagementServiceCustomer: CustomerManagementService,
		private loanSettingService: LoanSettingsService,
		private partnerService: PartnerService,
		private branchService: BranchService,
		private rolesService: RolesService,
		private brokerService: BrokerService,
		private walletPriceService: WalletPriceService,
		private categoryService: CategoryService,
		private subCategoryService: SubCategoryService,
		private internalUserService: InternalUserService,
		private internalUserBranchService: InternalUserBranchService,
		private appraiserService: AppraiserService,
		private packetService: PacketsService,
		private storeService: StoreService,
		private logisticPartnerService: LogisticPartnerService,
		private karatDetailsService: KaratDetailsService,
		private productService: ProductService,
		private orderDetailsService: OrderDetailsService,
		private cancelOrderDetailsService: CancelOrderDetailsService,
		private depositDetailsService: DepositDetailsService,
		private emiDetailsService: EmiDetailsService,
		private monthlyService: MonthlyService,
		private customerDetailsService: CustomerDetailsService,
		private leadService: LeadService,
		private emailAlertService: EmailAlertService,
		private smsAlertService: SMSAlertService,
		private holidayService: HolidayService,
		private packetLocation: PacketLocationService,
		private ornamentsService: OrnamentsService,
		private purposeService: PurposeService,
		private reasonsService: ReasonsService,
		private appliedKycService: AppliedKycService,
		private appliedLoan: AppliedLoanService,
		private leadSourceService: LeadSourceService,
		private shopService: ShopService,
		private packetTrackingService: PacketTrackingService,
		private loanRepaymentService: LoanRepaymentService,
		private loanDisbursementService: LoanDisbursementService,
		private shoppingCartService: ShoppingCartService,
		private ordersService: OrdersService,
		private occupationService: OccupationService
	) {

		this.router.events.subscribe(val => {
			this.reset()
			this.setTopbar(location.path())
		})

		this.walletPriceService.download$
			.pipe(takeUntil(this.destroy$))
			.subscribe((res) => {
				if (res) {
					this.downloadbtn = true;
				} else {
					this.downloadbtn = false;
				}
			});

		// this.orderDetailsService.button$
		// 	.pipe(takeUntil(this.destroy$))
		// 	.subscribe((res) => {
		// 		if (res && res == "spot") {
		// 			this.button = false;
		// 		} else if (res && res != "spot") {
		// 			this.button = true;
		// 		} else {
		// 			this.button = false;
		// 		}
		// 	});
	}

	ngOnInit() {
		this.setTopbar(this.router.url);
	}

	ngAfterViewInit(): void {
		this.subscriptions.push(
			this.sharedService.totalCount$
				.pipe(takeUntil(this.destroy$))
				.subscribe((ct) => {
					if (ct != null) {
						Promise.resolve(null).then(() => {
							this.totalRecords = ct;
						});
					}
				})
		);
		this.subscriptions.push(
			this.subheaderService.title$.subscribe((bt) => {
				// breadcrumbs title sometimes can be undefined
				if (bt) {
					Promise.resolve(null).then(() => {
						this.title = bt.title;
						this.desc = bt.desc;
					});
				}
			})
		);

		this.subscriptions.push(
			this.subheaderService.breadcrumbs$.subscribe((bc) => {
				Promise.resolve(null).then(() => {
					this.breadcrumbs = bc;
				});
			})
		);
		this.subscriptions.push(
			this.shoppingCartService.cartCount$
				.pipe(takeUntil(this.destroy$))
				.subscribe((ct) => {
					if (ct != null) {
						Promise.resolve(null).then(() => {
							if (this.router.url.includes('/broker/customers') ||
								this.router.url.includes('/broker/orders') ||
								this.router.url.includes('/broker/shop') ||
								this.router.url.includes('/broker/cart')) {
								this.totalRecords = ct;
							}
						});
					}
				})
		);
	}

	/**
	 * On destroy
	 */
	ngOnDestroy(): void {
		this.subscriptions.forEach((sb) => sb.unsubscribe());
	}

	reset() {
		this.totalRecords = 0;
		this.rightButton = false;
		this.type1 = "";
		this.value1 = "";
		this.type2 = "";
		this.value2 = "";
		this.value3 = "";
		this.type4 = "";
		this.value4 = "";
		this.type5 = "";
		this.value5 = "";
		this.showfilter = false;
		this.showInput = false;
		this.toogle = false;
		this.showBackButton = false;
		this.showDropdown = false;
		this.dropdownTitle = "";
		this.dropdownValue = [];
		this.permissionType = "";
		this.filterName = "";
		this.filterWidth = "";
		this.listType = "",
			this.sortFlag = false;
		this.clear = false;
	}

	dataSourceHeader() {
		// this.showfilter = true;
		this.showInput = true;
		this.type1 = "button";
	}

	setTopbar(path: string) {
		var pathArray = path.split("/");
		this.path = pathArray[pathArray.length - 1];
		if (this.path == "scheme") {
			this.rightButton = true;
			this.value2 = "Add New Scheme";
			this.type2 = "button";
			this.permissionType = "schemeAdd";
			this.showfilter = true;
			this.filterName = 'scheme';
			this.listType = 'scheme';
			this.filterWidth = '400px';
		}
		if (this.path == "holidays") {
			this.value1 = "Add Holiday";
			this.showInput = true;
			this.dataSourceHeader();
			// this.permissionType = "schemeAdd";
		}
		if (this.path == "ornaments") {
			this.value2 = "Add Ornaments";
			this.type2 = "button";
			this.rightButton = true;
			// this.permissionType = "schemeAdd";
		}
		if (this.path == "reasons") {
			this.value2 = "Add Reason";
			this.type2 = "button";
			this.rightButton = true;
			// this.permissionType = "schemeAdd";
		}
		if (this.path == "lead-management") {
			this.dataSourceHeader();
			this.value1 = "Add New Lead";
			this.showfilter = true;
			this.filterName = "leads";
			this.filterWidth = "900px";
			this.permissionType = "leadManagmentAdd";
			this.listType = "state,leadStatus";
		}
		if (this.path == "partner") {
			this.dataSourceHeader();
			this.value1 = "Add Partner";
			this.permissionType = "partnerAdd";
		}
		if (this.path == "logistic-partner") {
			this.showInput = true;
			this.rightButton = true;
			this.value2 = "Add Logistic Partner";
			this.type2 = "button";
			this.permissionType = "logisticPartnerAdd";
		}
		if (this.path == "karat-details") {
			this.rightButton = true;
			this.value2 = "Add Karat Details";
			this.type2 = "button";
			this.permissionType = "karatDetailsAdd";
		}
		if (this.path == "email-alert") {
			this.dataSourceHeader();
			this.value1 = "Create Email Alert";
		}
		if (this.path == "sms-alert") {
			this.dataSourceHeader();
			this.value1 = "Create SMS Alert";
		}
		if (this.path == "customer-list") {
			this.showfilter = false;
			this.showInput = true;
			this.toogle = true;
		}
		if (this.path == "applied-loan") {
			this.showfilter = true;
			this.filterWidth = "600px"
			this.filterName = "loan"
			this.showInput = true;
			this.listType = "approval";
		}
		if (this.path == "all-loan") {
			this.showfilter = false;
			this.showInput = true;
		}
		if (this.path == "applied-kyc") {
			this.showInput = true;
			this.showfilter = true;
			this.filterName = "kyc";
			this.filterWidth = "600px";
			this.listType = "approval";
		}
		if (this.path == "assigned-customers") {
			this.showInput = true;
		}
		if (this.path == "monthly") {
			this.dataSourceHeader();
			this.value1 = "Add Payment";
		}
		if (this.path == "branch") {
			this.dataSourceHeader();
			this.value1 = "Add New Branch";
			this.permissionType = "partnerBranchAdd";
		}
		if (this.path == "assign-appraiser") {
			this.dataSourceHeader();
			this.value1 = "Assign Appraiser";
			this.permissionType = "assignAppraiserAdd";
		}
		if (this.path == "redirect-assign-appraiser") {
			this.dataSourceHeader();
			this.value1 = "Assign Appraiser";
			this.permissionType = "assignAppraiserAdd";
		}
		if (this.path == "packet-location") {
			this.dataSourceHeader();
			this.value1 = "Add Packet Location";
		}
		if (this.path == "packet-tracking") {
			this.dataSourceHeader();
			this.showfilter = false;
		}
		if (this.path == "occupation") {
			this.value2 = "Add Occupation";
			this.type2 = "button";
			this.rightButton = true;
		}
		if (this.path == "purposes") {
			this.value2 = "Add Purpose";
			this.type2 = "button";
			this.rightButton = true;
		}
		if (this.path == "lead-source") {
			this.value1 = "Add Lead Source";
			this.showInput = true;
			this.dataSourceHeader();
			// this.permissionType = "schemeAdd";
		}

		if (this.path == "roles") {
			this.showInput = true;
			this.rightButton = true;
			this.type2 = "button";
			this.value2 = "Add New Role";
		}
		if (this.path == "broker") {
			this.dataSourceHeader();
			this.value1 = "Add Broker";
			this.permissionType = "brokerAdd";
		}
		if (this.path == "merchant") {
			this.dataSourceHeader();
			this.value1 = "Add Merchant";
			this.permissionType = "merchantAdd";
		}
		if (this.path == "wallet-price") {
			this.rightButton = true;
			this.type2 = "button";
			this.value2 = "Edit Wallet Price";
			this.value3 = "Download Wallet Price Report";
			this.permissionType = "walletEdit";
		}
		if (this.path == "bulk-upload-report") {
			this.showInput = true;
		}
		if (this.path == "products") {
			this.showfilter = true;
			this.showInput = true;
			this.filterName = "product";
			this.listType = "category,sub-category";
			this.filterWidth = "500px";
		}
		if (this.path == "category") {
			this.rightButton = true;
			this.showInput = true;
			this.value2 = "Add Category";
			this.type2 = "button";
			this.permissionType = "categoryAdd";
		}
		if (this.path == "sub-category") {
			this.rightButton = true;
			this.showInput = true;
			this.value2 = "Add Sub Category";
			this.type2 = "button";
			this.permissionType = "subCategoryAdd";
		}
		if (this.path == "internal-user") {
			this.dataSourceHeader();
			this.value1 = "Add Internal User";
			this.permissionType = "internalUserAdd";
		}
		if (this.path == "internal-user-branch") {
			this.dataSourceHeader();
			this.value1 = "Add Internal Branch";
			this.permissionType = "internalBranchAdd";
		}
		if (this.path == "packet") {
			this.dataSourceHeader();
			this.value1 = "Add Packets";
			this.permissionType = "packetAdd";
			this.showfilter = true;
			this.filterName = 'packets';
			this.filterWidth = '400px';
		}
		if (this.path == "store") {
			this.dataSourceHeader();
			this.value1 = "Create Stores";
			this.permissionType = "storeAdd";
		}
		if (this.path == "bulk-upload-product") {
			this.rightButton = true;
			this.type2 = "button";
			this.value2 = "Show Report";
		}
		if (this.path == "admin-log") {
			this.showInput = true;
		}
		if (this.path == "order-details") {
			this.showInput = true;
			this.value1 = "Export";
			this.type1 = "button";
			this.filterName = "orderDetails";
			this.filterWidth = "630px";
			this.listType = "tenure,orderStatus";
			this.showfilter = true;
			this.showDropdown = true;
			this.dropdownTitle = "Generate";
			this.dropdownValue = [
				{ label: "Label", value: "label" },
				{ label: "Manifest", value: "mainfest" },
				{ label: "Deli Manifest", value: "deliMainfest" },
				{ label: "Uninsured Manifest", value: "uninsuredMainfest" },
			]
		}
		if (this.path == "cancel-order-details") {
			this.showInput = true;
			this.value1 = "Export";
			this.type1 = "button";
			this.showfilter = true;
			this.filterName = "cancelOrderDetails";
			this.filterWidth = "500px";
			this.listType = "merchantName";
		}
		if (this.path == "deposit-details") {
			this.showInput = true;
			this.value1 = "Export";
			this.type1 = "button";
			this.showfilter = true;
			this.filterName = "depositDetails";
			this.filterWidth = "450px";
			this.listType = "tenure,orderStatus";
		}
		if (this.path == "emi-details") {
			this.showfilter = true;
			this.showInput = true;
			this.value1 = "Export";
			this.type1 = "button";
			this.filterName = "emiDetails";
			this.filterWidth = "350px";
			this.listType = "emiStatus";
		}
		if (this.path == "customers") {
			this.showInput = true;
			this.value1 = "Export";
			this.type1 = "button";
		}
		if (location.href.includes('/broker/customers')) {
			this.value1 = "";
			this.type1 = "";
		}
		if (location.href.includes("edit-order-details")) {
			this.value5 = "Print Proforma";
			this.type5 = "button";
			this.value4 = "Contract";
			this.type4 = "reset";
			this.rightButton = true;
			this.showBackButton = true;
		}
		if (this.path == "loan-repayment") {
			this.value1 = "Add Loan Repayment";
			this.showInput = true;
			this.dataSourceHeader();
			// this.permissionType = "schemeAdd";
		}
		if (this.path == "loan-disbursement") {
			this.value1 = "Add Loan Disbursement";
			this.showInput = true;
			this.dataSourceHeader();
			// this.permissionType = "schemeAdd";
		}
		if (location.href.includes("edit-refund-details")) {
			this.showBackButton = true;
		}
		if (location.href.includes("view-loan")) {
			this.showBackButton = true;
		}
		if (location.href.includes("packet-image-upload")) {
			this.showBackButton = true;
		}
		if (location.href.includes("loan-details/")) {
			this.showBackButton = true;
		}
		if (location.href.includes("customer-list/")) {
			this.showBackButton = true;
		}
		if (location.href.includes("kyc-setting?mob")) {
			this.showBackButton = true;
		}
		if (location.href.includes("edit-kyc")) {
			this.showBackButton = true;
		}
		if (location.href.includes("redirect-assign-appraiser")) {
			this.showBackButton = true;
		}
		if (location.href.includes('/roles/')) {
			this.showBackButton = true;
		}
		if (
			location.href.includes("edit-merchant") ||
			location.href.includes("add-merchant")
		) {
			this.showBackButton = true;
		}
		if (location.href.includes('/order-details/cancel-order/')) {
			this.showBackButton = true;
		}
		if (this.path == "shop") {
			this.showInput = true;
			this.toogle = true;
			this.sortFlag = true;
		}
		if (location.href.includes('/shop/product/')) {
			this.showBackButton = true;
		}
		if (this.path == "checkout-customer-address") {
			this.showBackButton = true;
		}
		if (location.href.includes('/orders/view-pay/')) {
			this.showBackButton = true;
		}
		if (location.href.includes('/orders/cancel-order/')) {
			this.showBackButton = true;
		}
		if (this.path == "orders") {
			this.showInput = true;
			this.filterName = "brokerOrder";
			this.filterWidth = "500px";
			this.listType = "tenure,orderStatus";
			this.showfilter = true;
		}
		if (location.href.includes('/loan-management/topup')) {
			this.showBackButton = true;
		}
		if (location.href.includes('/admin/repayment/part-release')) {
			this.showBackButton = true;
		}
	}

	action(event: Event) {
		if (this.path == "lead-management") {
			this.leadService.openModal.next(true);
		}
		if (this.path == "scheme") {
			this.loanSettingService.openModal.next(true);
		}
		if (this.path == "ornaments") {
			this.ornamentsService.openModal.next(true);
		}
		if (this.path == "reasons") {
			this.reasonsService.openModal.next(true);
		}
		if (this.path == "holidays") {
			this.holidayService.openModal.next(true);
		}
		if (this.path == "partner") {
			this.partnerService.openModal.next(true);
		}
		if (this.path == "monthly") {
			this.monthlyService.openModal.next(true);
		}
		if (this.path == "branch") {
			this.branchService.openModal.next(true);
		}
		if (this.path == "roles") {
			this.rolesService.openModal.next(true);
		}
		if (this.path == "broker") {
			this.brokerService.openModal.next(true);
		}
		if (this.path == "internal-user") {
			this.internalUserService.openModal.next(true);
		}
		if (this.path == "assign-appraiser") {
			this.appraiserService.openModal.next(true);
		}
		if (this.path == "redirect-assign-appraiser") {
			this.appraiserService.openModal.next(true);
		}
		if (this.path == "merchant") {
			this.router.navigate(["/admin/user-management/add-merchant"]);
		}
		if (this.path == "wallet-price") {
			this.walletPriceService.openModal.next(true);
		}
		if (this.path == "category") {
			this.categoryService.openModal.next(true);
		}
		if (this.path == "sub-category") {
			this.subCategoryService.openModal.next(true);
		}
		if (this.path == "internal-user-branch") {
			this.internalUserBranchService.openModal.next(true);
		}
		if (this.path == "packet") {
			this.packetService.openModal.next(true);
		}
		if (this.path == "store") {
			this.storeService.openModal.next(true);
		}
		if (this.path == "bulk-upload-product") {
			this.router.navigate(["/admin/emi-management/bulk-upload-report"]);
		}
		if (this.path == "logistic-partner") {
			this.logisticPartnerService.openModal.next(true);
		}
		if (this.path == "karat-details") {
			this.karatDetailsService.openModal.next(true);
		}
		if (this.path == "email-alert") {
			this.emailAlertService.openModal.next(true);
		}
		if (this.path == "sms-alert") {
			this.smsAlertService.openDialog.next(true);
		}
		if (this.path == "order-details") {
			this.orderDetailsService.exportExcel.next(true);
		}
		if (this.path == "cancel-order-details") {
			this.cancelOrderDetailsService.exportExcel.next(true);
		}
		if (this.path == "deposit-details") {
			this.depositDetailsService.exportExcel.next(true);
		}
		if (this.path == "emi-details") {
			this.emiDetailsService.exportExcel.next(true);
		}
		if (this.path == "customers") {
			this.customerDetailsService.exportExcel.next(true);
		}
		if (this.path == 'packet-location') {
			this.packetLocation.openModal.next(true)
		}

		if (this.path == 'purposes') {
			this.purposeService.openModal.next(true)
		}
		if (this.path == 'lead-source') {
			this.leadSourceService.openModal.next(true)
		}
		if (this.path == 'loan-disbursement') {
			this.loanDisbursementService.openModal.next(true)
		}
		if (this.path == 'loan-repayment') {
			this.loanRepaymentService.openModal.next(true)
		}
		if (this.path == 'occupation') {
			this.occupationService.openModal.next(true)
		}
	}

	download() {
		if (this.path == "wallet-price") {
			this.walletPriceService.downloadReport.next(true);
		}
	}

	check(val) {
		if (this.path == "customer-list") {
			this.customerManagementServiceCustomer.toggle.next(val);
		}
		if (this.path == "shop") {
			this.shopService.toggle.next(val);
		}
	}

	selectedValue(value: string) {
		if (this.path == "order-details") {
			this.orderDetailsService.dropdownValue.next(value);
		}
	}

	buttonValue(value) {
		if (location.href.includes("edit-order-details")) {
			this.orderDetailsService.buttonValue.next(value);
		}
	}

	sortValue(value) {
		this.shopService.sortValue.next(value);
	}

	sort() {
		this.sortType += 1;
		if (this.sortType % 2 == 0) {
			this.sortImg = "../../../../../assets/media/icons/sort (1).svg";
			this.shopService.sortType.next(true);

		} else {
			this.sortImg = "../../../../../assets/media/icons/sort.svg";
			this.shopService.sortType.next(false);
		}
	}

	applyFilter(data) {
		if (this.path == "products") {
			this.productService.applyFilter.next(data);
		}
		if (this.path == "order-details") {
			this.orderDetailsService.applyFilter.next(data);
		}
		if (this.path == "emi-details") {
			this.emiDetailsService.applyFilter.next(data);
		}
		if (this.path == "deposit-details") {
			this.depositDetailsService.applyFilter.next(data);
		}
		if (this.path == "cancel-order-details") {
			this.cancelOrderDetailsService.applyFilter.next(data);
		}
		if (this.path == "lead-management") {
			this.leadService.applyFilter.next(data);
		}
		if (this.path == "applied-kyc") {
			this.appliedKycService.applyFilter.next(data)
		}
		if (this.path == "scheme") {
			this.loanSettingService.applyFilter.next(data)
		}
		if (this.path == "applied-loan") {
			this.appliedLoan.applyFilter.next(data)
		}
		if (location.href.includes('/broker/orders')) {
			this.ordersService.applyFilter.next(data)
		}
	}

	goBack() {
		this.location.back();
	}
}
