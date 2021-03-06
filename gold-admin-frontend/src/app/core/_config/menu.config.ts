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
						// {
						// 	title: "Admin Account",
						// 	root: true,
						// 	src: "assets/media/aside-icons/icons-02.svg",
						// 	page: "/admin/dashboard",
						// 	bullet: 'dot',
						// 	permission: false,
						// 	submenu: [
						// 		{
						// 			title: "Change Password",
						// 			page: "/admin/admin-account/change-password",
						// 			permission: false,
						// 		},
						// 		{
						// 			title: "Show Queries",
						// 			page: "/admin/admin-account/show-queries",
						// 			permission: false,
						// 		},
						// 		{
						// 			title: "Show Feedback",
						// 			page: "/admin/admin-account/show-feedback",
						// 			permission: false,
						// 		},
						// 	],
						// },

						{
							title: "User Management",
							root: true,
							src: "assets/media/aside-icons/icons-04.svg",
							page: '/admin/user-management',
							permission: !(this.permissionsArr.includes('merchantView') ||
								this.permissionsArr.includes('brokerView') ||
								this.permissionsArr.includes('storeView') ||
								this.permissionsArr.includes('partnerBannerView') ||
								this.permissionsArr.includes('partnerView') ||
								this.permissionsArr.includes('partnerBranchView') ||
								this.permissionsArr.includes('internalBranchView') ||
								this.permissionsArr.includes('internalUserView') ||
								this.permissionsArr.includes('assignAppraiserView') ||
								this.permissionsArr.includes('concurrentLoginView') ||
								this.permissionsArr.includes('partnerBranchUserView') ||
								this.userType === 4),
						},
						{
							title: "Customer Management",
							root: true,
							bullet: 'dot',
							src: "assets/media/aside-icons/icons-05.svg",
							page: "/admin/lead-management",
							permission: !(this.permissionsArr.includes('leadManagmentView') || this.permissionsArr.includes('viewNewRequest') || this.permissionsArr.includes('customerRegistrationView')),
							submenu: [
								{
									title: "All Customers",
									page: "/admin/lead-management",
									permission: !this.permissionsArr.includes('leadManagmentView'),
								},
								{
									title: "Appraiser Requests",
									page: "/admin/lead-management/new-requests",
									permission: !this.permissionsArr.includes('viewNewRequest'),
								},
								// {
								// 	title: "My Requests",
								// 	page: "/admin/lead-management/my-requests",
								// 	permission: false,
								// },
								{
									title: "Customer Request List",
									page: "/admin/lead-management/registered-customers",
									// permission: !this.permissionsArr.includes('customerRegistrationView')
								},
								{
									title: "Campaign Customer List",
									page: "/admin/lead-management/campaign-list",
									// permission: !this.permissionsArr.includes('customerRegistrationView')
								}
							],
						},
						{
							title: "KYC Details",
							root: true,
							bullet: 'dot',
							src: "assets/media/aside-icons/icons-06.svg",
							permission: !(this.permissionsArr.includes('customerKycView') ||
								this.permissionsArr.includes('appliedKycView')),
							submenu: [
								// {
								// 	title: "KYC Application",
								// 	page: "/admin/kyc-setting",
								// 	permission: !this.permissionsArr.includes('customerKycAdd'),
								// },
								{
									title: "Applied KYC",
									page: "/admin/applied-kyc",
									permission: !this.permissionsArr.includes('appliedKycView'),
								},
								// {
								// 	title: "Applied KYC - Digi Gold",
								// 	page: "/admin/applied-kyc-digi-gold",
								// 	// permission: !this.permissionsArr.includes('appliedKycView'),
								// },
								// {
								// 	title: "Assigned Customers",
								// 	page: "/admin/assigned-customers",
								// 	// permission: !this.permissionsArr.includes('appliedKycView'),
								// },
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
								// {
								// 	title: "Loan Application Form",
								// 	page: "/admin/loan-management/loan-application-form",
								// 	bullet: 'dot',
								// 	permission: !this.permissionsArr.includes('loanApplicationAdd'),
								// },
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
									permission: !this.permissionsArr.includes('packetTrackingView'),
								},
								{
									title: "My Packets",
									page: "/admin/loan-management/my-packets",
									bullet: 'dot',
									permission: !this.permissionsArr.includes('myPacket'),
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
									title: "Loan Transfer List",
									page: "/admin/loan-management/transfer-loan-list",
									bullet: 'dot',
									permission: !this.permissionsArr.includes('viewLoanTransfer'),
								},
								{
									title: "Customer Management",
									// root: true,
									bullet: 'dot',
									// src: "assets/media/aside-icons/icons-08.svg",
									page: "/admin/customer-management/customer-list",
									permission: !this.permissionsArr.includes('customerManagementView'),
								}
							],
						},
						// {
						// 	title: "Global Map",
						// 	root: true,
						// 	src: "assets/media/aside-icons/icons-08.svg",
						// 	page: "/admin/global-map",
						// },
						// {
						// 	title: "Customer Management",
						// 	root: true,
						// 	src: "assets/media/aside-icons/icons-08.svg",
						// 	page: "/admin/customer-management/customer-list",
						// 	permission: !this.permissionsArr.includes('customerManagementView'),
						// },
						// {
						// 	title: "Repayment Structure",
						// 	root: true,
						// 	bullet: 'dot',
						// 	src: "assets/media/aside-icons/icons-09.svg",
						// 	permission: false,
						// 	submenu: [
						// 		{
						// 			title: "Monthly Payment",
						// 			page: "/admin/repayment/monthly",
						// 			bullet: 'dot',
						// 			permission: false,
						// 		},
						// 	],
						// },
						// {
						// 	title: "Account",
						// 	root: true,
						// 	src: "assets/media/aside-icons/icons-12.svg",
						// 	bullet: 'dot',
						// 	permission: false,
						// 	submenu: [
						// 		{
						// 			title: "Loan Disbursed Details",
						// 			page: "/admin/account/loan-disbursement",
						// 			permission: false,
						// 		},
						// 		{
						// 			title: "Loan Repayment Details",
						// 			page: "/admin/account/loan-repayment",
						// 			permission: false,
						// 		},
						// 	],
						// },
						{
							title: "Funds and Approvals",
							root: true,
							src: "assets/media/aside-icons/icons-12.svg",
							bullet: 'dot',
							permission: !(this.permissionsArr.includes('partReleaseApprovalView') ||
								this.permissionsArr.includes('fullReleaseApprovalView') ||
								this.permissionsArr.includes('viewDeposit') ||
								this.permissionsArr.includes('partReleaseApprovedView') ||
								this.permissionsArr.includes('fullReleaseApprovedView')),
							submenu: [
								{
									title: "Deposit",
									page: "/admin/funds-approvals/deposit",
									permission: !this.permissionsArr.includes('viewDeposit'),
								},
								{
									title: "Top-Up Approval",
									page: "/admin/funds-approvals/top-up-approval",
									permission: false,
								},
								{
									title: "Jewellery Release Approval",
									bullet: 'dot',
									permission: !(this.permissionsArr.includes('partReleaseApprovalView') || this.permissionsArr.includes('fullReleaseApprovalView')),
									submenu: [
										{
											title: "Part Release Approval",
											page: "/admin/funds-approvals/part-release-approval",
											permission: !this.permissionsArr.includes('partReleaseApprovalView'),
										},
										{
											title: "Full Release Approval",
											page: "/admin/funds-approvals/full-release-approval",
											permission: !this.permissionsArr.includes('fullReleaseApprovalView'),
										},
									]
								},
								{
									title: "Jewellery Release Final Process",
									bullet: 'dot',
									permission: !(this.permissionsArr.includes('partReleaseApprovedView') || this.permissionsArr.includes('fullReleaseApprovedView')),
									submenu: [
										{
											title: "Final Part Release",
											page: "/admin/funds-approvals/part-release-final",
											permission: !this.permissionsArr.includes('partReleaseApprovedView'),
										},
										{
											title: "Final Full Release",
											page: "/admin/funds-approvals/full-release-final",
											permission: !this.permissionsArr.includes('fullReleaseApprovedView'),
										},
									]
								},
							],
						},
						// {
						// 	title: "Report",
						// 	root: true,
						// 	bullet: 'dot',
						// 	src: "assets/media/aside-icons/icons-27.svg",
						// 	permission: false,
						// 	submenu: [
						// 		{
						// 			title: "KYC",
						// 			page: "/admin/kyc",
						// 			bullet: 'dot',
						// 			permission: false,
						// 		},
						// 		{
						// 			title: "Loan Status Report",
						// 			page: "/admin/loan-status",
						// 			bullet: 'dot',
						// 			permission: false,
						// 		},
						// 		{
						// 			title: "Branch Report",
						// 			page: "/admin/branch",
						// 			bullet: 'dot',
						// 			permission: false,
						// 		},
						// 		{
						// 			title: "Loan Type Reports",
						// 			page: "/admin/loan-type",
						// 			bullet: 'dot',
						// 			permission: false,
						// 		},
						// 		{
						// 			title: "Margin Reports",
						// 			page: "/admin/marign",
						// 			permission: false,
						// 		},
						// 	],
						// },
						{
							title: "EMI Management",
							root: true,
							src: "assets/media/aside-icons/icons-24.svg",
							page: "/admin/emi-management",
							permission: !this.modulesArr.includes(2),
						},
						{
							title: "Scrap Management",
							root: true,
							src: "assets/media/aside-icons/icons-39.svg",
							page: "/admin/scrap-management",
							permission: !this.modulesArr.includes(3),
						},
						{
							title: "Digi Gold",
							root: true,
							src: "assets/media/aside-icons/digi-gold.svg",
							page: "/admin/digi-gold/wallet",
							permission: !this.modulesArr.includes(4),
						},
						{
							title: "Broker",
							root: true,
							src: "assets/media/aside-icons/icons-29.svg",
							page: "/broker",
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
									title: "Admin Settings",
									root: true,
									bullet: 'dot',
									permission: false,
									submenu: [
										{
											title: "Change Password",
											page: "/admin/admin-account/change-password",
											permission: false,
										},
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
												{
													title: "Process Note (SOP)",
													page: "/admin/upload-data/process-note",
													permission: false,
												},

											],
										},
										{
											title: "Scheme Configuration",
											bullet: 'dot',
											page: "/admin/loan-setting/scheme",
											permission: !(this.permissionsArr.includes('schemeView')),

											// submenu: [
											// 	{
											// 		title: "Scheme",
											// 		page: "/admin/loan-setting/scheme",
											// 		bullet: 'dot',
											// 		permission: !this.permissionsArr.includes('schemeView'),
											// 	},
											// ],
										},
										{
											title: "Notification Settings",
											root: true,
											bullet: 'dot',
											permission: !(this.userType === 4),


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
											permission: !(this.permissionsArr.includes('viewLeadSource') ||
												this.permissionsArr.includes('viewOrnamentType') ||
												this.permissionsArr.includes('viewUnapprovalReason') ||
												this.permissionsArr.includes('viewPurpose') ||
												this.permissionsArr.includes('viewOccupation') ||
												this.permissionsArr.includes('viewPacketLocation') ||
												this.permissionsArr.includes('viewHoliday') ||
												this.permissionsArr.includes('karatDetailsView')),
											submenu: [
												{
													title: "Lead Source",
													page: "/admin/masters/lead-source",
													permission: !this.permissionsArr.includes('viewLeadSource'),
												},
												{
													title: "Ornaments",
													page: "/admin/masters/ornaments",
													permission: !this.permissionsArr.includes('viewOrnamentType'),
												},
												{
													title: "Karat",
													page: "/admin/loan-setting/karat-details",
													bullet: 'dot',
													permission: !this.permissionsArr.includes('karatDetailsView'),
												},
												{
													title: "Unapproved Reasons",
													page: "/admin/masters/reasons",
													permission: !this.permissionsArr.includes('viewUnapprovalReason'),
												},
												{
													title: "Purposes",
													page: "/admin/masters/purposes",
													permission: !this.permissionsArr.includes('viewPurpose'),
												},
												{
													title: "Occupations",
													page: "/admin/masters/occupation",
													permission: !this.permissionsArr.includes('viewOccupation'),
												},
												{
													title: "Packet Location",
													page: "/admin/masters/packet-location",
													permission: !this.permissionsArr.includes('viewPacketLocation'),
												},
												{
													title: "Holidays",
													root: true,
													permission: !this.permissionsArr.includes('viewHoliday'),
													page: "/admin/holidays"
												},
												{
													title: "Other Charges",
													root: true,
													permission: false,
													page: "/admin/masters/other-charges"
												},
											],
										},
										{
											title: "Error Logs",
											page: "/admin/error-log",
											permission: !(this.userType === 4)
										},
										{
											title: "Roles and Permissions",
											page: "/admin/roles",
											bullet: 'dot',
											permission: !(this.userType === 4),
										},
									],
								},
								{
									title: "Global Settings",
									page: "/admin/global-settings",
									permission: !this.permissionsArr.includes('viewGlobalSetting')
								},
								{
									title: "Cron Logs",
									page: "/admin/cron-list",
									permission: !(this.userType === 4)
								},
							]
						},
						{
							title: "Otp",
							root: true,
							src: "assets/media/aside-icons/icons-29.svg",
							page: "/otp",
							permission: !(this.userType === 4),
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
							title: "Partner Branch User",
							root: true,
							src: "assets/media/aside-icons/icons-14.svg",
							page: "/admin/user-management/partner-branch-user",
							permission: !this.permissionsArr.includes('partnerBranchUserView'),
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
						// {
						// 	title: "Assign Appraiser",
						// 	root: true,
						// 	page: "/admin/user-management/assign-appraiser",
						// 	src: "assets/media/aside-icons/icons-16.svg",
						// 	permission: !this.permissionsArr.includes('assignAppraiserView'),
						// },
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
							title: "Concurrent User",
							root: true,
							page: "/admin/user-management/concurrent-login",
							src: "assets/media/aside-icons/icons-06.svg",
							permission: !this.permissionsArr.includes('concurrentLoginView')

						},
						// {
						// 	title: "Roles and permissions",
						// 	root: true,
						// 	page: "/admin/user-management/roles",
						// 	src: "assets/media/aside-icons/icons-20.svg",
						// 	permission: !(this.userType === 4),
						// },
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
							title: "Refund Details",
							page: "/broker/refund-details",
							src: "assets/media/aside-icons/refund.svg",
							permission: !this.permissionsArr.includes('refundDetailsView'),
						},
						{
							title: "Shop",
							root: true,
							page: "/broker/shop",
							src: "assets/media/aside-icons/icons-31.svg",
							permission: !this.permissionsArr.includes('productView'),
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
							permission: !(this.userType === 2 || this.userType === 3),
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
					scrapMgmtItems: [
						{
							title: "Scrap Buying Calculator",
							root: true,
							src: "assets/media/aside-icons/icons-34.svg",
							page: "/admin/scrap-management/scrap-buying-calculator",
							permission: false,
						},
						// {
						// 	title: "Scrap Buying Application",
						// 	root: true,
						// 	src: "assets/media/aside-icons/icons-35.svg",
						// 	page: "/admin/scrap-management/scrap-buying-application-form",
						// 	permission: !this.permissionsArr.includes('scrapApplicationAdd'),
						// },
						{
							title: "Packet",
							root: true,
							src: "assets/media/aside-icons/icons-36.svg",
							page: "/admin/scrap-management/packets",
							permission: !this.permissionsArr.includes('scrapPacketView'),
						},
						{
							title: "Packet Tracking",
							root: true,
							src: "assets/media/aside-icons/shopping-bags.svg",
							page: "/admin/scrap-management/packet-tracking",
							permission: !this.permissionsArr.includes('scrapPacketTrackingView'),
						},
						{
							title: "Applied Scrap",
							root: true,
							src: "assets/media/aside-icons/icons-37.svg",
							page: "/admin/scrap-management/applied-scrap",
							permission: !this.permissionsArr.includes('appliedScrapView')
						},
						{
							title: "Scrap Buying List",
							root: true,
							src: "assets/media/aside-icons/icons-38.svg",
							page: "/admin/scrap-management/scrap-buying",
							permission: false
						},
						{
							title: "Customer Management",
							root: true,
							src: "assets/media/aside-icons/icons-08.svg",
							page: "/admin/scrap-management/customer-list",
							permission: !this.permissionsArr.includes('scrapCustomerManagementView')
						},
						{
							title: "Settings",
							root: true,
							bullet: 'dot',
							src: "assets/media/aside-icons/icons-03.svg",
							permission: !this.permissionsArr.includes('viewScrapGlobalSetting') || !this.permissionsArr.includes('viewStandardDeduction'),
							submenu: [
								{
									title: "Global Settings",
									page: "/admin/scrap-management/global-settings",
									permission: !this.permissionsArr.includes('viewScrapGlobalSetting')
								},
								// {
								// 	title: "Standard Deduction",
								// 	root: true,
								// 	permission: !this.permissionsArr.includes('viewStandardDeduction'),
								// 	page: "/admin/scrap-management/standard-deduction"
								// },
							]
						},
						{
							title: 'Back',
							root: true,
							src: "assets/media/aside-icons/icons-21.svg",
							page: "/admin/dashboard",
							permission: false,
						},
					],
					digiGoldItems: [
						{
							title: "All Customers",
							page: "/admin/digi-gold/all-customers",
							src: "assets/media/aside-icons/icons-05.svg",
							// permission: !this.permissionsArr.includes('appliedKycView'),
						},
						{
							title: "Wallet",
							bullet: 'dot',
							src: "assets/media/aside-icons/wallet.svg",
							permission: false,
							submenu: [
								{
									title: "Deposit Requests",
									page: "/admin/digi-gold/wallet/deposit-requests",
									bullet: 'dot',
									permission: !this.permissionsArr.includes('digiGoldDepositView'),
								},
								{
									title: "Withdrawal Requests",
									page: "/admin/digi-gold/wallet/withdrawal-requests",
									bullet: 'dot',
									permission: !this.permissionsArr.includes('digiGoldWithdrawView'),
								}
							]
						},
						{
							title: "Applied KYC",
							page: "/admin/digi-gold/applied-kyc-digi-gold",
							src: "assets/media/aside-icons/icons-06.svg",
							// permission: !this.permissionsArr.includes('appliedKycView'),
						},
						// {
						// 	title: "SIP Management",
						// 	root: true,
						// 	bullet: 'dot',
						// 	src: "assets/media/aside-icons/icons-35.svg",
						// 	permission: false,
						// 	submenu: [
						// 		{
						// 			title: "SIP Application",
						// 			page: "/admin/digi-gold/sip-management/sip-application",
						// 			root: true,
						// 		},
						// 		{
						// 			title: "Sip Trades",
						// 			page: "/admin/digi-gold/sip-management/sip-trades",
						// 			root: true,
						// 		},
						// 		{
						// 			title: "Masters",
						// 			root: true,
						// 			bullet: 'dot',
						// 			submenu: [
						// 				{
						// 					title: "SIP Cycle Date",
						// 					page: "/admin/digi-gold/sip-management/sip-cycle-date",
						// 					permission: false,
						// 				},
						// 				{
						// 					title: "SIP Investment Tenure",
						// 					page: "/admin/digi-gold/sip-management/sip-investment-tenure",
						// 					permission: false,
						// 				},
						// 			]
						// 		},
						// 	]
						// },
						{
							title: "Settings",
							root: true,
							bullet: 'dot',
							src: "assets/media/aside-icons/icons-03.svg",
							permission: false,
							submenu: [
								{
									title: "Global Settings",
									page: "/admin/digi-gold/global-settings",
									permission: !this.permissionsArr.includes('digiGoldViewGlobalSetting'),
								},
							]
						},
						{
							title: 'Back',
							root: true,
							src: "assets/media/aside-icons/icons-21.svg",
							page: "/admin/dashboard",
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
