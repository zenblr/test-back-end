export class PageConfig {
	public defaults = {
		'admin': {
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
			masters: {
				reasons: {
					page: { title: "Reasons", desc: "" },
				},
				ornaments: {
					page: { title: "Ornaments", desc: "" },
				},
				purposes: {
					page: { title: "Purposes", desc: "" },
				},
				'packet-location': {
					page: { title: "Packet Location", desc: "" },
				},
				'lead-source': {
					page: { title: "Lead Source", desc: "" },
				},
				occupation: {
					page: { title: "Occupations", desc: "" },
				},
			},
			"global-settings": {
				page: { title: "Global Settings", desc: "" },
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
			"notification-setting": {
				"email-alert": {
					page: { title: "Email Template", desc: "" }
				},
				"sms-alert": {
					page: { title: "SMS Template", desc: "" }
				}
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
				"gold-rate": {
					page: { title: "Gold Rate", desc: "" },
				},
			},
			"user-management": {
				partner: {
					page: { title: "All Partners", desc: "" },
					"view-schemes": { id: { page: { title: "Schemes", desc: "" }, } }
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
				'redirect-assign-appraiser': {
					page: { title: "Assigned Appraiser", desc: "" },
				},
				merchant: {
					page: { title: "All Merchants", desc: "" },
				},
				"add-merchant": {
					page: { title: "Add Merchants", desc: "" },
				},
				"edit-merchant": {
					id: {
						page: { title: "Edit Merchant", desc: "" },
					}
				},
				broker: {
					page: { title: "Brokers", desc: "" },
				},
				store: {
					page: { title: "Store", desc: "" },
				},
				roles: {
					page: { title: "Roles", desc: "" },
					id: {
						page: { title: "Permissions", desc: "" },
					}
				}
			},
			"lead-management": {
				page: { title: "All Leads", desc: "" },
			},
			"account": {
				"loan-disbursement": {
					page: { title: "Loan Disbursement", desc: "" },
				},
				"loan-repayment": {
					page: { title: "Loan Repayment", desc: "" },
				}
			},
			"funds-approvals": {
				"deposit": {
					page: { title: "Deposit", desc: "" },
				},
				"top-up-approval": {
					page: { title: "Top Up Approval", desc: "" },
				},
				"part-release-approval": {
					page: { title: "Part Release Approval", desc: "" },
				},
				"full-release-approval": {
					page: { title: "Full Release Approval", desc: "" },
				},
			},
			repayment: {
				monthly: {
					page: { title: "Monthly Repayment", desc: "" },
				},
				"part-release": {
					page: { title: "Part Release", desc: "" },
				},
				"full-release": {
					page: { title: "Full Release", desc: "" },
				},
				'interest-emi': {
					page: { title: "Pay Interest EMI", desc: "" },
				},
			},
			"kyc-setting": {
				page: { title: "Customer KYC", desc: "" },
				"edit-kyc": {
					page: { title: "Customer KYC", desc: "" },
				},
			},
			"assigned-customers": {
				page: { title: "Assigned Customers", desc: "" },
			},
			"emi-management": {
				'dashboard': {
					page: { title: "Dashboard", desc: "" },
				},
				products: {
					page: { title: "Show Products", desc: "" },
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
					'edit-order-details': {
						id: {
							page: { title: "Order Details", desc: "" },
						},
					},
					'cancel-order': {
						id: {
							page: { title: "Cancel Order", desc: "" },
						},
					},
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
					'edit-refund-details': {
						id: {
							page: { title: "Refund Details", desc: "" },
						},
					},
				},
				customers: {
					page: { title: "Customers", desc: "" },
				},
				reports: {
					page: { title: "Reports", desc: "" },
				},
			},
			"applied-kyc": {
				page: { title: "Applied KYC", desc: "" },
			},
			"holidays": {
				page: { title: "Holidays", desc: "" },
			},
			"customer-management": {
				"customer-list": {
					page: { title: "My Customer", desc: "" },
					id: {
						page: { title: "Customer Details", desc: "" },
					},
				},
				"loan-details": {
					id: {
						page: { title: "Loan Details", desc: "" },
					}

				},
			},
			"loan-management": {
				"loan-calculator": {
					page: { title: "Loan Calculator", desc: "" },
				},
				"loan-application-form": {
					page: { title: "Loan Application Form", desc: "" },
					id: {
						page: { title: "Loan Application Form", desc: "" },
					}
				},
				'view-loan': {
					id: {
						page: { title: "View Loan Application Form", desc: "" },
					}
				},
				packet: {
					page: { title: "Packets", desc: "" },
				},
				"packet-tracking": {
					page: { title: "Packet Tracking", desc: "" },
				},
				"all-loan": {
					page: { title: "All Loans", desc: "" },
				},
				"applied-loan": {
					page: { title: "Applied Loan", desc: "" },
				},
				"packet-image-upload": {
					id: {
						page: { title: "PACKET IMAGE UPLOAD", desc: "" },
					}
				},
				"topup": {
					page: { title: "Top Up", desc: "" },
				},
				"transfer-loan-list": {
					page: { title: "Transfer Loan List", desc: "" },
				}
			}
		},
		'broker': {
			'dashboard': {
				page: { title: "Dashboard", desc: "" },
			},
			"customers": {
				page: { title: "Customers", desc: "" },
			},
			"orders": {
				page: { title: "Orders", desc: "" },
				'view-pay': {
					id: {
						page: { title: "Orders", desc: "" },
					},
				},
				'cancel-order': {
					id: {
						page: { title: "Cancel Order", desc: "" },
					},
				},
			},
			"shop": {
				page: { title: "Shop", desc: "" },
				'product': {
					id: {
						page: { title: "Product Details", desc: "" },
					},
				},
			},
			"cart": {
				page: { title: "Shopping Cart", desc: "" },
			},
			"profile": {
				page: { title: "Profile", desc: "" },
			},
			"checkout-customer-address": {
				page: { title: "Customer Address", desc: "" },
			},
			"order-received": {
				id: {
					page: { title: "Order Received", desc: "" },
				}
			},
		}
	};

	public get configs() {
		return this.defaults;
	}
}
