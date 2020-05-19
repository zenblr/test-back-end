export class MenuConfig {
	public defaults: any = {
		aside: {
			self: {},
			itemsOne: [
				{
					title: 'Dashboard',
					root: true,
					src: 'assets/media/aside-icons/icons-01.svg',
					page: '/dashboard',
					translate: 'MENU.DASHBOARD',

				},
				{
					title: 'Admin Account',
					root: true,
					src: 'assets/media/aside-icons/icons-02.svg',
					page: '/dashboard',

					submenu: [
						{
							title: 'Change Password',
							page: '/admin-account/change-password',

						},
						{
							title: 'Show Queries',
							page: '/admin-account/show-queries',

						},
						{
							title: 'Show Feedback',
							page: '/admin-account/show-feedback',

						},
					]
				},
				{
					title: 'Admin-Settings',
					root: true,
					src: 'assets/media/aside-icons/icons-03.svg',

					submenu: [
						{
							title: 'Upload Data',
							root: true,

							submenu: [
								{
									title: 'Promotional Banners',
									page: '/upload-data/upload-banner',

								},
								{
									title: 'Offer Banners',
									page: '/upload-data/upload-offer',

								},
								{
									title: 'Partner Banners',
									page: '/upload-data/upload-lender-banner',

								},
								// {
								// 	title: 'Upload Scheme',
								// 	page: '/upload-data/upload-scheme',
								// 	
								// },
							]
						},
						{
							title: 'Loan Settings',
							root: true,

							submenu: [
								{
									title: 'Scheme',
									page: '/loan-setting/scheme',

								},
								{
									title: 'Packet',
									page: '/loan-setting/packet',

								},
								{
									title: 'Karat details',
									page: '/loan-setting/karat-details'
								}
							]
						},
						{
							title: 'Notification Settings',
							root: true,

							submenu: [
								{
									title: 'Email Alerts',
									page: '/loan-setting/email-alerts',

								},
								{
									title: 'SMS Alerts',
									page: '/loan-setting/sms-alerts'

								},
							]
						},

					]
				},

				{
					title: 'User Management',
					root: true,
					src: 'assets/media/aside-icons/icons-04.svg',
					page: '/user-management',

				},
				{
					title: 'Lead Management',
					root: true,
					src: 'assets/media/aside-icons/icons-05.svg',
					page: '/lead-management',

				},
				{
					title: 'Customer Setting',
					root: true,
					src: 'assets/media/aside-icons/icons-06.svg',
					submenu: [
						{
							title: 'KYC Setting',
							page: '/kyc-setting'
						},
						{
							title: 'Applied Kyc',
							page: '/applied-kyc'
						}
					]
				},
				{
					title: 'Loan Managment',
					root: true,
					src: 'assets/media/aside-icons/icons-07.svg',
					submenu: [
						{
							title: 'Loan Calculator',
							page: '/loan-management/loan-calculator'
						},
						{
							title: 'Loan Application Form',
							page: '/loan-management/loan-application-form'
						},
						{
							title: 'Packet',
							page: '/loan-management/packet',

						},
						{
							title: 'Applied Loan',
							page: '/loan-management/applied-loan'
						},
						{
							title: 'Package Image Upload',
							page: '/loan-management/package-image-upload'
						},

					]
				},
				{
					title: 'Customer Management',
					root: true,
					src: 'assets/media/aside-icons/icons-08.svg',
					page: '/customer-management/customer-list',
				},
				{
					title: 'Repayment Structure',
					root: true,
					src: 'assets/media/aside-icons/icons-09.svg',
					submenu: [
						{
							title: 'Montly Payment',
							path: '/montly-payment'
						},
						{
							title: 'One Shot Payment',
							path: '/one-shot-payment',
						}
					]
				},
				{
					title: 'Account',
					root: true,
					src: 'assets/media/aside-icons/icons-12.svg',
					submenu: [
						{
							title: 'Loan Disbursed Details',
							path: '/Loan-disbursed-detail'
						},
						{
							title: 'Loan Repayment Details',
							path: '/Loan-repayment-detail',
						}
					]
				},
				{
					title: 'Report',
					root: true,
					src: 'assets/media/aside-icons/icons-11.svg',
					submenu: [
						{
							title: 'KYC',
							path: '/kyc'
						},
						{
							title: 'Loan Status Report',
							path: '/loan-status',
						},
						{
							title: 'Branch Report',
							path: '/branch',
						},
						{
							title: 'Loan Type Reports',
							path: '/loan-type'
						},
						{
							title: 'Margin Reports',
							path: '/marign'
						}
					]
				},
				{
					title: 'EMI Management',
					root: true,
					src: 'assets/media/aside-icons/icons-04.svg',
					page: '/emi-management',
				},
				{
					title: 'Log Out',
					src: 'assets/media/aside-icons/icons-12.svg',
				}
			],

			itemsTwo: [
				{
					title: 'Partner',
					root: true,
					icon: 'flaticon2-architecture-and-city',
					page: '/user-management/partner',
				},
				{
					title: 'Partner Branch ',
					root: true,
					icon: 'flaticon2-architecture-and-city',
					page: '/user-management/branch',
				},

				{
					title: 'Internal User',
					root: true,
					icon: 'flaticon2-architecture-and-city',
					page: '/user-management/internal-user',
				},
				{
					title: 'Internal User Branch',
					root: true,
					icon: 'flaticon2-architecture-and-city',
					page: '/user-management/internal-user-branch',

				},
				{
					title: 'Assign Appraiser',
					root: true,
					icon: 'flaticon2-architecture-and-city',
					page: '/user-management/assign-appraiser',
				},
				{
					title: 'Merchant',
					root: true,
					icon: 'flaticon2-architecture-and-city',
					page: '/user-management/merchant',
				},
				{
					title: 'Broker',
					root: true,
					icon: 'flaticon2-architecture-and-city',
					page: '/user-management/broker',
				},
				{
					title: 'Store',
					root: true,
					icon: 'flaticon2-architecture-and-city',
					page: '/user-management/store',

				},
				{
					title: 'Roles and permissions',
					icon: 'flaticon2-architecture-and-city',
					root: true,
					page: '/user-management/roles',
				},
				{
					title: 'Back',
					icon: 'flaticon-logout',
					root: true,
					page: '/dashboard',
				},
			],

			itemsThree: [
				{
					title: 'Product',
					root: true,
					icon: 'flaticon2-open-box',
					submenu: [
						{
							title: 'Show Product',
							page: '/emi-management/products',
						},
						{
							title: 'Category',
							page: '/emi-management/category',
						},
						{
							title: 'Sub-Category',
							page: '/emi-management/sub-category',
						},
						{
							title: 'Bulk Upload Product',
							page: '/emi-management/bulk-upload-product',
						},
						{
							title: 'Bulk Edit Product',
							page: '/emi-management/bulk-edit-product',
						},
						{
							title: 'Upload Design',
							page: '/emi-management/upload-design',
						},
					]
				},
				{
					title: 'Logistic Partner',
					icon: 'flaticon2-architecture-and-city',
					page: '/emi-management/logistic-partner',
				},
				{
					title: 'Bulk Upload Report',
					root: true,
					icon: 'flaticon2-download-2',
					page: '/emi-management/bulk-upload-report',
				},
				{
					title: 'Config Details',
					root: true,
					icon: 'flaticon2-console',
					submenu: [
						{
							title: 'Wallet Price',
							page: '/emi-management/wallet-price',
						},
						{
							title: 'Admin Log',
							page: '/emi-management/admin-log',
						},
					]
				},
				{
					title: 'Order Management',
					root: true,
					icon: 'flaticon2-shopping-cart',
					submenu: [
						{
							title: 'Order Details',
							page: '/emi-management/order-details',
						},
						{
							title: 'EMI Details',
							page: '/emi-management/emi-details'
						},
						{
							title: 'Refund Management',
							page: '/emi-management/refund-management'
						},
						{
							title: 'Cancel Order Details',
							page: '/emi-management/cancel-order-details',
						},
						{
							title: 'Deposit Details',
							page: '/emi-management/deposit-details',
						}
					]
				},
				{
					title: 'Back',
					icon: 'flaticon-logout',
					root: true,
					page: '/dashboard',
				},
			]
		},
	};

	public get configs(): any {
		return this.defaults;
	}
}
