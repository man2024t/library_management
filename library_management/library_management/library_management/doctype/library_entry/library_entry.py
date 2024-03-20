# Copyright (c) 2023, Manvendra and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils.data import add_days

class LibraryEntry(Document):
    @frappe.whitelist()
    def return_book(self,data):
       transaction_details=data.get("transactionDetails")
       issueQuantity=data.get("issueQuantity")
       returnQuantity=data.get("returnQuantity")
       transaction=frappe.get_doc("Library Transactions",transaction_details)
       current_date = frappe.utils.nowdate()
       if issueQuantity-returnQuantity == 0:
        transaction.return_date=current_date
       transaction.quantity=int(issueQuantity)-int(returnQuantity)
       transaction.save()
    #    frappe.msgprint("{0}".format(transaction.book_name))
       return "Book is returned"
    

    @frappe.whitelist()
    def book_issue(self,data):
        # frappe.msgprint(data.get("bookName"))
        # frappe.msgprint(data.get("studentId"))
        # self.transaction(data)
        self.book_issue_validation(data)
        return "I am running finally"
    
    def transaction(self,data):
        student = frappe.get_doc("Student", {"name": data.get("studentId")})
        book = frappe.get_doc("Books", {"book_name":data.get("bookName")})
        transaction=frappe.new_doc("Library Transactions")
        transaction.student_id=student.name
        transaction.student_name=student.student_name
        transaction.book_name=book.name
        transaction.author=book.author
        transaction.publisher=book.publisher
        transaction.quantity=data.get("quantity")
        transaction.issue_date=data.get("issueDate")
        new_date_obj = add_days(data.get("issueDate"), 7)
        new_date = frappe.utils.formatdate(new_date_obj, "yyyy-MM-dd")
        transaction.return_date=new_date
        frappe.msgprint("Book is issued")
        transaction.save()
    
    def book_issue_validation(self,data):
        transactions = frappe.get_all("Library Transactions", filters={}, fields=["book_name", "quantity","return_date"])
        book_name=data.get("bookName")
        issue_quantity=data.get("quantity")
        issue_date=data.get("issueDate")
        bookedQuantity=0
        #Looping over every transaction and check with the name of a book
        for transaction in transactions:
            # frappe.msgprint(transaction.get("book_name"))
            # frappe.msgprint("book name {0} and transaction book name {1}".format(book_name,transaction.get("book_name")))
            if book_name==transaction.get("book_name"):
                if transaction.get("return_date")>issue_date:
                    bookedQuantity=bookedQuantity+transaction.get("quantity")
        book = frappe.get_doc("Books", {"book_name":data.get("bookName")})
        availableQuantity = int(book.total_quantity) - int(bookedQuantity)
            # frappe.msgprint("{0},{1},{2}".format(availableQuantity,issue_quantity,bookedQuantity))
        if issue_quantity <= availableQuantity:
            frappe.msgprint("Book can be issued")
            self.transaction(data)
        else:
            frappe.throw("Book is not availiable")

    @frappe.whitelist()
    def get_transaction_data(self,data):
    # Query the database to fetch transaction data based on the student_id
    # Construct and return the data as a list of dictionaries
    # Example: Fetch transactions related to the student
            transactions = frappe.get_all(
            'Library Transactions',
            filters={'student_id': data.get("studentId")},
            fields=['name','book_name','issue_date', 'author','publisher','quantity',]
             )
            return transactions

    