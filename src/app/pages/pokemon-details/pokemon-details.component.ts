import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Pokemon } from '../../models/pokemon.model';
import { PokemonService } from '../services/pokemon.service';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-pokemon-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputGroupModule,
    InputTextModule,
    ButtonModule,
    CardModule
  ],
  templateUrl: './pokemon-details.component.html',
  styleUrl: './pokemon-details.component.css'
})
export class PokemonDetailsComponent {
  pokemonName = '';
  pokemon: Pokemon | null = null;
  loading = false;
  error = '';

  constructor(private pokemonService: PokemonService) { }

  async buscarPokemon() {
    if (!this.pokemonName.trim()) {
      this.error = 'Digite um nome válido 🎯';
      return;
    }

    this.loading = true;
    this.error = '';
    this.pokemon = null;

    try {
      this.pokemon = await this.pokemonService.buscarPokemonPorNome(this.pokemonName);
    } catch (erro: any) {
      this.error = erro.message || 'Erro ao buscar pokémon';
    } finally {
      this.loading = false;
    }
  }

  getSprite(): string {
    return this.pokemon?.spriteUrl || '';
  }
}

