using System;
using System.Collections.Generic;
using MMABooksEFClasses.Models;
using System.Xml.Linq;

namespace MMABooksEFClasses.Models
{
    public partial class Product
    {
        public Product()
        {
            InvoiceLineItems = new HashSet<InvoiceLineItem>();
        }

        public string ProductCode { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal UnitPrice { get; set; }
        public int OnHandQuantity { get; set; }
        public override string ToString()
        {
            return ProductCode + ", " + Description + ", " + UnitPrice + ", " + OnHandQuantity;
        }

        public virtual ICollection<InvoiceLineItem> InvoiceLineItems { get; set; }
    }
}
