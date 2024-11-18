import { Routes } from "@angular/router";
import { UsersListOwnersComponent } from "./users-components/owners/users-list-owners/users-list-owners.component";
import { UsuariosNewOwnerComponent } from "./users-components/owners/users-new-owner/usuarios-new-owner.component";
import { UsersUpdateOwnerComponent } from "./users-components/owners/users-update-owner/users-update-owner.component";
import { UsersReportComponent } from "./users-components/dashboard/users-report/users-report.component";

export const OWNER_ROUTES: Routes = [
  { path: 'list', component: UsersListOwnersComponent },
  { path: 'add', component: UsuariosNewOwnerComponent },
  { path: 'edit/:id', component: UsersUpdateOwnerComponent },
  { path: 'dashboard', component: UsersReportComponent }, // Cambiar por el componente correspondiente
];