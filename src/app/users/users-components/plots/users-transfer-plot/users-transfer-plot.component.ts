import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { SuscriptionManagerService } from '../../../../common/services/suscription-manager.service';
import { OwnerService } from '../../../users-servicies/owner.service';
import { Owner } from '../../../users-models/owner/Owner';
import { PlotService } from '../../../users-servicies/plot.service';
import { GetPlotModel } from '../../../users-models/plot/GetPlot';
import { AuthService } from '../../../users-servicies/auth.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomSelectComponent } from "../../../../common/components/custom-select/custom-select.component";
import Swal from 'sweetalert2';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-users-transfer-plot',
  standalone: true,
  imports: [CustomSelectComponent, ReactiveFormsModule],
  templateUrl: './users-transfer-plot.component.html'
})
export class UsersTransferPlotComponent implements OnInit, OnDestroy {

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder) {
    this.reactiveForm = this.fb.group({
      actualOwner: [''],
      newOwner: ['', [Validators.required]]
    });
  }

  owners: any[] = [];
  actualOwner: Owner = new Owner();
  plot: GetPlotModel = new GetPlotModel();
  reactiveForm: FormGroup;
  confirm: boolean = false;
  plotLength: number = 0;

  @Input() plotId: number = 0;

  private readonly ownersService = inject(OwnerService);
  private readonly plotService = inject(PlotService);
  private readonly authService = inject(AuthService);
  private readonly suscriptonService = inject(SuscriptionManagerService);

  ngOnInit() {
    this.reactiveForm.get('actualOwner')?.disable();
    this.loadAllOwners();
  }

  //Desuscribirse de todos los observables
  ngOnDestroy() {
    this.suscriptonService.unsubscribeAll();
  }

  //Cargar todos los propietarios
  loadAllOwners() {
    const sus = this.ownersService.getAll().subscribe({
      next: (data: Owner[]) => {
        this.owners = data.map(owner => ({
          value: owner.id,
          name: `${owner.name}, ${owner.lastname} - ${owner.dni}`
        }));

        this.loadActualOwner();
      },
      error: (error) => {
        console.log('No se pudo cargar los propietarios, ' + error);
      }
    });

    //Agregar suscripción
    this.suscriptonService.addSuscription(sus);
  }

  //Cargar el propietario actual
  loadActualOwner() {
    const sus = this.ownersService.getOwnerByPlotId(this.plotId).subscribe({
      next: (data: Owner[]) => {
        this.actualOwner = data.find(owner => owner.active == true)!;
        this.owners = this.owners.filter(owner => owner.value != this.actualOwner.id);
        this.reactiveForm.get('actualOwner')?.setValue(this.actualOwner.name + ' ' + this.actualOwner.lastname + ' - ' + this.actualOwner.dni);

        this.loadPlotOwner(this.actualOwner.id);
      },
      error: (error) => {
        console.log('No se pudo cargar la información del propietario, ' + error);
      }
    });

    //Agregar suscripción
    this.suscriptonService.addSuscription(sus);
  }

  loadPlotOwner(id: number) {
    this.plotService.getPlotsByOwnerId(id).subscribe({
      next: (data: GetPlotModel[]) => {
        this.plotLength = data.length
      }
    })
  }

  confirmAction() {
    this.confirm = true;

    let message: string = '¿Estás seguro de que desea transferir el lote?'

    if (this.plotLength == 1) {
      message = `¿Estás seguro de que deseas transferir el lote? 
      El propietario ${this.actualOwner.name} ${this.actualOwner.lastname} - ${this.actualOwner.dni} se dará de baja por inexistencia de lotes a su nombre`
    }
    return message;
  }


  //Transferir el lote
  transferPlot() {
    this.plotService.transferPlot(this.plotId,
      this.reactiveForm.get('newOwner')?.value,
      this.authService.getUser().id).subscribe({
        next: () => {
          Swal.fire({
            icon: "success",
            title: "Lote transferido",
            showConfirmButton: true,
            confirmButtonText: "Aceptar",
            timer: undefined,
            allowEscapeKey: false,
            allowOutsideClick: false

          });
          this.activeModal.close();
        },
        error: (error) => {
          console.error('Error al trasnferir el lote:', error);
        }
      });
  }
}