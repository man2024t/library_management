// Copyright (c) 2023, Manvendra and contributors
// For license information, please see license.txt

frappe.ui.form.on('Library Entry', {
	// refresh: function(frm) {

	// }
	reload: function (frm) {
		let studentId = frm.doc.student_id
		frm.clear_table('book_history');
		const dataToSend = {
			studentId: studentId
		};
		frm.call({
			doc: frm.doc,
			method: 'get_transaction_data',
			args: {
				data: dataToSend
			},
			callback: function (response) {
				if (response.message) {
					// Update the Book Details child table with fetched data
					var transactions = response.message;
					// Loop through the list of transactions using forEach
					transactions.forEach(function (transaction) {
						// Access properties of each transaction
						var bookName = transaction.book_name;
						var author = transaction.author;
						var issue_quantity = transaction.quantity
						var publisher = transaction.publisher
						var transaction_details = transaction.name
						var issueDate = transaction.issue_date
						// Perform actions with bookName and author
						//  frappe.msgprint(bookName)
						//  frappe.msgprint(author)
						// frm.clear_table('book_history');
						if (issue_quantity > 0) {
							var child = frm.add_child('book_history');
							// Set values for the new row
							frappe.model.set_value(child.doctype, child.name, 'book_name', bookName);
							frappe.model.set_value(child.doctype, child.name, 'author', author);
							frappe.model.set_value(child.doctype, child.name, 'issue_quantity', issue_quantity);
							frappe.model.set_value(child.doctype, child.name, 'publisher', publisher);
							frappe.model.set_value(child.doctype, child.name, 'transaction_detials', transaction_details);
							frappe.model.set_value(child.doctype, child.name, 'issue_date', issueDate);
						}
						// Add more fields as needed and set their values
					})
					// Refresh the Book Details child table
					frm.fields_dict['book_history'].grid.refresh();
				}
				else {
					frappe.msgprint('Error: ' + response.exc || 'Undefined Error');
				}
			}
		})
	},


	issue: function (frm) {
		let book_name = frm.doc.book_name
		let stud_id = frm.doc.student_id
		let quantity = frm.doc.issue_quantity
		let date = frm.doc.date
		if (book_name && stud_id && date && quantity > 0) {
			// frappe.msgprint("follwing book "+book_name+" issued by "+stud_id)
			const dataToSend = {
				bookName: book_name,
				studentId: stud_id,
				quantity: quantity,
				issueDate: date
			};
			// Make an AJAX request to the Python file
			frm.call({
				doc: frm.doc,
				method: 'book_issue',
				args: {
					data: dataToSend
				},
				callback: function (response) {
					if (response.message) {
						frappe.msgprint(response.message);
					} else {
						frappe.msgprint('Error: ' + response.exc || 'Undefined Error');
					}
				},
				// Add an error handler for any network or server-side issues
			});
		}
		else {
			frappe.msgprint("Please select all the fields");
		}
	}
});


frappe.ui.form.on("Book History", {
	return: function (frm, cdt, cdn) {
		const row = locals[cdt][cdn]; // Access the row data
		const issue_qunatity = row.issue_quantity;
		const return_quantity = row.return_quantity;
		const transaction_details = row.transaction_detials
		// Assuming "book_details" has fields like "book_title" and "author"
		const dataToSend = {
			issueQuantity: issue_qunatity,
			returnQuantity: return_quantity,
			transactionDetails: transaction_details
		}
		// Perform your custom logic with the row data
		// frappe.msgprint(`Returned book: ${bookTitle} by ${author}`);
		if (return_quantity > 0 && return_quantity <= issue_qunatity) {
			frm.call({
				doc: frm.doc,
				method: 'return_book',
				args: {
					data: dataToSend
				},
				callback: function (response) {
					if (response.message) {
						frappe.msgprint(response.message);
					} else {
						frappe.msgprint('Error: ' + response.exc || 'Undefined Error');
					}
				},
				// Add an error handler for any network or server-side issues
			});
		}
		else {
			frappe.throw("Please select valid return quantity")
		}
	}
});