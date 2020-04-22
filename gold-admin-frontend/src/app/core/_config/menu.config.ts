export class MenuConfig {
	public defaults: any = {
		aside: {
			self: {},
			itemsOne: [
				{
					title: 'Dashboard',
					root: true,
					icon: 'flaticon2-architecture-and-city',
					page: '/dashboard',
					translate: 'MENU.DASHBOARD',

				},
				{
					title: 'Admin Account',
					root: true,
					icon: 'flaticon2-expand',
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
					icon: 'flaticon-web',

					submenu: [
						{
							title: 'Upload Data',
							root: true,

							submenu: [
								{
									title: 'Upload Promotional Banners',
									page: '/upload-data/upload-banner',

								},
								{
									title: 'Upload Offer Banners',
									page: '/upload-data/upload-offer',

								},
								{
									title: 'Upload Lending Partner Banners',
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
					icon: 'flaticon-users-1',
					page: '/user-management',

					// submenu: [
					// 	// {
					// 	// 	title: 'Upload Banner',
					// 	// 	page: '/upload-data/upload-banner',
					// 	// 	
					// 	// },
					// 	{
					// 		title: 'Partner Details',
					// 		page: '/user-management/partner',

					// 	},
					// 	{
					// 		title: 'Branch Details',
					// 		page: '/user-management/branch',

					// 	},
					// 	{
					// 		title: 'Internal User Details',
					// 		page: '/user-management/internal-user-details',

					// 	}, {
					// 		title: 'Assign Appraiser',
					// 		page: '/user-management/assign-appraiser',

					// 	},
					// 	{
					// 		title: 'Roles and permissions',
					// 		page: '/user-management/roles',

					// 	},
					// 	// {
					// 	// 	title: 'Upload Lender Banner',
					// 	// 	// page: '/material/form-controls/autocomplete',
					// 	// 	
					// 	// },
					// 	// {
					// 	// 	title: 'Upload Scheme',
					// 	// 	// page: '/material/form-controls/autocomplete',
					// 	// 	
					// 	// },
					// ]
				},
				{
					title: 'Lead Management',
					root: true,
					icon: 'flaticon2-architecture-and-city',
					page: '/lead-management',

				},
				{
					title: 'Customer Setting',
					root: true,
					icon: 'flaticon2-architecture-and-city',
					submenu: [
						{
							title: 'KYC Setting',
							page: '/kyc-setting'
						}
					]
				},
				{
					title: 'Loan Managment',
					root: true,
					icon: 'flaticon2-architecture-and-city',
					submenu: [
						{
							title: 'Loan Calculator',
							page: '/loan-calculator'
						},
						{
							title: 'Loan Application Form',
							page: '/loan-application-form'
						},
						{
							title: 'Applied Loan',
							page: '/applied-loan'
						},
						{
							title: 'Package Image Upload',
							page: '/package-image-upload'
						},

					]
				},
				{
					title: 'Customer Management',
					root: true,
					icon: 'flaticon-users-1',
					page: '/customer-management/customer-list',
				},
				{
					title: 'Repayment Structure',
					root: true,
					icon: 'flaticon-users-1',
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
					icon: 'flaticon-users-1',
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
					icon: 'flaticon-users-1',
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
					title: 'Log Out',
					icon: 'flaticon-logout'
				}
			],
			itemsTwo: [

				{
					title: 'Partner Details',
					root: true,
					icon: 'flaticon2-architecture-and-city',
					page: '/user-management/partner',

				},
				{
					title: 'Branch Details',
					root: true,
					icon: 'flaticon2-architecture-and-city',
					page: '/user-management/branch',

				},
				{
					title: 'Internal User Details',
					root: true,					
					icon: 'flaticon2-architecture-and-city',
					page: '/user-management/internal-user',

				}, 
				{
					title: 'Assign Appraiser',
					root: true,
					icon: 'flaticon2-architecture-and-city',
					page: '/user-management/assign-appraiser',

				},
				{
					title: 'Merchant Details',
					root: true,
					icon: 'flaticon2-architecture-and-city',
					page: '/user-management/merchant',

				},
				{
					title: 'Broker Details',
					root: true,
					icon: 'flaticon2-architecture-and-city',
					page: '/user-management/broker',

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
			]
		},
	};

	public get configs(): any {
		return this.defaults;
	}
}
