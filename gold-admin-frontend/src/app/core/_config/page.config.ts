export class PageConfig {
	public defaults = {
		dashboard: {
			page: {
				title: "Dashboard",
				desc: "",
			},
		},
		"admin-account": {
			"change-password": {
				page: { title: "Change Password", desc: "" },
			},
			"show-queries": {
				page: { title: "Show Queries", desc: "" },
			},
			"show-feedback": {
				page: { title: "Show Feedback", desc: "" },
			},
		},
		"loan-setting": {
			scheme: {
				page: { title: "Schemes", desc: "" },
			},
			packet: {
				page: { title: "Packets", desc: "" },
			},
			"karat-details": {
				page: { title: "Karat", desc: "" },
			},
		},
		"upload-data": {
			"upload-banner": {
				page: { title: "Promotional Banner", desc: "" },
			},
			"upload-offer": {
				page: { title: "Offer Banner", desc: "" },
			},
			"upload-lender-banner": {
				page: { title: "Lender Partner Banner", desc: "" },
			},
		},
		"user-management": {
			partner: {
				page: { title: "All Partners", desc: "" },
			},
			branch: {
				page: { title: "All Partner Branches", desc: "" },
			},
			"internal-user": {
				page: { title: "Internal User", desc: "" },
			},
			"internal-user-branch": {
				page: { title: "Internal User Branch", desc: "" },
			},
			"assign-appraiser": {
				page: { title: "Assigned Appraiser", desc: "" },
			},
			merchant: {
				page: { title: "All Merchants", desc: "" },
			},
			broker: {
				page: { title: "All Brokers", desc: "" },
			},
			store: {
				page: { title: "All Stores", desc: "" },
			},
			roles: {
				page: { title: "Roles", desc: "" },
			},
		},
		"lead-management": {
			page: { title: "All Leads", desc: "" },
		},
		repayment: {
			monthly: {
				page: { title: "Monthly Repayment", desc: "" },
			},
		},
		"kyc-setting": {
			page: { title: "Customer KYC", desc: "" },
		},
		"emi-management": {
			products: {
				page: { title: "Show Poducts", desc: "" },
			},
			category: {
				page: { title: "Category", desc: "" },
			},
			"sub-category": {
				page: { title: "Sub-Category", desc: "" },
			},
			"bulk-upload-product": {
				page: { title: "Bulk Upload Product", desc: "" },
			},
			"bulk-edit-product": {
				page: { title: "Bulk Edit Product", desc: "" },
			},
			"upload-design": {
				page: { title: "Upload Design", desc: "" },
			},
			"bulk-upload-report": {
				page: { title: "Bulk Upload Report", desc: "" },
			},
			"logistic-partner": {
				page: { title: "Logistic Partner", desc: "" },
			},
			"wallet-price": {
				page: { title: "Wallet Price", desc: "" },
			},
			"admin-log": {
				page: { title: "Admin Log", desc: "" },
			},
			"order-details": {
				page: { title: "Order Details", desc: "" },
			},
			"emi-details": {
				page: { title: "EMI Details", desc: "" },
			},
			"cancel-order-details": {
				page: { title: "Cancel Order Details", desc: "" },
			},
			"deposit-details": {
				page: { title: "Deposit Details", desc: "" },
			},
			"refund-details": {
				page: { title: "Refund Details", desc: "" },
			},
			users: {
				page: { title: "Users", desc: "" },
			},
			reports: {
				page: { title: "Reports", desc: "" },
			},
		},
		"applied-kyc": {
			page: { title: "Applied KYC", desc: "" },
		},
		"customer-management": {
			"customer-list": {
				page: { title: "My Customer", desc: "" },
			},
		},

		"loan-management": {
			"loan-calculator": {
				page: { title: "Loan Calculator", desc: "" },
			},
			"loan-application-form": {
				page: { title: "Loan Application Form", desc: "" },
			},
			packet: {
				page: { title: "Packets", desc: "" },
			},
			"all-loan": {
				page: { title: "All Loans", desc: "" },
			},
			"applied-loan": {
				page: { title: "Applied Loan", desc: "" },
			},
		},
	};

	public get configs() {
		return this.defaults;
	}
}
