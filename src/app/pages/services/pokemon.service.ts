import { Injectable } from '@angular/core';
import { apolloClient } from '../../graphql/apollo.client';
import { GET_POKEMON_BY_NAME } from '../../graphql/queries';
import { Pokemon, GetPokemonQueryResult, PokemonRestResponse } from '../../models/pokemon.model';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  async buscarPokemonPorNome(nome: string): Promise<Pokemon> {
    try {
      // 1️⃣ Buscar dados do GraphQL - COM TIPAGEM FORTE
      console.log('🔍 Buscando no GraphQL:', nome);
      const resultado = await apolloClient.query<GetPokemonQueryResult>({
        query: GET_POKEMON_BY_NAME,
        variables: {
          name: nome.toLowerCase()
        }
      });

      // Validar se data existe e tem resultado
      if (!resultado.data?.pokemonspecies?.length) {
        throw new Error('Pokémon não encontrado');
      }

      console.log('✅ GraphQL respondeu:', resultado.data.pokemonspecies);

      const pokemonData = resultado.data.pokemonspecies[0];

      // 2️⃣ Buscar imagem da REST API
      const spriteUrl = await this.buscarImagem(pokemonData.id);

      // 3️⃣ Retornar objeto completo
      return {
        id: pokemonData.id,
        name: pokemonData.name,
        spriteUrl: spriteUrl
      };

    } catch (error) {
      console.error('❌ Erro ao buscar pokémon:', error);
      throw new Error('Pokémon não encontrado 😢');
    }
  }

  private async buscarImagem(pokemonId: number): Promise<string> {
    try {
      console.log('🖼️ Buscando imagem do pokémon:', pokemonId);

      const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
      const dados: PokemonRestResponse = await resposta.json();

      const spriteUrl = dados.sprites.other['official-artwork'].front_default ||
        dados.sprites.front_default ||
        '';

      console.log('✅ Imagem encontrada');
      return spriteUrl;

    } catch (error) {
      console.error('⚠️ Erro ao buscar imagem:', error);

      // Fallback
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/pokemon/${pokemonId}.png`;
    }
  }
}
