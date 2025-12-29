/**
 * Interface para representar um Pokémon
 * com dados do GraphQL + imagem da REST API
 */
export interface Pokemon {
  id: number;
  name: string;
  spriteUrl: string;
}

/**
 * Interface para um item da resposta GraphQL
 */
export interface PokemonSpecies {
  id: number;
  name: string;
  __typename: string;
}

/**
 * Interface para o resultado completo da query GetPokemon
 * Representa exatamente o que vem do GraphQL
 */
export interface GetPokemonQueryResult {
  pokemonspecies: PokemonSpecies[];
}

/**
 * Interface para resposta da REST API
 */
export interface PokemonRestResponse {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
}
