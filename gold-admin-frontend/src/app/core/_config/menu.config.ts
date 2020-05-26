import { SharedService } from '../shared/services/shared.service';
import { NgxPermissionsService } from 'ngx-permissions';

export class MenuConfig {
	public defaults: any;
	permissionsArr = [];
	modulesArr = [];

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
				console.log(this.permissionsArr);
			}

			if (res && res.modules.length) {
				for (const item of res.modules) {
					this.modulesArr.push(item.module.id);
				}
				console.log(this.modulesArr);
			}

			this.defaults = {
				aside: {
					self: {},
					itemsOne: [
						{
							title: "Dashboard",
							root: true,
							src: "assets/media/aside-icons/icons-01.svg",
							page: "/dashboard",
							translate: "MENU.DASHBOARD",
							permission: false,
						},
						{
							title: "Admin Account",
							root: true,
							src: "assets/media/aside-icons/icons-02.svg",
							page: "/dashboard",
							permission: false,

							submenu: [
								{
									title: "Change Password",
									page: "/admin-account/change-password",
									permission: false,
								},
								{
									title: "Show Queries",
									page: "/admin-account/show-queries",
									permission: false,
								},
								{
									title: "Show Feedback",
									page: "/admin-account/show-feedback",
									permission: false,
								},
							],
						},
						{
							title: "Admin-Settings",
							root: true,
							src: "assets/media/aside-icons/icons-03.svg",
							permission: false,

							submenu: [
								{
									title: "Upload Data",
									root: true,
									permission: false,

									submenu: [
										{
											title: "Promotional Banners",
											page: "/upload-data/upload-banner",
											permission: false,
										},
										{
											title: "Offer Banners",
											page: "/upload-data/upload-offer",
											permission: false,
										},
										{
											title: "Partner Banners",
											page: "/upload-data/upload-lender-banner",
											permission: false,
										},
										// {
										// 	title: 'Upload Scheme',
										// 	page: '/upload-data/upload-scheme',
										// permission: false,
										//
										// },
									],
								},
								{
									title: "Loan Settings",
									root: true,
									permission: false,

									submenu: [
										{
											title: "Scheme",
											page: "/loan-setting/scheme",
											permission: false,
										},
										{
											title: "Packet",
											page: "/loan-setting/packet",
											permission: false,
										},
										{
											title: "Karat details",
											page: "/loan-setting/karat-details",
											permission: false,
										},
									],
								},
								{
									title: "Notification Settings",
									root: true,
									permission: false,

									submenu: [
										{
											title: "Email Alerts",
											page: "/loan-setting/email-alerts",
											permission: false,
										},
										{
											title: "SMS Alerts",
											page: "/loan-setting/sms-alerts",
											permission: false,
										},
									],
								},
							],
						},
						{
							title: "User Management",
							root: true,
							src: "assets/media/aside-icons/icons-04.svg",
							page: "/user-management",
							permission: false,
						},
						{
							title: "Lead Management",
							root: true,
							src: "assets/media/aside-icons/icons-05.svg",
							page: "/lead-management",
							permission: false,
						},
						{
							title: "Customer Setting",
							root: true,
							src: "assets/media/aside-icons/icons-06.svg",
							permission: false,

							submenu: [
								{
									title: "KYC Setting",
									page: "/kyc-setting",
									permission: false,
								},
								{
									title: "Applied Kyc",
									page: "/applied-kyc",
									permission: false,
								},
							],
						},
						{
							title: "Loan Managment",
							root: true,
							src: "assets/media/aside-icons/icons-07.svg",
							permission: false,

							submenu: [
								{
									title: "Loan Calculator",
									page: "/loan-management/loan-calculator",
									permission: false,
								},
								{
									title: "Loan Application Form",
									page: "/loan-management/loan-application-form",
									permission: false,
								},
								{
									title: "Packet",
									page: "/loan-management/packet",
									permission: false,
								},
								{
									title: "Applied Loan",
									page: "/loan-management/applied-loan",
									permission: false,
								},
								{
									title: "Loan Details",
									page: "/loan-management/all-loan",
									permission: false,
								},
							],
						},
						{
							title: "Customer Management",
							root: true,
							src: "assets/media/aside-icons/icons-08.svg",
							page: "/customer-management/customer-list",
							permission: false,
						},
						{
							title: "Repayment Structure",
							root: true,
							src: "assets/media/aside-icons/icons-09.svg",
							permission: false,

							submenu: [
								{
									title: "Monthly Payment",
									page: "/repayment/monthly",
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
							permission: false,

							submenu: [
								{
									title: "Loan Disbursed Details",
									path: "/Loan-disbursed-detail",
									permission: false,
								},
								{
									title: "Loan Repayment Details",
									path: "/Loan-repayment-detail",
									permission: false,
								},
							],
						},
						{
							title: "Report",
							root: true,
							src: "assets/media/aside-icons/icons-11.svg",
							permission: false,

							submenu: [
								{
									title: "KYC",
									path: "/kyc",
									permission: false,
								},
								{
									title: "Loan Status Report",
									path: "/loan-status",
									permission: false,
								},
								{
									title: "Branch Report",
									path: "/branch",
									permission: false,
								},
								{
									title: "Loan Type Reports",
									path: "/loan-type",
									permission: false,
								},
								{
									title: "Margin Reports",
									path: "/marign",
									permission: false,
								},
							],
						},
						{
							title: "EMI Management",
							root: true,
							src: "assets/media/aside-icons/icons-24.svg",
							page: "/emi-management",
							permission: !this.modulesArr.includes(2),
						},
						{
							title: "Log Out",
							src: "assets/media/aside-icons/icons-12.svg",
							permission: false,
						},
					],
					itemsTwo: [
						{
							title: "Partner",
							root: true,
							page: "/user-management/partner",
							src: "assets/media/aside-icons/icons-06.svg",
							permission: false,
						},
						{
							title: "Partner Branch ",
							root: true,
							page: "/user-management/branch",
							src: "assets/media/aside-icons/icons-13.svg",
							permission: false,
						},
						{
							title: "Internal User",
							root: true,
							page: "/user-management/internal-user",
							src: "assets/media/aside-icons/icons-14.svg",
							permission: false,
						},
						{
							title: "Internal User Branch",
							root: true,
							page: "/user-management/internal-user-branch",
							src: "assets/media/aside-icons/icons-15.svg",
							permission: false,
						},
						{
							title: "Assign Appraiser",
							root: true,
							page: "/user-management/assign-appraiser",
							src: "assets/media/aside-icons/icons-16.svg",
							permission: false,
						},
						{
							title: "Merchant",
							root: true,
							page: "/user-management/merchant",
							src: "assets/media/aside-icons/icons-17.svg",
							permission: false,
						},
						{
							title: "Broker",
							root: true,
							page: "/user-management/broker",
							src: "assets/media/aside-icons/icons-18.svg",
							permission: false,
						},
						{
							title: "Store",
							root: true,
							page: "/user-management/store",
							src: "assets/media/aside-icons/icons-19.svg",
							permission: false,
						},
						{
							title: "Roles and permissions",
							root: true,
							page: "/user-management/roles",
							src: "assets/media/aside-icons/icons-20.svg",
							permission: false,
						},
						{
							title: "Back",
							src: "assets/media/aside-icons/icons-21.svg",
							root: true,
							page: "/dashboard",
							permission: false,
						},
					],
					itemsThree: [
						{
							title: "Product",
							root: true,
							icon: "flaticon2-open-box",
							permission: !(this.permissionsArr.includes('productView') ||
								this.permissionsArr.includes('categoryView') ||
								this.permissionsArr.includes('sub-categoryView') ||
								this.permissionsArr.includes('productAdd') ||
								this.permissionsArr.includes('productEdit')),

							submenu: [
								{
									title: "Show Product",
									page: "/emi-management/products",
									permission: !this.permissionsArr.includes('productView'),
								},
								{
									title: "Category",
									page: "/emi-management/category",
									permission: !this.permissionsArr.includes('categoryView'),
								},
								{
									title: "Sub-Category",
									page: "/emi-management/sub-category",
									permission: !this.permissionsArr.includes('sub-categoryView'),
								},
								{
									title: "Bulk Upload Product",
									page: "/emi-management/bulk-upload-product",
									permission: !this.permissionsArr.includes('productAdd'),
								},
								{
									title: "Bulk Edit Product",
									page: "/emi-management/bulk-edit-product",
									permission: !this.permissionsArr.includes('productEdit'),
								},
								{
									title: "Upload Design",
									page: "/emi-management/upload-design",
									permission: !(this.permissionsArr.includes('productAdd') || this.permissionsArr.includes('productEdit')),
								},
							],
						},
						{
							title: "Logistic Partner",
							src: "assets/media/aside-icons/icons-25.svg",
							page: "/emi-management/logistic-partner",
							permission: !this.permissionsArr.includes('logisticPartnerView'),
						},
						{
							title: "Bulk Upload Report",
							root: true,
							icon: "flaticon2-download-2",
							page: "/emi-management/bulk-upload-report",
							permission: !this.permissionsArr.includes('bulkReportView'),
						},
						{
							title: "Config Details",
							root: true,
							icon: "flaticon2-console",
							permission: !(this.permissionsArr.includes('walletView') || this.permissionsArr.includes('adminLogView')),

							submenu: [
								{
									title: "Wallet Price",
									page: "/emi-management/wallet-price",
									permission: !this.permissionsArr.includes('walletView'),
								},
								{
									title: "Admin Log",
									page: "/emi-management/admin-log",
									permission: !this.permissionsArr.includes('adminLogView'),
								},
							],
						},
						{
							title: "Order Management",
							root: true,
							icon: "flaticon2-shopping-cart",
							permission: !(this.permissionsArr.includes('orderView') ||
								this.permissionsArr.includes('EMIDetailsView') ||
								this.permissionsArr.includes('refundDetailsView') ||
								this.permissionsArr.includes('cancelOrderView') ||
								this.permissionsArr.includes('depositDetailsView')),

							submenu: [
								{
									title: "Order Details",
									page: "/emi-management/order-details",
									permission: !this.permissionsArr.includes('orderView'),
								},
								{
									title: "EMI Details",
									page: "/emi-management/emi-details",
									permission: !this.permissionsArr.includes('EMIDetailsView'),
								},
								{
									title: "Deposit Details",
									page: "/emi-management/deposit-details",
									permission: !this.permissionsArr.includes('depositDetailsView'),
								},
								{
									title: "Cancel Order Details",
									page: "/emi-management/cancel-order-details",
									permission: !this.permissionsArr.includes('cancelOrderView'),
								},
								{
									title: "Refund Details",
									page: "/emi-management/refund-details",
									permission: !this.permissionsArr.includes('refundDetailsView'),
								},
							],
						},
						{
							title: 'User Details',
							root: true,
							src: "assets/media/aside-icons/icons-26.svg",
							page: "/emi-management/users",
							permission: !this.permissionsArr.includes('customerView'),
						},
						{
							title: 'Reports',
							root: true,
							src: "assets/media/aside-icons/icons-27.svg",
							page: '/emi-management/reports',
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
							icon: 'flaticon-logout',
							root: true,
							page: "/dashboard",
							permission: false,
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
