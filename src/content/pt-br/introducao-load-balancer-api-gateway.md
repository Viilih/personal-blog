---
title: "Uma introdução a load balancers e API Gateway utilizando NGINX"
description: "Entenda o que são load balancers e API Gateways, como eles funcionam na prática e como configurar os dois usando NGINX com um exemplo real."
pubDate: 2026-02-23
draft: true
tags: ["nginx", "load balancer", "api gateway", "system design", "infraestrutura"]
---

Quando eu comecei a estudar system design, load balancer era uma dessas palavras que eu via em todo diagrama de arquitetura mas nunca parei pra entender de verdade. Parecia coisa de empresa grande, sabe? Daquelas que têm mil servidores rodando em paralelo. Aí eu percebi que entender o conceito, independente da escala, muda completamente como você pensa em construir sistemas. E o melhor lugar pra começar é colocando a mão na massa com o NGINX.

Nesse post eu quero te mostrar o que é um load balancer, o que é um API Gateway, como os dois se encaixam num sistema e como configurar isso tudo na prática.

## O que é um Load Balancer?

Pensa assim: você tem uma fila no mercado com um único caixa. Chegam dez pessoas ao mesmo tempo. O caixa vai enlouquecer (ou travar). Agora imagina que o mercado abre mais quatro caixas e coloca uma pessoa na entrada pra distribuir os clientes entre eles. Essa pessoa é o load balancer.

Na prática, um load balancer recebe as requisições que chegam e as distribui entre múltiplas instâncias de um serviço. O objetivo é evitar que um único servidor seja sobrecarregado enquanto os outros ficam ociosos.

Mas não é só sobre carga. O load balancer também é uma peça de resiliência. Se uma das instâncias cair, ele para de mandar requisições pra ela. O sistema continua funcionando sem que o usuário perceba.

### Os algoritmos de distribuição

A forma como o load balancer decide pra qual servidor mandar cada requisição depende do algoritmo configurado. Os mais comuns são:

**Round Robin** — O padrão do NGINX. Cada requisição vai pra um servidor diferente, em sequência. Servidor 1, Servidor 2, Servidor 3, volta pro 1. Simples e funciona bem quando as instâncias têm capacidade similar.

**Least Connections** — Manda a requisição pro servidor que tem menos conexões ativas no momento. Útil quando as requisições têm tempos de processamento muito diferentes entre si.

**IP Hash** — Usa o IP do cliente pra decidir qual servidor vai atender. O mesmo cliente sempre cai no mesmo servidor. Isso é importante quando você precisa manter sessão (embora aplicações modernas tendam a resolver isso de outras formas).

**Weighted Round Robin** — Uma variação do Round Robin onde você define pesos. Se o Servidor A tem o dobro de capacidade do Servidor B, você configura ele pra receber o dobro de requisições.

No NGINX, trocar de algoritmo é questão de adicionar uma diretiva no bloco `upstream`. Eu mostro isso mais pra frente.

## O que é um API Gateway?

Se o load balancer é o distribuidor de filas do mercado, o API Gateway é a recepção do prédio inteiro.

Ele é o ponto de entrada único de todas as requisições externas para os seus serviços. Em vez de o cliente saber o endereço de cada microserviço — `/users`, `/orders`, `/products` — ele só conhece o gateway. O gateway recebe a requisição, identifica pra qual serviço ela pertence e faz o roteamento.

Além do roteamento, um API Gateway pode centralizar várias responsabilidades transversais: autenticação, rate limiting, logging, CORS, transformação de requests. Você para de repetir essas configurações em cada serviço e coloca tudo num lugar só.

É exatamente isso que o NGINX faz quando configurado como API Gateway: ele inspeciona o path da requisição e decide pra qual upstream encaminhar.

## O exemplo prático

O repositório com os arquivos está em [github.com/Viilih/nginx-resources](https://github.com/Viilih/nginx-resources/tree/main/02-api-gateway-lb). Vou te explicar o que está montado lá.

A estrutura tem três serviços simulados (chamados de `service-a`, `service-b` e `service-c`), cada um rodando em múltiplas instâncias via Docker Compose. O NGINX age como API Gateway na entrada e como load balancer na frente de cada conjunto de instâncias.

O `docker-compose.yml` sobe tudo junto: o NGINX e as instâncias dos serviços. O NGINX fica exposto na porta `8080` para o mundo externo.

A configuração central do NGINX fica assim (simplificada):

```nginx
upstream service_a {
    server service-a-1:3000;
    server service-a-2:3000;
    server service-a-3:3000;
}

upstream service_b {
    server service-b-1:3000;
    server service-b-2:3000;
}

server {
    listen 80;

    location /service-a/ {
        proxy_pass http://service_a/;
    }

    location /service-b/ {
        proxy_pass http://service_b/;
    }
}
```

Cada bloco `upstream` define um grupo de servidores. O bloco `server` faz o papel de API Gateway: dependendo do path da requisição, ele roteia pro upstream correto.

Quando você bate em `localhost:8080/service-a/health`, o NGINX captura essa requisição, vê que o path começa com `/service-a/` e distribui entre as três instâncias de `service-a` usando Round Robin por padrão.

### Mudando o algoritmo do load balancer

Quer usar Least Connections em vez de Round Robin? É só adicionar uma linha:

```nginx
upstream service_a {
    least_conn;
    server service-a-1:3000;
    server service-a-2:3000;
    server service-a-3:3000;
}
```

Pra IP Hash:

```nginx
upstream service_a {
    ip_hash;
    server service-a-1:3000;
    server service-a-2:3000;
    server service-a-3:3000;
}
```

E pra pesos no Round Robin:

```nginx
upstream service_a {
    server service-a-1:3000 weight=3;
    server service-a-2:3000 weight=1;
    server service-a-3:3000 weight=1;
}
```

(Nesse caso, `service-a-1` recebe três vezes mais requisições do que os outros dois. Útil quando uma instância tem mais recurso alocado.)

## Como o sistema se comporta quando algo falha?

Essa parte é a que eu acho mais interessante de testar na prática.

O NGINX tem um comportamento padrão de health check passivo. Isso significa que ele não fica ativamente verificando se os servidores estão vivos — ele descobre que um servidor caiu quando uma requisição falha.

Você pode configurar o número de falhas antes de marcar um servidor como indisponível e por quanto tempo ele fica fora da rotação:

```nginx
upstream service_a {
    server service-a-1:3000 max_fails=3 fail_timeout=30s;
    server service-a-2:3000 max_fails=3 fail_timeout=30s;
    server service-a-3:3000 max_fails=3 fail_timeout=30s;
}
```

Com essa configuração, se `service-a-1` falhar três vezes em 30 segundos, o NGINX para de mandar requisições pra ele por 30 segundos. Depois tenta de novo. Se o servidor voltou, volta pra rotação. Se ainda estiver falhando, o ciclo continua.

Pra testar isso no projeto do repositório, você pode derrubar uma das instâncias com `docker stop <container>` e observar que as requisições continuam sendo respondidas normalmente pelas outras instâncias. (Eu fiz isso na primeira vez que montei o ambiente e fiquei genuinamente empolgado quando funcionou. Parece óbvio no papel, mas ver acontecendo é diferente.)

O NGINX Open Source não tem health check ativo nativo — isso fica disponível na versão Plus (paga). Se você precisar de verificação ativa em produção com a versão open source, existem alternativas como usar o módulo `nginx_upstream_check_module` ou delegar isso pra outra camada da infraestrutura.

## Uma coisa importante antes de fechar

Tudo que a gente viu aqui é uma introdução. NGINX é uma das ferramentas que você pode usar como load balancer e API Gateway, mas está longe de ser a única. Existem soluções dedicadas como HAProxy, Traefik, Kong, AWS ALB, entre outras e cada uma com suas características, pontos fortes e casos de uso. Vou cobrir essas alternativas em posts futuros focados em system design, quando a gente puder comparar cada uma com mais calma.

Por enquanto, o NGINX é um ótimo ponto de partida porque ele é simples de configurar, tem muita documentação e te dá uma visão concreta de como esses conceitos funcionam antes de partir pra ferramentas mais especializadas.

Caso queira dar uma olhada no repositório que tenho utilizado como estudo: [github.com/Viilih/nginx-resources](https://github.com/Viilih/nginx-resources/tree/main/02-api-gateway-lb). Sobe o Docker Compose, derruba uma instância, muda o algoritmo do upstream, observa o comportamento. Aprender mexendo quebra mais galho do que ler dez artigos.

Beba água, cuide dos seus logs e não faça deploy na sexta :)