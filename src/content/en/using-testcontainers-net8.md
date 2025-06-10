---
title: Using TestContainers on your .NET 8 Application
description: Understando what Test containersare, it benefits and how to use it on your application
pubDate: 2025-03-14
draft: false
---

## Introduction

### What will you Learn?

In this article, you'll discover TestContainers and how they can significantly enhance your application's integration testing. You'll learn how to implement TestContainers in your .NET projects and seamlessly integrate them with CI/CD tools like GitHub Actions and Azure DevOps, creating a robust testing pipeline.

### Prerequisites

To get the most from this article, you should have:

- Experience developing APIs with C# and .NET
- Basic understanding of architectural concepts and organized API structures
- Familiarity with Entity Framework Core
- Basic knowledge of Docker (helpful but not required)

## Test Containers

### What is a TestContainer and why to use it?

Have you ever thought about how you can _really_ write integration tests without interfering on your production/development environment? How can you Integrate a complete workflow on your api only with your test environment? I thought there would be have a TON of work to do this, especially to integrate it into a CI/CD pipeline.

This is what [Test Containers](https://testcontainers.com/) solves, it helps you to create instances of databases, message brokers, services through Docker.

We can create those instances mainly to help with integration tests, where you usually need a communication with database and maybe a message broker.

You will see how this can be implemented, but firstly, let's take a look at our project

### Our initial state of the project (without any tests)

If you want to see the source code, just take a look at this [repo](https://github.com/Viilih/testingcontainer-application-net8) at the `src/Employee.API` where we have our api allowing us to create an employee and list all of them.

I'm using Mediatr and Vertical Slice Architecture, if you want to have a more detailed description, just check the `README.md` file, I put the structure, tools used, and more on that file

### How can you implement it in your integration tests

Well to start writing our tests we first need to create a test project:

```sh
dotnet new xunit -o Employee.Test
dotnet sln add ./Employee.Test/Employee.Test.csproj
dotnet add ./Employee.Test/Employee.Test.csproj reference ./Employee.API/Employee.API.csproj
```

On my project, I already have the package for the database I am using (PostgreSQL - Npgsql), but you need to add the package of the database you are using on the source/target project you want to test.

Now, we should add the TestContainer dependencies on on the test project:

```sh
dotnet add ./Employee.Test/Employee.Test.csproj package Testcontainers.PostgreSql

```

Well for the setup of our integration tests your dependencies should look similar to this (if one or another are missing just install them):

```cs
<PackageReference Include="Bogus" Version="35.6.2" />
<PackageReference Include="coverlet.collector" Version="6.0.0"/>
<PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="8.0.14" />
<PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.8.0"/>
<PackageReference Include="Testcontainers" Version="4.3.0" />
<PackageReference Include="Testcontainers.PostgreSql" Version="4.3.0" />
<PackageReference Include="xunit" Version="2.5.3"/>
<PackageReference Include="xunit.runner.visualstudio" Version="2.5.3"/>
```

I am using Bogus to help me to mock and generate some dummy data.

For start writing our integration tests, I usually like to create a class to setup the initial dependencies for our test environment (in our case, the database access and config):

```cs
// Infrastructure/CustomWebApplicationFactory.cs
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;

namespace Employee.Test.Infrastructure;

public class CustomWebApplicationFactory: WebApplicationFactory <Program> , IAsyncLifetime {
  private readonly PostgreSqlContainer _postgreSqlContainer =
    new PostgreSqlBuilder()
    .WithImage("postgres:latest")
    .WithDatabase("localdb")
    .WithUsername("postgres")
    .WithPassword("postgres")
    .Build();

  protected override void ConfigureWebHost(IWebHostBuilder builder) {
    builder.ConfigureTestServices(services => {
      var descriptor = services.SingleOrDefault(s => s.ServiceType == typeof (DbContextOptions <AppDbContext> ));

      if (descriptor is not null) {
        services.Remove(descriptor);
      }

      services.AddDbContext <AppDbContext> (opt => {
        opt.UseNpgsql(_postgreSqlContainer.GetConnectionString());
      });

    });

  }

  public Task InitializeAsync() {
    return _postgreSqlContainer.StartAsync();
  }

  public new Task DisposeAsync() {
    return _postgreSqlContainer.StopAsync();
  }
}
```

In this first configuration, I highlight some points of this code:

- The use of IAsyncLifeTime: We are using this for the moment our test environment starts, the InitializeAsync is called first before anything and setup our postgres container
- Using your program.cs as a type: For using the Program as a type I just added this piece of code on my program.cs `public partial class Program {}`
- The configuration of our PostgreSQL container: We configure the instance of our database container and the use of it on the `ConfigureWebHost` method

After setting up our database on the test environment, we can create a base class for our integration tests, defining the dependencies we are going to use and define a initial data for our database:

```cs
// Infrastructure/BaseIntegrationTest.cs
using Employee.Test.TestData;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace Employee.Test.Infrastructure;

public class BaseIntegrationTest: IClassFixture <CustomWebApplicationFactory> , IAsyncLifetime {
  private   readonly IServiceScope _scope;
  protected readonly ISender _sender;
  protected readonly AppDbContext _context;
  protected readonly TestDataSeeder DataSeeder;

  protected BaseIntegrationTest(CustomWebApplicationFactory factory) {
    _scope = factory.Services.CreateScope();
    _sender = _scope.ServiceProvider.GetRequiredService <ISender> ();
    _context = _scope.ServiceProvider.GetRequiredService <AppDbContext> ();
    DataSeeder = new TestDataSeeder(_context);
  }

  public Task InitializeAsync() => DataSeeder.SeedAsync();

  public Task DisposeAsync() => Task.CompletedTask;

```

- We use sender in order to enable the use of mediatr and the handlers we have on the API project
- DbCOntext for querying some data to verify the test at the level of the database
- DataSeeder is a Class for seeding the database with initial data
- Use IAsyncLifeTIme to use the method InitializeAsync to seed the data before our test environment starts
- IClassFixture: Ensures our PostgreSQL container is created once and shared across all tests in the class, improving test performance by avoiding container recreation for each test.

```cs
// TestData/TestDataSeeder
using Bogus;
using Employee.API;

namespace Employee.Test.TestData;

public class TestDataSeeder {
  private readonly AppDbContext _context;
  private readonly Faker _faker;

  private readonly List <API.Entities.Employee> _employees = new();

  public TestDataSeeder(AppDbContext context) {
    _context = context;
    _faker = new Faker();
  }

  public async Task SeedAsync() {
    await SeedEmployeesAsync();
    await _context.SaveChangesAsync();
  }

  private async Task SeedEmployeesAsync() {
    var employeeFaker = new Faker <API.Entities.Employee> ().CustomInstantiator(f =>
      new API.Entities.Employee {
        Id = f.Random.Int(),
          FirstName = f.Name.FirstName(),
          LastName = f.Name.LastName(),
          Email = f.Person.Email,
          PhoneNumber = f.Phone.PhoneNumber(),
      });

    _employees.AddRange(employeeFaker.Generate(10));
    await _context.Employees.AddRangeAsync(_employees);
  }
}
```

With this setup, we can start writing our tests:

```cs
// EmployeeTest.cs
using Employee.API.Features.Employees.CreateEmployee;
using Employee.API.Features.Employees.GetAllEmployees;
using Employee.Test.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Employee.Test;

public class EmployeeTests: BaseIntegrationTest {
  public EmployeeTests(CustomWebApplicationFactory factory): base(factory) {}

  [Fact]
  public async Task CreateEmployee_ShouldCreateEmployee_WhenDataIsValid() {
    // Arrange
    var command = new CreateEmployeeCommand {
      FirstName = "John",
        LastName = "Doe",
        Email = "johndoe@example.com",
        PhoneNumber = "21999999999"
    };

    // Act
    var employeeId = await _sender.Send(command);
    var employee = await _context.Employees.SingleOrDefaultAsync(e => e.Id == employeeId.Value);

    // Assert
    Assert.NotNull(employee);
    Assert.Equal(command.FirstName, employee.FirstName);
    Assert.Equal(command.LastName, employee.LastName);
    Assert.Equal(command.Email, employee.Email);
    Assert.Equal(command.PhoneNumber, employee.PhoneNumber);
  }

  [Theory]
  [InlineData("", "Doe", "johndoe@example.com", "21999999999")]
  [InlineData("John", "", "johndoe@example.com", "21999999999")]
  [InlineData("John", "Doe", "", "21999999999")]
  public async Task CreateEmployee_ShouldFail_WhenInvalidDataIsProvided(
    string firstName, string lastName, string email, string phoneNumber) {
    // Arrange
    var command = new CreateEmployeeCommand {
      FirstName = firstName,
        LastName = lastName,
        Email = email,
        PhoneNumber = phoneNumber
    };

    // Act
    var result = await _sender.Send(command);

    // Assert
    Assert.NotNull(result);
    Assert.True(result.IsFailed);
    Assert.False(result.IsSuccess);
    Assert.NotEmpty(result.Errors);
  }

  [Fact]
  public async Task GetAllEmployees_ShouldReturnEmployees_WhenEmployeesExist() {
    // Arrange
    var command = new CreateEmployeeCommand {
      FirstName = "Jane",
        LastName = "Smith",
        Email = "janesmith@example.com",
        PhoneNumber = "21888888888"
    };

    await _sender.Send(command);

    var query = new GetAllEmployeesQuery();

    // Act
    var employees = await _sender.Send(query);
    var employeesFromDb = await _context.Employees.ToListAsync();

    // Assert
    Assert.NotNull(employees);
    Assert.NotEmpty(employees.Value);
    Assert.Equal(employeesFromDb.Count, employees.Value.Count());
  }

  [Fact]
  public async Task GetAllEmployees_ShouldReturnEmptyList_WhenNoEmployeesExist() {
    // Arrange
    await _context.Employees.ExecuteDeleteAsync();

    var query = new GetAllEmployeesQuery();

    // Act
    var employees = await _sender.Send(query);

    // Assert
    Assert.NotNull(employees.Value);
    Assert.Empty(employees.Value);
  }
}
```

You can see that we are in fact testing the **integration** between our API and a real database without affecting the production/development environment

The main idea to use TestContainer is you can validate your tests at the very bottom level, at the database level,if an employee was created, queried or updated.

## Devops

### How can we integrate tests into CI/CD

First we need to create a pipeline.yaml file, since I'm using github actions I need to follow a specific structure for creating it:

At the solution level, create the file:

```yaml
name: Build & Test 🧪

on:
  push:
    branches:
      - main

env:
  DOTNET_VERSION: "8.x"

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: ${{ env.DOTNET_VERSION }}

      - name: Install dependencies
        run: dotnet restore ./employee.sln

      - name: Build
        run: dotnet build ./employee.sln --configuration Release --no-restore

      - name: Test
        run: dotnet test ./employee.sln --configuration Release --no-build
```

We have four steps: setting up, restoring the dependencies, building our application, and testing it.

To add it to Azure Pipelines, you just need to find your pipeline file in the pipeline tab. THis file is also validate on azure pipelines

## Conclusion

Just a disclaimer: this is a simple project and introduces the use of Test Containers and how they can be helpful during your tests and how to integrate the tests with Ci/CD.
Also, it's worth mentioning that this pipeline is just a basic implementation, you can add more tools and steps, like SonarQube, to verify the test coverage

I want to be very clear that this is an introduction to tools that could be helpful for you.

Here it is the official documentaion for Test Containers:
[link](https://testcontainers.com/)

If you are wondering what else you can do, I would suggest integrating it into a project you already have, or as I said before, use more tools such a SonarQube or Helm config values, add a deploy phase to your pipeline, something like that. I intend to start writing more about devops, since it's something that I'm interested in, so stay tuned for the next posts!

I hope you enjoyed this post and learned something.Remember:
Drink water, eat fruits, don't deploy on Friday and be happy :)
