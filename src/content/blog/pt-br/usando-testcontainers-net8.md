---
title: Usando TestContainers na sua Aplicação .NET 8
pubDate: 2025-03-14
---

## Introdução

### O que você vai aprender?

Neste artigo, você vai conhecer o TestContainers e como ele pode melhorar bastante os testes de integração da sua aplicação. Vamos ver como implementar TestContainers em projetos .NET e integrá-los facilmente com ferramentas de CI/CD como GitHub Actions e Azure DevOps, criando um pipeline de testes mais robusto.

### Pré-requisitos

Para aproveitar melhor esse artigo, é bom que você já tenha:

- Experiência desenvolvendo APIs com C# e .NET
- Noção básica de arquitetura e organização de APIs
- Conhecimento em Entity Framework Core
- Noções básicas de Docker (ajuda, mas não é obrigatório)

## Test Containers

### O que é um TestContainer e por que usar?

Já pensou em como rodar testes de integração sem bagunçar seu ambiente de produção/desenvolvimento? Como testar um fluxo completo da API sem sair do ambiente de testes? No começo, eu achei que isso ia dar MUITO trabalho, principalmente para integrar no CI/CD.

Mas é aí que entra o [TestContainers](https://testcontainers.com/)! Ele permite criar instâncias de bancos de dados, message brokers e outros serviços via Docker, facilitando demais os testes de integração.

A gente pode criar essas instâncias para testar interações com o banco de dados e, quem sabe, até com message brokers. Bora ver como isso funciona na prática!

### Como está o projeto antes dos testes

Se quiser ver o código-fonte, dá uma olhada nesse [repositório](https://github.com/Viilih/testingcontainer-application-net8) no diretório `src/Employee.API`. Lá temos uma API simples para criar e listar funcionários.

Estou usando Mediatr e Vertical Slice Architecture. Se quiser mais detalhes, confere o `README.md`, onde explico a estrutura, ferramentas usadas e outras informações.

### Implementando TestContainers nos testes de integração

Primeiro, criamos um projeto de testes:

```sh
dotnet new xunit -o Employee.Test
dotnet sln add ./Employee.Test/Employee.Test.csproj
dotnet add ./Employee.Test/Employee.Test.csproj reference ./Employee.API/Employee.API.csproj
```

Se o seu projeto já tem um pacote para o banco de dados que está usando (no meu caso, PostgreSQL com Npgsql), beleza! Se não, instale o pacote correspondente.

Agora, adicionamos a dependência do TestContainer no projeto de testes:

```sh
dotnet add ./Employee.Test/Employee.Test.csproj package Testcontainers.PostgreSql
```

O projeto de testes vai precisar dessas dependências:

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

O pacote **Bogus** ajuda a criar dados fictícios para os testes.

Agora, criamos uma classe para configurar o ambiente de testes, inicializando o banco de dados no TestContainer:

```cs
// Infrastructure/CustomWebApplicationFactory.cs
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;

namespace Employee.Test.Infrastructure;

public class CustomWebApplicationFactory: WebApplicationFactory<Program>, IAsyncLifetime {
  private readonly PostgreSqlContainer _postgreSqlContainer =
    new PostgreSqlBuilder()
    .WithImage("postgres:latest")
    .WithDatabase("localdb")
    .WithUsername("postgres")
    .WithPassword("postgres")
    .Build();

  protected override void ConfigureWebHost(IWebHostBuilder builder) {
    builder.ConfigureTestServices(services => {
      var descriptor = services.SingleOrDefault(s => s.ServiceType == typeof(DbContextOptions<AppDbContext>));
      if (descriptor is not null) {
        services.Remove(descriptor);
      }
      services.AddDbContext<AppDbContext>(opt => {
        opt.UseNpgsql(_postgreSqlContainer.GetConnectionString());
      });
    });
  }

  public Task InitializeAsync() => _postgreSqlContainer.StartAsync();
  public new Task DisposeAsync() => _postgreSqlContainer.StopAsync();
}
```

Isso configura o banco de dados no container e permite que os testes rodem sem afetar nada fora do ambiente de testes.

Agora, criamos uma classe base para os testes:

```cs
public class BaseIntegrationTest: IClassFixture<CustomWebApplicationFactory>, IAsyncLifetime {
  private readonly IServiceScope _scope;
  protected readonly ISender _sender;
  protected readonly AppDbContext _context;
  protected readonly TestDataSeeder DataSeeder;

  protected BaseIntegrationTest(CustomWebApplicationFactory factory) {
    _scope = factory.Services.CreateScope();
    _sender = _scope.ServiceProvider.GetRequiredService<ISender>();
    _context = _scope.ServiceProvider.GetRequiredService<AppDbContext>();
    DataSeeder = new TestDataSeeder(_context);
  }

  public Task InitializeAsync() => DataSeeder.SeedAsync();
  public Task DisposeAsync() => Task.CompletedTask;
}
```

Agora podemos escrever os testes!

```cs
public class EmployeeTests: BaseIntegrationTest {
  public EmployeeTests(CustomWebApplicationFactory factory): base(factory) {}

  [Fact]
  public async Task CreateEmployee_DeveCriarFuncionario_QuandoOsDadosForemValidos() {
    var command = new CreateEmployeeCommand {
      FirstName = "John",
      LastName = "Doe",
      Email = "johndoe@example.com",
      PhoneNumber = "21999999999"
    };

    var employeeId = await _sender.Send(command);
    var employee = await _context.Employees.SingleOrDefaultAsync(e => e.Id == employeeId.Value);

    Assert.NotNull(employee);
  }
}
```

Agora temos testes que realmente validam a integração da API com um banco de dados real, sem interferir no ambiente de desenvolvimento ou produção!

## DevOps

### Como integrar os testes no CI/CD

Criamos um `pipeline.yaml` para rodar os testes no GitHub Actions:

```yaml
name: Build & Test 🧪

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: "8.x"
      - name: Install dependencies
        run: dotnet restore ./employee.sln
      - name: Build
        run: dotnet build ./employee.sln --configuration Release --no-restore
      - name: Test
        run: dotnet test ./employee.sln --configuration Release --no-build
```

## Conclusão

Conclusão
Só pra deixar claro: esse é um projeto simples, feito para te apresentar o TestContainers e mostrar como ele pode facilitar seus testes de integração e a automação dentro do CI/CD.

Vale lembrar também que esse pipeline é bem básico. Você pode melhorar ele adicionando mais ferramentas e etapas, como o SonarQube, para validar a cobertura dos testes.

Quero enfatizar que essa é apenas uma introdução a ferramentas que podem ser úteis no seu dia a dia.

Segue o link da documentação oficial dos Tests Containers:
[link](https://testcontainers.com/)

Se você quer dar um próximo passo, minha sugestão é tentar integrar isso em um projeto real que você já tenha. Como mencionei antes, dá pra adicionar mais ferramentas, como SonarQube, valores de configuração no Helm, incluir uma etapa de deploy no pipeline... enfim, tem bastante coisa pra explorar. Eu também pretendo escrever mais sobre DevOps, já que é uma área que me interessa bastante, então fique ligado para os próximos posts!

Espero que você tenha curtido o post e aprendido algo novo. E lembre-se:

Beba água, coma frutas, não faça deploy na sexta-feira e seja feliz :)
