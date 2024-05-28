import ViewsRoutes from './views';
import ScannerRoutes from './scanner';
import ClientesRoutes from './clientes';
import OrdenesCompra from './ordenes_compra';
import SettingsRoutes from './settings';
import UsuariosRoutes from './usuarios';
import authRoutes from './auth';
import InventoryRoutes from './inventory';

export const viewsRoutes = [ViewsRoutes];
export const apiRoutes = [
  ScannerRoutes,
  ClientesRoutes,
  OrdenesCompra,
  SettingsRoutes,
  UsuariosRoutes,
  authRoutes,
  InventoryRoutes
];
