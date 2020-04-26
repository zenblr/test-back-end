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
			'show=feedback': {
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
				page: { title: 'Upload Banner', desc: '' }
			},
			'upload-offer': {
				page: { title: 'Upload Offer', desc: '' }
			},
			'upload-lender-banner': {
				page: { title: 'Upload Lender Banner', desc: '' }
			},
		},
		'user-management': {
			'partner': {
				page: { title: 'Partner Details', desc: '' }
			},
			'branch': {
				page: { title: 'Branch Details', desc: '' }
			},
			'internal-user': {
				page: { title: 'Internal User', desc: '' }
			},
			'assign-appraiser': {
				page: { title: 'Assign Appraiser', desc: '' }
			},
			'merchant': {
				page: { title: 'Merchant Details', desc: '' }
			},
			'broker': {
				page: { title: 'Broker Details', desc: '' }
			},
			'roles': {
				page: { title: 'Roles', desc: '' }
			},
		},
		'lead-management':{
			page:{title:'Lead Management',desc: ''}
		},
		'kyc-setting':{
			page:{title:'KYC Setting',desc: ''}
		},
	};

	public get configs() {
		return this.defaults;
	}
}
