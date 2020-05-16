export class PageConfig {
	public defaults = {
		dashboard: {
			page: {
				title: 'Dashboard',
				desc: ''
			},
		},
		'admin-account': {
			'change-password': {
				page: { title: 'Change Password', desc: '' }
			},
			'show-queries': {
				page: { title: 'Show Queries', desc: '' }
			},
			'show-feedback': {
				page: { title: 'Show Feedback', desc: '' }
			},
		},
		'loan-setting': {
			'scheme': {
				page: { title: 'Schemes', desc: '' }
			},
			'packet': {
				page: { title: 'Packets', desc: '' }
			},
			'karat-details': {
				page: { title: 'Karat', desc: '' }
			}
		},
		'upload-data': {
			'upload-banner': {
				page: { title: 'Promotional Banner', desc: '' }
			},
			'upload-offer': {
				page: { title: 'Offer Banner', desc: '' }
			},
			'upload-lender-banner': {
				page: { title: 'Lender Partner Banner', desc: '' }
			},
		},
		'user-management': {
			'partner': {
				page: { title: 'All Partners', desc: '' }
			},
			'branch': {
				page: { title: 'All Partner Branches', desc: '' }
			},
			'internal-user': {
				page: { title: 'Internal User', desc: '' }
			},
			'internal-user-branch': {
				page: { title: 'Internal User Branch', desc: '' }
			},
			'assign-appraiser': {
				page: { title: 'Assign Appraiser', desc: '' }
			},
			'merchant': {
				page: { title: 'All Merchants', desc: '' }
			},
			'broker': {
				page: { title: 'All Brokers', desc: '' }
			},
			'store': {
				page: { title: 'All Stores', desc: '' }
			},
			'roles': {
				page: { title: 'Roles', desc: '' }
			},
		},
		'lead-management': {
			page: { title: 'All Leads', desc: '' }
		},
		'kyc-setting': {
			page: { title: 'Customer KYC', desc: '' }
		},
		'emi-management': {
			'products': {
				page: { title: 'Show Poducts', desc: '' }
			},
			'category': {
				page: { title: 'Category', desc: '' }
			},
			'sub-category': {
				page: { title: 'Sub-Category', desc: '' }
			},
			'bulk-upload-product': {
				page: { title: 'Bulk Upload Product', desc: '' }
			},
			'bulk-edit-product': {
				page: { title: 'Bulk Edit Product', desc: '' }
			},
			'upload-design': {
				page: { title: 'Upload Design', desc: '' }
			},
			'bulk-upload-report': {
				page: { title: 'Bulk Upload Report', desc: '' }
			},
			'logistic-partner': {
				page: { title: 'Logistic Partner', desc: '' }
			},
			'wallet-price': {
				page: { title: 'Wallet Price', desc: '' }
			},
			'admin-log': {
				page: { title: 'Admin Log', desc: '' }
			},
			'order-details': {
				page: { title: 'Order Details', desc: '' }
			},
			'cancel-order-details': {
				page: { title: 'Cancel Order Details', desc: '' }
			},
			'deposit-details': {
				page: { title: 'Deposit Details', desc: '' }
			},
		},
		'applied-kyc': {
			page: { title: 'Applied KYC', desc: '' }
		},

		'loan-management': {
			'loan-calculator': {
				page: { title: 'Loan Calculator', desc: '' }
			},
			'loan-application-form': {
				page: { title: 'Add New Loan', desc: '' }
			},
			'packet': {
				page: { title: 'Packets', desc: '' }
			},
			'package-image-upload': {
				page: { title: 'Upload Packets', desc: '' }
			},
			'applied-loan': {
				page: { title: 'Applied Loan', desc: '' }
			}
		},
	};

	public get configs() {
		return this.defaults;
	}
}
