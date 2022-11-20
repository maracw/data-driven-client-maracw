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
    public class ProductTests
    {
        
        MMABooksContext dbContext;
        Product? p;
        List <Product>? products;

        [SetUp]
        public void Setup()
        {
            dbContext = new MMABooksContext();
            dbContext.Database.ExecuteSqlRaw("call usp_testingResetData()");
        }

        [Test]
        public void GetAllTest()
        {
            products = dbContext.Products.OrderBy(p => p.ProductCode).ToList();
            Assert.AreEqual(16, products.Count);
            Assert.AreEqual("A4CS", products[0].ProductCode);
            PrintAll(products);
        }

        [Test]
        public void GetByPrimaryKeyTest()
        {

            p = dbContext.Products.Find("A4CS");
            Assert.AreEqual(4637, p.OnHandQuantity);
            Assert.AreEqual("Murach's ASP.NET 4 Web Programming with C# 2010", p.Description);
            Assert.AreEqual(56.5000m, p.UnitPrice);
            Console.WriteLine(p);
        }

        [Test]
        public void GetUsingWhere()
        {
            // get a list of all of the products that have a unit price of 56.50
            products = dbContext.Products.Where(p => p.UnitPrice == 56.50m).ToList();
            PrintAll(products);
        }

        [Test]
        public void GetWithCalculatedFieldTest()
        {
            // get a list of objects that include the productcode, unitprice, quantity and inventoryvalue
            var products = dbContext.Products.Select(
            p => new { p.ProductCode, p.UnitPrice, p.OnHandQuantity, Value = p.UnitPrice * p.OnHandQuantity }).
            OrderBy(p => p.ProductCode).ToList();
            Assert.AreEqual(16, products.Count);
            foreach (var p in products)
            {
                Console.WriteLine(p);
            }
        }
        //broken
        [Test]
        public void DeleteTest()
        {
            p = dbContext.Products.Find("A4CS");
            dbContext.Products.Remove(p);
            dbContext.SaveChanges();
            Assert.IsNull(dbContext.Products.Find("A4CS"));
        }

        [Test]
        public void CreateTest()
        {
            Product p = new Product();
            p.ProductCode = "ZA32";
            p.Description = "Coding for Bears";
            p.UnitPrice = 14.99m;
            p.OnHandQuantity = 1;
            dbContext.Add(p);
            dbContext.SaveChanges();

            Assert.NotNull(dbContext.Products.Find("ZA32"));
            Product p2 = dbContext.Products.Find("ZA32");
            Assert.AreEqual("Coding for Bears", p2.Description);
            Assert.AreEqual(p.UnitPrice, p2.UnitPrice);



        }

        [Test]
        public void UpdateTest()
        {
            p = dbContext.Products.Find("A4CS");
            p.Description = "New Edition";
            p.OnHandQuantity = 97401;
            p.UnitPrice = 9.99m;

            dbContext.Update(p);
            dbContext.SaveChanges();


            p = dbContext.Products.Find("A4CS");
            Assert.AreEqual("New Edition", p.Description);
            Assert.AreEqual(97401, p.OnHandQuantity);
            Assert.AreEqual(9.99m, p.UnitPrice);
        }
        public void PrintAll(List<Product> products)
        {
            foreach (Product p in products)
            {
                Console.WriteLine(p);
            }
        }

    }
}