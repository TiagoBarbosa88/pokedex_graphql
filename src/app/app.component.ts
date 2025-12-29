import { Component } from '@angular/core';
import { PokemonDetailsComponent } from "./pages/pokemon-details/pokemon-details.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PokemonDetailsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'pokemon-graphql-app';
}
