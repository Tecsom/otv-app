import ViewsRoutes from './views';
import ScannerRoutes from './scanner';
import ClientesRoutes from './clientes';
import OrdenesCompra from './ordenes_compra';
import SettingsRoutes from './settings';

export const viewsRoutes = [ViewsRoutes];
export const apiRoutes = [ScannerRoutes, ClientesRoutes, OrdenesCompra, SettingsRoutes];
