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
			packet: {
				page: { title: 'Packets', desc: '' }
			},
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
				page: { title: 'All Branches', desc: '' }
			},
			'internal-user': {
				page: { title: 'Internal User', desc: '' }
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
				page: { title: 'Sub-category', desc: '' }
			},
			'upload-product': {
				page: { title: 'Bulk Upload Product', desc: '' }
			},
			'upload-design': {
				page: { title: 'Upload Design', desc: '' }
			},
			'bulkUploadReport': {
				page: { title: 'Bulk Upload Report', desc: '' }
			},
			'wallet-price': {
				page: { title: 'Wallet Price', desc: '' }
			},
		},
	};

	public get configs() {
		return this.defaults;
	}
}
