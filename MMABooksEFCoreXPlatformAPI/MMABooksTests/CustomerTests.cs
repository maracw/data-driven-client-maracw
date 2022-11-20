using System.Collections.Generic;
using System.Linq;
using System;

using NUnit.Framework;
//using MMABooksEFClasses.MarisModels;
using Microsoft.EntityFrameworkCore;
using MMABooksEFClasses.Models;

namespace MMABooksTests
{
    [TestFixture]
    public class CustomerTests
    {

        MMABooksContext dbContext;
        Customer? c;
        List<Customer>? customers;

        [SetUp]
        public void Setup()
        {
            dbContext = new MMABooksContext();
            dbContext.Database.ExecuteSqlRaw("call usp_testingResetData()");
        }

        [Test]
        public void GetAllTest()
        {
            customers = dbContext.Customers.OrderBy(c => c.CustomerId).ToList();
            Assert.AreEqual(696, customers.Count);
            Assert.AreEqual("Molunguri, A", customers[0].Name);
            PrintAll(customers);
        }

        [Test]
        public void GetByPrimaryKeyTest()
        {
            c = dbContext.Customers.Find(1);
            Assert.IsNotNull(c);
            Assert.AreEqual("Molunguri, A", c.Name);
            Assert.AreEqual("Birmingham", c.City);
            Console.WriteLine(c);

        }

        [Test]
        public void GetUsingWhere()
        {
            // get a list of all of the customers who live in OR
            customers = dbContext.Customers.Where(c => c.StateCode.Equals("OR")).OrderBy(c => c.Name).ToList();
            Assert.AreEqual(5, customers.Count);
            Assert.AreEqual("Erpenbach, Lee", customers[0].Name);
            PrintAll(customers);

        }

        [Test]
        public void GetWithInvoicesTest()
        {
            // get the customer whose id is 20 and all of the invoices for that customer
            c = dbContext.Customers.Include("Invoices").Where(c => c.CustomerId == 20).SingleOrDefault();

            Assert.IsNotNull(c);
            Assert.AreEqual("Doraville", c.City);
            Assert.AreEqual(3, c.Invoices.Count);
            Console.WriteLine(c);

            c = dbContext.Customers.Include("Invoices").Where(c => c.CustomerId == 10).SingleOrDefault();

            Assert.IsNotNull(c);
            Assert.AreEqual("McGrer", c.City);
            Assert.AreEqual(5, c.Invoices.Count);
            Console.WriteLine(c);
        }

        [Test]
        public void GetWithJoinTest()
        {
            // get a list of objects that include the customer id, name, statecode and statename
            var customers = dbContext.Customers.Join(
               dbContext.States,
               c => c.StateCode,
               s => s.StateCode,
               (c, s) => new { c.CustomerId, c.Name, c.StateCode, s.StateName }).OrderBy(r => r.StateName).ToList();
            Assert.AreEqual(696, customers.Count);
            // I wouldn't normally print here but this lets you see what each object looks like
            foreach (var c in customers)
            {
                Console.WriteLine(c);
            }
        }

        [Test]
        public void DeleteTest()
        {
            c = dbContext.Customers.Find(1);
            dbContext.Customers.Remove(c);
            dbContext.SaveChanges();
            Assert.IsNull(dbContext.Customers.Find(1));
        }

        [Test]
        public void CreateTest()
        {
            c = new Customer();
            c.Name = "Lois Lane";
            c.Address = "789 Fancy Place";
            c.City = "Gotham";
            c.StateCode = "NY";
            c.ZipCode = "10001";
            dbContext.Customers.Add(c);
            dbContext.SaveChanges();

            
            c = dbContext.Customers.Where(c => c.Name == "Lois Lane" && c.Address == "789 Fancy Place").SingleOrDefault();

            Assert.NotNull(dbContext.Customers.Where(c =>c.Name == "Lois Lane" && c.Address =="789 Fancy Place"));
            Assert.AreEqual(c.Name, "Lois Lane");
            Console.WriteLine(c);

            
        }

        [Test]
        public void UpdateTest()
        {
            c = dbContext.Customers.Find(1);
            c.Name = "Oregon Jones";
            c.ZipCode = "97401";
            dbContext.Update(c);

            dbContext.SaveChanges();
            c = dbContext.Customers.Find(1);
            Assert.AreEqual("Oregon Jones", c.Name);
            Assert.AreEqual("97401", c.ZipCode);

        }

        public void PrintAll(List<Customer> customers)
        {
            foreach (Customer c in customers)
            {
                Console.WriteLine(c);
            }
        }

    }
}