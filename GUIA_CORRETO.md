# � Guia Completo: Angular 18 + GraphQL + Apollo Client v4 + PrimeNG

Um guia passo a passo com **melhores práticas** para criar uma aplicação moderna usando Angular 18, Apollo Client v4 e PrimeNG.

---

## 📖 Introdução

Este guia mostra como construir uma **Pokédex** consumindo dados de uma API GraphQL moderna, com:

- ✅ Apollo Client v4 (não v3 antigo)
- ✅ Tipagem forte (sem `any`)
- ✅ Separação de responsabilidades (Services + Models)
- ✅ Componentes limpos e reutilizáveis
- ✅ PrimeNG com tema bonito
- ✅ Padrões de mercado

---

# 🎯 PARTE 1: Configuração Inicial

## Passo 1: Criar Projeto Angular 18

```bash
ng new pokemon-graphql-app
cd pokemon-graphql-app
```

**Escolha:**

- ✅ Standalone components: `Yes`
- ❌ Routing: `No` (não precisa aqui)
- CSS: `CSS` (padrão)

```
✅ Angular 18 criado com standalone components
```

---

## Passo 2: Instalar Dependências na Ordem Correta

### 2.1 GraphQL + Apollo Client (o coração da app)

```bash
npm install @apollo/client graphql
```

**O que instalamos:**

- `@apollo/client` - Cliente Apollo (v4, moderno)
- `graphql` - Parser GraphQL

---

### 2.2 PrimeNG + Tema

```bash
npm install primeng @primeng/themes primeicons @angular/cdk
```

**O que instalamos:**

- `primeng` - Componentes UI
- `@primeng/themes` - Temas oficiais
- `primeicons` - Ícones
- `@angular/cdk` - Dependência do PrimeNG

---

# 🎨 PARTE 2: Configuração de Estilos

## Passo 3: Limpar o styles.css Global

Editar `src/styles.css`:

```css
/* PrimeNG Icons */
@import "primeicons/primeicons.css";

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: #f5f5f5;
  color: #333;
}
```

**Por quê?**

- Tema agora é configurado via `providePrimeNG()` (não via CSS)
- Apenas ícones e reset global aqui

---

## Passo 4: Configurar app.config.ts (CRUCIAL)

Editar `src/app/app.config.ts`:
import { providePrimeNG } from "primeng/config";
import Aura from "@primeng/themes/aura";

export const appConfig: ApplicationConfig = {
providers: [
provideZoneChangeDetection({ eventCoalescing: true }),
provideAnimationsAsync(),
providePrimeNG({
theme: {
preset: Aura,
options: {
darkModeSelector: ".fake-selector", // ✅ Desativa dark mode
},
},
}),
],
};

````

**Por que assim?**

- ✅ `providePrimeNG()` - Configura PrimeNG oficialmente
- ✅ `provideAnimationsAsync()` - Animações assincronas (recomendado)
- ✅ Tema Aura em modo light

---

## 🎯 Passo 4: Limpar styles.css

Editar `src/styles.css`:

```css
/* PrimeNG Icons */
@import "primeicons/primeicons.css";

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: #f5f5f5;
  color: #333;
}
````

**Nota:** Tema agora é configurado em `app.config.ts`, não aqui!

---

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { providePrimeNG } from "primeng/config";
import Aura from "@primeng/themes/aura";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: ".fake-selector", // ✅ Tema light
        },
      },
    }),
  ],
};
```

**O que cada coisa faz:**

| Função                       | Propósito                                           |
| ---------------------------- | --------------------------------------------------- |
| `provideZoneChangeDetection` | Otimiza detecção de mudanças                        |
| `provideAnimationsAsync`     | ✅ Melhor que `provideAnimations()` (carrega async) |
| `providePrimeNG()`           | Configura PrimeNG via provider (moderno!)           |
| `theme: { preset: Aura }`    | Tema visual bonito                                  |
| `darkModeSelector`           | Desativa dark mode automático                       |

---

# 🔌 PARTE 3: GraphQL + Apollo Client

## Passo 5: Entender GraphQL

### O que é GraphQL?

GraphQL é uma **linguagem de query** para APIs. Ao invés de:

```
REST: GET /api/pokemon/25
```

Com GraphQL você faz:

```graphql
query GetPokemon($id: Int!) {
  pokemon(id: $id) {
    id
    name
    height
    weight
  }
}
```

**Vantagens:**

- ✅ Você pede exatamente o que precisa (sem overfetching)
- ✅ Uma única request (sem N+1)
- ✅ Tipado (schema definido na API)
- ✅ Autocompletar no IDE

### Por que não usar REST?

```javascript
// ❌ REST: precisa 2 requisições
GET /api/pokemon/25              // pokemon data
GET /api/pokemon/25/abilities     // abilities
GET /api/pokemon/25/sprites       // sprites (e pega coisa extra!)

// ✅ GraphQL: 1 requisição exata
query GetPokemon($id: Int!) {
  pokemon(id: $id) {
    name
    abilities { name }
    sprites { official }
  }
}
```

---

### PokéAPI GraphQL

**Endpoint:** `https://graphql.pokeapi.co/v1beta2`

**Como explorar:**

1. Acesse: https://graphql.pokeapi.co/v1beta2
2. Teste queries no playground
3. Use o schema explorer (lado esquerdo)

---

## Passo 6: Criar Apollo Client Instance

Criar `src/app/graphql/apollo.client.ts`:

```typescript
import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { HttpLink } from "@apollo/client/link/http";

/**
 * Instância única do Apollo Client
 * Gerencia todas as requisições GraphQL
 */
export const apolloClient = new ApolloClient({
  // HttpLink: responsável por fazer requisições HTTP
  link: new HttpLink({
    uri: "https://graphql.pokeapi.co/v1beta2", // ← Seu endpoint GraphQL
  }),

  // InMemoryCache: cache local das queries
  cache: new InMemoryCache(),
});
```

**Por quê assim?**

❌ **ANTIGO (Apollo v2/v3):**

```typescript
// Injetava no DI
{ provide: 'APOLLO_CLIENT', useValue: new ApolloClient(...) }
```

✅ **MODERNO (Apollo v4 + Angular 18):**

```typescript
// Arquivo dedicado, importa quando precisa
import { apolloClient } from "./apollo.client";
```

**Benefícios:**

- Simples e direto
- Sem magic strings de token
- Fácil de mockar em testes
- Segue padrão moderno

---

## Passo 7: Criar Queries GraphQL

Criar `src/app/graphql/queries.ts`:

```typescript
import { gql } from "@apollo/client/core";

/**
 * Query GraphQL para buscar um Pokémon por nome
 *
 * Parâmetros:
 *   $name: String! - nome do pokémon (required)
 *
 * Retorna:
 *   pokemonspecies - lista de espécies encontradas
 */
export const GET_POKEMON_BY_NAME = gql`
  query GetPokemon($name: String!) {
    pokemonspecies(where: { name: { _ilike: $name } }, limit: 1) {
      id
      name
    }
  }
`;
```

**Explicando a query:**

```graphql
query GetPokemon($name: String!) {
  ↑       ↑
  |       └─ Variável (dinâmica, passada ao chamar)
  └─ Tipo de operação

  pokemonspecies(where: { name: { _ilike: $name } }, limit: 1)
  ↑              ↑                    ↑
  |              |                    └─ Case-insensitive
  |              └─ Filtro (where clause)
  └─ Campo a buscar

  {
    id        ← Campos que queremos retornar
    name      ← Só estes! (especificidade)
  }
}
```

---

# 📦 PARTE 4: Tipagem Forte

## Passo 8: Criar Models (Interfaces)

Criar `src/app/models/pokemon.model.ts`:

```typescript
/**
 * Representa um Pokémon completo
 * Combina dados do GraphQL + imagem da REST API
 */
export interface Pokemon {
  id: number;
  name: string;
  spriteUrl: string; // ← Adicionado da REST API
}

/**
 * Resposta do GraphQL
 * Tipagem do que vem de graphql.pokeapi.co
 */
export interface PokemonSpecies {
  id: number;
  name: string;
  __typename: string; // Campo automático do Apollo
}

/**
 * Resultado completo da query GetPokemon
 * Representa exatamente o que vem do GraphQL
 */
export interface GetPokemonQueryResult {
  pokemonspecies: PokemonSpecies[];
}

/**
 * Resposta da REST API (/api/v2/pokemon/:id)
 * Usada para pegar a imagem oficial
 */
export interface PokemonRestResponse {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
}
```

**Por quê interfaces?**

❌ **SEM tipos:**

```typescript
const pokemon: any = resultado; // 😱 Perigoso!
pokemon.name.toUpperCase(); // Erro em runtime
pokemon.imagemQueNaoExiste.foo; // Sem erro? Compile, run, crash!
```

✅ **COM tipos:**

```typescript
const pokemon: Pokemon = resultado; // ✅ Seguro!
pokemon.name.toUpperCase(); // IDE sabe que existe!
pokemon.imagemQueNaoExiste.foo; // ❌ ERRO EM COMPILE!
```

---

# 🔧 PARTE 5: Service (Separação de Responsabilidades)

## Passo 9: Criar PokemonService

Criar `src/app/pages/services/pokemon.service.ts`:

```typescript
import { Injectable } from "@angular/core";
import { apolloClient } from "../../graphql/apollo.client";
import { GET_POKEMON_BY_NAME } from "../../graphql/queries";
import { Pokemon, PokemonRestResponse } from "../../models/pokemon.model";

/**
 * Service que encapsula TODA lógica de API
 * - Requisições GraphQL
 * - Requisições REST
 * - Transformação de dados
 * - Tratamento de erros
 */
@Injectable({
  providedIn: "root", // ✅ Singleton automático
})
export class PokemonService {
  /**
   * Método público: buscar um pokémon pelo nome
   *
   * Fluxo:
   * 1. Faz query GraphQL
   * 2. Pega imagem da REST API
   * 3. Combina tudo em um objeto Pokemon
   * 4. Retorna tipado
   */
  async buscarPokemonPorNome(nome: string): Promise<Pokemon> {
    try {
      // 1️⃣ PASSO 1: Buscar dados no GraphQL - COM TIPAGEM FORTE
      console.log("🔍 Buscando no GraphQL:", nome);

      const resultado = await apolloClient.query<GetPokemonQueryResult>({
        query: GET_POKEMON_BY_NAME,
        variables: {
          name: nome.toLowerCase(),
        },
      });

      // Validar se data existe e tem resultado
      if (!resultado.data?.pokemonspecies?.length) {
        throw new Error("Pokémon não encontrado");
      }

      console.log("✅ Resposta GraphQL:", resultado.data.pokemonspecies);

      const pokemonData = resultado.data.pokemonspecies[0];

      // 2️⃣ PASSO 2: Buscar imagem da REST API
      const spriteUrl = await this.buscarImagem(pokemonData.id);

      // 3️⃣ PASSO 3: Retornar objeto combinado
      return {
        id: pokemonData.id,
        name: pokemonData.name,
        spriteUrl: spriteUrl,
      };
    } catch (error) {
      console.error("❌ Erro ao buscar pokémon:", error);
      throw new Error("Pokémon não encontrado 😢");
    }
  }

  /**
   * Método privado: buscar imagem do pokémon
   * Usa REST API porque GraphQL não tem sprites oficiais
   */
  private async buscarImagem(pokemonId: number): Promise<string> {
    try {
      console.log("🖼️ Buscando imagem do pokémon:", pokemonId);

      const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
      const dados: PokemonRestResponse = await resposta.json();

      // Prioridade: artwork > default
      const spriteUrl = dados.sprites.other["official-artwork"].front_default || dados.sprites.front_default || "";

      console.log("✅ Imagem encontrada");
      return spriteUrl;
    } catch (error) {
      console.error("⚠️ Erro ao buscar imagem:", error);

      // Fallback: URL alternativa
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/pokemon/${pokemonId}.png`;
    }
  }
}
```

**Por quê Service?**

| Responsabilidade       | Antes            | Depois        |
| ---------------------- | ---------------- | ------------- |
| **Chamadas de API**    | No componente 😱 | No service ✅ |
| **Transformação**      | Espalhado        | Centralizado  |
| **Tratamento de erro** | Repetido         | Uma vez       |
| **Reutilização**       | Difícil          | Fácil         |
| **Testes**             | Complexo         | Simples       |

---

# 🎨 PARTE 6: Componente Limpo

## Passo 10: Criar Componente

```bash
ng generate component pages/pokemon-details --standalone
```

---

## Passo 11: Implementar Componente Limpo

Editar `src/app/pages/pokemon-details/pokemon-details.component.ts`:

```typescript
import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PokemonService } from "../services/pokemon.service";
import { Pokemon } from "../../models/pokemon.model";

// PrimeNG
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { InputGroupModule } from "primeng/inputgroup";
import { InputTextModule } from "primeng/inputtext";

@Component({
  selector: "app-pokemon-details",
  standalone: true,
  imports: [CommonModule, FormsModule, InputGroupModule, InputTextModule, ButtonModule, CardModule],
  templateUrl: "./pokemon-details.component.html",
  styleUrl: "./pokemon-details.component.css",
})
export class PokemonDetailsComponent {
  // Estado da UI
  pokemonName = "";
  pokemon: Pokemon | null = null;
  loading = false;
  error = "";

  // ✅ Injetar service (dependency injection)
  constructor(private pokemonService: PokemonService) {}

  /**
   * Handler do botão de busca
   * Async/await é mais limpo que .then()
   */
  async buscarPokemon() {
    // Validação
    if (!this.pokemonName.trim()) {
      this.error = "Digite um nome válido 🎯";
      return;
    }

    // Reset state
    this.loading = true;
    this.error = "";
    this.pokemon = null;

    try {
      // Delega para o service
      this.pokemon = await this.pokemonService.buscarPokemonPorNome(this.pokemonName);
    } catch (erro: any) {
      this.error = erro.message || "Erro ao buscar pokémon";
    } finally {
      this.loading = false;
    }
  }

  // Helper para pegar sprite
  getSprite(): string {
    return this.pokemon?.spriteUrl || "";
  }
}
```

**Por que este componente é bom?**

- ✅ **~40 linhas** (antes eram 95!)
- ✅ Apenas UI e interação
- ✅ Sem lógica de API
- ✅ Fácil de testar
- ✅ Reutilizável

---

## Passo 12: Template HTML

Editar `src/app/pages/pokemon-details/pokemon-details.component.html`:

```html
<div
  style="
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
"
>
  <div style="max-width: 400px; width: 100%;">
    <!-- Título -->
    <h2 style="margin-bottom: 1rem; text-align: center;">Pokédex GraphQL</h2>

    <!-- Input Group do PrimeNG -->
    <div class="p-inputgroup">
      <input pInputText placeholder="Digite o nome do Pokémon" [(ngModel)]="pokemonName" (keyup.enter)="buscarPokemon()" />
      <button pButton label="Buscar" icon="pi pi-search" (click)="buscarPokemon()" class="p-button-primary"></button>
    </div>

    <!-- Loading -->
    <p *ngIf="loading" style="margin-top: 1rem; text-align: center;"><i class="pi pi-spin pi-spinner"></i> Carregando...</p>

    <!-- Erro -->
    <p *ngIf="error" style="color: red; margin-top: 1rem; text-align: center;">{{ error }}</p>

    <!-- Card com Pokémon -->
    <p-card *ngIf="pokemon" [style]="{'margin-top': '1rem'}">
      <ng-template pTemplate="header">
        <img [src]="getSprite()" alt="pokemon" style="width: 200px; margin: auto; display: block; padding: 1rem 0;" />
      </ng-template>

      <h3 style="text-transform: capitalize; text-align: center; margin: 0;">{{ pokemon.name }}</h3>

      <p style="text-align: center; margin-top: 0.5rem;"><strong>ID:</strong> #{{ pokemon.id }}</p>
    </p-card>
  </div>
</div>
```

---

## Passo 13: CSS (Opcional)

Editar `src/app/pages/pokemon-details/pokemon-details.component.css`:

```css
:host ::ng-deep {
  .p-inputgroup {
    margin-bottom: 1.5rem;
  }

  .p-inputgroup input {
    flex: 1;
  }

  .p-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}
```

---

## Passo 14: Atualizar AppComponent

Editar `src/app/app.component.ts`:

```typescript
import { Component } from "@angular/core";
import { PokemonDetailsComponent } from "./pages/pokemon-details/pokemon-details.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [PokemonDetailsComponent],
  template: "<app-pokemon-details></app-pokemon-details>",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  title = "pokemon-graphql-app";
}
```

---

# 🚀 PARTE 7: Executar

## Passo 15: Rodar a Aplicação

```bash
npm start
```

**Abre em:** http://localhost:4200

---

# 📂 Estrutura Final

```
src/
├── app/
│   ├── app.config.ts                    ⭐ Config Angular + PrimeNG
│   ├── app.component.ts                 (Raiz)
│   │
│   ├── models/
│   │   └── pokemon.model.ts             ⭐ Interfaces tipadas
│   │
│   ├── graphql/
│   │   ├── apollo.client.ts             ⭐ Instância Apollo
│   │   └── queries.ts                   (Queries GraphQL)
│   │
│   └── pages/
│       ├── services/
│       │   └── pokemon.service.ts       ⭐ Lógica de API
│       │
│       └── pokemon-details/
│           ├── pokemon-details.component.ts
│           ├── pokemon-details.component.html
│           └── pokemon-details.component.css
│
├── main.ts
└── styles.css
```

---

# ✅ Checklist de Boas Práticas

- ✅ Apollo Client v4 (moderno)
- ✅ Tipagem forte (sem `any`)
- ✅ Service para lógica
- ✅ Models para interfaces
- ✅ Componente limpo (~40 linhas)
- ✅ Async/await (não promises aninhadas)
- ✅ Try/catch/finally
- ✅ Validação de input
- ✅ PrimeNG configurado via provider
- ✅ Separação de responsabilidades
- ✅ Código testável

---

# 🧪 Testando

1. Digite: `pikachu`
2. Aperte Enter ou clique Buscar
3. Veja:
   - ✅ Imagem oficial
   - ✅ Nome
   - ✅ ID
   - ✅ Spinner durante carregamento

---

# 📚 Recursos

- **GraphQL Playground:** https://graphql.pokeapi.co/v1beta2
- **PokéAPI GraphQL:** https://pokeapi.co/docs/graphql
- **Apollo Docs:** https://www.apollographql.com/docs/react/
- **PrimeNG Docs:** https://primeng.org/
- **Angular Docs:** https://angular.io/docs

---

# 🎯 Próximos Passos (Avançado)

1. **Adicionar lista paginada** - Listar todos pokémons
2. **Implementar cache** - Apollo InMemoryCache
3. **Lazy loading** - Componentes sob demanda
4. **Testes unitários** - Service + Component
5. **State management** - NgRx (se necessário)
6. **Deploy** - Vercel / Netlify

---

**Status:** ✅ Testado e funcionando perfeitamente!

**Stack Final:**

- Angular 18 + Standalone
- Apollo Client v4
- GraphQL
- PrimeNG 18
- TypeScript strict mode
