export class MenuConfig {
	public defaults: any = {
		header: {
			self: {},
			items: [
				// {
				// 	title: 'Dashboards',
				// 	root: true,
				// 	alignment: 'left',
				// 	page: '/dashboard',
				// 	translate: 'MENU.DASHBOARD',
				// },
				// {
				// 	title: 'Components',
				// 	root: true,
				// 	alignment: 'left',
				// 	toggle: 'click',
				// 	submenu: [
				// 		{
				// 			title: 'Google Material',
				// 			
				// 			icon: 'flaticon-interface-7',
				// 			submenu: [
				// 				{
				// 					title: 'Form Controls',
				// 					
				// 					submenu: [
				// 						{
				// 							title: 'Auto Complete',
				// 							page: '/material/form-controls/autocomplete',
				// 							permission: 'accessToECommerceModule'
				// 						},
				// 						{
				// 							title: 'Checkbox',
				// 							page: '/material/form-controls/checkbox'
				// 						},
				// 						{
				// 							title: 'Radio Button',
				// 							page: '/material/form-controls/radiobutton'
				// 						},
				// 						{
				// 							title: 'Datepicker',
				// 							page: '/material/form-controls/datepicker'
				// 						},
				// 						{
				// 							title: 'Form Field',
				// 							page: '/material/form-controls/formfield'
				// 						},
				// 						{
				// 							title: 'Input',
				// 							page: '/material/form-controls/input'
				// 						},
				// 						{
				// 							title: 'Select',
				// 							page: '/material/form-controls/select'
				// 						},
				// 						{
				// 							title: 'Slider',
				// 							page: '/material/form-controls/slider'
				// 						},
				// 						{
				// 							title: 'Slider Toggle',
				// 							page: '/material/form-controls/slidertoggle'
				// 						}
				// 					]
				// 				},
				// 				{
				// 					title: 'Navigation',
				// 					
				// 					submenu: [
				// 						{
				// 							title: 'Menu',
				// 							page: '/material/navigation/menu'
				// 						},
				// 						{
				// 							title: 'Sidenav',
				// 							page: '/material/navigation/sidenav'
				// 						},
				// 						{
				// 							title: 'Toolbar',
				// 							page: '/material/navigation/toolbar'
				// 						}
				// 					]
				// 				},
				// 				{
				// 					title: 'Layout',
				// 					
				// 					submenu: [
				// 						{
				// 							title: 'Card',
				// 							page: '/material/layout/card'
				// 						},
				// 						{
				// 							title: 'Divider',
				// 							page: '/material/layout/divider'
				// 						},
				// 						{
				// 							title: 'Expansion panel',
				// 							page: '/material/layout/expansion-panel'
				// 						},
				// 						{
				// 							title: 'Grid list',
				// 							page: '/material/layout/grid-list'
				// 						},
				// 						{
				// 							title: 'List',
				// 							page: '/material/layout/list'
				// 						},
				// 						{
				// 							title: 'Tabs',
				// 							page: '/material/layout/tabs'
				// 						},
				// 						{
				// 							title: 'Stepper',
				// 							page: '/material/layout/stepper'
				// 						},
				// 						{
				// 							title: 'Default Forms',
				// 							page: '/material/layout/default-forms'
				// 						},
				// 						{
				// 							title: 'Tree',
				// 							page: '/material/layout/tree'
				// 						}
				// 					]
				// 				},
				// 				{
				// 					title: 'Buttons & Indicators',
				// 					
				// 					submenu: [
				// 						{
				// 							title: 'Button',
				// 							page: '/material/buttons-and-indicators/button'
				// 						},
				// 						{
				// 							title: 'Button toggle',
				// 							page: '/material/buttons-and-indicators/button-toggle'
				// 						},
				// 						{
				// 							title: 'Chips',
				// 							page: '/material/buttons-and-indicators/chips'
				// 						},
				// 						{
				// 							title: 'Icon',
				// 							page: '/material/buttons-and-indicators/icon'
				// 						},
				// 						{
				// 							title: 'Progress bar',
				// 							page: '/material/buttons-and-indicators/progress-bar'
				// 						},
				// 						{
				// 							title: 'Progress spinner',
				// 							page: '/material/buttons-and-indicators/progress-spinner'
				// 						},
				// 						{
				// 							title: 'Ripples',
				// 							page: '/material/buttons-and-indicators/ripples'
				// 						}
				// 					]
				// 				},
				// 				{
				// 					title: 'Popups & Modals',
				// 					
				// 					submenu: [
				// 						{
				// 							title: 'Bottom sheet',
				// 							page: '/material/popups-and-modals/bottom-sheet'
				// 						},
				// 						{
				// 							title: 'Dialog',
				// 							page: '/material/popups-and-modals/dialog'
				// 						},
				// 						{
				// 							title: 'Snackbar',
				// 							page: '/material/popups-and-modals/snackbar'
				// 						},
				// 						{
				// 							title: 'Tooltip',
				// 							page: '/material/popups-and-modals/tooltip'
				// 						}
				// 					]
				// 				},
				// 				{
				// 					title: 'Data table',
				// 					
				// 					submenu: [
				// 						{
				// 							title: 'Paginator',
				// 							page: '/material/data-table/paginator'
				// 						},
				// 						{
				// 							title: 'Sort header',
				// 							page: '/material/data-table/sort-header'
				// 						},
				// 						{
				// 							title: 'Table',
				// 							page: '/material/data-table/table'
				// 						}
				// 					]
				// 				}
				// 			]
				// 		},
				// 		{
				// 			title: 'Ng-Bootstrap',
				// 			
				// 			icon: 'flaticon-web',
				// 			submenu: [
				// 				{
				// 					title: 'Accordion',
				// 					page: '/ngbootstrap/accordion'
				// 				},
				// 				{
				// 					title: 'Alert',
				// 					page: '/ngbootstrap/alert'
				// 				},
				// 				{
				// 					title: 'Buttons',
				// 					page: '/ngbootstrap/buttons'
				// 				},
				// 				{
				// 					title: 'Carousel',
				// 					page: '/ngbootstrap/carousel'
				// 				},
				// 				{
				// 					title: 'Collapse',
				// 					page: '/ngbootstrap/collapse'
				// 				},
				// 				{
				// 					title: 'Datepicker',
				// 					page: '/ngbootstrap/datepicker'
				// 				},
				// 				{
				// 					title: 'Dropdown',
				// 					page: '/ngbootstrap/dropdown'
				// 				},
				// 				{
				// 					title: 'Modal',
				// 					page: '/ngbootstrap/modal'
				// 				},
				// 				{
				// 					title: 'Pagination',
				// 					page: '/ngbootstrap/pagination'
				// 				},
				// 				{
				// 					title: 'Popover',
				// 					page: '/ngbootstrap/popover'
				// 				},
				// 				{
				// 					title: 'Progressbar',
				// 					page: '/ngbootstrap/progressbar'
				// 				},
				// 				{
				// 					title: 'Rating',
				// 					page: '/ngbootstrap/rating'
				// 				},
				// 				{
				// 					title: 'Tabs',
				// 					page: '/ngbootstrap/tabs'
				// 				},
				// 				{
				// 					title: 'Timepicker',
				// 					page: '/ngbootstrap/timepicker'
				// 				},
				// 				{
				// 					title: 'Tooltips',
				// 					page: '/ngbootstrap/tooltip'
				// 				},
				// 				{
				// 					title: 'Typehead',
				// 					page: '/ngbootstrap/typehead'
				// 				}
				// 			]
				// 		},
				// 	]
				// },
				// {
				// 	title: 'Applications',
				// 	root: true,
				// 	alignment: 'left',
				// 	toggle: 'click',
				// 	submenu: [
				// 		{
				// 			title: 'eCommerce',
				// 			
				// 			icon: 'flaticon-business',
				// 			permission: 'accessToECommerceModule',
				// 			submenu: [
				// 				{
				// 					title: 'Customers',
				// 					page: '/ecommerce/customers'
				// 				},
				// 				{
				// 					title: 'Products',
				// 					page: '/ecommerce/products'
				// 				},
				// 			]
				// 		},
				// 		{
				// 			title: 'User Management',
				// 			
				// 			icon: 'flaticon-user',
				// 			submenu: [
				// 				{
				// 					title: 'Users',
				// 					page: '/user-management/users'
				// 				},
				// 				{
				// 					title: 'Roles',
				// 					page: '/user-management/roles'
				// 				}
				// 			]
				// 		},
				// 	]
				// },
				// {
				// 	title: 'Custom',
				// 	root: true,
				// 	alignment: 'left',
				// 	toggle: 'click',
				// 	submenu: [
				// 		{
				// 			title: 'Error Pages',
				// 			
				// 			icon: 'flaticon2-list-2',
				// 			submenu: [
				// 				{
				// 					title: 'Error 1',
				// 					page: '/error/error-v1'
				// 				},
				// 				{
				// 					title: 'Error 2',
				// 					page: '/error/error-v2'
				// 				},
				// 				{
				// 					title: 'Error 3',
				// 					page: '/error/error-v3'
				// 				},
				// 				{
				// 					title: 'Error 4',
				// 					page: '/error/error-v4'
				// 				},
				// 				{
				// 					title: 'Error 5',
				// 					page: '/error/error-v5'
				// 				},
				// 				{
				// 					title: 'Error 6',
				// 					page: '/error/error-v6'
				// 				},
				// 			]
				// 		},
				// 		{
				// 			title: 'Wizard',
				// 			
				// 			icon: 'flaticon2-mail-1',
				// 			submenu: [
				// 				{
				// 					title: 'Wizard 1',
				// 					page: '/wizard/wizard-1'
				// 				},
				// 				{
				// 					title: 'Wizard 2',
				// 					page: '/wizard/wizard-2'
				// 				},
				// 				{
				// 					title: 'Wizard 3',
				// 					page: '/wizard/wizard-3'
				// 				},
				// 				{
				// 					title: 'Wizard 4',
				// 					page: '/wizard/wizard-4'
				// 				},
				// 			]
				// 		},
				// 	]
				// },
			]
		},
		aside: {
			self: {},
			items: [
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
					// page: '/user-management',

					submenu: [
						// {
						// 	title: 'Upload Banner',
						// 	page: '/upload-data/upload-banner',
						// 	
						// },
						{
							title: 'Partner Details',
							page: '/user-management/partner',

						},
						{
							title: 'Branch Details',
							page: '/user-management/branch',

						},
						{
							title: 'Internal User Details',
							page: '/user-management/internal-user-details',

						}, {
							title: 'Assign Appraiser',
							page: '/user-management/assign-appraiser',

						},
						{
							title: 'Roles and permissions',
							page: '/user-management/roles',

						},
						// {
						// 	title: 'Upload Lender Banner',
						// 	// page: '/material/form-controls/autocomplete',
						// 	
						// },
						// {
						// 	title: 'Upload Scheme',
						// 	// page: '/material/form-controls/autocomplete',
						// 	
						// },
					]
				},
				{
					title: 'Customer Management',
					root: true,
					icon: 'flaticon2-architecture-and-city',
					page: '/customer-management',

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
					title: 'Customer Settings',
					root: true,
					icon: 'flaticon-users-1',
					page: '/customer-setting/customer-list',
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
					icon:'flaticon-logout'
				}				
				// {
				// 	title: 'Layout Builder',
				// 	root: true,
				// 	icon: 'flaticon2-expand',
				// 	page: '/builder'
				// },
				// {section: 'Components'},
				// {
				// 	title: 'Google Material',
				// 	root: true,
				// 	
				// 	icon: 'flaticon2-browser-2',
				// 	submenu: [
				// 		{
				// 			title: 'Form Controls',
				// 			
				// 			submenu: [
				// 				{
				// 					title: 'Auto Complete',
				// 					page: '/material/form-controls/autocomplete',
				// 					permission: 'accessToECommerceModule'
				// 				},
				// 				{
				// 					title: 'Checkbox',
				// 					page: '/material/form-controls/checkbox'
				// 				},
				// 				{
				// 					title: 'Radio Button',
				// 					page: '/material/form-controls/radiobutton'
				// 				},
				// 				{
				// 					title: 'Datepicker',
				// 					page: '/material/form-controls/datepicker'
				// 				},
				// 				{
				// 					title: 'Form Field',
				// 					page: '/material/form-controls/formfield'
				// 				},
				// 				{
				// 					title: 'Input',
				// 					page: '/material/form-controls/input'
				// 				},
				// 				{
				// 					title: 'Select',
				// 					page: '/material/form-controls/select'
				// 				},
				// 				{
				// 					title: 'Slider',
				// 					page: '/material/form-controls/slider'
				// 				},
				// 				{
				// 					title: 'Slider Toggle',
				// 					page: '/material/form-controls/slidertoggle'
				// 				}
				// 			]
				// 		},
				// 		{
				// 			title: 'Navigation',
				// 			
				// 			submenu: [
				// 				{
				// 					title: 'Menu',
				// 					page: '/material/navigation/menu'
				// 				},
				// 				{
				// 					title: 'Sidenav',
				// 					page: '/material/navigation/sidenav'
				// 				},
				// 				{
				// 					title: 'Toolbar',
				// 					page: '/material/navigation/toolbar'
				// 				}
				// 			]
				// 		},
				// 		{
				// 			title: 'Layout',
				// 			
				// 			submenu: [
				// 				{
				// 					title: 'Card',
				// 					page: '/material/layout/card'
				// 				},
				// 				{
				// 					title: 'Divider',
				// 					page: '/material/layout/divider'
				// 				},
				// 				{
				// 					title: 'Expansion panel',
				// 					page: '/material/layout/expansion-panel'
				// 				},
				// 				{
				// 					title: 'Grid list',
				// 					page: '/material/layout/grid-list'
				// 				},
				// 				{
				// 					title: 'List',
				// 					page: '/material/layout/list'
				// 				},
				// 				{
				// 					title: 'Tabs',
				// 					page: '/material/layout/tabs'
				// 				},
				// 				{
				// 					title: 'Stepper',
				// 					page: '/material/layout/stepper'
				// 				},
				// 				{
				// 					title: 'Default Forms',
				// 					page: '/material/layout/default-forms'
				// 				},
				// 				{
				// 					title: 'Tree',
				// 					page: '/material/layout/tree'
				// 				}
				// 			]
				// 		},
				// 		{
				// 			title: 'Buttons & Indicators',
				// 			
				// 			submenu: [
				// 				{
				// 					title: 'Button',
				// 					page: '/material/buttons-and-indicators/button'
				// 				},
				// 				{
				// 					title: 'Button toggle',
				// 					page: '/material/buttons-and-indicators/button-toggle'
				// 				},
				// 				{
				// 					title: 'Chips',
				// 					page: '/material/buttons-and-indicators/chips'
				// 				},
				// 				{
				// 					title: 'Icon',
				// 					page: '/material/buttons-and-indicators/icon'
				// 				},
				// 				{
				// 					title: 'Progress bar',
				// 					page: '/material/buttons-and-indicators/progress-bar'
				// 				},
				// 				{
				// 					title: 'Progress spinner',
				// 					page: '/material/buttons-and-indicators/progress-spinner'
				// 				},
				// 				{
				// 					title: 'Ripples',
				// 					page: '/material/buttons-and-indicators/ripples'
				// 				}
				// 			]
				// 		},
				// 		{
				// 			title: 'Popups & Modals',
				// 			
				// 			submenu: [
				// 				{
				// 					title: 'Bottom sheet',
				// 					page: '/material/popups-and-modals/bottom-sheet'
				// 				},
				// 				{
				// 					title: 'Dialog',
				// 					page: '/material/popups-and-modals/dialog'
				// 				},
				// 				{
				// 					title: 'Snackbar',
				// 					page: '/material/popups-and-modals/snackbar'
				// 				},
				// 				{
				// 					title: 'Tooltip',
				// 					page: '/material/popups-and-modals/tooltip'
				// 				}
				// 			]
				// 		},
				// 		{
				// 			title: 'Data table',
				// 			
				// 			submenu: [
				// 				{
				// 					title: 'Paginator',
				// 					page: '/material/data-table/paginator'
				// 				},
				// 				{
				// 					title: 'Sort header',
				// 					page: '/material/data-table/sort-header'
				// 				},
				// 				{
				// 					title: 'Table',
				// 					page: '/material/data-table/table'
				// 				}
				// 			]
				// 		}
				// 	]
				// },
				// {
				// 	title: 'Ng-Bootstrap',
				// 	root: true,
				// 	
				// 	icon: 'flaticon2-digital-marketing',
				// 	submenu: [
				// 		{
				// 			title: 'Accordion',
				// 			page: '/ngbootstrap/accordion'
				// 		},
				// 		{
				// 			title: 'Alert',
				// 			page: '/ngbootstrap/alert'
				// 		},
				// 		{
				// 			title: 'Buttons',
				// 			page: '/ngbootstrap/buttons'
				// 		},
				// 		{
				// 			title: 'Carousel',
				// 			page: '/ngbootstrap/carousel'
				// 		},
				// 		{
				// 			title: 'Collapse',
				// 			page: '/ngbootstrap/collapse'
				// 		},
				// 		{
				// 			title: 'Datepicker',
				// 			page: '/ngbootstrap/datepicker'
				// 		},
				// 		{
				// 			title: 'Dropdown',
				// 			page: '/ngbootstrap/dropdown'
				// 		},
				// 		{
				// 			title: 'Modal',
				// 			page: '/ngbootstrap/modal'
				// 		},
				// 		{
				// 			title: 'Pagination',
				// 			page: '/ngbootstrap/pagination'
				// 		},
				// 		{
				// 			title: 'Popover',
				// 			page: '/ngbootstrap/popover'
				// 		},
				// 		{
				// 			title: 'Progressbar',
				// 			page: '/ngbootstrap/progressbar'
				// 		},
				// 		{
				// 			title: 'Rating',
				// 			page: '/ngbootstrap/rating'
				// 		},
				// 		{
				// 			title: 'Tabs',
				// 			page: '/ngbootstrap/tabs'
				// 		},
				// 		{
				// 			title: 'Timepicker',
				// 			page: '/ngbootstrap/timepicker'
				// 		},
				// 		{
				// 			title: 'Tooltips',
				// 			page: '/ngbootstrap/tooltip'
				// 		},
				// 		{
				// 			title: 'Typehead',
				// 			page: '/ngbootstrap/typehead'
				// 		}
				// 	]
				// },
				// {section: 'Applications'},
				// {
				// 	title: 'eCommerce',
				// 	
				// 	icon: 'flaticon2-list-2',
				// 	root: true,
				// 	permission: 'accessToECommerceModule',
				// 	submenu: [
				// 		{
				// 			title: 'Customers',
				// 			page: '/ecommerce/customers'
				// 		},
				// 		{
				// 			title: 'Products',
				// 			page: '/ecommerce/products'
				// 		},
				// 	]
				// },
				// {
				// 	title: 'User Management',
				// 	root: true,
				// 	
				// 	icon: 'flaticon2-user-outline-symbol',
				// 	submenu: [
				// 		{
				// 			title: 'Users',
				// 			page: '/user-management/users'
				// 		},
				// 		{
				// 			title: 'Roles',
				// 			page: '/user-management/roles'
				// 		}
				// 	]
				// },
				// {section: 'Custom'},
				// {
				// 	title: 'Error Pages',
				// 	root: true,
				// 	
				// 	icon: 'flaticon2-list-2',
				// 	submenu: [
				// 		{
				// 			title: 'Error 1',
				// 			page: '/error/error-v1'
				// 		},
				// 		{
				// 			title: 'Error 2',
				// 			page: '/error/error-v2'
				// 		},
				// 		{
				// 			title: 'Error 3',
				// 			page: '/error/error-v3'
				// 		},
				// 		{
				// 			title: 'Error 4',
				// 			page: '/error/error-v4'
				// 		},
				// 		{
				// 			title: 'Error 5',
				// 			page: '/error/error-v5'
				// 		},
				// 		{
				// 			title: 'Error 6',
				// 			page: '/error/error-v6'
				// 		},
				// 	]
				// },
				// {
				// 	title: 'Wizard',
				// 	root: true,
				// 	
				// 	icon: 'flaticon2-mail-1',
				// 	submenu: [
				// 		{
				// 			title: 'Wizard 1',
				// 			page: '/wizard/wizard-1'
				// 		},
				// 		{
				// 			title: 'Wizard 2',
				// 			page: '/wizard/wizard-2'
				// 		},
				// 		{
				// 			title: 'Wizard 3',
				// 			page: '/wizard/wizard-3'
				// 		},
				// 		{
				// 			title: 'Wizard 4',
				// 			page: '/wizard/wizard-4'
				// 		},
				// 	]
				// },
			]
		},
	};

	public get configs(): any {
		return this.defaults;
	}
}
