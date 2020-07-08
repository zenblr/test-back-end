import { SharedService } from '../shared/services/shared.service';
import { NgxPermissionsService } from 'ngx-permissions';

export class MenuConfig {
	public defaults: any;
	permissionsArr = [];
	modulesArr = [];
	userType: number;
	constructor(
		private sharedService: SharedService,
		public permissionsService: NgxPermissionsService
	) {
		this.sharedService.getUserDetailsFromStorage().subscribe(res => {
			if (res && res.permissions.length) {
				for (const item of res.permissions) {
					this.permissionsArr.push(item.description);
				}
				this.permissionsService.loadPermissions(this.permissionsArr);
				// console.log(this.permissionsArr);
			}

			if (res.userDetails) {
				this.userType = res.userDetails.userTypeId;
			}

			if (res && res.modules.length) {
				for (const item of res.modules) {
					this.modulesArr.push(item.module.id);
				}
				// console.log(this.modulesArr);
			}

			this.defaults = {
				aside: {
					self: {},
					adminItems: [
						{
							title: "Dashboard",
							root: true,
							src: "assets/media/aside-icons/icons-01.svg",
							page: "/admin/dashboard",
							translate: "MENU.DASHBOARD",
							permission: false,
						},
						{
							title: "Admin Account",
							root: true,
							src: "assets/media/aside-icons/icons-02.svg",
							page: "/admin/dashboard",
							bullet: 'dot',
							permission: false,
							submenu: [
								{
									title: "Change Password",
									page: "/admin/admin-account/change-password",
									permission: false,
								},
								{
									title: "Show Queries",
									page: "/admin/admin-account/show-queries",
									permission: false,
								},
								{
									title: "Show Feedback",
									page: "/admin/admin-account/show-feedback",
									permission: false,
								},
							],
						},
						{
							title: "Admin Settings",
							root: true,
							src: "assets/media/aside-icons/icons-03.svg",
							bullet: 'dot',
							permission: false,
							submenu: [
								{
									title: "Upload Data",
									root: true,
									bullet: 'dot',
									permission: !(this.permissionsArr.includes('promotionalBannerView') ||
										this.permissionsArr.includes('offerBannerView') ||
										this.permissionsArr.includes('goldRateView') ||
										this.permissionsArr.includes('partnerBannerView')),

									submenu: [
										{
											title: "Gold Rate",
											page: "/admin/upload-data/gold-rate",
											permission: !this.permissionsArr.includes('goldRateView'),
										},
										{
											title: "Promotional Banners",
											page: "/admin/upload-data/upload-banner",
											permission: !this.permissionsArr.includes('promotionalBannerView'),
										},
										{
											title: "Offer Banners",
											page: "/admin/upload-data/upload-offer",
											permission: !this.permissionsArr.includes('offerBannerView'),
										},
										{
											title: "Partner Banners",
											page: "/admin/upload-data/upload-lender-banner",
											permission: !this.permissionsArr.includes('partnerBannerView'),
										},

									],
								},
								{
									title: "Loan Settings",
									root: true,
									bullet: 'dot',
									permission: !(this.permissionsArr.includes('schemeView') ||
										this.permissionsArr.includes('karatDetailsView')),

									submenu: [
										{
											title: "Scheme",
											page: "/admin/loan-setting/scheme",
											bullet: 'dot',
											permission: !this.permissionsArr.includes('schemeView'),
										},
										{
											title: "Karat details",
											page: "/admin/loan-setting/karat-details",
											bullet: 'dot',
											permission: !this.permissionsArr.includes('karatDetailsView'),
										},
									],
								},
								{
									title: "Notification Settings",
									root: true,
									bullet: 'dot',
									permission: false,

									submenu: [
										{
											title: "Email Template",
											page: "/admin/notification-setting/email-alert",
											permission: false,
										},
										{
											title: "SMS Template",
											page: "/admin/notification-setting/sms-alert",
											permission: false,
										},
									],
								},
								{
									title: "Masters",
									root: true,
									bullet: 'dot',
									permission: false,

									submenu: [
										{
											title: "Lead Source",
											page: "/admin/masters/lead-source",
											permission: false,
										},
										{
											title: "Ornaments",
											page: "/admin/masters/ornaments",
											permission: false,
										},
										{
											title: "Unapproved Reasons",
											page: "/admin/masters/reasons",
											permission: false,
										},
										{
											title: "Purposes",
											page: "/admin/masters/purposes",
											permission: false,
										},
										{
											title: "Occupations",
											page: "/admin/masters/occupation",
											permission: false,
										},
										{
											title: "Packet Location",
											page: "/admin/masters/packet-location",
											permission: false,
										},
										{
											title: "Holidays",
											root: true,
											permission: false,
											page: "/admin/holidays"
										},
									],
								},
							],
						},
						{
							title: "User Management",
							root: true,
							src: "assets/media/aside-icons/icons-04.svg",
							page: "/admin/user-management",
							permission: !(this.permissionsArr.includes('merchantView') ||
								this.permissionsArr.includes('brokerView') ||
								this.permissionsArr.includes('storeView') ||
								this.permissionsArr.includes('partnerBannerView') ||
								this.permissionsArr.includes('partnerView') ||
								this.permissionsArr.includes('partnerBranchView') ||
								this.permissionsArr.includes('internalBranchView') ||
								this.permissionsArr.includes('internalUserView') ||
								this.permissionsArr.includes('assignAppraiserView') ||
								this.userType === 4),
						},
						{
							title: "Lead Management",
							root: true,
							src: "assets/media/aside-icons/icons-05.svg",
							page: "/admin/lead-management",
							permission: !(this.permissionsArr.includes('leadManagmentView')),
						},
						{
							title: "Customer Setting",
							root: true,
							bullet: 'dot',
							src: "assets/media/aside-icons/icons-06.svg",
							permission: !(this.permissionsArr.includes('customerKycView') ||
								this.permissionsArr.includes('appliedKycView')),
							submenu: [
								{
									title: "KYC Setting",
									page: "/admin/kyc-setting",
									permission: !this.permissionsArr.includes('customerKycAdd'),
								},
								{
									title: "Applied KYC",
									page: "/admin/applied-kyc",
									permission: !this.permissionsArr.includes('appliedKycView'),
								},
								{
									title: "Assigned Customers",
									page: "/admin/assigned-customers",
									// permission: !this.permissionsArr.includes('appliedKycView'),
								},
							],
						},
						{
							title: "Loan Management",
							root: true,
							bullet: 'dot',
							src: "assets/media/aside-icons/icons-07.svg",
							permission: false,
							submenu: [
								{
									title: "Loan Calculator",
									page: "/admin/loan-management/loan-calculator",
									bullet: 'dot',
									permission: false,
								},
								{
									title: "Loan Application Form",
									page: "/admin/loan-management/loan-application-form",
									bullet: 'dot',
									permission: !this.permissionsArr.includes('loanApplicationAdd'),
								},
								{
									title: "Packet",
									page: "/admin/loan-management/packet",
									bullet: 'dot',
									permission: !(this.permissionsArr.includes('packetEdit') ||
										this.permissionsArr.includes('packetAdd') ||
										this.permissionsArr.includes('packetView')),
								},
								{
									title: "Packet Tracking",
									page: "/admin/loan-management/packet-tracking",
									bullet: 'dot',
									permission: !(this.permissionsArr.includes('packetEdit') ||
										this.permissionsArr.includes('packetAdd') ||
										this.permissionsArr.includes('packetView')),
								},
								{
									title: "Applied Loan",
									page: "/admin/loan-management/applied-loan",
									bullet: 'dot',
									permission: !this.permissionsArr.includes('appliedLoanView'),
								},
								{
									title: "Loan Details",
									page: "/admin/loan-management/all-loan",
									bullet: 'dot',
									permission: !this.permissionsArr.includes('loanDetailsView'),
								},
								{
									title: "Transfer Loan List",
									page: "/admin/loan-management/transfer-loan-list",
									bullet: 'dot',
									// permission: !this.permissionsArr.includes('loanDetailsView'),
								}
							],
						},
						{
							title: "Customer Management",
							root: true,
							src: "assets/media/aside-icons/icons-08.svg",
							page: "/admin/customer-management/customer-list",
							permission: !this.permissionsArr.includes('customerManagementView'),
						},
						{
							title: "Repayment Structure",
							root: true,
							bullet: 'dot',
							src: "assets/media/aside-icons/icons-09.svg",
							permission: false,
							submenu: [
								{
									title: "Monthly Payment",
									page: "/admin/repayment/monthly",
									bullet: 'dot',
									permission: false,
								},
								// {
								// 	title: 'One Shot Payment',
								// 	path: '/one-shot-payment',
								// permission: false,
								// }
							],
						},
						{
							title: "Account",
							root: true,
							src: "assets/media/aside-icons/icons-12.svg",
							bullet: 'dot',
							permission: false,
							submenu: [
								{
									title: "Loan Disbursed Details",
									page: "/admin/account/loan-disbursement",
									permission: false,
								},
								{
									title: "Loan Repayment Details",
									page: "/admin/account/loan-repayment",
									permission: false,
								},
							],
						},
						{
							title: "Funds and Approvals",
							root: true,
							src: "assets/media/aside-icons/icons-12.svg",
							bullet: 'dot',
							permission: false,
							submenu: [
								{
									title: "Deposit",
									page: "/admin/funds-approvals/deposit",
									permission: false,
								},
							],
						},
						{
							title: "Report",
							root: true,
							bullet: 'dot',
							src: "assets/media/aside-icons/icons-27.svg",
							permission: false,
							submenu: [
								{
									title: "KYC",
									page: "/admin/kyc",
									bullet: 'dot',
									permission: false,
								},
								{
									title: "Loan Status Report",
									page: "/admin/loan-status",
									bullet: 'dot',
									permission: false,
								},
								{
									title: "Branch Report",
									page: "/admin/branch",
									bullet: 'dot',
									permission: false,
								},
								{
									title: "Loan Type Reports",
									page: "/admin/loan-type",
									bullet: 'dot',
									permission: false,
								},
								{
									title: "Margin Reports",
									page: "/admin/marign",
									permission: false,
								},
							],
						},
						{
							title: "EMI Management",
							root: true,
							src: "assets/media/aside-icons/icons-24.svg",
							page: "/admin/emi-management",
							permission: !this.modulesArr.includes(2),
						},
						{
							title: "Settings",
							root: true,
							bullet: 'dot',
							src: "assets/media/aside-icons/icons-03.svg",
							permission: false,
							submenu: [
								{
									title: "Global Settings",
									page: "/admin/global-settings",
									permission: false,
								},
							]
						},
						{
							title: "Broker",
							root: true,
							src: "assets/media/aside-icons/icons-29.svg",
							page: "/broker",
							permission: !this.modulesArr.includes(2),
						},
						{
							title: "Log Out",
							src: "assets/media/aside-icons/icons-11.svg",
							permission: false,
						},
					],
					userMgmtItems: [
						{
							title: "Partner",
							root: true,
							page: "/admin/user-management/partner",
							src: "assets/media/aside-icons/icons-06.svg",
							permission: !this.permissionsArr.includes('partnerView'),
						},
						{
							title: "Partner Branch ",
							root: true,
							page: "/admin/user-management/branch",
							src: "assets/media/aside-icons/icons-13.svg",
							permission: !this.permissionsArr.includes('partnerBranchView'),
						},
						{
							title: "Internal User",
							root: true,
							page: "/admin/user-management/internal-user",
							src: "assets/media/aside-icons/icons-14.svg",
							permission: !this.permissionsArr.includes('internalUserView'),
						},
						{
							title: "Internal User Branch",
							root: true,
							page: "/admin/user-management/internal-user-branch",
							src: "assets/media/aside-icons/icons-15.svg",
							permission: !this.permissionsArr.includes('internalBranchView'),
						},
						{
							title: "Assign Appraiser",
							root: true,
							page: "/admin/user-management/assign-appraiser",
							src: "assets/media/aside-icons/icons-16.svg",
							permission: !this.permissionsArr.includes('assignAppraiserView'),
						},
						{
							title: "Merchant",
							root: true,
							page: "/admin/user-management/merchant",
							src: "assets/media/aside-icons/icons-17.svg",
							permission: !this.permissionsArr.includes('merchantView')
						},
						{
							title: "Broker",
							root: true,
							page: "/admin/user-management/broker",
							src: "assets/media/aside-icons/icons-18.svg",
							permission: !this.permissionsArr.includes('brokerView'),
						},
						{
							title: "Store",
							root: true,
							page: "/admin/user-management/store",
							src: "assets/media/aside-icons/icons-19.svg",
							permission: !this.permissionsArr.includes('storeView')
						},
						{
							title: "Roles and permissions",
							root: true,
							page: "/admin/user-management/roles",
							src: "assets/media/aside-icons/icons-20.svg",
							permission: !(this.userType === 4),
						},
						{
							title: "Back",
							src: "assets/media/aside-icons/icons-21.svg",
							root: true,
							page: "/admin/dashboard",
							permission: false,
						},
					],
					emiMgmtItems: [
						{
							title: "Dashboard",
							root: true,
							src: "assets/media/aside-icons/icons-01.svg",
							page: "/admin/emi-management/dashboard",
							translate: "MENU.DASHBOARD",
							permission: false,
						},
						{
							title: "Product",
							root: true,
							icon: "flaticon2-open-box",
							bullet: 'dot',

							permission: !(this.permissionsArr.includes('productView') ||
								this.permissionsArr.includes('categoryView') ||
								this.permissionsArr.includes('subCategoryView') ||
								this.permissionsArr.includes('productAdd') ||
								this.permissionsArr.includes('productEdit')),

							submenu: [
								{
									title: "Show Product",
									page: "/admin/emi-management/products",
									permission: !this.permissionsArr.includes('productView'),
								},
								{
									title: "Category",
									page: "/admin/emi-management/category",
									permission: !this.permissionsArr.includes('categoryView'),
								},
								{
									title: "Sub-Category",
									page: "/admin/emi-management/sub-category",
									permission: !this.permissionsArr.includes('subCategoryView'),
								},
								{
									title: "Bulk Upload Product",
									page: "/admin/emi-management/bulk-upload-product",
									permission: !this.permissionsArr.includes('productAdd'),
								},
								{
									title: "Bulk Edit Product",
									page: "/admin/emi-management/bulk-edit-product",
									permission: !this.permissionsArr.includes('productEdit'),
								},
								{
									title: "Upload Design",
									page: "/admin/emi-management/upload-design",
									permission: !(this.permissionsArr.includes('productAdd') || this.permissionsArr.includes('productEdit')),
								},
							],
						},
						{
							title: "Logistic Partner",
							src: "assets/media/aside-icons/icons-25.svg",
							page: "/admin/emi-management/logistic-partner",
							permission: !this.permissionsArr.includes('logisticPartnerView'),
						},
						{
							title: "Bulk Upload Report",
							root: true,
							icon: "flaticon2-download-2",
							page: "/admin/emi-management/bulk-upload-report",
							permission: !this.permissionsArr.includes('bulkReportView'),
						},
						{
							title: "Config Details",
							root: true,
							icon: "flaticon2-console",
							bullet: 'dot',

							permission: !(this.permissionsArr.includes('walletView') || this.permissionsArr.includes('adminLogView')),

							submenu: [
								{
									title: "Wallet Price",
									page: "/admin/emi-management/wallet-price",
									permission: !this.permissionsArr.includes('walletView'),
								},
								{
									title: "Admin Log",
									page: "/admin/emi-management/admin-log",
									permission: !this.permissionsArr.includes('adminLogView'),
								},
							],
						},
						{
							title: "Order Management",
							root: true,
							icon: "flaticon2-shopping-cart",
							bullet: 'dot',
							permission: !(this.permissionsArr.includes('orderView') ||
								this.permissionsArr.includes('EMIDetailsView') ||
								this.permissionsArr.includes('refundDetailsView') ||
								this.permissionsArr.includes('cancelOrderView') ||
								this.permissionsArr.includes('depositDetailsView')),

							submenu: [
								{
									title: "Order Details",
									page: "/admin/emi-management/order-details",
									permission: !this.permissionsArr.includes('orderView'),
								},
								{
									title: "EMI Details",
									page: "/admin/emi-management/emi-details",
									permission: !this.permissionsArr.includes('EMIDetailsView'),
								},
								{
									title: "Deposit Details",
									page: "/admin/emi-management/deposit-details",
									permission: !this.permissionsArr.includes('depositDetailsView'),
								},
								{
									title: "Cancel Order Details",
									page: "/admin/emi-management/cancel-order-details",
									permission: !this.permissionsArr.includes('cancelOrderView'),
								},
								{
									title: "Refund Details",
									page: "/admin/emi-management/refund-details",
									permission: !this.permissionsArr.includes('refundDetailsView'),
								},
							],
						},
						{
							title: 'Customer Details',
							root: true,
							src: "assets/media/aside-icons/icons-26.svg",
							page: "/admin/emi-management/customers",
							permission: !this.permissionsArr.includes('customerView'),
						},
						{
							title: 'Reports',
							root: true,
							src: "assets/media/aside-icons/icons-27.svg",
							page: "/admin/emi-management/reports",
							permission: !(this.permissionsArr.includes('userReport') ||
								this.permissionsArr.includes('depositReport') ||
								this.permissionsArr.includes('EMIReport') ||
								this.permissionsArr.includes('orderReport') ||
								this.permissionsArr.includes('cancelOrderReport') ||
								this.permissionsArr.includes('labelReport') ||
								this.permissionsArr.includes('productsReport') ||
								this.permissionsArr.includes('franchiseReport')),
						},
						{
							title: 'Back',
							src: "assets/media/aside-icons/icons-21.svg",
							root: true,
							page: "/admin/dashboard",
							permission: false,
						},
					],
					brokerItems: [
						{
							title: "Dashboard",
							root: true,
							src: "assets/media/aside-icons/icons-01.svg",
							page: "/broker/dashboard",
							translate: "MENU.DASHBOARD",
							permission: false,
						},
						{
							title: "Customers",
							root: true,
							page: "/broker/customers",
							src: "assets/media/aside-icons/icons-26.svg",
							permission: !this.permissionsArr.includes('customerView'),
						},
						{
							title: "Orders",
							root: true,
							page: "/broker/orders",
							src: "assets/media/aside-icons/icons-30.svg",
							permission: !this.permissionsArr.includes('orderView'),
						},
						{
							title: "Shop",
							root: true,
							page: "/broker/shop",
							src: "assets/media/aside-icons/icons-31.svg",
							permission: !this.permissionsArr.includes('orderAdd'),
						},
						{
							title: "Cart",
							root: true,
							page: "/broker/cart",
							src: "assets/media/aside-icons/icons-32.svg",
							count: true,
							permission: false,
						},
						{
							title: "Profile",
							root: true,
							page: "/broker/profile",
							src: "assets/media/aside-icons/icons-33.svg",
							permission: !this.permissionsArr.includes('customerView'),
						},
						{
							title: 'Back',
							src: "assets/media/aside-icons/icons-21.svg",
							root: true,
							page: "/admin/dashboard",
							permission: !(this.userType !== 2 && this.userType !== 3),
						},
						{
							title: "Log Out",
							src: "assets/media/aside-icons/icons-12.svg",
							permission: !(this.userType === 2 || this.userType === 3),
						},
					],
				},
			};
		});
	}

	public get configs(): any {
		return this.defaults;
	}
}
