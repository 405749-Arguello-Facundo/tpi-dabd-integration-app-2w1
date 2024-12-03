import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { PlotService } from '../../../users/users-servicies/plot.service';
import { GetPlotModel } from '../../../users/users-models/plot/GetPlot';
import { CommonModule } from '@angular/common';
import { RoutingService } from '../../services/routing.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent implements OnInit {
  lotes: GetPlotModel[] = [];
  selectedPlot: GetPlotModel | null = null;
  //Injects
  private routingService = inject(RoutingService);
  private plotService = inject(PlotService);

  formMessage: FormGroup;
  plotsCard: { number: number, blockNumber: number, totalArea: number, type: string, status: string }[] = [];


  images: any[] = [
    'https://www.villadelcondor.com/imagenes/villadelcondor1.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor2.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor3.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor4.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor5.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor6.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor7.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor8.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor9.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor10.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor11.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor12.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor14.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor15.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor16.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor17.jpg',
    'https://www.villadelcondor.com/imagenes/villadelcondor18.jpg'
  ];


  //Formulario para hacer consultas
  constructor(private fb: FormBuilder, private cdRef: ChangeDetectorRef) {
    this.formMessage = this.fb.group({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      message: new FormControl('', [Validators.required])
    })
  }


  //Init
  ngOnInit(): void {
    this.getPlots();
  }


  //Cargar el mapa
  loadMap(): void {
    const svgElement = document.getElementById('mapa') as HTMLObjectElement;
    const svgDoc = svgElement.contentDocument;

    //Colores de elementos unicos
    svgDoc?.getElementById('river')?.setAttribute('fill', '#789DBC');
    svgDoc?.getElementById('street')?.setAttribute('fill', '#6C757D');
    svgDoc?.getElementById('entry')?.setAttribute('fill', '#6C757D');

    this.lotes.forEach(lote => {
      const pathElement = svgDoc?.getElementById(lote.plot_number.toString());
      if (pathElement) {
        switch (lote.plot_state) {
          case 'Habitado':
            pathElement.setAttribute('fill', '#FFE6A9');
            break;
          case 'En construccion':
            pathElement.setAttribute('fill', '#DEAA79');
            break;
          case 'Disponible':
            pathElement.setAttribute('fill', '#B1C29E');
            break;
        }

        // Evento de hover (mouseenter)
        pathElement.addEventListener('mouseenter', () => {
          pathElement.setAttribute('stroke-width', '3'); // Ancho del borde
          pathElement.setAttribute('opacity', '0.6'); // Opacidad reducida
        });

        // Evento de salir del hover (mouseleave)
        pathElement.addEventListener('mouseleave', () => {
          pathElement.setAttribute('stroke-width', '1');
          pathElement.removeAttribute('opacity');
        });

        // Setteo de evento de clic
        pathElement.addEventListener('click', () => {
          this.selectedPlot = this.lotes.find(l => l.id === lote.id)!;
          console.log("Lote seleccionado:", this.selectedPlot);
          this.cdRef.detectChanges();
        });

      }
    });
  }

  //Trae los primeros 3 lotes disponibles
  getPlots() {
    this.plotService.getAllPlotsAvailables().subscribe({
      next: (data: GetPlotModel[]) => {

        const firstThreePlots = data.slice(0, 6);
        this.plotsCard = firstThreePlots.map(d => ({
          number: d.plot_number,
          blockNumber: d.block_number,
          totalArea: d.total_area_in_m2,
          type: d.plot_type,
          status: d.plot_state
        }));

      },
      error: (err) => {
        console.error('Error al cargar los lotes', err);
      }
    });
    this.plotService.getAllPlots().subscribe({
      next: (data: GetPlotModel[]) => {
        this.lotes = data;
        this.loadMap();
      },
      error: (err) => {
        console.error('Error al cargar los lotes', err);
      }
    })
  }

  //Método para redireccionar
  redirect(path: string) {
    this.routingService.redirect('/login')
  }


  //Mostrar si el campo es válido o no
  onValidate(controlName: string) {
    const control = this.formMessage.get(controlName);
    return {
      'is-invalid': control?.invalid && (control?.dirty || control?.touched),
      'is-valid': control?.valid
    }
  }

  //Mostrar los errores del los campos
  showError(controlName: string): string {
    const control = this.formMessage.get(controlName);

    if (!control || !control.errors) return '';

    const errorKey = Object.keys(control.errors)[0];

    const errorMessages: { [key: string]: string } = {
      required: 'Este campo no puede estar vacío.',
      email: 'Formato de correo electrónico inválido.',
    };

    return errorMessages[errorKey] || 'Error desconocido';
  }

  clearPlot() {
    this.selectedPlot = null;
  }

}