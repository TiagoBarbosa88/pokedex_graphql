import { gql } from '@apollo/client/core';

export const GET_POKEMON_BY_NAME = gql`
  query GetPokemon($name: String!) {
    pokemonspecies(where: { name: { _ilike: $name } }, limit: 1) {
      id
      name
    }
  }
`;
